import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import mongoose from "mongoose";
import { ACTIVE_CYCLE_ID, getCanonicalDeptSlug, getDeptSlugVariants } from "@/lib/constants";
import { createZipArchive, ZipFileItem } from "@/lib/zip";

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

const ALL_HEADERS = {
  id: "ID",
  fullName: "Full Name",
  email: "Email",
  phone: "Phone Number",
  regNo: "Registration No",
  dept: "Department",
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

interface FormFieldItem {
  id: string;
  label: string;
}

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function getCandidateAnswerForDept(
  app: Record<string, unknown>,
  deptSlug: string,
  fieldId: string
): string {
  const stagesToSearch: Array<Record<string, unknown>> = [];

  const targetSlug = getCanonicalDeptSlug(deptSlug);
  const rawFirst = getCanonicalDeptSlug(String(app.firstPreference ?? ""));
  const rawSecond = getCanonicalDeptSlug(String(app.secondPreference ?? ""));

  if (rawFirst === targetSlug && (app.firstPrefProgress as Record<string, unknown> | undefined)?.stages) {
    const stages = (app.firstPrefProgress as Record<string, unknown>).stages;
    if (Array.isArray(stages)) {
      stagesToSearch.push(...(stages as Array<Record<string, unknown>>));
    }
  }

  if (rawSecond === targetSlug && (app.secondPrefProgress as Record<string, unknown> | undefined)?.stages) {
    const stages = (app.secondPrefProgress as Record<string, unknown>).stages;
    if (Array.isArray(stages)) {
      stagesToSearch.push(...(stages as Array<Record<string, unknown>>));
    }
  }

  const savedMap = app.savedDepartmentResponses as Record<string, unknown> | undefined;
  if (savedMap && typeof savedMap === "object") {
    for (const [k, stages] of Object.entries(savedMap)) {
      if (getCanonicalDeptSlug(k) === targetSlug && Array.isArray(stages)) {
        stagesToSearch.push(...(stages as Array<Record<string, unknown>>));
      }
    }
  }

  for (const stageSub of stagesToSearch) {
    if (stageSub?.responses && typeof stageSub.responses === "object") {
      const respObj = stageSub.responses as Record<string, unknown>;
      if (fieldId in respObj || Object.prototype.hasOwnProperty.call(respObj, fieldId)) {
        const val = respObj[fieldId];
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) return val.join(", ");
          if (typeof val === "object") return JSON.stringify(val);
          return String(val);
        }
      }
    }
  }
  return "";
}

