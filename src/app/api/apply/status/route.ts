import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import RecruitmentCycle from "@/models/RecruitmentCycle";

export const dynamic = "force-dynamic";

const CYCLE_ID = "2026-27";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  const [application, cycle] = await Promise.all([
    Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }).lean(),
    RecruitmentCycle.findOne({ cycleId: CYCLE_ID }).lean(),
  ]);

  if (!application) {
    return NextResponse.json({ success: true, application: null, cycleOpen: cycle?.isOpen ?? false, user: session.user });
  }

  return NextResponse.json({
    success: true,
    application,
    cycleOpen: cycle?.isOpen ?? false,
    user: session.user,
  });
}
