import { Badge, Group, Paper, Stack, Text, Divider } from "@mantine/core";
import type { DictWord, SearchResult } from "@/lib/types";

const JLPT_COLORS: Record<string, string> = {
  N1: "red",
  N2: "orange",
  N3: "yellow",
  N4: "teal",
  N5: "green",
};

interface WordDetailProps {
  word: DictWord;
  result: SearchResult;
}

export default function WordDetail({ word, result }: WordDetailProps) {
  return (
    <Stack gap="xl">
      {/* Hero section */}
      <Stack gap="xs" align="center" ta="center">
        <Text
          size="5rem"
          fw={700}
          className="jp-text"
          style={{ lineHeight: 1.1, letterSpacing: "0.02em" }}
        >
          {result.kanji}
        </Text>

        {result.reading && result.reading !== result.kanji && (
          <Text size="xl" c="dimmed" className="jp-text">
            {result.reading}
          </Text>
        )}

        {result.romaji && (
          <Text size="lg" c="dimmed" fs="italic">
            {result.romaji}
          </Text>
        )}

        <Group gap="xs" justify="center" mt="xs">
          {result.jlpt && (
            <Badge
              color={JLPT_COLORS[result.jlpt] ?? "gray"}
              variant="filled"
              size="md"
            >
              JLPT {result.jlpt}
            </Badge>
          )}
          {result.partOfSpeech.slice(0, 3).map((pos) => (
            <Badge key={pos} color="gray" variant="outline" size="md">
              {pos}
            </Badge>
          ))}
        </Group>
      </Stack>

      <Divider />

      {/* All readings */}
      {word.kana.length > 1 && (
        <Stack gap="xs">
          <Text fw={600} size="sm" tt="uppercase" c="dimmed">
            Readings
          </Text>
          <Group gap="xs">
            {word.kana.map((k, i) => (
              <Badge key={i} variant="light" color="green" size="lg">
                {k.text}
              </Badge>
            ))}
          </Group>
        </Stack>
      )}

      {/* All kanji forms */}
      {word.kanji.length > 1 && (
        <Stack gap="xs">
          <Text fw={600} size="sm" tt="uppercase" c="dimmed">
            Written forms
          </Text>
          <Group gap="xs">
            {word.kanji.map((k, i) => (
              <Badge key={i} variant="light" color="blue" size="lg" className="jp-text">
                {k.text}
              </Badge>
            ))}
          </Group>
        </Stack>
      )}

      {/* Definitions */}
      <Stack gap="md">
        <Text fw={600} size="sm" tt="uppercase" c="dimmed">
          Definitions
        </Text>
        {word.sense.map((sense, si) => (
          <Paper key={si} withBorder p="md" radius="md">
            <Stack gap="sm">
              {sense.partOfSpeech.length > 0 && (
                <Group gap={4}>
                  {sense.partOfSpeech.map((pos) => (
                    <Badge key={pos} color="green" variant="light" size="xs">
                      {pos}
                    </Badge>
                  ))}
                </Group>
              )}

              <Stack gap={4}>
                {sense.gloss.map((g, gi) => (
                  <Text key={gi} size="md">
                    <Text component="span" c="dimmed" size="sm" mr={6}>
                      {gi + 1}.
                    </Text>
                    {g}
                  </Text>
                ))}
              </Stack>

              {sense.info.length > 0 && (
                <Text size="xs" c="dimmed" fs="italic">
                  {sense.info.join("; ")}
                </Text>
              )}

              {/* Example sentences */}
              {sense.examples.length > 0 && (
                <Stack gap="sm" mt="xs">
                  {sense.examples.slice(0, 3).map((ex, ei) => (
                    <Paper key={ei} bg="var(--mantine-color-gray-0)" p="sm" radius="sm">
                      <Stack gap={4}>
                        {ex.sentences.map((s, si) => (
                          <Text
                            key={si}
                            size="sm"
                            className={s.lang === "jpn" ? "jp-text" : ""}
                            c={s.lang === "jpn" ? "dark" : "dimmed"}
                          >
                            {s.text}
                          </Text>
                        ))}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
