import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserNote, getUserExamples, saveUserNote } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { wordId } = await params;
  const userId = parseInt(session.user.id);

  const note = getUserNote(userId, wordId);
  const examples = getUserExamples(userId, wordId);

  return NextResponse.json({ note: note?.note ?? "", examples });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { wordId } = await params;
  const { note } = await req.json();

  saveUserNote(parseInt(session.user.id), wordId, note ?? "");
  return NextResponse.json({ ok: true });
}
