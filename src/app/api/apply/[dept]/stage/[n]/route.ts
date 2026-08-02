import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application, { DeptSlug } from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import { sendFinalPreferencesConfirmation } from "@/lib/mailer";
import { validateResponses } from "@/lib/validation";
import { ACTIVE_CYCLE_ID, DEPT_TYPE_MAP, getCanonicalDeptSlug } from "@/lib/constants";
import { validateOrigin } from "@/lib/csrf";


const CYCLE_ID = ACTIVE_CYCLE_ID;

// Limit request body to 128 KB — prevents oversized payloads on form submission
export const maxRequestBodySize = "128kb";


interface RouteParams {
  params: Promise<{ dept: string; n: string }>;
}


export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { dept: rawDept, n } = await params;
  const dept = getCanonicalDeptSlug(rawDept);
  const stageNum = parseInt((n || "").replace("quest-", "").replace("stage-", ""), 10);

  if (isNaN(stageNum) || stageNum < 1) {
    return NextResponse.json({ success: false, error: "Invalid stage number." }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  const [application, department, cycle] = await Promise.all([
    Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }),
    Department.findOne({ slug: dept }),
    RecruitmentCycle.findOne({ cycleId: CYCLE_ID }),
  ]);

  if (!application) {
    return NextResponse.json({ success: false, error: "No application found." }, { status: 404 });
  }
  if (!department) {
    return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
  }

  const { isStageOpen } = await import("@/lib/cycle");
  if (!isStageOpen(cycle, department, stageNum)) {
    return NextResponse.json(
      {
        success: false,
        stageClosed: true,
        error: `Stage 1 evaluation is currently in progress. Stage ${stageNum} will open once evaluations conclude.`,
      },
      { status: 403 }
    );
  }

  // Determine which preference this dept belongs to
  const isFirst = application.firstPreference === dept;
  const isSecond = application.secondPreference === dept;

  if (!isFirst && !isSecond) {
    const deptType = DEPT_TYPE_MAP[dept as DeptSlug];

    const canBeFirstPref =
      stageNum === 1 &&
      deptType &&
      deptType === application.firstPrefType;

    const canBeSecondPref =
      stageNum === 1 &&
      application.firstPreference !== dept &&
      deptType &&
      deptType !== application.firstPrefType;

    if (!canBeFirstPref && !canBeSecondPref) {
      return NextResponse.json({ success: false, error: "This department is not in your preferences." }, { status: 403 });
    }
  }

  const progress = isFirst
    ? application.firstPrefProgress
    : isSecond
    ? application.secondPrefProgress
    : { currentStage: 1, status: "active" as const, stages: [] };

  if (progress.status === "rejected") {
    return NextResponse.json(
      { success: false, error: "Your application for this department has been rejected." },
      { status: 403 }
    );
  }

  if (stageNum > 1) {
    return NextResponse.json(
      { success: false, error: "Invalid quest stage." },
      { status: 404 }
    );
  }

  const stageSubmission = progress.stages.find((s) => s.stage === stageNum);
  const stageConfig = department.stages.find((s) => s.stage === stageNum);

  return NextResponse.json({
    success: true,
    stageConfig,
    submission: stageSubmission ?? null,
    currentStage: progress.currentStage,
    status: progress.status,
    applicantYear: application.year,
    isFinalSubmitted: application.isFinalSubmitted ?? false,
  });
}

