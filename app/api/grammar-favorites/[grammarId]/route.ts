import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isGrammarFavoritedInDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ grammarId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ favorited: false });
  const { grammarId } = await params;
  const favorited = isGrammarFavoritedInDb(parseInt(session.user.id), grammarId);
  return NextResponse.json({ favorited });
}
