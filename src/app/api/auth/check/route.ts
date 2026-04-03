import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import User from "@/src/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ exists: false });
    }

    const existingUser = await User.findOne({ password });
    
    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Check password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
