import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";

// M2: Simple in-memory per-admin cooldown — prevents repeated full DB dumps
// in the event of admin credential compromise.
// Note: this resets on server restart and doesn't work across multiple instances.
// For a multi-instance setup, use Redis instead.
const BACKUP_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const lastBackupTime = new Map<string, number>();

export async function GET(req: NextRequest) {
  // Check admin privileges
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  // Rate-limit: one backup per admin per 10 minutes
  const adminEmail = session.user.email ?? "unknown";
  const last = lastBackupTime.get(adminEmail) ?? 0;
  const now = Date.now();
  if (now - last < BACKUP_COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((BACKUP_COOLDOWN_MS - (now - last)) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: `Backup rate-limited. Please wait ${Math.ceil(retryAfterSec / 60)} minute(s) before triggering another backup.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  await dbConnect();

  try {
    const [applications, departments, cycles] = await Promise.all([
      Application.find({}).lean(),
      Department.find({}).lean(),
      RecruitmentCycle.find({}).lean(),
    ]);

    // Record successful backup time only after data is fetched
    lastBackupTime.set(adminEmail, now);

    const backupData = {
      applications,
      departments,
      cycles,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    // Return backup data as an attachment JSON download
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=mic_backup_${new Date().toISOString().split("T")[0]}.json`,
      },
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json(
      { success: false, error: "Database backup execution failed." },
      { status: 500 }
    );
  }
}

