import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUserExample } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ wordId: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  deleteUserExample(parseInt(session.user.id), parseInt(id));
  return NextResponse.json({ ok: true });
}
