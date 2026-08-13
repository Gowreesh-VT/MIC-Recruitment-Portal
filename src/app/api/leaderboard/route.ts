import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Leaderboard from "@/models/Leaderboard";
import { escapeHtml } from "@/lib/escapeHtml";
import { auth } from "@/auth";

import {
  verifyGameSessionToken,
  consumeGameSessionToken,
  validateGameScore,
} from "@/lib/gameSession";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    const limit = Math.min(Math.max(parseInt(limitParam || "25", 10), 1), 100);
    const page = Math.max(parseInt(pageParam || "1", 10), 1);
    const skip = (page - 1) * limit;

    // Filter for scores strictly > 20
    const filter = { score: { $gt: 20 } };

    // Get total count for pagination
    const totalCount = await Leaderboard.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Fetch entries for current page
    // Tie-break logic: Sort by score DESC, then createdAt ASC (first to achieve score wins ties)
    const entries = await Leaderboard.find(filter, "anonymousName score createdAt")
      .sort({ score: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedEntries = entries.map((item: any, index: number) => ({
      id: item._id.toString(),
      rank: skip + index + 1,
      anonymousName: escapeHtml(item.anonymousName),
      score: item.score,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: formattedEntries,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { anonymousName, score, sessionToken, playerToken } = body;

    // Validate score requirement (> 20)
    const numericScore = Math.floor(Number(score));
    if (isNaN(numericScore) || numericScore <= 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Score must be greater than 20 to qualify for the Leaderboard.",
        },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic game session token
    const verification = verifyGameSessionToken(sessionToken, playerToken);
    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          error: verification.reason || "Invalid game session token.",
        },
        { status: 400 }
      );
    }

    // 2. Validate physical time and speed limits
    const scoreValidation = validateGameScore(
      numericScore,
      verification.startTime!
    );
    if (!scoreValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: scoreValidation.reason || "Gameplay speed check failed.",
        },
        { status: 400 }
      );
    }

    // Mark session token as consumed (prevents replay attacks)
    consumeGameSessionToken(verification.sessionId!);

    // Automatically retrieve real name from user session if authenticated
    let userRealName: string | undefined;
    try {
      const session = await auth();
      if (session?.user?.name || session?.user?.email) {
        userRealName = session.user.name || session.user.email || undefined;
      }
    } catch (authError) {
      // Session lookup fallback
    }

    // Validate and sanitize anonymous identity
    let cleanName = typeof anonymousName === "string" ? anonymousName.trim() : "";
    if (!cleanName || !cleanName.startsWith("Anonymous ")) {
      cleanName = `Anonymous Bird #${Math.floor(100 + Math.random() * 900)}`;
    }
    cleanName = escapeHtml(cleanName.slice(0, 50));

    const cleanRealName = userRealName ? escapeHtml(userRealName.slice(0, 100)) : undefined;

    await dbConnect();

    // 3. Upsert logic: Check owner matching via playerTokenHash
    let entryDoc = await Leaderboard.findOne({ anonymousName: cleanName });

    if (entryDoc) {
      // If entry belongs to a player token, ensure requesting playerTokenHash matches
      if (
        entryDoc.playerTokenHash &&
        entryDoc.playerTokenHash !== verification.playerTokenHash
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "This anonymous name is registered to another device.",
          },
          { status: 403 }
        );
      }

      // Update if new score is higher than saved personal best
      if (numericScore > entryDoc.score) {
        entryDoc.score = numericScore;
        if (cleanRealName && !entryDoc.realName) {
          entryDoc.realName = cleanRealName;
        }
        if (!entryDoc.playerTokenHash) {
          entryDoc.playerTokenHash = verification.playerTokenHash;
        }
        await entryDoc.save();
      }
    } else {
      // Create new leaderboard row with playerTokenHash
      entryDoc = await Leaderboard.create({
        anonymousName: cleanName,
        realName: cleanRealName,
        playerTokenHash: verification.playerTokenHash,
        score: numericScore,
      });
    }

    // Calculate rank with tie-breaking logic (higher score OR same score with earlier createdAt timestamp)
    const higherScoresCount = await Leaderboard.countDocuments({
      $or: [
        { score: { $gt: entryDoc.score } },
        { score: entryDoc.score, createdAt: { $lt: entryDoc.createdAt } },
      ],
    });
    const rank = higherScoresCount + 1;

    return NextResponse.json({
      success: true,
      rank,
      entry: {
        id: entryDoc._id.toString(),
        anonymousName: cleanName,
        score: entryDoc.score,
        createdAt: entryDoc.createdAt,
      },
    });
  } catch (error: any) {
    console.error("POST /api/leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit score to leaderboard." },
      { status: 500 }
    );
  }
}
