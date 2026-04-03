import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import ExtraLog from "@/src/models/ExtraLog";
import { updateAuraScore } from "@/src/lib/score";
import { getUserId } from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { description, points = 1 } = await request.json();
    const log = await ExtraLog.create({
      userId,
      description,
      points,
    });

    await updateAuraScore(userId, points);

    return NextResponse.json(log);
  } catch (error) {
    console.error("Log extra work error:", error);
    return NextResponse.json({ error: "Failed to log extra work" }, { status: 500 });
  }
}
