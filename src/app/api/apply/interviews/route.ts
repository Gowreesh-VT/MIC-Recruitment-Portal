import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import InterviewSlot from "@/models/InterviewSlot";
import { sendInterviewBookingConfirmation } from "@/lib/mailer";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  try {
    // 1. Fetch user's application
    const application = await Application.findOne({ userId: session.user.id, cycleId: ACTIVE_CYCLE_ID });
    if (!application) {
      return NextResponse.json({ success: false, error: "No application found." }, { status: 404 });
    }

    const deptSlug = application.activePreference === "first" ? application.firstPreference : application.secondPreference;

    // 2. Fetch available slots for this dept or 'all'
    const availableSlots = await InterviewSlot.find({
      deptSlug: { $in: [deptSlug, "all"] },
      status: "available",
      startTime: { $gt: new Date() }, // only future slots
    }).sort({ startTime: 1 });

    // 3. Fetch candidate's current booking if any
    const currentBooking = await InterviewSlot.findOne({
      "bookedBy.userId": session.user.id,
      deptSlug: { $in: [deptSlug, "all"] },
      status: "booked",
    });

    return NextResponse.json({
      success: true,
      slots: availableSlots,
      currentBooking,
      deptSlug,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load candidate booking details.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  try {
    const { slotId } = await req.json();
    if (!slotId) {
      return NextResponse.json({ success: false, error: "Slot ID is required." }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      return NextResponse.json({ success: false, error: "Invalid slot ID." }, { status: 400 });
    }

    // 1. Get application
    const application = await Application.findOne({ userId: session.user.id, cycleId: ACTIVE_CYCLE_ID });
    if (!application) {
      return NextResponse.json({ success: false, error: "No application found." }, { status: 404 });
    }

    const deptSlug = application.activePreference === "first" ? application.firstPreference : application.secondPreference;

    // 2. Atomically book the new slot to prevent double-booking race conditions
    const targetSlot = await InterviewSlot.findOneAndUpdate(
      {
        _id: slotId,
        status: "available",
        deptSlug: { $in: [deptSlug, "all"] },
      },
      {
        $set: {
          status: "booked",
          bookedBy: {
            userId: session.user.id,
            userEmail: session.user.email ?? application.userEmail,
            userName: session.user.name ?? undefined,
          },
        },
      },
      { new: true }
    );

    if (!targetSlot) {
      return NextResponse.json(
        { success: false, error: "Slot is no longer available or invalid for your department." },
        { status: 400 }
      );
    }

    // 3. Now that the new slot is successfully claimed, free up any previously booked slot
    const existingSlot = await InterviewSlot.findOne({
      "bookedBy.userId": session.user.id,
      _id: { $ne: slotId },
      deptSlug: { $in: [deptSlug, "all"] },
      status: "booked",
    });

    if (existingSlot) {
      existingSlot.status = "available";
      existingSlot.bookedBy = undefined;
      existingSlot.markModified("bookedBy");
      await existingSlot.save();
    }

    // 4. Send confirmation email
    const timeStr = targetSlot.startTime.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    sendInterviewBookingConfirmation(
      session.user.email ?? application.userEmail,
      timeStr,
      targetSlot.locationDetails,
      targetSlot.locationType === "online"
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Interview booked successfully.",
      slot: targetSlot,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to book slot.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
