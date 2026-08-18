import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import mongoose from "mongoose";
import { ACTIVE_CYCLE_ID, getCanonicalDeptSlug, getDeptSlugVariants } from "@/lib/constants";

export interface BulkAdvancedPayload {
  identifiers: string[]; // emails, regNos, or ObjectIds
  targetDepartment?: string; // department slug or "all" | "active"
  action: "advance" | "reject_department" | "reject_all" | "select" | "waitlist";
  targetStage?: number | "current"; // 1, 2, 3, or "current"
  nextStage?: number; // target stage when advancing (e.g. 2 or 3)
  note?: string;
  dryRun?: boolean; // if true, returns preview statistics without mutating DB
}

interface CandidateMatch {
  id: string;
  userEmail: string;
  fullName: string;
  regNo: string;
  firstPreference: string;
  secondPreference?: string;
  matchedPreference: "first" | "second" | "active" | "none";
  currentStage: number;
  preferenceStatus: string;
  overallStatus: string;
  willChangeTo?: string;
}

export async function POST(req: NextRequest) {
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

  try {
    const body: BulkAdvancedPayload = await req.json();
    const {
      identifiers = [],
      targetDepartment = "active",
      action,
      targetStage = "current",
      nextStage,
      note,
      dryRun = false,
    } = body;

    if (!["advance", "reject_department", "reject_all", "select", "waitlist"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action specified." },
        { status: 400 }
      );
    }

    if (!Array.isArray(identifiers) || identifiers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No candidate emails, registration numbers, or IDs provided." },
        { status: 400 }
      );
    }

    // Clean, trim, and deduplicate identifiers
    const cleanedIdentifiers = Array.from(
      new Set(
        identifiers
          .map((id) => (typeof id === "string" ? id.trim() : ""))
          .filter((id) => id.length > 0)
      )
    );

    if (cleanedIdentifiers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid non-empty identifiers provided." },
        { status: 400 }
      );
    }

    // Classify identifiers: MongoDB ObjectIds vs emails vs reg numbers
    const objectIds: string[] = [];
    const emails: string[] = [];
    const regNos: string[] = [];

    for (const item of cleanedIdentifiers) {
      if (mongoose.Types.ObjectId.isValid(item) && item.length === 24) {
        objectIds.push(item);
      } else if (item.includes("@")) {
        emails.push(item.toLowerCase());
      } else {
        // Collect variations of registration numbers (uppercase, lowercase, raw)
        regNos.push(item);
        regNos.push(item.toUpperCase());
        regNos.push(item.toLowerCase());
      }
    }

    // Build query conditions
    const orConditions: Record<string, unknown>[] = [];
    if (objectIds.length > 0) {
      orConditions.push({ _id: { $in: objectIds } });
    }
    if (emails.length > 0) {
      orConditions.push({ userEmail: { $in: emails } });
    }
    if (regNos.length > 0) {
      orConditions.push({ regNo: { $in: Array.from(new Set(regNos)) } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not parse valid identifiers." },
        { status: 400 }
      );
    }

    // Query active recruitment applications
    const applications = await Application.find({
      $and: [
        { $or: [{ cycleId: ACTIVE_CYCLE_ID }, { cycleId: { $exists: false } }] },
        { $or: orConditions },
      ],
    });

    // Lookup user names from users collection for clean previews
    const appEmails = applications.map((a) => a.userEmail.toLowerCase());
    const db = mongoose.connection.db;
    const users = db
      ? await db
          .collection("users")
          .find({ email: { $in: appEmails } })
          .toArray()
      : [];
    const userMap = new Map(
      users.map((u) => [u.email?.toLowerCase(), u.name || ""])
    );

    // Build lookup sets to determine which inputs were matched vs not found
    const matchedEmails = new Set(applications.map((a) => (a.userEmail || "").toLowerCase().trim()));
    const matchedRegNos = new Set(applications.map((a) => (a.regNo || "").toUpperCase().trim()));
    const matchedIds = new Set(applications.map((a) => a._id.toString()));

    const notFoundIdentifiers: string[] = [];
    for (const item of cleanedIdentifiers) {
      const lower = item.toLowerCase();
      const upper = item.toUpperCase();
      if (!matchedEmails.has(lower) && !matchedRegNos.has(upper) && !matchedIds.has(item)) {
        notFoundIdentifiers.push(item);
      }
    }

    // Prepare department slug matching variants if targetDepartment is specified
    const hasSpecificDept =
      targetDepartment &&
      targetDepartment !== "all" &&
      targetDepartment !== "active";
    const canonicalTargetDept = hasSpecificDept
      ? getCanonicalDeptSlug(targetDepartment)
      : null;
    const targetDeptVariants = canonicalTargetDept
      ? getDeptSlugVariants(canonicalTargetDept)
      : [];

    const matchedCandidates: CandidateMatch[] = [];
    let updatedCount = 0;
    let firstPrefCount = 0;
    let secondPrefCount = 0;
    let otherDeptCount = 0;

    const reviewerEmail = session.user.email ?? "admin";
    const now = new Date();

    for (const app of applications) {
      // Defensive initialization of preference structures if missing
      if (!app.firstPrefProgress) {
        app.firstPrefProgress = { currentStage: 1, status: "active", stages: [] };
      }
      if (!app.firstPrefProgress.stages) {
        app.firstPrefProgress.stages = [];
      }
      if (!app.secondPrefProgress) {
        app.secondPrefProgress = { currentStage: 1, status: "active", stages: [] };
      }
      if (!app.secondPrefProgress.stages) {
        app.secondPrefProgress.stages = [];
      }

      // Determine candidate display name
      const displayName =
        app.fullName || userMap.get(app.userEmail.toLowerCase()) || "Candidate";

      // Determine which preference track to target
      let targetPref: "first" | "second" = app.activePreference || "first";

      if (hasSpecificDept && canonicalTargetDept) {
        const isFirst = targetDeptVariants.includes(app.firstPreference);
        const isSecond =
          Boolean(app.secondPreference && targetDeptVariants.includes(app.secondPreference));

        if (isFirst) {
          targetPref = "first";
          firstPrefCount++;
        } else if (isSecond) {
          targetPref = "second";
          secondPrefCount++;
        } else {
          // Candidate applied to other departments
          otherDeptCount++;
          matchedCandidates.push({
            id: app._id.toString(),
            userEmail: app.userEmail,
            fullName: displayName,
            regNo: app.regNo || "",
            firstPreference: app.firstPreference,
            secondPreference: app.secondPreference,
            matchedPreference: "none",
            currentStage: app.firstPrefProgress?.currentStage || 1,
            preferenceStatus: app.firstPrefProgress?.status || "active",
            overallStatus: app.overallStatus,
            willChangeTo: "Skipped (Has different department choices)",
          });
          continue;
        }
      } else {
        if (targetPref === "first") firstPrefCount++;
        else secondPrefCount++;
      }

      const progressKey =
        targetPref === "first" ? "firstPrefProgress" : "secondPrefProgress";
      const progress =
        targetPref === "first" ? app.firstPrefProgress : app.secondPrefProgress;

      // Determine which stage number to evaluate
      const stageToEvaluate =
        targetStage === "current" || typeof targetStage !== "number"
          ? progress.currentStage || 1
          : targetStage;

      let stageIdx = progress.stages.findIndex((s) => s.stage === stageToEvaluate);
      if (stageIdx === -1) {
        progress.stages.push({
          stage: stageToEvaluate,
          submittedAt: now,
          responses: {},
          result: "pending",
        });
        stageIdx = progress.stages.length - 1;
      }

      let willChangeToDescription = "";

      if (action === "advance") {
        const nextStageNum =
          typeof nextStage === "number" && nextStage > 0
            ? nextStage
            : stageToEvaluate + 1;

        willChangeToDescription = `Advanced to Stage ${nextStageNum}`;

        if (!dryRun) {
          progress.stages[stageIdx].result = "passed";
          progress.stages[stageIdx].reviewedBy = reviewerEmail;
          progress.stages[stageIdx].reviewedAt = now;
          if (note) progress.stages[stageIdx].adminNote = note;

          progress.currentStage = nextStageNum;
          progress.status = "active";
          app.markModified(progressKey);
        }
      } else if (action === "reject_department") {
        willChangeToDescription = `Rejected from ${hasSpecificDept ? canonicalTargetDept : targetPref + " preference"}`;

        if (!dryRun) {
          progress.stages[stageIdx].result = "failed";
          progress.stages[stageIdx].reviewedBy = reviewerEmail;
          progress.stages[stageIdx].reviewedAt = now;
          if (note) progress.stages[stageIdx].adminNote = note;

          progress.status = "rejected";

          // Mark any remaining pending stages in this preference as failed
          if (progress.stages) {
            progress.stages.forEach((s) => {
              if (s.result === "pending") s.result = "failed";
            });
          }

          // Candidate is overall rejected ONLY if BOTH preferences are rejected (or no 2nd pref exists)
          const firstIsRejected = app.firstPrefProgress.status === "rejected";
          const hasSecondPref =
            Boolean(app.secondPreference && (app.secondPreference as string) !== "");
          const secondIsRejected =
            !hasSecondPref || app.secondPrefProgress.status === "rejected";

          if (firstIsRejected && secondIsRejected) {
            app.overallStatus = "rejected";
            willChangeToDescription += " (Overall Status: Rejected)";
          } else {
            // If 1st preference is rejected and 2nd preference is active, switch activePreference to second
            if (targetPref === "first" && hasSecondPref && !secondIsRejected) {
              app.activePreference = "second";
              willChangeToDescription += " (2nd Choice remains active)";
            }
          }

          app.markModified(progressKey);
          app.markModified("activePreference");
          app.markModified("overallStatus");
        }
      } else if (action === "reject_all") {
        willChangeToDescription = "Rejected from All Preferences";

        if (!dryRun) {
          app.firstPrefProgress.status = "rejected";
          if (app.firstPrefProgress.stages) {
            app.firstPrefProgress.stages.forEach((s) => {
              if (s.result === "pending") s.result = "failed";
            });
          }

          app.secondPrefProgress.status = "rejected";
          if (app.secondPrefProgress.stages) {
            app.secondPrefProgress.stages.forEach((s) => {
              if (s.result === "pending") s.result = "failed";
            });
          }

          app.overallStatus = "rejected";
          app.markModified("firstPrefProgress");
          app.markModified("secondPrefProgress");
          app.markModified("overallStatus");
        }
      } else if (action === "select") {
        willChangeToDescription = "Selected for Club";

        if (!dryRun) {
          progress.stages[stageIdx].result = "passed";
          progress.stages[stageIdx].reviewedBy = reviewerEmail;
          progress.stages[stageIdx].reviewedAt = now;
          if (note) progress.stages[stageIdx].adminNote = note;

          progress.status = "passed";
          app.overallStatus = "selected";
          app.markModified(progressKey);
          app.markModified("overallStatus");
        }
      } else if (action === "waitlist") {
        willChangeToDescription = "Waitlisted";

        if (!dryRun) {
          app.overallStatus = "waitlisted";
          app.markModified("overallStatus");
        }
      }

      if (!dryRun) {
        await app.save();
      }

      updatedCount++;

      matchedCandidates.push({
        id: app._id.toString(),
        userEmail: app.userEmail,
        fullName: displayName,
        regNo: app.regNo || "",
        firstPreference: app.firstPreference,
        secondPreference: app.secondPreference,
        matchedPreference: targetPref,
        currentStage: progress.currentStage || 1,
        preferenceStatus: progress.status || "active",
        overallStatus: app.overallStatus,
        willChangeTo: willChangeToDescription,
      });
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        totalProvided: cleanedIdentifiers.length,
        foundCount: applications.length,
        updatedCount,
        notFoundCount: notFoundIdentifiers.length,
        firstPreferenceMatches: firstPrefCount,
        secondPreferenceMatches: secondPrefCount,
        otherDepartmentMatches: otherDeptCount,
      },
      notFound: notFoundIdentifiers,
      matched: matchedCandidates,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Bulk advanced action execution failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
