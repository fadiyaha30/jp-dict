// Usage: node scripts/scrape-grammar.mjs
// Scrapes JLPT N5–N1 grammar points from jlptsensei.com and writes data/grammar.json.
// Saves after each JLPT level so interruption doesn't lose progress.

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'data', 'grammar.json');
const BASE = 'https://jlptsensei.com';
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const DELAY_MS = 900;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (personal-study-app; non-commercial)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ── Collect all grammar URLs for a level (handles pagination) ──────────────

async function getUrlsForLevel(level) {
  const allUrls = [];
  let page = 1;

  while (true) {
    const listUrl =
      page === 1
        ? `${BASE}/jlpt-${level}-grammar-list/`
        : `${BASE}/jlpt-${level}-grammar-list/page/${page}/`;

    process.stdout.write(`  list page ${page}… `);
    const html = await fetchHtml(listUrl);
    const $ = load(html);

    const before = allUrls.length;
    $('a[href*="/learn-japanese-grammar/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !allUrls.includes(href)) allUrls.push(href);
    });
    console.log(`+${allUrls.length - before} urls`);

    // Check for a next-page link
    const nextHref = `${BASE}/jlpt-${level}-grammar-list/page/${page + 1}/`;
    const hasNext = $(`a[href="${nextHref}"]`).length > 0
      || $(`a[href*="/page/${page + 1}/"]`).length > 0;
    if (!hasNext) break;

    page++;
    await sleep(DELAY_MS);
  }

  return [...new Set(allUrls)];
}

// ── Scrape one grammar detail page ────────────────────────────────────────

function extractText($el) {
  return $el.text().replace(/\s+/g, ' ').trim();
}

async function scrapePoint(url, level, seqIndex) {
  const html = await fetchHtml(url);
  const $ = load(html);

  // ── Pattern ──────────────────────────────────────────────────────────────
  // The h1 contains: a block span with level info, and a span.jp with the pattern
  let pattern = $('h1 .jp, h1 span.jp').first().text().trim();
  if (!pattern) {
    // Fallback: strip the "JLPT N5 Grammar" prefix from h1 text
    pattern = $('h1').text()
      .replace(/JLPT\s+N\d\s+Grammar\s*:?\s*/i, '')
      .trim();
  }

  // ── Meaning ───────────────────────────────────────────────────────────────
  // Structure: <a name="meaning">Meaning</a><br>TEXT<a href=...>
  let meaning = '';
  const rawHtml = $.html();
  const afterMeaning = rawHtml.split('Meaning</a>')[1] || '';
  if (afterMeaning) {
    // Extract text before the next tag
    const cleaned = afterMeaning
      .replace(/<br\s*\/?>/gi, '')
      .split('<')[0]
      .replace(/[|]/g, '')
      .trim();
    meaning = cleaned;
  }

  // ── Structure / Formation ────────────────────────────────────────────────
  // table.usage has <tbody><tr><td> rows without closing tags — cheerio handles it
  let structure = '';
  const usageTable = $('table.usage, table.table-sm.usage');
  if (usageTable.length) {
    const parts = [];
    usageTable.find('tr').each((_, tr) => {
      const cells = [];
      $(tr).find('td, th').each((_, td) => {
        const txt = extractText($(td));
        if (txt) cells.push(txt);
      });
      if (cells.length) parts.push(cells.join(' + '));
    });
    structure = parts.filter(Boolean).join(' | ');
  }

  // ── Examples ─────────────────────────────────────────────────────────────
  // Each example: id="example_N" div containing:
  //   - <p class="m-0 jp">Japanese text (with span.color for the grammar highlight)
  //   - id="example_N_en" > .alert-primary  → English translation
  const examples = [];

  // Find all top-level example divs (id="example_1", "example_2", etc.)
  $('[id]').each((_, el) => {
    const id = $(el).attr('id') || '';
    if (!/^example_\d+$/.test(id)) return; // skip _en, _ja, _romaji sub-divs

    const num = id.replace('example_', '');

    // Japanese: strip the <span class=color> highlight markers
    const jpEl = $(el).find('.m-0.jp, p.jp').first();
    const jp = jpEl.text().replace(/\s+/g, ' ').trim();

    // English: in a separate collapse div id=example_N_en
    const enEl = $(`#example_${num}_en .alert-primary`).first();
    const en = enEl.text().replace(/\s+/g, ' ').trim();

    if (jp && en) examples.push({ japanese: jp, english: en });
  });

  return {
    id: `${level}-${String(seqIndex + 1).padStart(3, '0')}`,
    pattern,
    meaning,
    jlpt: level.toUpperCase(),
    structure,
    examples: examples.slice(0, 6),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // Load existing data so we can resume if interrupted
  let existing = [];
  if (existsSync(OUTPUT)) {
    try {
      existing = JSON.parse(readFileSync(OUTPUT, 'utf8'));
      console.log(`Resuming — ${existing.length} entries already saved.`);
    } catch {}
  }

  const doneIds = new Set(existing.map((g) => g.id));
  const allGrammar = [...existing];

  for (const level of LEVELS) {
    console.log(`\n── JLPT ${level.toUpperCase()} ──────────────────────────`);

    const urls = await getUrlsForLevel(level);
    console.log(`  ${urls.length} grammar points found`);

    const levelEntries = allGrammar.filter((g) => g.jlpt === level.toUpperCase());
    let seqIndex = levelEntries.length;

    for (let i = 0; i < urls.length; i++) {
      const tentativeId = `${level}-${String(i + 1).padStart(3, '0')}`;
      if (doneIds.has(tentativeId)) {
        process.stdout.write(`  [${i + 1}/${urls.length}] skip (already done)\n`);
        continue;
      }

      const slug = urls[i].split('/').filter(Boolean).pop()?.substring(0, 45) || '';
      process.stdout.write(`  [${i + 1}/${urls.length}] ${slug}… `);

      try {
        const point = await scrapePoint(urls[i], level, seqIndex);
        allGrammar.push(point);
        doneIds.add(point.id);
        seqIndex++;
        process.stdout.write(`✓ ${point.pattern}\n`);
      } catch (err) {
        process.stdout.write(`✗ ${err.message}\n`);
      }

      await sleep(DELAY_MS);
    }

    // Save after each level
    writeFileSync(OUTPUT, JSON.stringify(allGrammar, null, 2), 'utf8');
    console.log(`  Saved — total so far: ${allGrammar.length}`);
  }

  console.log(`\n✓ Done. ${allGrammar.length} grammar points → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
