import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updatePersonalNote, deletePersonalNote } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { phrase, meaning, context } = await req.json();
  if (!phrase?.trim()) return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
  updatePersonalNote(
    parseInt(session.user.id),
    parseInt(id),
    phrase.trim(),
    (meaning ?? "").trim(),
    (context ?? "").trim()
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  deletePersonalNote(parseInt(session.user.id), parseInt(id));
  return NextResponse.json({ ok: true });
}
