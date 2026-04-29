import { readFileSync } from "fs";
import path from "path";
import type { DictData, DictWord, SearchResult } from "./types";
import { toRomaji } from "./romaji";

// Part-of-speech shorthand labels
const POS_LABELS: Record<string, string> = {
  "n": "Noun",
  "v1": "Verb (Ichidan)",
  "v5r": "Verb (Godan)",
  "v5k": "Verb (Godan)",
  "v5s": "Verb (Godan)",
  "v5t": "Verb (Godan)",
  "v5n": "Verb (Godan)",
  "v5b": "Verb (Godan)",
  "v5m": "Verb (Godan)",
  "v5g": "Verb (Godan)",
  "v5u": "Verb (Godan)",
  "vk": "Verb (Kuru)",
  "vs-i": "Verb (Suru)",
  "adj-i": "い-Adjective",
  "adj-na": "な-Adjective",
  "adv": "Adverb",
  "conj": "Conjunction",
  "prt": "Particle",
  "int": "Interjection",
  "exp": "Expression",
  "pn": "Pronoun",
  "aux-v": "Auxiliary Verb",
  "aux-adj": "Auxiliary Adjective",
  "suf": "Suffix",
  "pref": "Prefix",
  "ctr": "Counter",
  "num": "Numeral",
};

let _cache: DictData | null = null;
let _jlptMap: Record<string, string> | null = null;

function loadDict(): DictData {
  if (_cache) return _cache;
  try {
    const filePath = path.join(process.cwd(), "data", "jmdict.json");
    const raw = readFileSync(filePath, "utf-8");
    _cache = JSON.parse(raw) as DictData;
  } catch {
    _cache = { version: "", dictDate: "", words: [] };
  }
  return _cache;
}

function loadJlptMap(): Record<string, string> {
  if (_jlptMap) return _jlptMap;
  try {
    const filePath = path.join(process.cwd(), "data", "jlpt-map.json");
    _jlptMap = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    _jlptMap = {};
  }
  return _jlptMap!;
}

export function isJapanese(text: string): boolean {
  return /[　-鿿豈-﫿＀-￯]/.test(text);
}

function getJlpt(word: DictWord): string | null {
  // jmdict-simplified v3.6+ has no JLPT data; use the separately-built jlpt-map.json
  const map = loadJlptMap();
  const kanji = word.kanji[0]?.text;
  const kana = word.kana[0]?.text;
  return (kanji && map[kanji]) || (kana && map[kana]) || null;
}

function getPOS(word: DictWord): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const sense of word.sense) {
    for (const pos of sense.partOfSpeech) {
      const label = POS_LABELS[pos] ?? pos;
      if (!seen.has(label)) {
        seen.add(label);
        result.push(label);
      }
    }
  }
  return result;
}

function wordToResult(word: DictWord): SearchResult {
  const kanji = word.kanji[0]?.text ?? word.kana[0]?.text ?? "";
  const reading = word.kana[0]?.text ?? "";
  const romaji = toRomaji(reading);
  const meanings = word.sense.flatMap((s) => s.gloss).slice(0, 5);

  return {
    id: word.id,
    kanji,
    reading,
    romaji,
    meanings,
    partOfSpeech: getPOS(word),
    jlpt: getJlpt(word),
  };
}

export function search(
  query: string,
  mode: "auto" | "en" | "jp" = "auto",
  limit = 20
): SearchResult[] {
  const dict = loadDict();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const useJapanese =
    mode === "jp" || (mode === "auto" && isJapanese(query));

  const results: DictWord[] = [];

  if (useJapanese) {
    // Ranked: exact match > starts-with > contains
    const exactJp: DictWord[] = [];
    const startsWithJp: DictWord[] = [];
    const containsJp: DictWord[] = [];

    for (const word of dict.words) {
      const kanjiTexts = word.kanji.map((k) => k.text);
      const kanaTexts = word.kana.map((k) => k.text);
      const all = [...kanjiTexts, ...kanaTexts];

      if (all.some((t) => t === q)) {
        exactJp.push(word);
      } else if (all.some((t) => t.startsWith(q))) {
        startsWithJp.push(word);
      } else if (all.some((t) => t.includes(q))) {
        containsJp.push(word);
      }
    }

    results.push(...exactJp, ...startsWithJp, ...containsJp);
  } else {
    // Search English glosses + romaji (for transliterated input like "kutsu", "sushi")
    // Ranked: exact English > exact romaji > word-boundary English > partial romaji > substring English
    const exactEn: DictWord[] = [];
    const exactRomaji: DictWord[] = [];
    const wordBoundaryEn: DictWord[] = [];
    const partialRomaji: DictWord[] = [];
    const substringEn: DictWord[] = [];
    const wordBoundary = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    // Only attempt romaji matching for pure-letter queries (rules out numbers, spaces, etc.)
    const tryRomaji = mode !== "en" && /^[a-z]+$/.test(q);

    for (const word of dict.words) {
      const glosses = word.sense.flatMap((s) => s.gloss.map((g) => g.toLowerCase()));

      if (glosses.some((g) => g === q)) {
        exactEn.push(word);
      } else if (tryRomaji && word.kana.some((k) => toRomaji(k.text).toLowerCase() === q)) {
        exactRomaji.push(word);
      } else if (glosses.some((g) => wordBoundary.test(g))) {
        wordBoundaryEn.push(word);
      } else if (tryRomaji && word.kana.some((k) => toRomaji(k.text).toLowerCase().includes(q))) {
        partialRomaji.push(word);
      } else if (glosses.some((g) => g.includes(q))) {
        substringEn.push(word);
      }
    }

    results.push(...exactEn, ...exactRomaji, ...wordBoundaryEn, ...partialRomaji, ...substringEn);
  }

  return results.slice(0, limit).map(wordToResult);
}

export function getRandomWord(): SearchResult | null {
  const dict = loadDict();
  const map = loadJlptMap();
  // Prefer JLPT-tagged words (more useful/common vocabulary)
  const jlptWords = dict.words.filter((w) => {
    const kanji = w.kanji[0]?.text;
    const kana = w.kana[0]?.text;
    return (kanji && map[kanji]) || (kana && map[kana]);
  });
  const pool = jlptWords.length > 0 ? jlptWords : dict.words;
  const word = pool[Math.floor(Math.random() * pool.length)];
  return word ? wordToResult(word) : null;
}

export function getWordById(id: string): DictWord | null {
  const dict = loadDict();
  return dict.words.find((w) => w.id === id) ?? null;
}

export function getWordDetail(id: string): {
  word: DictWord;
  result: SearchResult;
} | null {
  const word = getWordById(id);
  if (!word) return null;
  return { word, result: wordToResult(word) };
}
