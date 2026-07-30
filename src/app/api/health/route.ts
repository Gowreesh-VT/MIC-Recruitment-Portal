import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = "disconnected";

  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      dbStatus = "connected";
    } else {
      dbStatus = `state_${mongoose.connection.readyState}`;
    }
  } catch (err) {
    dbStatus = "error";
    console.error("[HEALTH] Database connection check failed:", err);
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp,
      services: {
        database: dbStatus,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
