import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import mongoose from "mongoose";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";


function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Comp. Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Social Media",
  iot: "IoT",
  outreach: "Outreach",
};

export async function GET(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const colsParam = searchParams.get("columns");
    const scopeParam = searchParams.get("scope"); // "all" | "filtered" | "selected"
    const idsParam = searchParams.get("ids");
    const deptParam = searchParams.get("dept");
    const prefParam = searchParams.get("pref") ?? "any"; // "any" | "first" | "second" | "active"
    const statusParam = searchParams.get("status");
    const qParam = searchParams.get("q");

    // Construct MongoDB filter based on export scope & filters
    const filter: Record<string, unknown> = { cycleId: ACTIVE_CYCLE_ID };

    if (scopeParam === "selected" && idsParam) {
      const validIds = idsParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      filter._id = { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) };
    } else {
      if (deptParam && deptParam.trim().length > 0) {
        const dept = deptParam.trim();
        if (prefParam === "first") {
          filter.firstPreference = dept;
        } else if (prefParam === "second") {
          filter.secondPreference = dept;
        } else if (prefParam === "active") {
          filter.$or = [
            { firstPreference: dept, activePreference: "first" },
            { secondPreference: dept, activePreference: "second" },
          ];
        } else {
          filter.$or = [{ firstPreference: dept }, { secondPreference: dept }];
        }
      }

      if (statusParam) {
        filter.overallStatus = statusParam;
      }

      if (qParam) {
        const safeSearch = escapeRegex(qParam);
        const db = mongoose.connection.db;
        const matchingUsers = db
          ? await db
              .collection("users")
              .find({ name: { $regex: safeSearch, $options: "i" } }, { projection: { email: 1 } })
              .toArray()
          : [];
        const matchingEmails = matchingUsers.map((u) => u.email).filter(Boolean);

        const searchConditions: Record<string, unknown>[] = [
          { userEmail: { $regex: safeSearch, $options: "i" } },
          { fullName: { $regex: safeSearch, $options: "i" } },
          { regNo: { $regex: safeSearch, $options: "i" } },
          { phone: { $regex: safeSearch, $options: "i" } },
        ];
        if (matchingEmails.length > 0) {
          searchConditions.push({ userEmail: { $in: matchingEmails } });
        }

        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
          delete filter.$or;
        } else {
          filter.$or = searchConditions;
        }
      }
    }

    // Fetch matching applications
    const applications = await Application.find(filter).sort({ createdAt: -1 }).lean();

    if (!applications || applications.length === 0) {
      return new NextResponse("No applications found matching export criteria.", { status: 404 });
    }

    const allHeaders = {
      id: "ID",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      regNo: "Registration No",
      year: "Academic Year",
      branch: "Branch",
      whyMic: "Why MIC",
      createdAt: "Applied Date",
      overallStatus: "Overall Status",
      activePreference: "Active Preference",
      firstPref: "First Preference",
      firstPrefType: "First Pref Type",
      firstPrefStatus: "First Pref Status",
      firstPrefStage: "First Pref Current Stage",
      secondPref: "Second Preference",
      secondPrefType: "Second Pref Type",
      secondPrefStatus: "Second Pref Status",
      secondPrefStage: "Second Pref Current Stage",
      adminNotes: "Admin Notes",
    };

    const columns = colsParam ? colsParam.split(",") : Object.keys(allHeaders);

    // Validate columns
    const activeCols = columns.filter((col) => col in allHeaders) as Array<keyof typeof allHeaders>;
    const headers = activeCols.map((col) => allHeaders[col]);

    interface ExportStage {
      stage?: number;
      adminNote?: string;
      reviewedBy?: string;
    }

    // Map rows
    const rows = (applications as Record<string, unknown>[]).map((app) => {
      const firstProgress = app.firstPrefProgress as Record<string, unknown> | undefined;
      const secondProgress = app.secondPrefProgress as Record<string, unknown> | undefined;

      const getAdminNotesString = () => {
        const notesList: string[] = [];
        const processStages = (stages: ExportStage[] | undefined, prefLabel: string) => {
          stages?.forEach((s) => {
            if (s.adminNote && s.adminNote.trim()) {
              const reviewer = s.reviewedBy ? ` (${s.reviewedBy})` : "";
              notesList.push(`[${prefLabel} Stage ${s.stage}] ${s.adminNote.trim()}${reviewer}`);
            }
          });
        };
        processStages(firstProgress?.stages as ExportStage[] | undefined, "First");
        processStages(secondProgress?.stages as ExportStage[] | undefined, "Second");
        return notesList.join(" | ");
      };

      const rawFirstPref = String(app.firstPreference ?? "");
      const rawSecondPref = String(app.secondPreference ?? "");

      const cellMap = {
        id: String(app._id ?? ""),
        fullName: String(app.fullName ?? ""),
        email: String(app.userEmail ?? ""),
        phone: String(app.phone ?? ""),
        regNo: String(app.regNo ?? ""),
        year: String(app.year ?? ""),
        branch: String(app.branch ?? ""),
        whyMic: String(app.whyMic ?? "").replace(/[\r\n]+/g, " "),
        createdAt: app.createdAt ? new Date(app.createdAt as string).toISOString() : "",
        overallStatus: String(app.overallStatus ?? ""),
        activePreference: String(app.activePreference ?? "first"),
        firstPref: DEPT_NAMES[rawFirstPref] ?? rawFirstPref,
        firstPrefType: String(app.firstPrefType ?? ""),
        firstPrefStatus: String(firstProgress?.status ?? ""),
        firstPrefStage: String(firstProgress?.currentStage ?? "1"),
        secondPref: DEPT_NAMES[rawSecondPref] ?? rawSecondPref,
        secondPrefType: String(app.secondPrefType ?? ""),
        secondPrefStatus: String(secondProgress?.status ?? ""),
        secondPrefStage: String(secondProgress?.currentStage ?? "1"),
        adminNotes: getAdminNotesString(),
      };

      return activeCols.map((col) => {
        const cell = cellMap[col] ?? "";
        return `"${cell.replace(/"/g, '""')}"`; // Escape quotes for CSV compatibility
      });
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mic-applicants-${ACTIVE_CYCLE_ID}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
