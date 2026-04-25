import { Divider, Text } from "@mantine/core";
import type { DictWord } from "@/lib/types";

interface WordDefinitionsProps {
  word: DictWord;
}

export default function WordDefinitions({ word }: WordDefinitionsProps) {
  const senses = word.sense.filter((s) => s.gloss.length > 0);

  return (
    <div className="space-y-5">
      {senses.map((sense, si) => (
        <div key={si}>
          {si > 0 && <Divider mb="md" />}

          {/* Part of speech */}
          {sense.partOfSpeech.length > 0 && (
            <div className="flex gap-3 mb-2">
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

          {/* Glosses */}
          <ol className="space-y-2">
            {sense.gloss.map((g, gi) => (
              <li key={gi} className="flex gap-3 items-baseline">
                <span
                  className="text-sm font-bold shrink-0 w-5 text-right"
                  style={{ color: "#1D9E75" }}
                >
                  {gi + 1}
                </span>
                <span className="text-gray-800 leading-relaxed">{g}</span>
              </li>
            ))}
          </ol>

          {/* Notes */}
          {sense.info.length > 0 && (
            <Text size="xs" c="dimmed" fs="italic" mt="xs" ml={32}>
              {sense.info.join("; ")}
            </Text>
          )}

          {/* Misc tags */}
          {sense.misc.length > 0 && (
            <Text size="xs" c="dimmed" mt={4} ml={32}>
              {sense.misc.join(", ")}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}
