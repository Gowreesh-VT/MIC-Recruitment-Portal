import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ dept: string }>;
}

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Competitive Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Content & Media",
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { dept } = await params;

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

  try {
    const firstPrefCount = await Application.countDocuments({
      cycleId: ACTIVE_CYCLE_ID,
      firstPreference: dept,
    });

    const secondPrefCount = await Application.countDocuments({
      cycleId: ACTIVE_CYCLE_ID,
      secondPreference: dept,
    });

    // Total applicants who chose this department as either first or second preference
    const totalApplicants = firstPrefCount + secondPrefCount;

    // Candidates currently active in this department (their activePreference is this department and overallStatus is in-progress)
    const activePipeline = await Application.aggregate([
      {
        $match: {
          cycleId: ACTIVE_CYCLE_ID,
          overallStatus: "in-progress",
          $or: [
            { firstPreference: dept, activePreference: "first" },
            { secondPreference: dept, activePreference: "second" },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$activePreference", "first"] },
              then: "$firstPrefProgress.currentStage",
              else: "$secondPrefProgress.currentStage",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Selected candidates for this department
    const selected = await Application.countDocuments({
      cycleId: ACTIVE_CYCLE_ID,
      overallStatus: "selected",
      $or: [
        { firstPreference: dept, activePreference: "first" },
        { secondPreference: dept, activePreference: "second" },
      ],
    });

    const byStage: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
    };
    activePipeline.forEach((s) => {
      if (s._id >= 1 && s._id <= 3) {
        byStage[s._id as 1 | 2 | 3] = s.count;
      }
    });

    const stagesFunnel = [1, 2, 3].map((stageNum) => ({
      stageNum,
      count: byStage[stageNum] || 0,
    }));

    // Pool Year Distribution
    const yearAgg = await Application.aggregate([
      {
        $match: {
          cycleId: ACTIVE_CYCLE_ID,
          $or: [{ firstPreference: dept }, { secondPreference: dept }],
        },
      },
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearDistribution = yearAgg.map((y) => ({
      year: y._id || "Unknown",
      count: y.count,
    }));

    // Rubric average scores
    const appsWithScores = await Application.find({
      cycleId: ACTIVE_CYCLE_ID,
      $or: [{ firstPreference: dept }, { secondPreference: dept }],
    }).select("firstPreference secondPreference firstPrefProgress secondPrefProgress");

    const scoreTotals: Record<string, { sum: number; count: number }> = {};
    for (const app of appsWithScores) {
      const isFirst = app.firstPreference === dept;
      const progress = isFirst ? app.firstPrefProgress : app.secondPrefProgress;
      if (progress?.stages) {
        for (const stage of progress.stages) {
          if (stage.scores) {
            const scoresObj =
              stage.scores instanceof Map
                ? Object.fromEntries(stage.scores)
                : stage.scores;
            for (const [key, val] of Object.entries(scoresObj)) {
              if (typeof val === "number") {
                if (!scoreTotals[key]) scoreTotals[key] = { sum: 0, count: 0 };
                scoreTotals[key].sum += val;
                scoreTotals[key].count += 1;
              }
            }
          }
          if (stage.panelistScores) {
            for (const ps of stage.panelistScores) {
              if (ps.scores) {
                const scoresObj =
                  ps.scores instanceof Map
                    ? Object.fromEntries(ps.scores)
                    : ps.scores;
                for (const [key, val] of Object.entries(scoresObj)) {
                  if (typeof val === "number") {
                    if (!scoreTotals[key]) scoreTotals[key] = { sum: 0, count: 0 };
                    scoreTotals[key].sum += val;
                    scoreTotals[key].count += 1;
                  }
                }
              }
            }
          }
        }
      }
    }

    const avgScores: Record<string, number> = {};
    for (const [key, data] of Object.entries(scoreTotals)) {
      if (data.count > 0) {
        avgScores[key] = Number((data.sum / data.count).toFixed(1));
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        slug: dept,
        name: DEPT_NAMES[dept] || dept,
        totalStages: 3,
        totalApplicants,
        firstPrefCount,
        secondPrefCount,
        acceptedCount: selected,
        selected,
        conversionRate: totalApplicants > 0 ? ((selected / totalApplicants) * 100).toFixed(1) : "0",
        byStage,
        stagesFunnel,
        yearDistribution,
        avgScores,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