// POST — submit a stage
export async function POST(req: NextRequest, { params }: RouteParams) {
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  const { dept: rawDept, n } = await params;
  const dept = getCanonicalDeptSlug(rawDept);
  const stageNum = parseInt((n || "").replace("quest-", "").replace("stage-", ""), 10);

  if (isNaN(stageNum) || stageNum < 1) {
    return NextResponse.json({ success: false, error: "Invalid stage number." }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const [application, department, cycle] = await Promise.all([
      Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }),
      Department.findOne({ slug: dept }),
      RecruitmentCycle.findOne({ cycleId: CYCLE_ID })
    ]);

    if (!application) {
      return NextResponse.json({ success: false, error: "No application found. Please start from /apply." }, { status: 404 });
    }
    if (!department) {
      return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
    }

    const { isStageOpen } = await import("@/lib/cycle");
    if (!isStageOpen(cycle, department, stageNum)) {
      return NextResponse.json(
        { success: false, error: `Stage ${stageNum} is currently closed for this department.` },
        { status: 403 }
      );
    }

    let isFirst = application.firstPreference === dept;
    let isSecond = application.secondPreference === dept;

    if (!isFirst && !isSecond) {
      const deptType = DEPT_TYPE_MAP[dept as DeptSlug];

      const canBeFirstPref =
        stageNum === 1 &&
        deptType &&
        deptType === application.firstPrefType;

      const canBeSecondPref =
        stageNum === 1 &&
        application.firstPreference !== dept &&
        deptType &&
        deptType !== application.firstPrefType;

      if (canBeFirstPref) {
        // Drop previous 1st preference and switch to this department ONLY upon actual stage 1 submission
        application.firstPreference = dept as DeptSlug;
        application.firstPrefType = deptType;
        application.firstPrefProgress = {
          currentStage: 1,
          status: "active",
          stages: [],
        };
        await application.save();
        isFirst = true;
      } else if (canBeSecondPref) {
        // Drop previous 2nd preference (if any) and switch to this department ONLY upon actual stage 1 submission
        application.secondPreference = dept as DeptSlug;
        application.secondPrefType = deptType;
        application.secondPrefProgress = {
          currentStage: 1,
          status: "active",
          stages: [],
        };
        await application.save();
        isSecond = true;
      } else {
        return NextResponse.json(
          { success: false, error: "This department is not in your preferences." },
          { status: 403 }
        );
      }
    }

    const progress = isFirst
      ? application.firstPrefProgress
      : application.secondPrefProgress;

    if (progress.status === "rejected") {
      return NextResponse.json(
        { success: false, error: "Your application for this department has been rejected." },
        { status: 403 }
      );
    }

    if (progress.status === "passed") {
      return NextResponse.json(
        { success: false, error: "Your application for this department has already been passed/selected." },
        { status: 403 }
      );
    }

    if (stageNum > 1) {
      return NextResponse.json(
        { success: false, error: "Invalid quest stage." },
        { status: 404 }
      );
    }

    // Cannot resubmit an already-reviewed stage
    const existingStage = progress.stages.find((s) => s.stage === stageNum);
    if (existingStage && existingStage.result !== "pending") {
      return NextResponse.json(
        { success: false, error: "This stage has already been reviewed and cannot be resubmitted." },
        { status: 409 }
      );
    }

    if (application.isFinalSubmitted) {
      return NextResponse.json(
        { success: false, error: "Your preferences and application have been finalized and locked. Editing is no longer allowed." },
        { status: 403 }
      );
    }

    const stageConfig = department.stages.find((s) => s.stage === stageNum);
    if (!stageConfig) {
      return NextResponse.json({ success: false, error: "Stage configuration not found." }, { status: 404 });
    }

    const body = await req.json();
    const { responses, _trap, finalSubmit } = body;

    if (_trap) {
      return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });
    }

    // Validate all required fields and strip unknown fields via Zod
    const validationResult = validateResponses(stageConfig.formFields, responses ?? {}, { year: application.year });
    if (validationResult.error) {
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 });
    }
    const safeResponses = validationResult.data;

    // Build stage submission
    const submission = {
      stage: stageNum,
      submittedAt: new Date(),
      responses: safeResponses ?? {},
      result: "pending" as const,
    };

    const progressKey = isFirst ? "firstPrefProgress" : "secondPrefProgress";

    if (existingStage) {
      // Edit existing pending stage
      await Application.updateOne(
        { userId: session.user.id, cycleId: CYCLE_ID, [`${progressKey}.stages.stage`]: stageNum },
        {
          $set: {
            [`${progressKey}.stages.$.responses`]: safeResponses,
            [`${progressKey}.stages.$.submittedAt`]: new Date(),
          },
        }
      );
    } else {
      // Do not automatically advance the candidate's currentStage.
      // The admin will evaluate and advance them manually.
      await Application.updateOne(
        { userId: session.user.id, cycleId: CYCLE_ID },
        {
          $push: { [`${progressKey}.stages`]: submission },
        }
      );
    }

    if (finalSubmit) {
      await Application.updateOne(
        { userId: session.user.id, cycleId: CYCLE_ID },
        { $set: { isFinalSubmitted: true } }
      );

      if (application.firstPreference && application.secondPreference) {
        Promise.all([
          Department.findOne({ slug: application.firstPreference }).lean(),
          Department.findOne({ slug: application.secondPreference }).lean(),
        ]).then(([dept1, dept2]) => {
          const firstIsTech = application.firstPrefType === "tech";
          const techName = (firstIsTech ? dept1?.name : dept2?.name) || "Technical";
          const nonTechName = (firstIsTech ? dept2?.name : dept1?.name) || "Non-Technical";

          sendFinalPreferencesConfirmation(application.userEmail, techName, nonTechName).catch(console.error);
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stage ${stageNum} submitted successfully.`,
      nextStage: stageNum,
      isLastStage: true, // Forces frontend to show the Success screen and not navigate to the next stage automatically
    });
  } catch (err) {
    console.error("stage submit error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT — edit an existing pending stage
export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Same logic as POST but forces update of existing submission
  const { dept: rawDept, n } = await params;
  const dept = getCanonicalDeptSlug(rawDept);
  const stageNum = parseInt((n || "").replace("quest-", "").replace("stage-", ""), 10);

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const [application, department, cycle] = await Promise.all([
      Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }),
      Department.findOne({ slug: dept }),
      RecruitmentCycle.findOne({ cycleId: CYCLE_ID })
    ]);

    if (!application || !department) {
      return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
    }

    const { isStageOpen } = await import("@/lib/cycle");
    if (!isStageOpen(cycle, department, stageNum)) {
      return NextResponse.json(
        { success: false, error: `Stage ${stageNum} is closed. Editing is no longer available.` },
        { status: 403 }
      );
    }

    const isFirst = application.firstPreference === dept;
    const isSecond = application.secondPreference === dept;

    if (!isFirst && !isSecond) {
      return NextResponse.json(
        { success: false, error: "This department is not in your preferences." },
        { status: 403 }
      );
    }

    if (application.isFinalSubmitted) {
      return NextResponse.json(
        { success: false, error: "Your preferences and application have been finalized and locked. Editing is no longer allowed." },
        { status: 403 }
      );
    }

    const progress = isFirst ? application.firstPrefProgress : application.secondPrefProgress;
    const progressKey = isFirst ? "firstPrefProgress" : "secondPrefProgress";

    if (progress.status === "rejected" || progress.status === "passed") {
      return NextResponse.json(
        { success: false, error: "This stage cannot be edited because your status for this department is finalized." },
        { status: 403 }
      );
    }

    const existingStage = progress.stages.find((s) => s.stage === stageNum);
    if (!existingStage) {
      return NextResponse.json({ success: false, error: "Stage not yet submitted. Use POST." }, { status: 400 });
    }
    if (existingStage.result !== "pending") {
      return NextResponse.json(
        { success: false, error: "This stage has been reviewed and cannot be edited." },
        { status: 409 }
      );
    }

    const stageConfig = department.stages.find((s) => s.stage === stageNum);
    if (!stageConfig) {
      return NextResponse.json({ success: false, error: "Stage config not found." }, { status: 404 });
    }

    const body = await req.json();
    const { responses, _trap, finalSubmit } = body;
    if (_trap) return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });

    // Validate responses and strip unknown fields
    const validationResult = validateResponses(stageConfig.formFields, responses ?? {});
    if (validationResult.error) {
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 });
    }
    const safeResponses = validationResult.data;

    await Application.updateOne(
      { userId: session.user.id, cycleId: CYCLE_ID, [`${progressKey}.stages.stage`]: stageNum },
      {
        $set: {
          [`${progressKey}.stages.$.responses`]: safeResponses,
          [`${progressKey}.stages.$.submittedAt`]: new Date(),
        },
      }
    );

    if (finalSubmit) {
      await Application.updateOne(
        { userId: session.user.id, cycleId: CYCLE_ID },
        { $set: { isFinalSubmitted: true } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Stage updated successfully.",
      nextStage: stageNum,
      isLastStage: true,
    });
  } catch (err) {
    console.error("stage edit error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
