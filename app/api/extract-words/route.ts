import "server-only";
import { NextResponse } from "next/server";
import { search } from "@/lib/dictionary";
import { toHiragana } from "wanakana";

type Token = {
  surface_form: string;
  reading: string;
  pos: string;
  pos_detail_1: string;
  basic_form: string;
};

let tokenizerPromise: Promise<{ tokenize: (text: string) => Token[] }> | null = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const kuromoji = require("kuromoji");
      kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build(
        (err: Error | null, tokenizer: any) => {
          if (err) {
            tokenizerPromise = null;
            reject(err);
          } else {
            resolve(tokenizer);
          }
        }
      );
    });
  }
  return tokenizerPromise;
}

const EXCLUDE_NOUN_DETAIL = new Set(["代名詞", "数", "接尾", "非自立"]);

function isEssential(token: Token): boolean {
  if (token.pos === "動詞" && token.pos_detail_1 === "自立") return true;
  if (token.pos === "形容詞" && token.pos_detail_1 === "自立") return true;
  if (token.pos === "副詞") return true;
  if (token.pos === "名詞") return !EXCLUDE_NOUN_DETAIL.has(token.pos_detail_1);
  return false;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ words: [] });

    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);

    const seen = new Set<string>();
    const words: { word: string; reading: string; pos: string; meanings: string[] }[] = [];

    for (const token of tokens) {
      if (!isEssential(token)) continue;
      const word =
        token.basic_form && token.basic_form !== "*"
          ? token.basic_form
          : token.surface_form;
      if (!word || word.length < 2) continue;
      if (seen.has(word)) continue;
      seen.add(word);

      const dictMatch = search(word, "jp", 1)[0];
      const meanings = dictMatch?.meanings.slice(0, 3) ?? [];

      const reading = token.reading ? toHiragana(token.reading) : "";
      words.push({ word, reading, pos: token.pos, meanings });
    }

    return NextResponse.json({ words });
  } catch (err) {
    console.error("extract-words error:", err);
    return NextResponse.json({ error: "Failed to extract words" }, { status: 500 });
  }
}
