import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";
import { validateOrigin } from "@/lib/csrf";
import { z } from "zod";

const deleteCategorySchema = z.object({
  category: z.enum(["tech", "non-tech"], { message: "Invalid category." }),
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

    const body = await req.json();
    const parseResult = deleteCategorySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid category." },
        { status: 400 }
      );
    }

    const { category } = parseResult.data;

    const application = await Application.findOne({
      userId: session.user.id,
      cycleId: CYCLE_ID,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "No active application found." },
        { status: 404 }
      );
    }

    const isFirstCategory = application.firstPrefType === category;
    const isSecondCategory = application.secondPrefType === category;

    if (!isFirstCategory && !isSecondCategory) {
      return NextResponse.json(
        { success: false, error: `No active application found for ${category} category.` },
        { status: 400 }
      );
    }

    const targetProgress = isFirstCategory
      ? application.firstPrefProgress
      : application.secondPrefProgress;

    // Disallow deletion if Stage 2 is already accepted/passed or rejected/failed
    if (targetProgress?.status === "passed" || targetProgress?.status === "rejected") {
      return NextResponse.json(
        { success: false, error: "Cannot change department after shortlisting decision is finalized." },
        { status: 403 }
      );
    }

    if (isFirstCategory) {
      if (application.secondPreference) {
        // Promote second preference to first preference
        application.firstPreference = application.secondPreference;
        application.firstPrefType = application.secondPrefType!;
        application.firstPrefProgress = application.secondPrefProgress;

        // Clear second preference
        application.secondPreference = undefined;
        application.secondPrefType = undefined;
        application.secondPrefProgress = { currentStage: 1, status: "pending", stages: [] };

        await application.save();
      } else {
        // Only one application existed — delete the document so the candidate can apply fresh
        await Application.deleteOne({ _id: application._id });
      }
    } else if (isSecondCategory) {
      // Clear second preference
      application.secondPreference = undefined;
      application.secondPrefType = undefined;
      application.secondPrefProgress = { currentStage: 1, status: "pending", stages: [] };

      await application.save();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${category} department application.`,
    });
  } catch (err) {
    console.error("delete-category error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
