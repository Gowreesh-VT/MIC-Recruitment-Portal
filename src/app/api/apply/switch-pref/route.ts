import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import type { DeptSlug } from "@/models/Application";
import { ACTIVE_CYCLE_ID, DEPT_TYPE_MAP, getCanonicalDeptSlug, getDeptSlugVariants } from "@/lib/constants";
import { z } from "zod";
import { validateOrigin } from "@/lib/csrf";



const switchPrefSchema = z.object({
  newDepartment: z.enum([
    "development",
    "competitive-coding",
    "ui-ux",
    "ai-ml",
    "cyber-security",
    "design",
    "management",
    "entrepreneurship",
    "content-media",
  ], { message: "Invalid department selection." }),
  // Which preference slot to replace: "first" or "second"
  prefSlot: z.enum(["first", "second"], { message: "Invalid preference slot." }),
});

const CYCLE_ID = ACTIVE_CYCLE_ID;


export async function POST(req: NextRequest) {
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    // Check recruitment is open
    const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID });
    const { isCycleOpen } = await import("@/lib/cycle");
    if (!isCycleOpen(cycle)) {
      return NextResponse.json(
        { success: false, error: "Recruitment is currently closed." },
        { status: 403 }
      );
    }

    // Fetch existing application
    const application = await Application.findOne({
      userId: session.user.id,
      cycleId: CYCLE_ID,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found. Please select your 1st preference first." },
        { status: 404 }
      );
    }

    const body = await req.json();
    if (body && typeof body.newDepartment === "string") {
      body.newDepartment = getCanonicalDeptSlug(body.newDepartment);
    }
    const parseResult = switchPrefSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    const { newDepartment, prefSlot } = parseResult.data;
    const newDeptType = DEPT_TYPE_MAP[newDepartment as DeptSlug];

    if (!newDeptType) {
      return NextResponse.json(
        { success: false, error: "Invalid department selection." },
        { status: 400 }
      );
    }

    // Validate the slot matches the type being replaced
    if (prefSlot === "first") {
      if (!application.firstPreference) {
        return NextResponse.json(
          { success: false, error: "No first preference found to replace." },
          { status: 400 }
        );
      }
      if (application.firstPrefType !== newDeptType) {
        return NextResponse.json(
          { success: false, error: `Cannot switch to a ${newDeptType} department for a ${application.firstPrefType} preference slot.` },
          { status: 400 }
        );
      }
      if (application.firstPreference === newDepartment) {
        return NextResponse.json(
          { success: false, error: "That department is already your first preference." },
          { status: 400 }
        );
      }
    } else {
      // prefSlot === "second"
      if (!application.secondPreference) {
        return NextResponse.json(
          { success: false, error: "No second preference found to replace." },
          { status: 400 }
        );
      }
      if (application.secondPrefType !== newDeptType) {
        return NextResponse.json(
          { success: false, error: `Cannot switch to a ${newDeptType} department for a ${application.secondPrefType} preference slot.` },
          { status: 400 }
        );
      }
      if (application.secondPreference === newDepartment) {
        return NextResponse.json(
          { success: false, error: "That department is already your second preference." },
          { status: 400 }
        );
      }
    }

    // Prevent using the other pref's department
    if (prefSlot === "first" && application.secondPreference === newDepartment) {
      return NextResponse.json(
        { success: false, error: "This department is already your second preference." },
        { status: 400 }
      );
    }
    if (prefSlot === "second" && application.firstPreference === newDepartment) {
      return NextResponse.json(
        { success: false, error: "This department is already your first preference." },
        { status: 400 }
      );
    }

    // Verify the new department is active
    const dept = await Department.findOne({ slug: { $in: getDeptSlugVariants(newDepartment) }, isActive: true });
    if (!dept) {
      return NextResponse.json(
        { success: false, error: "The selected department is not currently available." },
        { status: 400 }
      );
    }

    // Ensure savedDepartmentResponses map exists
    const savedResponses = (application.savedDepartmentResponses || {}) as Record<string, unknown[]>;

    if (prefSlot === "first") {
      const oldDept = application.firstPreference;
      if (oldDept && application.firstPrefProgress?.stages?.length > 0) {
        savedResponses[oldDept] = application.firstPrefProgress.stages;
      }

      // Restore previously saved stages for the new dept, but only if they
      // have a pending result — i.e. not yet reviewed by an admin.
      // If stages were reviewed (passed/failed), start fresh so the user
      // must re-submit the form for the new department.
      const rawRestoredStages = (savedResponses[newDepartment] || []) as typeof application.firstPrefProgress.stages;
      const restoredStages = rawRestoredStages.filter(
        (s) => !s.result || s.result === "pending"
      );

      application.firstPreference = newDepartment as DeptSlug;
      application.firstPrefType = newDeptType;
      application.firstPrefProgress = {
        currentStage: 1,
        // Use "active" so the form page is accessible immediately.
        // Status moves to "pending" once the user submits stage 1.
        status: "active",
        stages: restoredStages,
      };
    } else {
      const oldDept = application.secondPreference;
      if (oldDept && application.secondPrefProgress?.stages?.length > 0) {
        savedResponses[oldDept] = application.secondPrefProgress.stages;
      }

      const rawRestoredStages = (savedResponses[newDepartment] || []) as typeof application.secondPrefProgress.stages;
      const restoredStages = rawRestoredStages.filter(
        (s) => !s.result || s.result === "pending"
      );

      application.secondPreference = newDepartment as DeptSlug;
      application.secondPrefType = newDeptType;
      application.secondPrefProgress = {
        currentStage: 1,
        status: "active",
        stages: restoredStages,
      };
    }

    application.savedDepartmentResponses = savedResponses as Record<string, typeof application.firstPrefProgress.stages>;
    application.markModified("savedDepartmentResponses");
    await application.save();

    return NextResponse.json({
      success: true,
      message: `Switched ${prefSlot} preference to ${newDepartment}.`,
      newDepartment,
      prefSlot,
      // Tell the frontend to redirect to the new department's form immediately
      redirectTo: `/apply/${newDepartment}/quest-1`,
    });
  } catch (err) {
    console.error("Error switching preference:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
