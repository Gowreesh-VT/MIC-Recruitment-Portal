import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Leaderboard from "@/models/Leaderboard";
import { escapeHtml } from "@/lib/escapeHtml";

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
    const { anonymousName, realName, score } = body;

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

    // Anti-cheat sanity cap
    if (numericScore > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid score range.",
        },
        { status: 400 }
      );
    }

    // Validate and sanitize anonymous identity
    let cleanName = typeof anonymousName === "string" ? anonymousName.trim() : "";
    if (!cleanName || !cleanName.startsWith("Anonymous ")) {
      cleanName = `Anonymous Bird #${Math.floor(100 + Math.random() * 900)}`;
    }
    cleanName = escapeHtml(cleanName.slice(0, 50));

    // Sanitize real name (saved privately in DB, never served in public GET API)
    const cleanRealName =
      typeof realName === "string" && realName.trim()
        ? escapeHtml(realName.trim().slice(0, 100))
        : undefined;

    await dbConnect();

    // Create entry in MongoDB
    const newEntry = await Leaderboard.create({
      anonymousName: cleanName,
      realName: cleanRealName,
      score: numericScore,
    });

    // Calculate player's current rank among all qualifying entries
    const higherScoresCount = await Leaderboard.countDocuments({
      score: { $gt: numericScore },
    });
    const rank = higherScoresCount + 1;

    return NextResponse.json({
      success: true,
      rank,
      entry: {
        id: newEntry._id.toString(),
        anonymousName: cleanName,
        score: numericScore,
        createdAt: newEntry.createdAt,
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
