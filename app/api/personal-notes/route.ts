import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPersonalNotes, addPersonalNote } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notes = getPersonalNotes(parseInt(session.user.id));
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { phrase, meaning, context } = await req.json();
  if (!phrase?.trim()) return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
  const id = addPersonalNote(
    parseInt(session.user.id),
    phrase.trim(),
    (meaning ?? "").trim(),
    (context ?? "").trim()
  );
  return NextResponse.json({ id });
}
