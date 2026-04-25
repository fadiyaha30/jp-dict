import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getFavoritesByUserId,
  addFavoriteToDb,
  removeFavoriteFromDb,
  isFavoritedInDb,
} from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const favorites = getFavoritesByUserId(parseInt(session.user.id));
  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt(session.user.id);
  const item = await req.json();

  if (isFavoritedInDb(userId, item.id)) {
    removeFavoriteFromDb(userId, item.id);
    return NextResponse.json({ favorited: false });
  } else {
    addFavoriteToDb(userId, item);
    return NextResponse.json({ favorited: true });
  }
}
