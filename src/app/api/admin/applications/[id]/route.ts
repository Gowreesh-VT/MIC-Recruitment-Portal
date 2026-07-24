import { NextRequest, NextResponse } from "next/server";
import { sendStageUpdate } from "@/lib/mailer";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// GET — full application details
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // ── Auth guard ────────────────────────────────────────────────────────────
  const getSession = await auth();
  if (
    !getSession?.user ||
    (getSession.user as { role?: string }).role !== "admin"
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await dbConnect();

  const application = await Application.findById(id).lean();
  if (!application) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  // Fetch candidate name from users collection
  const db = mongoose.connection.db;
  const user = db ? await db.collection("users").findOne({ email: (application as unknown as { userEmail: string }).userEmail }) : null;
  
  const enrichedApplication = {
    ...application,
    userName: user ? user.name : "",
  };

  // Convert private S3 submission URLs to Presigned GET URLs
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
    const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
    const s3Prefix = `https://${bucketName}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/submissions/`;

    const processResponses = async (responses: Record<string, unknown>) => {
      if (!responses) return;
      for (const key of Object.keys(responses)) {
        const val = responses[key];
        if (typeof val === "string" && val.startsWith(s3Prefix)) {
          const objectKey = val.split(".amazonaws.com/")[1];
          if (objectKey) {
            const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
            const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            responses[key] = presignedUrl;
          }
        }
      }
    };

    if (enrichedApplication.firstPrefProgress?.stages) {
      for (const stage of enrichedApplication.firstPrefProgress.stages) {
        await processResponses(stage.responses as Record<string, unknown>);
      }
    }
    if (enrichedApplication.secondPrefProgress?.stages) {
      for (const stage of enrichedApplication.secondPrefProgress.stages) {
        await processResponses(stage.responses as Record<string, unknown>);
      }
    }
  } catch (err) {
    console.error("Failed to generate presigned GET URLs:", err);
  }

  // Enrich with dept names
  const [dept1, dept2] = await Promise.all([
    Department.findOne({ slug: (application as unknown as { firstPreference: string }).firstPreference }).lean(),
    Department.findOne({ slug: (application as unknown as { secondPreference: string }).secondPreference }).lean(),
  ]);

  return NextResponse.json({ success: true, application: enrichedApplication, dept1, dept2 });
}

