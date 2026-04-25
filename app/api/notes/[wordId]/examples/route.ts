import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addUserExample } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { wordId } = await params;
  const { text, translation } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Example text is required" }, { status: 400 });
  }

  const id = addUserExample(parseInt(session.user.id), wordId, text.trim(), translation?.trim() ?? "");
  return NextResponse.json({ id, ok: true }, { status: 201 });
}
