import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import WordHistoryTracker from "@/components/WordHistoryTracker";
import FavoriteButton from "@/components/FavoriteButton";
import WordPageTabs from "@/components/WordPageTabs";
import { getWordDetail } from "@/lib/dictionary";
import { fetchExamples } from "@/lib/tatoeba";
import { toFurigana, warmFurigana } from "@/lib/furigana";
import { conjugate } from "@/lib/conjugation";
import { extractKanji, fetchKanjiSvg } from "@/lib/kanjivg";

interface WordPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WordPageProps) {
  const { id } = await params;
  const detail = getWordDetail(id);
  if (!detail) return { title: "Word not found" };
  return {
    title: `${detail.result.kanji} — ファヤの辞書`,
    description: detail.result.meanings.join(", "),
  };
}

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
};

async function AsyncWordPageTabs({
  word,
  searchWord,
  result,
  conjugation,
  kanjiChars,
}: {
  word: any;
  searchWord: string;
  result: any;
  conjugation: any;
  kanjiChars: string[];
}) {
  const [rawExamples, kanjiSvgEntries] = await Promise.all([
    fetchExamples(searchWord, 5),
    Promise.all(kanjiChars.map(async (char) => ({ char, svg: await fetchKanjiSvg(char) }))),
  ]);

  const examples = await Promise.all(
    rawExamples.map(async (ex) => ({
      ...ex,
      furigana: await toFurigana(ex.japanese),
    }))
  );

  const kanjiSvgs = kanjiSvgEntries.filter(
    (e): e is { char: string; svg: string } => e.svg !== null
  );

  return (
    <WordPageTabs
      word={word}
      examples={examples}
      searchWord={searchWord}
      result={result}
      conjugation={conjugation}
      kanjiSvgs={kanjiSvgs}
    />
  );
}

function TabsSkeleton() {
  return (
    <div>
      <div
        className="flex border-b mb-6 gap-1"
        style={{ borderColor: "var(--border)" }}
      >
        {["Definitions", "Examples", "My Notes"].map((label) => (
          <div
            key={label}
            className="px-4 py-2.5 text-sm rounded-t"
            style={{ color: "var(--muted)", opacity: 0.4 }}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="h-4 rounded w-1/4 mb-2" style={{ background: "var(--subtle)" }} />
            <div className="h-3 rounded w-3/4" style={{ background: "var(--subtle)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function WordPage({ params }: WordPageProps) {
  const { id } = await params;
  const detail = getWordDetail(id);
  if (!detail) notFound();

  const { word, result } = detail;

  warmFurigana();

  const altKanji = word.kanji.slice(1).map((k: any) => k.text);
  const altKana = word.kana.slice(1).map((k: any) => k.text);

  const rawPos = [...new Set(word.sense.flatMap((s: any) => s.partOfSpeech))] as string[];
  const conjugation = conjugate(result.reading, rawPos);

  const kanjiChars = extractKanji(result.kanji);
  const searchWord = result.kanji !== result.reading ? result.kanji : result.reading;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 w-full">
      <WordHistoryTracker
        id={result.id}
        kanji={result.kanji}
        reading={result.reading}
        meaning={result.meanings[0] ?? ""}
      />

      {/* ── Back link ───────────────────────────────────── */}
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors min-h-[44px]"
        style={{ color: "var(--muted)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Search
      </Link>

      {/* ── Word header ──────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Faint watermark kanji */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 jp-text font-black select-none pointer-events-none"
          style={{
            fontSize: "clamp(6rem, 15vw, 10rem)",
            lineHeight: 1,
            color: "var(--accent)",
            opacity: 0.05,
          }}
          aria-hidden
        >
          {result.kanji}
        </div>

        <div className="relative flex justify-between items-start gap-4">
          <div className="flex flex-col gap-3">
            {/* Kanji */}
            <div
              className="jp-text font-black leading-none"
              style={{ fontSize: "clamp(3rem, 10vw, 5rem)", color: "var(--text)" }}
            >
              {result.kanji}
            </div>

            {/* Reading + romaji */}
            <div className="flex items-center gap-3 flex-wrap">
              {result.reading && result.reading !== result.kanji && (
                <span className="jp-text text-lg" style={{ color: "var(--muted)" }}>
                  {result.reading}
                </span>
              )}
              {result.romaji && (
                <>
                  <span style={{ color: "var(--border)", fontSize: "1.2em" }}>·</span>
                  <span className="text-base italic" style={{ color: "#b5afa8" }}>
                    {result.romaji}
                  </span>
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {result.jlpt && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{
                    background: JLPT_COLORS[result.jlpt] + "18",
                    color: JLPT_COLORS[result.jlpt],
                  }}
                >
                  JLPT {result.jlpt}
                </span>
              )}
              {result.partOfSpeech.slice(0, 3).map((pos: string) => (
                <span
                  key={pos}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: "var(--subtle)", color: "var(--muted)" }}
                >
                  {pos}
                </span>
              ))}
            </div>

            {/* Alt forms */}
            {(altKanji.length > 0 || altKana.length > 0) && (
              <div className="flex gap-1.5 flex-wrap">
                {[...altKanji, ...altKana].map((k: string) => (
                  <span
                    key={k}
                    className="jp-text text-xs px-2 py-0.5 rounded"
                    style={{ background: "var(--subtle)", color: "var(--muted)" }}
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>

          <FavoriteButton
            size="md"
            item={{
              id: result.id,
              kanji: result.kanji,
              reading: result.reading,
              romaji: result.romaji,
              meaning: result.meanings[0] ?? "",
              partOfSpeech: result.partOfSpeech,
              jlpt: result.jlpt,
            }}
          />
        </div>
      </div>

      {/* ── Tabs + content (streamed) ────────────────────── */}
      <Suspense fallback={<TabsSkeleton />}>
        <AsyncWordPageTabs
          word={word}
          searchWord={searchWord}
          result={result}
          conjugation={conjugation}
          kanjiChars={kanjiChars}
        />
      </Suspense>
    </main>
  );
}