// PATCH — advance or reject
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await dbConnect();

  const body = await req.json();
  const { action, preference, note, scores } = body;

  if (!["advance", "reject", "waitlist", "select", "score"].includes(action) || !["first", "second"].includes(preference)) {
    return NextResponse.json({ success: false, error: "Invalid action or preference." }, { status: 400 });
  }
  // action: "advance" | "reject" | "waitlist" | "select" | "score"
  // preference: "first" | "second"

  const application = await Application.findById(id);
  if (!application) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  if (action === "waitlist") {
    application.overallStatus = "waitlisted";
    await application.save();

    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      "candidate_waitlist",
      application.userEmail,
      `Waitlisted applicant from active preference.`
    );

    return NextResponse.json({ success: true, message: "Applicant waitlisted successfully." });
  }

  if (action === "select") {
    application.overallStatus = "selected";
    if (preference === "first") {
      application.firstPrefProgress.status = "passed";
    } else {
      application.secondPrefProgress.status = "passed";
    }
    await application.save();

    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      "stage_select",
      application.userEmail,
      `Directly selected candidate for ${preference} preference.`
    );

    return NextResponse.json({ success: true, message: "Applicant selected successfully." });
  }

  const progressKey = preference === "first" ? "firstPrefProgress" : "secondPrefProgress";
  const deptSlug =
    preference === "first"
      ? application.firstPreference
      : application.secondPreference;

  const department = await Department.findOne({ slug: deptSlug });
  const progress =
    preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress;

  // Update the most recent stage's result
  let currentStageIdx = progress.stages.findIndex(
    (s) => s.stage === progress.currentStage
  );

  if (currentStageIdx === -1) {
    progress.stages.push({
      stage: progress.currentStage,
      submittedAt: new Date(),
      responses: {},
      result: "pending",
    } as any);
    currentStageIdx = progress.stages.length - 1;
  }

  // Multi-interviewer Panelist Scoring Update
  if (scores && Object.keys(scores).length > 0) {
    const stage = (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).stages[currentStageIdx];

    if (!stage.panelistScores) {
      stage.panelistScores = [];
    }

    const interviewerEmail = session.user.email ?? "unknown";

    // Filter valid positive scores
    const validScores: Record<string, number> = {};
    Object.entries(scores).forEach(([k, v]) => {
      const numVal = Number(v);
      if (numVal > 0) {
        validScores[k] = numVal;
      }
    });

    const existingIdx = stage.panelistScores.findIndex(
      (ps: any) => ps.interviewerEmail === interviewerEmail
    );

    if (existingIdx !== -1) {
      stage.panelistScores[existingIdx].scores = validScores;
      if (note) stage.panelistScores[existingIdx].note = note;
      stage.panelistScores[existingIdx].createdAt = new Date();
    } else {
      stage.panelistScores.push({
        interviewerEmail,
        scores: validScores,
        note: note || "",
        createdAt: new Date(),
      });
    }

    // Recalculate averages across all panelists safely
    const scoreSums: Record<string, number> = {};
    const scoreCounts: Record<string, number> = {};

    stage.panelistScores.forEach((ps: any) => {
      if (!ps || !ps.scores) return;

      let entries: [string, any][] = [];
      if (ps.scores instanceof Map) {
        entries = Array.from(ps.scores.entries());
      } else if (typeof ps.scores === "object" && ps.scores !== null) {
        entries = Object.entries(ps.scores);
      }

      entries.forEach(([key, val]) => {
        const scoreVal = Number(val);
        if (!isNaN(scoreVal) && scoreVal > 0) {
          scoreSums[key] = (scoreSums[key] || 0) + scoreVal;
          scoreCounts[key] = (scoreCounts[key] || 0) + 1;
        }
      });
    });

    const averagedScores: Record<string, number> = {};
    Object.keys(scoreSums).forEach((key) => {
      averagedScores[key] = Number((scoreSums[key] / scoreCounts[key]).toFixed(1));
    });

    stage.scores = averagedScores;
    if (note) stage.adminNote = note;
  } else if (note) {
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).stages[currentStageIdx].adminNote = note;
  }

  if (action === "score") {
    application.markModified(progressKey);
    application.markModified(`${progressKey}.stages`);
    await application.save();

    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      "stage_score",
      application.userEmail,
      `Submitted panelist scores for ${preference} preference stage ${progress.currentStage}.`
    );

    return NextResponse.json({ success: true, message: "Scores updated successfully.", application });
  }

  if (action === "advance") {
    const currentStage = progress.currentStage;
    const totalStages = department?.totalStages ?? 3;
    const isLastStage = currentStage >= totalStages;
    const nextStage = currentStage + 1;
    const nextIsLastStage = nextStage === totalStages;

    // Mark current stage as passed
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).stages[currentStageIdx].result = "passed";
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).stages[currentStageIdx].reviewedBy =
      session?.user?.email ?? "admin";
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).stages[currentStageIdx].reviewedAt = new Date();

    if (isLastStage) {
      // Final stage passed → select the candidate
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).status = "passed";
      application.overallStatus = "selected";

      if (preference === "first" && application.secondPreference) {
        application.secondPrefProgress.status = "rejected";
      }
    } else {
      // Advance to next stage
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).currentStage = nextStage;
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).status = "active";
      application.overallStatus = "in-progress";

      // If the next stage is the final (interview) stage, auto-create a pending entry
      // so the applicant can book a slot without needing to submit a form
      if (nextIsLastStage) {
        (preference === "first"
          ? application.firstPrefProgress
          : application.secondPrefProgress).stages.push({
            stage: nextStage,
            submittedAt: new Date(),
            responses: {},
            result: "pending",
          } as any);
      }
    }

    // Log advance action
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      isLastStage ? "stage_select" : "stage_advance",
      application.userEmail,
      `Advanced ${preference} preference (${deptSlug}) to ${isLastStage ? "Selected" : "Stage " + (currentStage + 1)}.`
    );
  } else {
    // reject
    if (currentStageIdx !== -1) {
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].result = "failed";
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].reviewedBy =
        session?.user?.email ?? "admin";
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].reviewedAt = new Date();
      if (note) {
        (preference === "first"
          ? application.firstPrefProgress
          : application.secondPrefProgress).stages[currentStageIdx].adminNote = note;
      }
    }
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).status = "rejected";

    // If rejected from first preference, activate second (if they have one)
    if (preference === "first") {
      if (application.secondPreference && (application.secondPreference as string) !== "") {
        application.activePreference = "second";
        application.secondPrefProgress.status = "active";
        application.overallStatus = "in-progress";
      } else {
        application.overallStatus = "rejected";
      }
    } else {
      // Rejected from second preference — check if both are now rejected
      if (application.firstPrefProgress.status === "rejected") {
        application.overallStatus = "rejected";
      }
    }

    // Log reject action
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      "candidate_reject",
      application.userEmail,
      `Rejected from ${preference} preference (${deptSlug}).`
    );
  }

  application.markModified(progressKey);
  await application.save();

  // Send email update in background only on advance
  if (action === "advance") {
    sendStageUpdate(application.userEmail, "passed", note).catch(console.error);
  }

  return NextResponse.json({
    success: true,
    message: `Applicant ${action === "advance" ? "advanced" : "rejected"} successfully.`,
  });
}
