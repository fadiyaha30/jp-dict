import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addFavoriteToDb, addHistoryToDb, isFavoritedInDb } from "@/lib/db";
import type { FavoriteItem } from "@/lib/favorites";
import type { HistoryItem } from "@/lib/history";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt(session.user.id);

  const { favorites, history } = await req.json() as {
    favorites: FavoriteItem[];
    history: HistoryItem[];
  };

  for (const fav of favorites ?? []) {
    if (!isFavoritedInDb(userId, fav.id)) {
      addFavoriteToDb(userId, fav);
    }
  }

  for (const item of history ?? []) {
    addHistoryToDb(userId, item);
  }

  return NextResponse.json({ ok: true });
}
