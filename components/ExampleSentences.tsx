import type { TatoebaExample } from "@/lib/tatoeba";

export interface ExampleWithFurigana extends TatoebaExample {
  furigana: string;
}

interface ExampleSentencesProps {
  examples: ExampleWithFurigana[];
  word: string;
}

export default function ExampleSentences({ examples, word }: ExampleSentencesProps) {
  if (examples.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
        No example sentences found for this word.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {examples.map((ex) => (
        <div
          key={ex.id}
          className="pl-4 py-1 transition-all"
          style={{ borderLeft: "2px solid rgba(29,158,117,0.25)" }}
          onMouseEnter={(e) => ((e.currentTarget.style.borderLeftColor = "rgba(29,158,117,0.7)"))}
          onMouseLeave={(e) => ((e.currentTarget.style.borderLeftColor = "rgba(29,158,117,0.25)"))}
        >
          <div
            className="jp-text furigana-text font-medium"
            style={{ color: "rgba(255,255,255,0.88)" }}
            dangerouslySetInnerHTML={{ __html: ex.furigana }}
          />
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            {ex.english}
          </p>
        </div>
      ))}

      <p className="text-xs text-right mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
        via{" "}
        <a
          href={`https://tatoeba.org/en/sentences/search?from=jpn&to=eng&query=${encodeURIComponent(word)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(29,158,117,0.5)" }}
          className="hover:underline"
        >
          Tatoeba
        </a>
      </p>
    </div>
  );
}
