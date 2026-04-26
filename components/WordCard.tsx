import Link from "next/link";
import type { SearchResult } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
};

export default function WordCard({ result, from }: { result: SearchResult; from?: string }) {
  const wordHref = from ? `/word/${result.id}?from=${encodeURIComponent(from)}` : `/word/${result.id}`;
  return (
    <div className="card bg-white p-5 flex flex-col gap-2.5">
      {/* Top row */}
      <div className="flex justify-between items-start gap-2">
        <Link href={wordHref} className="flex-1 min-w-0 no-underline group">
          <div
            className="jp-text font-bold leading-none transition-colors group-hover:text-[var(--accent)]"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2rem)", color: "var(--text)" }}
          >
            {result.kanji}
          </div>
          {result.reading && result.reading !== result.kanji && (
            <div className="jp-text text-sm mt-1" style={{ color: "var(--muted)" }}>
              {result.reading}
              {result.romaji && (
                <span className="ml-2 not-italic" style={{ color: "#b5afa8" }}>
                  {result.romaji}
                </span>
              )}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {result.jlpt && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{
                background: JLPT_COLORS[result.jlpt] + "18",
                color: JLPT_COLORS[result.jlpt],
              }}
            >
              {result.jlpt}
            </span>
          )}
          <FavoriteButton
            size="sm"
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

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)" }} />

      {/* Meaning */}
      <Link href={wordHref} className="no-underline">
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
          {result.meanings.slice(0, 3).join("; ")}
        </p>
      </Link>
    </div>
  );
}
