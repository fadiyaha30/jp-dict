/**
 * Downloads the latest jmdict-simplified .tgz release and writes a trimmed
 * version to /data/jmdict.json with only the fields needed for search/display.
 *
 * Run: node scripts/download-jmdict.mjs
 */
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { writeFile } from "fs/promises";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(OUT_DIR, "jmdict.json");
const TMP_FILE = path.join(tmpdir(), "jmdict-eng.json.tgz");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ── 1. Get latest release asset URL from GitHub API ──────────────────────────
console.log("Fetching latest release info from GitHub...");
const apiRes = await fetch(
  "https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest",
  { headers: { "User-Agent": "faya-dict-setup-script/1.0" } }
);
if (!apiRes.ok) throw new Error(`GitHub API error: ${apiRes.status}`);
const release = await apiRes.json();

const asset = release.assets.find(
  (a) =>
    a.name.startsWith("jmdict-eng") &&
    a.name.endsWith(".json.tgz") &&
    !a.name.includes("common")
);
if (!asset) throw new Error(`No jmdict-eng .tgz asset found. Available: ${release.assets.map((a) => a.name).join(", ")}`);
console.log(`Found: ${asset.name} (${(asset.size / 1024 / 1024).toFixed(1)} MB compressed)`);

// ── 2. Download the .tgz to a temp file ──────────────────────────────────────
console.log("Downloading...");
const dlRes = await fetch(asset.browser_download_url);
if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);
const buf = Buffer.from(await dlRes.arrayBuffer());
writeFileSync(TMP_FILE, buf);
console.log(`Saved to ${TMP_FILE} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);

// ── 3. Extract JSON from the .tgz using system tar ───────────────────────────
console.log("Extracting...");
// tar -xzf archive.tgz -O streams the file contents to stdout
const json = execFileSync("tar", ["-xzf", TMP_FILE, "-O"], { maxBuffer: 512 * 1024 * 1024 });
unlinkSync(TMP_FILE);

// ── 4. Parse + trim to only needed fields ────────────────────────────────────
console.log("Parsing JSON...");
const raw = JSON.parse(json.toString("utf-8"));

const trimmed = {
  version: raw.version,
  dictDate: raw.dictDate,
  words: raw.words.map((w) => ({
    id: w.id,
    jlpt: w.jlpt ?? null,
    kanji: (w.kanji ?? []).map((k) => ({ text: k.text, tags: k.tags })),
    kana: (w.kana ?? []).map((k) => ({
      text: k.text,
      tags: k.tags,
      appliesToKanji: k.appliesToKanji,
    })),
    sense: (w.sense ?? []).map((s) => ({
      partOfSpeech: s.partOfSpeech,
      gloss: (s.gloss ?? []).map((g) => (typeof g === "string" ? g : g.text)),
      examples: (s.examples ?? []).map((e) => ({
        text: e.text,
        sentences: e.sentences,
      })),
      tags: s.tags ?? [],
      misc: s.misc ?? [],
      info: s.info ?? [],
    })),
  })),
};

// ── 5. Write output ───────────────────────────────────────────────────────────
await writeFile(OUT_FILE, JSON.stringify(trimmed));
const outMB = (Buffer.byteLength(JSON.stringify(trimmed)) / 1024 / 1024).toFixed(1);
console.log(`Done! ${trimmed.words.length.toLocaleString()} entries → ${OUT_FILE} (${outMB} MB)`);
