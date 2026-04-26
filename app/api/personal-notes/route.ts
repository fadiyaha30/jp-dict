import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPersonalNotes, getPersonalNotesByWord, addPersonalNote } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt(session.user.id);
  const wordId = req.nextUrl.searchParams.get("wordId");
  const notes = wordId ? getPersonalNotesByWord(userId, wordId) : getPersonalNotes(userId);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { phrase, meaning, context, word_id, word_kanji } = await req.json();
  if (!phrase?.trim()) return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
  const id = addPersonalNote(
    parseInt(session.user.id),
    phrase.trim(),
    (meaning ?? "").trim(),
    (context ?? "").trim(),
    word_id ?? undefined,
    word_kanji ?? undefined
  );
  return NextResponse.json({ id });
}
