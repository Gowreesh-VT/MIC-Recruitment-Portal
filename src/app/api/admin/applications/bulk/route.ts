import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import mongoose from "mongoose";


export async function POST(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await dbConnect();

  const body = await req.json();
  const { action, ids, note } = body;

  if (!["advance", "reject", "select"].includes(action) || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { success: false, error: "Invalid action or candidate list." },
      { status: 400 }
    );
  }

  try {
    // Validate that every supplied id is a proper MongoDB ObjectId before querying.
    // Passing arbitrary strings to $in can cause query misrouting or crashes.
    const validIds = (ids as unknown[]).filter(
      (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
    ) as string[];
    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid application IDs provided." },
        { status: 400 }
      );
    }

    const applications = await Application.find({ _id: { $in: validIds } });
    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching applications found." },
        { status: 404 }
      );
    }

    const processedEmails: string[] = [];

    for (const app of applications) {
      const preference = app.activePreference;
      const progressKey = preference === "first" ? "firstPrefProgress" : "secondPrefProgress";

      const progress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;

      const currentStageIdx = progress.stages.findIndex((s) => s.stage === progress.currentStage);

      if (action === "advance") {
        if (currentStageIdx !== -1) {
          if (preference === "first") {
            app.firstPrefProgress.stages[currentStageIdx].result = "passed";
            app.firstPrefProgress.stages[currentStageIdx].reviewedBy = session.user.email ?? "admin";
            app.firstPrefProgress.stages[currentStageIdx].reviewedAt = new Date();
            if (note) app.firstPrefProgress.stages[currentStageIdx].adminNote = note;
          } else {
            app.secondPrefProgress.stages[currentStageIdx].result = "passed";
            app.secondPrefProgress.stages[currentStageIdx].reviewedBy = session.user.email ?? "admin";
            app.secondPrefProgress.stages[currentStageIdx].reviewedAt = new Date();
            if (note) app.secondPrefProgress.stages[currentStageIdx].adminNote = note;
          }
        }

        // Advance to the next stage — do NOT mark as selected yet.
        // Selection is finalised separately via the "select" action after Stage 3.
        const targetProgress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
        targetProgress.currentStage = progress.currentStage + 1;
      } else if (action === "select") {
        if (currentStageIdx !== -1) {
          if (preference === "first") {
            app.firstPrefProgress.stages[currentStageIdx].result = "passed";
            app.firstPrefProgress.stages[currentStageIdx].reviewedBy = session.user.email ?? "admin";
            app.firstPrefProgress.stages[currentStageIdx].reviewedAt = new Date();
            if (note) app.firstPrefProgress.stages[currentStageIdx].adminNote = note;
          } else {
            app.secondPrefProgress.stages[currentStageIdx].result = "passed";
            app.secondPrefProgress.stages[currentStageIdx].reviewedBy = session.user.email ?? "admin";
            app.secondPrefProgress.stages[currentStageIdx].reviewedAt = new Date();
            if (note) app.secondPrefProgress.stages[currentStageIdx].adminNote = note;
          }
        }

        // Mark preference as passed → select candidate
        const targetProgress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
        targetProgress.status = "passed";
        app.overallStatus = "selected";
      } else {
        // reject
        if (currentStageIdx !== -1) {
          if (preference === "first") {
            app.firstPrefProgress.stages[currentStageIdx].result = "failed";
            app.firstPrefProgress.stages[currentStageIdx].reviewedBy = session.user.email ?? "admin";
            app.firstPrefProgress.stages[currentStageIdx].reviewedAt = new Date();
            if (note) app.firstPrefProgress.stages[currentStageIdx].adminNote = note;
          } else {
            app.secondPrefProgress.stages[currentStageIdx].result = "failed";
            app.secondPrefProgress.stages[currentStageIdx].reviewedBy = session.user.email ?? "admin";
            app.secondPrefProgress.stages[currentStageIdx].reviewedAt = new Date();
            if (note) app.secondPrefProgress.stages[currentStageIdx].adminNote = note;
          }
        }

        const targetProgress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
        targetProgress.status = "rejected";
        if (targetProgress.stages) {
          targetProgress.stages.forEach((s) => {
            if (s.result === "pending") s.result = "failed";
          });
        }

        // Candidate is overall rejected ONLY if both preferences are rejected
        const firstIsRejected = app.firstPrefProgress.status === "rejected";
        const hasSecondPref = app.secondPreference && (app.secondPreference as string) !== "";
        const secondIsRejected = !hasSecondPref || app.secondPrefProgress.status === "rejected";

        if (firstIsRejected && secondIsRejected) {
          app.overallStatus = "rejected";
        }
      }

      app.markModified(progressKey);
      await app.save();
      processedEmails.push(app.userEmail);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully bulk ${action === "select" ? "selected" : action === "advance" ? "advanced" : "rejected"} ${applications.length} applications.`,
      processedEmails,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Bulk action execution failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
