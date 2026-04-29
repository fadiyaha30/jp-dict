import { NextResponse } from "next/server";
import { fetchKanjiSvg } from "@/lib/kanjivg";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const char = searchParams.get("char");
  if (!char) return NextResponse.json({ error: "Missing char" }, { status: 400 });
  const svg = await fetchKanjiSvg(char);
  return NextResponse.json({ svg });
}
