import type { DictWord } from "@/lib/types";

interface WordDefinitionsProps {
  word: DictWord;
}

export default function WordDefinitions({ word }: WordDefinitionsProps) {
  const senses = word.sense.filter((s) => s.gloss.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {senses.map((sense, si) => (
        <div key={si}>
          {si > 0 && <div className="border-t border-white/[0.06] mb-6" />}

          {sense.partOfSpeech.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {sense.partOfSpeech.slice(0, 2).map((pos) => (
                <span
                  key={pos}
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#1D9E75" }}
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
                  style={{ color: "rgba(29,158,117,0.6)" }}
                >
                  {gi + 1}
                </span>
                <span style={{ color: "rgba(255,255,255,0.82)", lineHeight: "1.6" }}>{g}</span>
              </li>
            ))}
          </ol>

          {sense.info.length > 0 && (
            <p className="text-xs italic mt-2 ml-8" style={{ color: "rgba(255,255,255,0.35)" }}>
              {sense.info.join("; ")}
            </p>
          )}

          {sense.misc.length > 0 && (
            <p className="text-xs mt-1 ml-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              {sense.misc.join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
