import type { DictWord } from "@/lib/types";

export default function WordDefinitions({ word }: { word: DictWord }) {
  const senses = word.sense.filter((s) => s.gloss.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {senses.map((sense, si) => (
        <div key={si}>
          {si > 0 && <div className="border-t mb-6" style={{ borderColor: "var(--border)" }} />}

          {sense.partOfSpeech.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {sense.partOfSpeech.slice(0, 2).map((pos) => (
                <span
                  key={pos}
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--accent)" }}
                >
                  {pos}
                </span>
              ))}
            </div>
          )}

          <ol className="flex flex-col gap-2">
            {sense.gloss.map((g, gi) => (
              <li key={gi} className="flex gap-3 items-baseline">
                <span
                  className="text-sm font-bold shrink-0 w-5 text-right"
                  style={{ color: "var(--accent-mid)" }}
                >
                  {gi + 1}
                </span>
                <span className="leading-relaxed" style={{ color: "var(--text)" }}>{g}</span>
              </li>
            ))}
          </ol>

          {sense.info.length > 0 && (
            <p className="text-xs italic mt-2 ml-8" style={{ color: "var(--muted)" }}>
              {sense.info.join("; ")}
            </p>
          )}

          {sense.misc.length > 0 && (
            <p className="text-xs mt-1 ml-8" style={{ color: "var(--muted)" }}>
              {sense.misc.join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
