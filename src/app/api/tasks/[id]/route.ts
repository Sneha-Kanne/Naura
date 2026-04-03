import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import Task from "@/src/models/Task";
import { updateAuraScore } from "@/src/lib/score";
import { getUserId } from "@/src/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status } = await request.json();
    const { id } = params;

    const oldTask = await Task.findOne({ _id: id, userId });
    if (!oldTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Only update score if status changes to completed or missed
    let scoreChange = 0;
    if (oldTask.status === "pending") {
      if (status === "completed") scoreChange = 1;
      if (status === "missed") scoreChange = -1;
    } else if (oldTask.status === "completed" && status === "pending") {
      scoreChange = -1;
    } else if (oldTask.status === "missed" && status === "pending") {
      scoreChange = 1;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { status },
      { new: true }
    );

    if (scoreChange !== 0) {
      await updateAuraScore(userId, scoreChange);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
