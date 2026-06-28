import type { TatoebaExample } from "@/lib/tatoeba";

export interface ExampleWithFurigana extends TatoebaExample {
  furigana: string;
}

export default function ExampleSentences({
  examples,
  word,
}: {
  examples: ExampleWithFurigana[];
  word: string;
}) {
  if (examples.length === 0) {
    return (
      <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>
        この単語の例文が見つかりません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {examples.map((ex) => (
        <div
          key={ex.id}
          className="pl-4 py-0.5"
          style={{ borderLeft: "2px solid var(--border)", transition: "border-color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget.style.borderLeftColor = "var(--accent-mid)"))}
          onMouseLeave={(e) => ((e.currentTarget.style.borderLeftColor = "var(--border)"))}
        >
          <div
            className="jp-text furigana-text font-medium"
            style={{ color: "var(--text)" }}
            dangerouslySetInnerHTML={{ __html: ex.furigana }}
          />
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
            {ex.english}
          </p>
        </div>
      ))}

      <p className="text-xs text-right mt-1" style={{ color: "#c0b8ae" }}>
        出典：{" "}
        <a
          href={`https://tatoeba.org/en/sentences/search?from=jpn&to=eng&query=${encodeURIComponent(word)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)" }}
          className="hover:underline"
        >
          Tatoeba
        </a>
      </p>
    </div>
  );
}