function buildDepartmentCsvContent(
  applications: Record<string, unknown>[],
  deptSlug: string,
  deptName: string,
  deptFields: FormFieldItem[],
  activeCols: Array<keyof typeof ALL_HEADERS>
): string {
  // 1. Build Headers row
  const headerLabels = activeCols.map((col) => ALL_HEADERS[col]);

  // Append Question 1, Answer 1, Question 2, Answer 2...
  deptFields.forEach((_, idx) => {
    headerLabels.push(`Question ${idx + 1}`);
    headerLabels.push(`Answer ${idx + 1}`);
  });

  const headerLine = headerLabels.map(escapeCsvCell).join(",");

  // 2. Build Application rows
  const rows = applications.map((app) => {
    const firstProgress = app.firstPrefProgress as Record<string, unknown> | undefined;
    const secondProgress = app.secondPrefProgress as Record<string, unknown> | undefined;

    const getAdminNotesString = () => {
      const notesList: string[] = [];
      const processStages = (stages: Array<Record<string, unknown>> | undefined, prefLabel: string) => {
        stages?.forEach((s) => {
          if (s.adminNote && typeof s.adminNote === "string" && s.adminNote.trim()) {
            const reviewer = s.reviewedBy ? ` (${s.reviewedBy})` : "";
            notesList.push(`[${prefLabel} Stage ${s.stage}] ${s.adminNote.trim()}${reviewer}`);
          }
        });
      };
      processStages(firstProgress?.stages as Array<Record<string, unknown>> | undefined, "First");
      processStages(secondProgress?.stages as Array<Record<string, unknown>> | undefined, "Second");
      return notesList.join(" | ");
    };

    const rawFirstPref = getCanonicalDeptSlug(String(app.firstPreference ?? ""));
    const rawSecondPref = getCanonicalDeptSlug(String(app.secondPreference ?? ""));

    const cellMap: Record<string, string> = {
      id: String(app._id ?? ""),
      fullName: String(app.fullName ?? ""),
      email: String(app.userEmail ?? ""),
      phone: String(app.phone ?? ""),
      regNo: String(app.regNo ?? ""),
      dept: DEPT_NAMES[deptSlug] ?? deptName ?? deptSlug,
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

    const rowCells = activeCols.map((col) => escapeCsvCell(cellMap[col] ?? ""));

    // Add Question & Answer cells
    deptFields.forEach((field) => {
      rowCells.push(escapeCsvCell(field.label));
      const answer = getCandidateAnswerForDept(app, deptSlug, field.id);
      rowCells.push(escapeCsvCell(answer));
    });

    return rowCells.join(",");
  });

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  return "\uFEFF" + [headerLine, ...rows].join("\n");
}

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
    const formatParam = searchParams.get("format"); // "csv" | "zip"

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
        const canonicalDept = getCanonicalDeptSlug(deptParam.trim());
        const deptVariants = getDeptSlugVariants(canonicalDept);
        if (prefParam === "first") {
          filter.firstPreference = { $in: deptVariants };
        } else if (prefParam === "second") {
          filter.secondPreference = { $in: deptVariants };
        } else if (prefParam === "active") {
          filter.$or = [
            { firstPreference: { $in: deptVariants }, activePreference: "first" },
            { secondPreference: { $in: deptVariants }, activePreference: "second" },
          ];
        } else {
          filter.$or = [
            { firstPreference: { $in: deptVariants } },
            { secondPreference: { $in: deptVariants } },
          ];
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
    const applications = (await Application.find(filter).sort({ createdAt: -1 }).lean()) as Record<string, unknown>[];

    if (!applications || applications.length === 0) {
      return new NextResponse("No applications found matching export criteria.", { status: 404 });
    }

    // Columns selection
    const columns = colsParam ? colsParam.split(",") : Object.keys(ALL_HEADERS);
    const activeCols = columns.filter((col) => col in ALL_HEADERS) as Array<keyof typeof ALL_HEADERS>;

    // Fetch department definitions from database for dynamic questions
    const deptDocs = (await Department.find({}).lean()) as Array<{
      slug: string;
      name: string;
      stages?: Array<{ formFields?: Array<{ id: string; label: string }> }>;
    }>;

    const deptMap = new Map<string, (typeof deptDocs)[0]>();
    deptDocs.forEach((d) => {
      if (d.slug) {
        deptMap.set(getCanonicalDeptSlug(d.slug), d);
      }
    });

    const getDeptFormFields = (slug: string): FormFieldItem[] => {
      const canonical = getCanonicalDeptSlug(slug);
      let deptDoc = deptMap.get(canonical);
      if (!deptDoc) {
        const variants = getDeptSlugVariants(canonical);
        for (const v of variants) {
          if (deptMap.has(v)) {
            deptDoc = deptMap.get(v);
            break;
          }
        }
      }
      if (!deptDoc || !deptDoc.stages) return [];
      const fields: FormFieldItem[] = [];
      const seen = new Set<string>();
      for (const stage of deptDoc.stages) {
        for (const field of stage.formFields || []) {
          if (field.id && !seen.has(field.id)) {
            seen.add(field.id);
            fields.push({ id: field.id, label: field.label || field.id });
          }
        }
      }
      return fields;
    };

    // Decide whether to produce a ZIP of all department CSVs or a single CSV:
    // If formatParam === "zip" or no specific deptParam was supplied (Download All Departments)
    const isZip = formatParam === "zip" || (!deptParam && formatParam !== "csv");

    if (isZip) {
      // Generate individual department CSVs
      const zipFiles: ZipFileItem[] = [];

      // Get list of canonical department slugs
      const deptSlugs = Array.from(
        new Set(
          deptDocs.length > 0
            ? deptDocs.map((d) => getCanonicalDeptSlug(d.slug))
            : Object.keys(DEPT_NAMES).map(getCanonicalDeptSlug)
        )
      );

      for (const slug of deptSlugs) {
        const deptName = DEPT_NAMES[slug] || deptMap.get(slug)?.name || slug;

        // Filter applications belonging to this department (either 1st or 2nd pref)
        const deptApps = applications.filter(
          (app) =>
            getCanonicalDeptSlug(String(app.firstPreference ?? "")) === slug ||
            getCanonicalDeptSlug(String(app.secondPreference ?? "")) === slug
        );

        const deptFields = getDeptFormFields(slug);
        const csvText = buildDepartmentCsvContent(deptApps, slug, deptName, deptFields, activeCols);

        // Sanitize filename: e.g. web-development.csv, app-development.csv, ai-ml.csv, cyber-security.csv, ui-ux.csv
        const safeFilename = `${slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}.csv`;
        zipFiles.push({
          filename: safeFilename,
          content: csvText,
        });
      }

      const zipBuffer = await createZipArchive(zipFiles);

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="mic-recruitment-departments-${ACTIVE_CYCLE_ID}.zip"`,
        },
      });
    }

    // Single Department CSV Export
    const targetSlug = getCanonicalDeptSlug(
      deptParam || String(applications[0]?.firstPreference || "development")
    );
    const targetName = DEPT_NAMES[targetSlug] || deptMap.get(targetSlug)?.name || targetSlug;
    const deptFields = getDeptFormFields(targetSlug);

    // Filter applications belonging to target department if not already filtered
    const deptApps = applications.filter(
      (app) =>
        getCanonicalDeptSlug(String(app.firstPreference ?? "")) === targetSlug ||
        getCanonicalDeptSlug(String(app.secondPreference ?? "")) === targetSlug
    );

    const csvContent = buildDepartmentCsvContent(
      deptApps.length > 0 ? deptApps : applications,
      targetSlug,
      targetName,
      deptFields,
      activeCols
    );
    const filenameSlug = targetSlug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filenameSlug}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

