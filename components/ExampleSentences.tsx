import { Stack, Text, Paper, Divider, Anchor } from "@mantine/core";
import type { TatoebaExample } from "@/lib/tatoeba";

interface ExampleSentencesProps {
  examples: TatoebaExample[];
  word: string;
}

export default function ExampleSentences({ examples, word }: ExampleSentencesProps) {
  if (examples.length === 0) return null;

  return (
    <Stack gap="md">
      <Divider />
      <Stack gap="xs">
        <Text fw={600} size="sm" tt="uppercase" c="dimmed">
          Example Sentences
        </Text>
        <Text size="xs" c="dimmed">
          via{" "}
          <Anchor
            href={`https://tatoeba.org/en/sentences/search?from=jpn&to=eng&query=${encodeURIComponent(word)}`}
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
          >
            Tatoeba
          </Anchor>
        </Text>
      </Stack>

      <Stack gap="sm">
        {examples.map((ex) => (
          <Paper key={ex.id} withBorder p="md" radius="md">
            <Stack gap={6}>
              <Text size="md" fw={500} className="jp-text" style={{ lineHeight: 1.6 }}>
                {ex.japanese}
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                {ex.english}
              </Text>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
