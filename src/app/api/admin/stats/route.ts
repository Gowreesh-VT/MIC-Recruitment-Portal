import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const results = await Promise.allSettled([
    Application.countDocuments({ cycleId: ACTIVE_CYCLE_ID }),
    Application.countDocuments({ cycleId: ACTIVE_CYCLE_ID, overallStatus: "in-progress" }),
    Application.countDocuments({ cycleId: ACTIVE_CYCLE_ID, overallStatus: "selected" }),
    Application.countDocuments({ cycleId: ACTIVE_CYCLE_ID, overallStatus: "rejected" }),
    Application.aggregate([
      { $match: { cycleId: ACTIVE_CYCLE_ID } },
      {
        $facet: {
          byFirst: [
            { $group: { _id: "$firstPreference", count: { $sum: 1 } } },
          ],
          bySecond: [
            { $group: { _id: "$secondPreference", count: { $sum: 1 } } },
          ],
        },
      },
    ]),
    Application.aggregate([
      { $match: { cycleId: ACTIVE_CYCLE_ID } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          applications: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Application.find({ cycleId: ACTIVE_CYCLE_ID })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("userEmail overallStatus firstPreference secondPreference updatedAt")
      .lean(),
    Application.aggregate([
      { $match: { cycleId: ACTIVE_CYCLE_ID, overallStatus: "in-progress" } },
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
    ]),
    Department.find({}, "slug name isActive").lean(),
    Application.aggregate([
      { $match: { cycleId: ACTIVE_CYCLE_ID, overallStatus: "selected" } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$activePreference", "first"] },
              then: "$firstPreference",
              else: "$secondPreference",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Application.aggregate([
      { $match: { cycleId: ACTIVE_CYCLE_ID } },
      {
        $facet: {
          byFirst: [
            {
              $group: {
                _id: "$firstPreference",
                total: { $sum: 1 },
                stage1Completed: {
                  $sum: {
                    $cond: [
                      {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: { $ifNull: ["$firstPrefProgress.stages", []] },
                                as: "s",
                                cond: { $eq: ["$$s.stage", 1] },
                              },
                            },
                          },
                          0,
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          bySecond: [
            { $match: { secondPreference: { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$secondPreference",
                total: { $sum: 1 },
                stage1Completed: {
                  $sum: {
                    $cond: [
                      {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: { $ifNull: ["$secondPrefProgress.stages", []] },
                                as: "s",
                                cond: { $eq: ["$$s.stage", 1] },
                              },
                            },
                          },
                          0,
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]),
  ]);

  // Extract fulfilled values with safe fallbacks so a single failed aggregation
  // doesn't crash the entire dashboard (Promise.allSettled never throws)
  const get = <T>(idx: number, fallback: T): T => {
    const r = results[idx];
    return r.status === "fulfilled" ? (r.value as T) : fallback;
  };

  const total            = get<number>(0, 0);
  const inProgress       = get<number>(1, 0);
  const selected         = get<number>(2, 0);
  const rejected         = get<number>(3, 0);
  const byDept           = get<{ byFirst: unknown[]; bySecond: unknown[] }[]>(4, [{ byFirst: [], bySecond: [] }]);
  const dailyApplications = get<unknown[]>(5, []);
  const recentActivity   = get<unknown[]>(6, []);
  const byStage          = get<unknown[]>(7, []);
  const departmentsList  = get<unknown[]>(8, []);
  const acceptedByDept   = get<unknown[]>(9, []);
  const stage1ByDept     = get<{ byFirst: unknown[]; bySecond: unknown[] }[]>(10, [{ byFirst: [], bySecond: [] }]);


  return NextResponse.json({
    success: true,
    stats: {
      total,
      inProgress,
      selected,
      rejected,
      conversionRate: total > 0 ? ((selected / total) * 100).toFixed(1) : "0",
      byDepartment: byDept[0],
      dailyApplications,
      recentActivity,
      byStage,
      departmentsList,
      acceptedByDept,
      stage1ByDept: stage1ByDept[0],
    },
  });
}
