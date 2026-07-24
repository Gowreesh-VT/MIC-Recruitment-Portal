import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const [departments, cycle] = await Promise.all([
      Department.find({ isActive: true }).lean(),
      RecruitmentCycle.findOne({ cycleId: ACTIVE_CYCLE_ID }).lean(),
    ]);

    // Map departments to their UI props
    const formattedQuests = departments.map((d) => ({
      slug: d.slug,
      title: d.name.toUpperCase(),
      name: d.name,
      type: d.type,
      desc: d.desc ?? "",
      subtitle: d.desc ?? "",
      tagline: d.tagline ?? "",
      description: d.description ?? "",
      skills: d.skills ?? "",
      iconType: d.iconType ?? "dev",
      role: d.name,
      stage1Open: d.stageToggles ? (d.stageToggles["1"] !== false) : true,
    }));

    const techQuests = formattedQuests.filter((q) => q.type === "tech");
    const nonTechQuests = formattedQuests.filter((q) => q.type === "non-tech");

    const countdownTarget = cycle?.countdownTarget
      ? new Date(cycle.countdownTarget).toISOString()
      : cycle?.startAt
      ? new Date(cycle.startAt).toISOString()
      : null;

    return NextResponse.json({
      success: true,
      title: "Recruitments",
      subtitle: "CHOOSE THE QUEST SUITS YOU THE MOST",
      techQuests,
      nonTechQuests,
      countdownSettings: {
        enabled: cycle?.countdownEnabled ?? false,
        target: countdownTarget,
        title: cycle?.countdownTitle || "Recruitment Countdown",
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load recruitments configuration.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
