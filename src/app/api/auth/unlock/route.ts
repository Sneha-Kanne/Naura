import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/db";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { action, password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let user;

    if (action === "register") {
      const existingUser = await User.findOne({ password });
      if (existingUser) {
        return NextResponse.json({ error: "Password already in use. Please choose another or login." }, { status: 400 });
      }
      user = await User.create({ password });
    } else {
      user = await User.findOne({ password });
      if (!user) {
        return NextResponse.json({ error: "Invalid password." }, { status: 401 });
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, userId: user._id });

    // Set HTTP-only cookie with the JWT
    response.cookies.set("naura_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
