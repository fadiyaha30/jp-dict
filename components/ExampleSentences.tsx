import { Text, Anchor } from "@mantine/core";
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
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No example sentences found for this word.
      </Text>
    );
  }

  return (
    <div className="space-y-5">
      {examples.map((ex) => (
        <div
          key={ex.id}
          className="pl-4 border-l-2 hover:border-[#1D9E75] transition-colors"
          style={{ borderColor: "#1D9E7555" }}
        >
          <div
            className="jp-text furigana-text text-gray-900 font-medium"
            dangerouslySetInnerHTML={{ __html: ex.furigana }}
          />
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{ex.english}</p>
        </div>
      ))}

      <Text size="xs" c="dimmed" ta="right">
        via{" "}
        <Anchor
          href={`https://tatoeba.org/en/sentences/search?from=jpn&to=eng&query=${encodeURIComponent(word)}`}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          c="dimmed"
        >
          Tatoeba
        </Anchor>
      </Text>
    </div>
  );
}
