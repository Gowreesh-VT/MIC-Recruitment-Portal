import { NextResponse } from "next/server";
import { createGameSessionToken } from "@/lib/gameSession";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { playerToken } = body;

    if (!playerToken || typeof playerToken !== "string" || playerToken.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Player identity token is required." },
        { status: 400 }
      );
    }

    const session = createGameSessionToken(playerToken);

    return NextResponse.json({
      success: true,
      sessionToken: session.sessionToken,
    });
  } catch (error: any) {
    console.error("POST /api/leaderboard/start error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize game session." },
      { status: 500 }
    );
  }
}
