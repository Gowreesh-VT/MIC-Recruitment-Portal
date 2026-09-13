import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import { cycleUpdateSchema } from "@/lib/validation";
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
  const cycle = await RecruitmentCycle.findOne({ cycleId: ACTIVE_CYCLE_ID }).lean();
  return NextResponse.json({ success: true, cycle });
}

export async function PUT(req: NextRequest) {
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
  const body = await req.json();
  const parseResult = cycleUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }
  const { isOpen, startAt, endAt, countdownEnabled, countdownTarget, countdownTitle, emailNotificationsEnabled } = parseResult.data;

  const updateFields: Record<string, unknown> = { isOpen };
  if (startAt !== undefined) updateFields.startAt = startAt ? new Date(startAt) : null;
  if (endAt !== undefined) updateFields.endAt = endAt ? new Date(endAt) : null;
  if (countdownEnabled !== undefined) updateFields.countdownEnabled = countdownEnabled;
  if (countdownTarget !== undefined) updateFields.countdownTarget = countdownTarget ? new Date(countdownTarget) : null;
  if (countdownTitle !== undefined) updateFields.countdownTitle = countdownTitle || "Recruitment Countdown";
  if (emailNotificationsEnabled !== undefined) updateFields.emailNotificationsEnabled = emailNotificationsEnabled;

  if (isOpen) {
    updateFields.openedAt = new Date();
  } else {
    updateFields.closedAt = new Date();
  }

  const cycle = await RecruitmentCycle.findOneAndUpdate(
    { cycleId: ACTIVE_CYCLE_ID },
    {
      $set: updateFields,
    },
    { new: true, upsert: true }
  );

  return NextResponse.json({
    success: true,
    cycle,
    message: `Recruitment is now ${isOpen ? "OPEN" : "CLOSED"}.`,
  });
}
