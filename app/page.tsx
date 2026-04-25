import SearchBar from "@/components/SearchBar";
import Link from "next/link";

const SUGGESTIONS = ["water", "食べる", "beautiful", "東京", "travel"];

export default function HomePage() {
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
            JDict
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text)" }}>
            English–Japanese<br />Dictionary
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)", maxWidth: "24rem" }}>
            Search in English or Japanese. Readings, romaji, JLPT levels, conjugations &amp; examples.
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
      </div>
    </main>
  );
}
