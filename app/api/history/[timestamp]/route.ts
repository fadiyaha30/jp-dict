import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeHistoryItemFromDb } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { timestamp } = await params;
  removeHistoryItemFromDb(parseInt(session.user.id), parseInt(timestamp));
  return NextResponse.json({ ok: true });
}
