import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import Config from "@/src/models/Config";
import { ensureConfig } from "@/src/lib/score";
import { getUserId } from "@/src/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureConfig(userId);
    const config = await Config.findOne({ userId });
    return NextResponse.json({ auraScore: config?.auraScore || 0 });
  } catch (error) {
    console.error("Fetch score error:", error);
    return NextResponse.json({ error: "Failed to fetch score" }, { status: 500 });
  }
}
