/**
 * Builds data/jlpt-map.json by fetching JLPT-tagged words from the Jisho API.
 * Maps each word's primary kanji (or kana fallback) to its JLPT level (N1-N5).
 *
 * Run: node scripts/download-jlpt.mjs
 */
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(OUT_DIR, "jlpt-map.json");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
// Upper bound page limits per level (checked empirically — these are generous ceilings)
const MAX_PAGES = { n5: 45, n4: 35, n3: 100, n2: 100, n1: 185 };
const CONCURRENCY = 1;
const DELAY_MS = 500;

async function fetchPage(level, page, retries = 4) {
  const url = `https://jisho.org/api/v1/search/words?keyword=%23jlpt-${level}&page=${page}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "faya-dict-setup-script/1.0" } });
    if (res.status === 429) {
      const wait = 2000 * (attempt + 1);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`Jisho API error: ${res.status} for ${level} p${page}`);
    const json = await res.json();
    return json.data ?? [];
  }
  throw new Error(`Too many 429s for ${level} p${page}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchLevel(level) {
  const label = level.toUpperCase();
  const maxPage = MAX_PAGES[level];
  const words = new Map(); // word/kana → level
  let page = 1;
  let empty = 0;

  while (page <= maxPage && empty < 2) {
    // Batch CONCURRENCY pages at a time
    const batch = [];
    for (let i = 0; i < CONCURRENCY && page <= maxPage; i++, page++) {
      batch.push(fetchPage(level, page));
    }
    const results = await Promise.all(batch);

    for (const entries of results) {
      if (entries.length === 0) {
        empty++;
        continue;
      }
      empty = 0;
      for (const entry of entries) {
        const jp = entry.japanese?.[0];
        if (!jp) continue;
        const key = jp.word ?? jp.reading;
        if (key && !words.has(key)) {
          words.set(key, label);
        }
        // Also index the kana reading as a secondary key
        if (jp.word && jp.reading && !words.has(jp.reading)) {
          words.set(jp.reading, label);
        }
      }
    }

    process.stdout.write(`\r  ${label}: ${words.size} entries (page ${page - 1}/${maxPage})...`);
    await sleep(DELAY_MS);
  }

  process.stdout.write(`\r  ${label}: ${words.size} entries                             \n`);
  return words;
}

console.log("Downloading JLPT vocab from Jisho API...");
const combined = {};

for (const level of LEVELS) {
  const map = await fetchLevel(level);
  for (const [word, lvl] of map) {
    // Lower-numbered (harder) levels take precedence only if not already set
    if (!(word in combined)) {
      combined[word] = lvl;
    }
  }
}

console.log(`Total unique JLPT entries: ${Object.keys(combined).length}`);
await writeFile(OUT_FILE, JSON.stringify(combined));
console.log(`Done! → ${OUT_FILE}`);
