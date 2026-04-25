import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getHistoryByUserId, addHistoryToDb, clearHistoryFromDb } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const history = getHistoryByUserId(parseInt(session.user.id));
  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await req.json();
  addHistoryToDb(parseInt(session.user.id), item);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  clearHistoryFromDb(parseInt(session.user.id));
  return NextResponse.json({ ok: true });
}
