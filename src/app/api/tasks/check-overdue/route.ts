import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import Task from "@/src/models/Task";
import { updateAuraScore } from "@/src/lib/score";
import { getUserId } from "@/src/lib/auth";

export async function POST() {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find pending tasks where dueDate is in the past
    const now = new Date();
    const overdueTasks = await Task.find({
      userId,
      status: "pending",
      dueDate: { $lt: now }
    });

    if (overdueTasks.length === 0) {
      return NextResponse.json({ updatedCount: 0 });
    }

    const ids = overdueTasks.map((t: any) => t._id);

    // Update them to missed
    await Task.updateMany(
      { _id: { $in: ids }, userId },
      { $set: { status: "missed" } }
    );

    // Update score: -1 for each missed task
    await updateAuraScore(userId, -overdueTasks.length);

    return NextResponse.json({ updatedCount: overdueTasks.length });
  } catch (error) {
    console.error("Overdue check error:", error);
    return NextResponse.json({ error: "Failed to check overdue tasks" }, { status: 500 });
  }
}
