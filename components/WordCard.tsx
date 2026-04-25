import Link from "next/link";
import type { SearchResult } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#eab308", N4: "#14b8a6", N5: "#1D9E75",
};

interface WordCardProps {
  result: SearchResult;
}

export default function WordCard({ result }: WordCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <Link href={`/word/${result.id}`} className="flex-1 min-w-0 no-underline">
          <div
            className="jp-text font-bold leading-none mb-1"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)", color: "rgba(255,255,255,0.95)" }}
          >
            {result.kanji}
          </div>
          {result.reading && result.reading !== result.kanji && (
            <div className="jp-text text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {result.reading}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {result.jlpt && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: JLPT_COLORS[result.jlpt] + "22",
                border: `1px solid ${JLPT_COLORS[result.jlpt]}55`,
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

      {result.romaji && (
        <div className="text-sm italic" style={{ color: "rgba(255,255,255,0.35)" }}>
          {result.romaji}
        </div>
      )}

      {result.partOfSpeech.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.partOfSpeech.slice(0, 3).map((pos) => (
            <span
              key={pos}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(29,158,117,0.1)",
                border: "1px solid rgba(29,158,117,0.2)",
                color: "rgba(29,158,117,0.9)",
              }}
            >
              {pos}
            </span>
          ))}
        </div>
      )}

      <Link href={`/word/${result.id}`} className="no-underline">
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {result.meanings.slice(0, 3).join("; ")}
        </p>
      </Link>
    </div>
  );
}
