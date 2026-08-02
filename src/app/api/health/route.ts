import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  let isHealthy = false;

  try {
    await dbConnect();
    isHealthy = mongoose.connection.readyState === 1;
  } catch (err) {
    // Log internally — do not surface DB error details in the response
    console.error("[HEALTH] Database connection check failed:", err);
  }

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
