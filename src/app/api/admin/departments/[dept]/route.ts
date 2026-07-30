import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import { deptUpdateSchema } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ dept: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { dept } = await params;

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
  const department = await Department.findOne({ slug: dept }).lean();
  if (!department) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, department });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { dept } = await params;

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

  const parseResult = deptUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }

  const { isActive, stages } = parseResult.data;

  const update: Record<string, unknown> = {};
  if (isActive !== undefined) update.isActive = isActive;
  if (stages !== undefined) update.stages = stages;

  const department = await Department.findOneAndUpdate(
    { slug: dept },
    { $set: update },
    { new: true }
  );

  if (!department) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, department });
}
