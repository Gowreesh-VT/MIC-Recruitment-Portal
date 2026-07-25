import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

const CYCLE_ID = ACTIVE_CYCLE_ID;

export async function POST() {
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
