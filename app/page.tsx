import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { getRandomWord } from "@/lib/dictionary";
import FavoriteButton from "@/components/FavoriteButton";

export const dynamic = "force-dynamic";

const SUGGESTIONS = ["water", "食べる", "beautiful", "東京", "travel"];

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
};

export default function HomePage() {
  const word = getRandomWord();
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Faint watermark kanji */}
      <div
        className="absolute select-none pointer-events-none jp-text font-black"
        style={{
          fontSize: "clamp(16rem, 50vw, 32rem)",
          lineHeight: 1,
          color: "var(--accent)",
          opacity: 0.04,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          userSelect: "none",
        }}
        aria-hidden
      >
        辞
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--accent)" }}
          >
            ファヤの辞書
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text)" }}>
            English–Japanese<br />Dictionary
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            My personal Japanese dictionary — look up, practice, and take notes.
          </p>
        </div>

        {/* Search */}
        <div className="w-full">
          <SearchBar size="lg" />
        </div>

        {/* Suggestions */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs" style={{ color: "var(--muted)" }}>Try:</span>
          {SUGGESTIONS.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}&mode=auto`}
              className="text-xs px-3 py-1 rounded-full transition-all hover:border-[var(--accent-mid)]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Random flashcard */}
        {word && (
          <Link
            href={`/word/${word.id}`}
            className="w-full no-underline"
          >
            <div className="card w-full rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Word of the refresh
                </span>
                <div className="flex items-center gap-2">
                  {word.jlpt && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: JLPT_COLORS[word.jlpt] + "18",
                        color: JLPT_COLORS[word.jlpt],
                      }}
                    >
                      {word.jlpt}
                    </span>
                  )}
                  <FavoriteButton
                    size="sm"
                    item={{
                      id: word.id,
                      kanji: word.kanji,
                      reading: word.reading,
                      romaji: word.romaji ?? "",
                      meaning: word.meanings[0] ?? "",
                      partOfSpeech: word.partOfSpeech,
                      jlpt: word.jlpt,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="jp-text font-black" style={{ fontSize: "2rem", color: "var(--text)", lineHeight: 1 }}>
                  {word.kanji}
                </span>
                {word.reading !== word.kanji && (
                  <span className="jp-text text-base" style={{ color: "var(--muted)" }}>
                    {word.reading}
                  </span>
                )}
                {word.romaji && (
                  <span className="text-sm italic" style={{ color: "#b5afa8" }}>
                    {word.romaji}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {word.meanings.slice(0, 3).join(" · ")}
              </p>
            </div>
          </Link>
        )}
      </div>
    </main>
  );
}
