import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

  // Validate the id is a proper MongoDB ObjectId before querying.
  // Arbitrary strings passed to findById() cause a Mongoose CastError.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid application ID." },
      { status: 400 }
    );
  }

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
  const { action, preference, note } = body;

  if (!["advance", "reject", "waitlist", "select", "reset"].includes(action) || !["first", "second"].includes(preference)) {
    return NextResponse.json({ success: false, error: "Invalid action or preference." }, { status: 400 });
  }
  // action: "advance" | "reject" | "waitlist" | "select" | "reset"
  // preference: "first" | "second"

  const application = await Application.findById(id);
  if (!application) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  if (action === "reset") {
    application.overallStatus = "in-progress";
    if (preference === "first") {
      application.firstPrefProgress.status = "active";
      application.firstPrefProgress.currentStage = 1;
      if (application.firstPrefProgress.stages) {
        application.firstPrefProgress.stages.forEach((s) => {
          s.result = "pending";
          s.adminNote = undefined;
          s.reviewedBy = undefined;
          s.reviewedAt = undefined;
        });
      }
    } else {
      application.secondPrefProgress.status = "active";
      application.secondPrefProgress.currentStage = 1;
      if (application.secondPrefProgress.stages) {
        application.secondPrefProgress.stages.forEach((s) => {
          s.result = "pending";
          s.adminNote = undefined;
          s.reviewedBy = undefined;
          s.reviewedAt = undefined;
        });
      }
    }
    await application.save();

    return NextResponse.json({ success: true, message: "Applicant reset to Stage 1 successfully." });
  }

  if (action === "waitlist") {
    application.overallStatus = "waitlisted";
    await application.save();

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

    return NextResponse.json({ success: true, message: "Applicant selected successfully." });
  }

  const progressKey = preference === "first" ? "firstPrefProgress" : "secondPrefProgress";

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
    });
    currentStageIdx = progress.stages.length - 1;
  }

  if (note) {
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).stages[currentStageIdx].adminNote = note;
  }

  if (action === "advance") {
    // Mark current stage result as passed
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

    // Advance to the next stage — do NOT mark as selected yet.
    // The admin uses the separate "select" action to finalise selection after Stage 3.
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).currentStage = progress.currentStage + 1;
  } else if (action === "select") {
    // Mark current stage result as passed
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

    // Mark preference as passed → select candidate
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).status = "passed";
    application.overallStatus = "selected";
  } else {
    // reject
    const targetProgress = preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress;

    if (currentStageIdx !== -1) {
      targetProgress.stages[currentStageIdx].result = "failed";
      targetProgress.stages[currentStageIdx].reviewedBy =
        session?.user?.email ?? "admin";
      targetProgress.stages[currentStageIdx].reviewedAt = new Date();
      if (note) {
        targetProgress.stages[currentStageIdx].adminNote = note;
      }
    }
    targetProgress.status = "rejected";

    // Mark any remaining pending stages in this preference as failed
    if (targetProgress.stages) {
      targetProgress.stages.forEach((s) => {
        if (s.result === "pending") s.result = "failed";
      });
    }

    // Candidate is overall rejected ONLY if both preferences are rejected
    const firstIsRejected = application.firstPrefProgress.status === "rejected";
    const hasSecondPref = application.secondPreference && (application.secondPreference as string) !== "";
    const secondIsRejected = !hasSecondPref || application.secondPrefProgress.status === "rejected";

    if (firstIsRejected && secondIsRejected) {
      application.overallStatus = "rejected";
    }
  }

  application.markModified(progressKey);
  await application.save();

  return NextResponse.json({
    success: true,
    message: `Applicant ${action === "advance" ? "advanced" : "rejected"} successfully.`,
  });
}
