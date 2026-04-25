import { notFound } from "next/navigation";
import Link from "next/link";
import WordDefinitions from "@/components/WordDefinitions";
import WordHistoryTracker from "@/components/WordHistoryTracker";
import ExampleSentences from "@/components/ExampleSentences";
import UserNotes from "@/components/UserNotes";
import FavoriteButton from "@/components/FavoriteButton";
import WordPageTabs from "@/components/WordPageTabs";
import { getWordDetail } from "@/lib/dictionary";
import { fetchExamples } from "@/lib/tatoeba";
import { toFurigana } from "@/lib/furigana";
import { conjugate } from "@/lib/conjugation";

interface WordPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WordPageProps) {
  const { id } = await params;
  const detail = getWordDetail(id);
  if (!detail) return { title: "Word not found" };
  return {
    title: `${detail.result.kanji} — JDict`,
    description: detail.result.meanings.join(", "),
  };
}

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#eab308", N4: "#14b8a6", N5: "#1D9E75",
};

export default async function WordPage({ params }: WordPageProps) {
  const { id } = await params;
  const detail = getWordDetail(id);
  if (!detail) notFound();

  const { word, result } = detail;

  const searchWord = result.kanji !== result.reading ? result.kanji : result.reading;
  const rawExamples = await fetchExamples(searchWord, 5);
  const examples = await Promise.all(
    rawExamples.map(async (ex) => ({
      ...ex,
      furigana: await toFurigana(ex.japanese),
    }))
  );

  const altKanji = word.kanji.slice(1).map((k) => k.text);
  const altKana = word.kana.slice(1).map((k) => k.text);

  const rawPos = [...new Set(word.sense.flatMap((s) => s.partOfSpeech))];
  const conjugation = conjugate(result.reading, rawPos);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 w-full">
      <WordHistoryTracker
        id={result.id}
        kanji={result.kanji}
        reading={result.reading}
        meaning={result.meanings[0] ?? ""}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Hero sidebar ─────────────────────────────────────── */}
        <div className="w-full lg:w-72 lg:sticky lg:top-6 shrink-0">
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: "linear-gradient(160deg, #052e1c 0%, #1D9E75 100%)" }}
          >
            {/* decorative blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

            <div className="relative px-5 pt-4 pb-6">
              {/* top bar */}
              <div className="flex justify-between items-center mb-5">
                <Link
                  href="/search"
                  className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                  Search
                </Link>
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

              {/* main word */}
              <div className="text-center">
                <div
                  className="jp-text font-bold text-white leading-none mb-3"
                  style={{ fontSize: "clamp(3.5rem, 12vw, 5.5rem)", textShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
                >
                  {result.kanji}
                </div>

                {/* reading + romaji */}
                <div className="flex flex-col items-center gap-1 mb-4">
                  {result.reading && result.reading !== result.kanji && (
                    <span className="jp-text text-lg text-white/85">{result.reading}</span>
                  )}
                  {result.romaji && (
                    <span className="text-sm italic text-white/55">{result.romaji}</span>
                  )}
                </div>

                {/* badges */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {result.jlpt && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: JLPT_COLORS[result.jlpt] + "55", border: `1px solid ${JLPT_COLORS[result.jlpt]}88` }}
                    >
                      JLPT {result.jlpt}
                    </span>
                  )}
                  {result.partOfSpeech.slice(0, 3).map((pos) => (
                    <span key={pos} className="px-3 py-1 rounded-full text-xs text-white/75 bg-white/10 border border-white/10">
                      {pos}
                    </span>
                  ))}
                </div>

                {/* alt forms */}
                {(altKanji.length > 0 || altKana.length > 0) && (
                  <div className="flex gap-2 justify-center flex-wrap mt-3">
                    {altKanji.map((k) => (
                      <span key={k} className="jp-text text-xs text-white/50 px-2 py-0.5 rounded bg-white/5">
                        {k}
                      </span>
                    ))}
                    {altKana.map((k) => (
                      <span key={k} className="jp-text text-xs text-white/50 px-2 py-0.5 rounded bg-white/5">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <WordPageTabs word={word} examples={examples} searchWord={searchWord} result={result} conjugation={conjugation} />
        </div>
      </div>
    </main>
  );
}
