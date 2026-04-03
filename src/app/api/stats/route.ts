import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import Task from "@/src/models/Task";
import ExtraLog from "@/src/models/ExtraLog";
import { getUserId } from "@/src/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [completedCount, missedCount, extraCount] = await Promise.all([
      Task.countDocuments({ userId, status: "completed" }),
      Task.countDocuments({ userId, status: "missed" }),
      ExtraLog.countDocuments({ userId }),
    ]);

    // For the chart, we'll just mock some daily data for now or try to aggregate
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const chartData = last7Days.map((date, index) => ({
      date,
      score: Math.floor(Math.random() * 10) + index * 2,
    }));

    return NextResponse.json({
      completedCount,
      missedCount,
      extraCount,
      chartData
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
