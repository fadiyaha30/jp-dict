import SearchBar from "@/components/SearchBar";
import Link from "next/link";

const SUGGESTIONS = ["water", "食べる", "beautiful", "東京", "travel"];

export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "400px",
          background: "radial-gradient(ellipse, rgba(29,158,117,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-8">
        {/* Hero kanji */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="jp-text font-bold select-none"
            style={{
              fontSize: "clamp(6rem, 20vw, 9rem)",
              lineHeight: 1,
              color: "#1D9E75",
              textShadow: "0 0 60px rgba(29,158,117,0.7), 0 0 120px rgba(29,158,117,0.3)",
              letterSpacing: "-0.02em",
            }}
          >
            辞書
          </div>
          <h1 className="text-xl font-semibold text-white/90 tracking-tight">
            English–Japanese Dictionary
          </h1>
          <p className="text-sm text-white/40 text-center max-w-sm leading-relaxed">
            Search in English or Japanese. Readings, romaji, JLPT levels, conjugations &amp; example sentences.
          </p>
        </div>

        {/* Search */}
        <div className="w-full">
          <SearchBar size="lg" />
        </div>

        {/* Suggestions */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs text-white/30">Try:</span>
          {SUGGESTIONS.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}&mode=auto`}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: "rgba(29,158,117,0.08)",
                border: "1px solid rgba(29,158,117,0.18)",
                color: "rgba(29,158,117,0.85)",
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
