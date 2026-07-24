import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

const CYCLE_ID = ACTIVE_CYCLE_ID;

export async function GET() {
  try {
    await dbConnect();
    const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID }).lean();
    const { isCycleOpen } = await import("@/lib/cycle");
    const cycleOpen = isCycleOpen(cycle);
    const cycleLabel = cycle?.label ?? "MIC Recruitment 2026–27";

    const countdownTarget = cycle?.countdownTarget
      ? new Date(cycle.countdownTarget).toISOString()
      : cycle?.startAt
      ? new Date(cycle.startAt).toISOString()
      : null;

    return NextResponse.json({
      success: true,
      title: `░ ${cycleLabel.toUpperCase()} ░`,
      welcomeTitle: "★ WELCOME TO THE QUEST ★",
      bulletPoints: [
        "9 DEPARTMENTS. 100 SEATS.",
        "ONLY THE BEST COMPLETE THE QUEST.",
        cycleOpen ? "ARE YOU READY, PLAYER?" : "RECRUITMENTS ARE CLOSED."
      ],
      cycleOpen,
      cycle,
      countdownSettings: {
        enabled: cycle?.countdownEnabled ?? false,
        target: countdownTarget,
        title: cycle?.countdownTitle || "Recruitment Countdown",
      },
      footerBlinkText: cycleOpen ? "[ PRESS BUTTON TO BEGIN ]" : "[ QUEST CLOSED ]",
      marqueeText: "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027"
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load home page configuration.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
