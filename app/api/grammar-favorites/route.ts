import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getGrammarFavoritesByUserId,
  addGrammarFavoriteToDb,
  removeGrammarFavoriteFromDb,
  isGrammarFavoritedInDb,
} from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const favorites = getGrammarFavoritesByUserId(parseInt(session.user.id));
  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt(session.user.id);
  const { grammar_id, pattern, meaning, jlpt } = await req.json();

  if (isGrammarFavoritedInDb(userId, grammar_id)) {
    removeGrammarFavoriteFromDb(userId, grammar_id);
    return NextResponse.json({ favorited: false });
  } else {
    addGrammarFavoriteToDb(userId, grammar_id, pattern, meaning, jlpt);
    return NextResponse.json({ favorited: true });
  }
}
