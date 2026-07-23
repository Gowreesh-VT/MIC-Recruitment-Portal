import { NextRequest, NextResponse } from "next/server";
import { sendStageUpdate } from "@/lib/mailer";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";

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

  if (!["advance", "reject"].includes(action) || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { success: false, error: "Invalid action or candidate list." },
      { status: 400 }
    );
  }

  try {
    const applications = await Application.find({ _id: { $in: ids } });
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
      const deptSlug = preference === "first" ? app.firstPreference : app.secondPreference;

      const department = await Department.findOne({ slug: deptSlug });
      const progress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;

      const currentStageIdx = progress.stages.findIndex((s) => s.stage === progress.currentStage);

      if (action === "advance") {
        const currentStage = progress.currentStage;
        const totalStages = department?.totalStages ?? 3;
        const isLastStage = currentStage >= totalStages;
        const nextStage = currentStage + 1;
        const nextIsLastStage = nextStage === totalStages;

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

        if (isLastStage) {
          // Final stage passed → select the candidate
          const targetProgress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
          targetProgress.status = "passed";
          app.overallStatus = "selected";
          if (preference === "first" && app.secondPreference) {
            app.secondPrefProgress.status = "rejected";
          }
        } else {
          // Advance to next stage
          const targetProgress = preference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
          targetProgress.currentStage = nextStage;
          targetProgress.status = "active";
          app.overallStatus = "in-progress";

          // If the next stage is the final (interview) stage, auto-create a pending entry
          if (nextIsLastStage) {
            targetProgress.stages.push({
              stage: nextStage,
              submittedAt: new Date(),
              responses: {},
              result: "pending",
            } as any);
          }
        }
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

        if (preference === "first") {
          app.firstPrefProgress.status = "rejected";
          if (app.secondPreference && (app.secondPreference as string) !== "") {
            app.activePreference = "second";
            app.secondPrefProgress.status = "active";
            app.overallStatus = "in-progress";
          } else {
            app.overallStatus = "rejected";
          }
        } else {
          app.secondPrefProgress.status = "rejected";
          if (app.firstPrefProgress.status === "rejected") {
            app.overallStatus = "rejected";
          }
        }
      }

      app.markModified(progressKey);
      await app.save();
      processedEmails.push(app.userEmail);

      // Email update (non-blocking background task) only on advance
      if (action === "advance") {
        sendStageUpdate(app.userEmail, "passed", note).catch(console.error);
      }
    }

    // Log the bulk admin action
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      action === "advance" ? "bulk_advance" : "bulk_reject",
      `${applications.length} applicants`,
      `Bulk processed ${action} action for: ${processedEmails.join(", ")}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully bulk ${action === "advance" ? "advanced" : "rejected"} ${applications.length} applications.`,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Bulk action execution failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
