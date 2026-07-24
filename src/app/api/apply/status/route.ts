import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

const CYCLE_ID = ACTIVE_CYCLE_ID;

export async function GET() {
  const session = await auth();

  await dbConnect();
  
  const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID }).lean();
  const { isCycleOpen, isStageOpen } = await import("@/lib/cycle");
  const cycleOpen = isCycleOpen(cycle);

  if (!session?.user?.id) {
    return NextResponse.json({
      success: true,
      application: null,
      cycleOpen,
      user: null,
    });
  }

  const application = await Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }).lean();

  if (!application) {
    return NextResponse.json({
      success: true,
      application: null,
      cycleOpen,
      user: session.user,
    });
  }

  // Fetch departments to check stage open toggles for evaluation masking
  const [dept1, dept2] = await Promise.all([
    application.firstPreference ? Department.findOne({ slug: application.firstPreference }).lean() : null,
    application.secondPreference ? Department.findOne({ slug: application.secondPreference }).lean() : null,
  ]);

  // Mask stage progress if the current stage is not yet open by admin
  const processProgress = (progress: any, dept: any) => {
    if (!progress) return progress;
    let effectiveStage = progress.currentStage ?? 1;
    let stageMasked = false;

    if (effectiveStage > 1 && !isStageOpen(cycle, dept, effectiveStage)) {
      const submittedStages = (progress.stages || [])
        .filter((s: any) => s.submittedAt || (s.responses && Object.keys(s.responses).length > 0))
        .map((s: any) => s.stage);

      const maxSubmitted = submittedStages.length > 0 ? Math.max(...submittedStages) : 1;
      effectiveStage = Math.max(1, Math.min(maxSubmitted, effectiveStage - 1));
      stageMasked = true;
    }

    return {
      ...progress,
      effectiveCurrentStage: effectiveStage,
      stageMasked,
    };
  };

  const processedApplication = {
    ...application,
    firstPrefProgress: processProgress(application.firstPrefProgress, dept1),
    secondPrefProgress: processProgress(application.secondPrefProgress, dept2),
  };

  return NextResponse.json({
    success: true,
    application: processedApplication,
    cycleOpen,
    user: session.user,
  });
}
