import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usernameExists, createUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters: letters, numbers, underscores only" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (usernameExists(username)) {
    return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  createUser(username, hash);

  return NextResponse.json({ success: true }, { status: 201 });
}
