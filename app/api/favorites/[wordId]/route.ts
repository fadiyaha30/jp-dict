import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isFavoritedInDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ favorited: false });
  const { wordId } = await params;
  const favorited = isFavoritedInDb(parseInt(session.user.id), wordId);
  return NextResponse.json({ favorited });
}
