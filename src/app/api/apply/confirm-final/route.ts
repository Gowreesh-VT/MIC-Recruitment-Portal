import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";
import { validateOrigin } from "@/lib/csrf";

import { sendFinalPreferencesConfirmation } from "@/lib/mailer";
import Department from "@/models/Department";

const CYCLE_ID = ACTIVE_CYCLE_ID;


export async function POST(req: NextRequest) {
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const application = await Application.findOne({
      userId: session.user.id,
      cycleId: CYCLE_ID,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "No application found." },
        { status: 404 }
      );
    }

    application.isFinalSubmitted = true;
    await application.save();

    // Send confirmation email in background
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

    return NextResponse.json({
      success: true,
      message: "Final preferences confirmed and locked successfully.",
    });
  } catch (err) {
    console.error("confirm-final error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
