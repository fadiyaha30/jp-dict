import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPersonalNotes, getPersonalNotesByWord, getPersonalNotesByGrammar, addPersonalNote } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt(session.user.id);
  const wordId = req.nextUrl.searchParams.get("wordId");
  const grammarId = req.nextUrl.searchParams.get("grammarId");
  const notes = wordId
    ? getPersonalNotesByWord(userId, wordId)
    : grammarId
    ? getPersonalNotesByGrammar(userId, grammarId)
    : getPersonalNotes(userId);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { phrase, meaning, context, additional_notes, word_id, word_kanji, grammar_id, grammar_pattern } = await req.json();
  if (!phrase?.trim()) return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
  const id = addPersonalNote(
    parseInt(session.user.id),
    phrase.trim(),
    (meaning ?? "").trim(),
    (context ?? "").trim(),
    (additional_notes ?? "").trim(),
    word_id ?? undefined,
    word_kanji ?? undefined,
    grammar_id ?? undefined,
    grammar_pattern ?? undefined
  );
  return NextResponse.json({ id });
}
