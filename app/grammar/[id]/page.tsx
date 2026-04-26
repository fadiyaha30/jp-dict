import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrammarById, getAllGrammar } from "@/lib/grammar";
import { toFurigana } from "@/lib/furigana";
import GrammarFavoriteButton from "@/components/GrammarFavoriteButton";
import GrammarUserNotes from "@/components/GrammarUserNotes";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateStaticParams() {
  return getAllGrammar().map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const g = getGrammarById(id);
  if (!g) return { title: "Grammar point not found" };
  return {
    title: `${g.pattern} — ファヤの辞書`,
    description: g.meaning,
  };
}

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
};

export default async function GrammarDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const g = getGrammarById(id);
  if (!g) notFound();

  const color = JLPT_COLORS[g.jlpt];
  const backHref = from ?? "/grammar";

  const examplesWithFurigana = await Promise.all(
    g.examples.map(async (ex) => ({
      ...ex,
      furigana: await toFurigana(ex.japanese),
    }))
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 w-full">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--muted)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Grammar
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Watermark */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 jp-text font-black select-none pointer-events-none"
          style={{ fontSize: "clamp(5rem, 12vw, 8rem)", lineHeight: 1, color, opacity: 0.05 }}
          aria-hidden
        >
          文法
        </div>

        <div className="relative flex flex-col gap-3">
          {/* Pattern + JLPT badge + favorite */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="jp-text font-black"
                style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", color: "var(--text)", lineHeight: 1.1 }}
              >
                {g.pattern}
              </span>
              <span
                className="text-sm font-bold px-2.5 py-1 rounded-lg self-start"
                style={{ background: color + "18", color }}
              >
                JLPT {g.jlpt}
              </span>
            </div>
            <GrammarFavoriteButton
              grammarId={g.id}
              pattern={g.pattern}
              meaning={g.meaning}
              jlpt={g.jlpt}
              size="md"
            />
          </div>

          {/* Meaning */}
          <p className="text-base font-medium" style={{ color: "var(--text)" }}>
            {g.meaning}
          </p>

          {/* Structure */}
          <div
            className="rounded-lg px-3 py-2 text-sm font-mono"
            style={{ background: "var(--subtle)", color: "var(--muted)" }}
          >
            {g.structure}
          </div>
        </div>
      </div>

      {/* Examples */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
          Examples
        </h2>
        <div className="flex flex-col gap-3">
          {examplesWithFurigana.map((ex, i) => (
            <div key={i} className="rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p
                className="jp-text furigana-text font-medium mb-1"
                style={{ color: "var(--text)" }}
                dangerouslySetInnerHTML={{ __html: ex.furigana }}
              />
              <p className="text-sm" style={{ color: "var(--muted)" }}>{ex.english}</p>
              {ex.note && <p className="text-xs mt-1.5 italic" style={{ color: "#b5afa8" }}>{ex.note}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Grammar notes (site-provided) */}
      {g.notes && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Notes
          </h2>
          <div className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: color + "08", border: `1px solid ${color}22`, color: "var(--text)" }}>
            {g.notes}
          </div>
        </section>
      )}

      {/* Related patterns */}
      {g.related && g.related.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Related Patterns
          </h2>
          <div className="flex gap-2 flex-wrap">
            {g.related.map((relId) => {
              const rel = getGrammarById(relId);
              if (!rel) return null;
              return (
                <Link key={relId} href={`/grammar/${relId}`}
                  className="text-sm px-3 py-1.5 rounded-full transition-all hover:border-[var(--accent-mid)]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {rel.pattern}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Personal notes */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
          My Notes
        </h2>
        <GrammarUserNotes grammarId={g.id} grammarPattern={g.pattern} />
      </section>
    </main>
  );
}
