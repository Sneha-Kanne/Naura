import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import Task from "@/src/models/Task";
import { getUserId } from "@/src/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, dueDate } = await request.json();
    const task = await Task.create({
      userId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "pending",
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
