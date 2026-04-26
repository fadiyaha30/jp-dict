// Usage: node scripts/retry-grammar.mjs
// Retries grammar points that failed the first scrape (Cloudflare-blocked).
// Run this a few hours after the initial scrape when rate limits reset.

import { writeFileSync, readFileSync } from 'fs';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'data', 'grammar.json');
const BASE = 'https://jlptsensei.com';
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const DELAY_MS = 2500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok && res.status !== 202) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function getUrlsForLevel(level) {
  const allUrls = [];
  let page = 1;
  while (true) {
    const listUrl = page === 1
      ? `${BASE}/jlpt-${level}-grammar-list/`
      : `${BASE}/jlpt-${level}-grammar-list/page/${page}/`;
    const html = await fetchHtml(listUrl);
    const $ = load(html);
    $('a[href*="/learn-japanese-grammar/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !allUrls.includes(href)) allUrls.push(href);
    });
    const hasNext = $(`a[href*="/page/${page + 1}/"]`).length > 0;
    if (!hasNext) break;
    page++;
    await sleep(DELAY_MS);
  }
  return [...new Set(allUrls)];
}

async function scrapePoint(url, level, seqIndex) {
  const html = await fetchHtml(url);
  if (html.length < 10000) throw new Error(`Too short (${html.length}b) — likely bot challenge`);
  const $ = load(html);

  let pattern = $('h1 .jp, h1 span.jp').first().text().trim()
    || $('h1').text().replace(/JLPT\s+N\d\s+Grammar\s*:?\s*/i, '').trim();

  let meaning = '';
  const rawHtml = $.html();
  const afterMeaning = rawHtml.split('Meaning</a>')[1] || '';
  if (afterMeaning) {
    meaning = afterMeaning.replace(/<br\s*\/?>/gi, '').split('<')[0].replace(/[|]/g, '').trim();
  }

  let structure = '';
  const usageTable = $('table.usage, table.table-sm.usage');
  if (usageTable.length) {
    const parts = [];
    usageTable.find('tr').each((_, tr) => {
      const cells = [];
      $(tr).find('td, th').each((_, td) => { cells.push($(td).text().trim()); });
      if (cells.length) parts.push(cells.join(' + '));
    });
    structure = parts.filter(Boolean).join(' | ');
  }

  const examples = [];
  $('[id]').each((_, el) => {
    const id = $(el).attr('id') || '';
    if (!/^example_\d+$/.test(id)) return;
    const num = id.replace('example_', '');
    const jp = $(el).find('.m-0.jp, p.jp').first().text().replace(/\s+/g, ' ').trim();
    const en = $(`#example_${num}_en .alert-primary`).first().text().replace(/\s+/g, ' ').trim();
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

async function main() {
  const existing = JSON.parse(readFileSync(OUTPUT, 'utf8'));
  const existingByLevel = {};
  LEVELS.forEach((l) => {
    existingByLevel[l.toUpperCase()] = existing.filter((g) => g.jlpt === l.toUpperCase());
  });

  for (const level of LEVELS) {
    const levelEntries = existingByLevel[level.toUpperCase()];
    const allUrls = await getUrlsForLevel(level);
    const expectedCount = allUrls.length;
    const haveCount = levelEntries.length;

    if (haveCount >= expectedCount) {
      console.log(`${level.toUpperCase()}: complete (${haveCount}/${expectedCount}) — skip`);
      continue;
    }

    console.log(`\n── JLPT ${level.toUpperCase()} — have ${haveCount}/${expectedCount} ──`);

    // Find which indices are missing
    for (let i = haveCount; i < allUrls.length; i++) {
      const url = allUrls[i];
      const slug = url.split('/').filter(Boolean).pop()?.substring(0, 45) || '';
      process.stdout.write(`  [${i + 1}/${allUrls.length}] ${slug}… `);

      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const point = await scrapePoint(url, level, levelEntries.length);
          levelEntries.push(point);
          success = true;
          process.stdout.write(`✓ ${point.pattern}\n`);
          break;
        } catch (err) {
          if (attempt < 3) {
            process.stdout.write(`retry ${attempt}… `);
            await sleep(DELAY_MS * attempt * 2);
          } else {
            process.stdout.write(`✗ ${err.message}\n`);
          }
        }
      }
      await sleep(success ? DELAY_MS : DELAY_MS * 3);
    }

    // Rebuild and save
    const updated = LEVELS.flatMap((l) => existingByLevel[l.toUpperCase()]);
    writeFileSync(OUTPUT, JSON.stringify(updated, null, 2), 'utf8');
    console.log(`  Saved — ${level.toUpperCase()} now has ${levelEntries.length}`);
  }

  const final = JSON.parse(readFileSync(OUTPUT, 'utf8'));
  console.log(`\n✓ Done. Total: ${final.length}`);
}

main().catch(console.error);
