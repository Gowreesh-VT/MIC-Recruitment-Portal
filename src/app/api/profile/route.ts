import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import { updateProfileSchema } from "@/lib/validation";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const application = await Application.findOne({
      userId: session.user.id,
      cycleId: ACTIVE_CYCLE_ID,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "No active application found to update." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    const { fullName, phone, regNo, year, branch, whyMic } = parseResult.data;

    application.fullName = fullName;
    application.phone = phone;
    application.regNo = regNo;
    application.year = year;
    application.branch = branch;
    application.whyMic = whyMic;

    await application.save();

    // M1: Return only the fields the client needs — not the full Mongoose document,
    // which would leak stage responses, userId, internal DB references, etc.
    return NextResponse.json({
      success: true,
      message: "Personal details updated successfully.",
      profile: { fullName, phone, regNo, year, branch, whyMic },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while updating profile." },
      { status: 500 }
    );
  }
}
