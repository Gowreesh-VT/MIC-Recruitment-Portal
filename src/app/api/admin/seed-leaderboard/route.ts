import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Leaderboard from "@/models/Leaderboard";
import { generateRandomAnonymousName } from "@/lib/anonymousNames";

const FIRST_NAMES = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Dev", "Diya", "Ishan", "Kavya", "Manav",
  "Neha", "Pranav", "Rohan", "Riya", "Sahil", "Siddharth", "Tanvi", "Utkarsh",
  "Varun", "Yash", "Zoya", "Alex", "Chris", "Jordan", "Morgan", "Taylor", "Sam"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Kumar", "Singh", "Joshi", "Mehta",
  "Nair", "Rao", "Reddy", "Chopra", "Deshmukh", "Iyer", "Kulkarni", "Shah"
];

function getRandomRealName(): string {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get("count");
    const count = Math.min(Math.max(parseInt(countParam || "100", 10), 1), 500);

    const now = Date.now();
    const sampleEntries = [];

    for (let i = 0; i < count; i++) {
      const baseScore = Math.floor(21 + Math.pow(Math.random(), 1.8) * 190);
      const anonName = generateRandomAnonymousName();
      const realName = getRandomRealName();
      const timeOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
      const createdAt = new Date(now - timeOffset);

      sampleEntries.push({
        anonymousName: anonName,
        realName,
        score: baseScore,
        createdAt,
      });
    }

    const inserted = await Leaderboard.insertMany(sampleEntries);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} leaderboard entries!`,
      count: inserted.length,
    });
  } catch (error: any) {
    console.error("POST /api/admin/seed-leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed leaderboard." },
      { status: 500 }
    );
  }
}
