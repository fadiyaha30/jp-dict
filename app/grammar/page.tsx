import Link from "next/link";
import { searchGrammar, JLPT_LEVELS } from "@/lib/grammar";

export const metadata = {
  title: "Grammar — ファヤの辞書",
  description: "JLPT grammar points from N5 to N1",
};

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
};

interface PageProps {
  searchParams: Promise<{ q?: string; jlpt?: string }>;
}

export default async function GrammarPage({ searchParams }: PageProps) {
  const { q = "", jlpt = "all" } = await searchParams;
  const results = searchGrammar(q, jlpt === "all" ? undefined : jlpt);

  const countByLevel = Object.fromEntries(
    JLPT_LEVELS.map((lvl) => [lvl, searchGrammar(q, lvl).length])
  );
  const totalCount = searchGrammar(q).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
          文法ポイント
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          JLPT N5〜N1の文法パターン
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <input type="hidden" name="jlpt" value={jlpt} />
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--muted)" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="パターン・意味・例文で検索…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
        </div>
      </form>

      {/* JLPT filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", ...JLPT_LEVELS] as const).map((lvl) => {
          const active = jlpt === lvl || (lvl === "all" && jlpt === "all");
          const count = lvl === "all" ? totalCount : countByLevel[lvl];
          const color = lvl === "all" ? "var(--accent)" : JLPT_COLORS[lvl];
          const href = `?q=${encodeURIComponent(q)}&jlpt=${lvl}`;
          return (
            <Link
              key={lvl}
              href={href}
              className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
              style={{
                background: active ? color + "18" : "var(--surface)",
                border: `1px solid ${active ? color : "var(--border)"}`,
                color: active ? color : "var(--muted)",
              }}
            >
              {lvl === "all" ? "すべて" : lvl}
              <span
                className="ml-1.5 text-[10px]"
                style={{ opacity: 0.7 }}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--muted)" }}>
          <p className="text-4xl mb-3 jp-text">文法</p>
          <p className="text-sm">文法ポイントが見つかりません。</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((g) => {
            const color = JLPT_COLORS[g.jlpt];
            return (
              <Link
                key={g.id}
                href={`/grammar/${g.id}`}
                className="no-underline block rounded-xl p-4 transition-all hover:border-[var(--accent-mid)]"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="jp-text font-bold text-base"
                        style={{ color: "var(--text)" }}
                      >
                        {g.pattern}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: color + "18", color }}
                      >
                        {g.jlpt}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {g.meaning}
                    </p>
                    <p
                      className="text-xs mt-1.5 font-mono"
                      style={{ color: "#b5afa8" }}
                    >
                      {g.structure}
                    </p>
                  </div>
                  <svg
                    className="shrink-0 mt-1"
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ color: "var(--muted)" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                {/* First example preview */}
                {g.examples[0] && (
                  <div
                    className="mt-3 pt-3 text-xs jp-text"
                    style={{
                      borderTop: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    {g.examples[0].japanese}
                    <span className="ml-2 not-jp-text" style={{ fontStyle: "italic" }}>
                      — {g.examples[0].english}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
