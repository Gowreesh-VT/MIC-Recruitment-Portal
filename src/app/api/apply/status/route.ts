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

  interface StageSubmissionItem {
    submittedAt?: Date | string;
    responses?: Record<string, unknown>;
    stage?: number;
  }

  interface PreferenceProgress {
    currentStage?: number;
    stages?: StageSubmissionItem[];
    [key: string]: unknown;
  }

  // Mask stage progress if the current stage is not yet open by admin
  const processProgress = (progress: PreferenceProgress | undefined | null, dept: unknown) => {
    if (!progress) return progress;
    let effectiveStage = progress.currentStage ?? 1;
    let stageMasked = false;

    if (effectiveStage > 1 && !isStageOpen(cycle, dept, effectiveStage)) {
      const submittedStages = (progress.stages || [])
        .filter((s) => s.submittedAt || (s.responses && Object.keys(s.responses).length > 0))
        .map((s) => s.stage ?? 1);

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

  const hasFirstPrefSubmission = (application.firstPrefProgress?.stages || []).some(
    (s: StageSubmissionItem) => s.submittedAt || (s.responses && Object.keys(s.responses).length > 0)
  );

  const hasSecondPrefSubmission = (application.secondPrefProgress?.stages || []).some(
    (s: StageSubmissionItem) => s.submittedAt || (s.responses && Object.keys(s.responses).length > 0)
  );

  const processedApplication = {
    ...application,
    isFinalSubmitted: application.isFinalSubmitted ?? false,
    firstPreference: application.firstPreference,
    firstPrefType: application.firstPrefType,
    firstPrefProgress: processProgress(application.firstPrefProgress, dept1),

    secondPreference: application.secondPreference,
    secondPrefType: application.secondPrefType,
    secondPrefProgress: processProgress(application.secondPrefProgress, dept2),
  };

  return NextResponse.json({
    success: true,
    application: processedApplication,
    cycleOpen,
    user: session.user,
  });
}
