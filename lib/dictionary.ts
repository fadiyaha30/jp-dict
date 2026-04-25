import { readFileSync } from "fs";
import path from "path";
import type { DictData, DictWord, SearchResult } from "./types";
import { toRomaji } from "./romaji";

// JLPT level tags used in jmdict-simplified
const JLPT_TAGS: Record<string, string> = {
  "jlpt-n1": "N1",
  "jlpt-n2": "N2",
  "jlpt-n3": "N3",
  "jlpt-n4": "N4",
  "jlpt-n5": "N5",
};

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

function loadDict(): DictData {
  if (_cache) return _cache;
  const filePath = path.join(process.cwd(), "data", "jmdict.json");
  const raw = readFileSync(filePath, "utf-8");
  _cache = JSON.parse(raw) as DictData;
  return _cache;
}

export function isJapanese(text: string): boolean {
  return /[　-鿿豈-﫿＀-￯]/.test(text);
}

function getJlpt(word: DictWord): string | null {
  for (const sense of word.sense) {
    for (const tag of sense.tags) {
      if (JLPT_TAGS[tag]) return JLPT_TAGS[tag];
    }
  }
  // Also check kana/kanji tags in some jmdict versions
  for (const k of word.kana) {
    for (const tag of k.tags) {
      if (JLPT_TAGS[tag]) return JLPT_TAGS[tag];
    }
  }
  return null;
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
    // Search kanji and kana fields
    for (const word of dict.words) {
      const matchKanji = word.kanji.some((k) => k.text.includes(q));
      const matchKana = word.kana.some((k) =>
        k.text.includes(q) || toRomaji(k.text).toLowerCase().includes(q)
      );
      if (matchKanji || matchKana) {
        results.push(word);
        if (results.length >= limit) break;
      }
    }
  } else {
    // Search English glosses — ranked: exact match > word-start > substring
    const exact: DictWord[] = [];
    const wordStart: DictWord[] = [];
    const substring: DictWord[] = [];
    const wordBoundary = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

    for (const word of dict.words) {
      const glosses = word.sense.flatMap((s) => s.gloss.map((g) => g.toLowerCase()));
      if (glosses.some((g) => g === q)) {
        exact.push(word);
      } else if (glosses.some((g) => wordBoundary.test(g))) {
        wordStart.push(word);
      } else if (glosses.some((g) => g.includes(q))) {
        substring.push(word);
      }
    }

    results.push(...exact, ...wordStart, ...substring);
  }

  return results.slice(0, limit).map(wordToResult);
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
