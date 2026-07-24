import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";
import { z } from "zod";

const patchSlotSchema = z.object({
  locationDetails: z.string().min(1, "Location details cannot be empty.").max(500).optional(),
  panelName: z.string().min(1, "Panel name cannot be empty.").max(100).optional(),
  locationType: z.enum(["online", "offline"]).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const parseResult = patchSlotSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }
    const { locationDetails, panelName, locationType } = parseResult.data;

    const updates: Record<string, string | undefined> = {};
    if (locationDetails !== undefined) updates.locationDetails = locationDetails;
    if (panelName !== undefined) updates.panelName = panelName;
    if (locationType !== undefined) updates.locationType = locationType;

    const slot = await InterviewSlot.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!slot) {
      return NextResponse.json({ success: false, error: "Slot not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Slot updated successfully.",
      slot,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update slot.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
  }

  await dbConnect();

  try {
    const slot = await InterviewSlot.findByIdAndDelete(id);
    if (!slot) {
      return NextResponse.json({ success: false, error: "Slot not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Slot deleted successfully.",
      wasBooked: slot.status === "booked",
      bookedBy: slot.bookedBy,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete slot.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
