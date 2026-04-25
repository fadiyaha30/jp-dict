import Link from "next/link";
import { Card, Badge, Group, Stack, Text } from "@mantine/core";
import type { SearchResult } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";

const JLPT_COLORS: Record<string, string> = {
  N1: "red",
  N2: "orange",
  N3: "yellow",
  N4: "teal",
  N5: "green",
};

interface WordCardProps {
  result: SearchResult;
}

export default function WordCard({ result }: WordCardProps) {
  return (
    <Card
      component={Link}
      href={`/word/${result.id}`}
      padding="lg"
      radius="md"
      className="hover:border-[#1D9E75] transition-colors cursor-pointer"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Stack gap="xs">
        {/* Header row: kanji + JLPT badge */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text
              size="2rem"
              fw={700}
              className="jp-text"
              style={{ lineHeight: 1.2, letterSpacing: "0.02em" }}
            >
              {result.kanji}
            </Text>
            {result.reading && result.reading !== result.kanji && (
              <Text size="sm" c="dimmed" className="jp-text" mt={2}>
                {result.reading}
              </Text>
            )}
          </div>
          <Group gap="xs">
            {result.jlpt && (
              <Badge color={JLPT_COLORS[result.jlpt] ?? "gray"} variant="light" size="sm">
                JLPT {result.jlpt}
              </Badge>
            )}
            <FavoriteButton
              size="sm"
              item={{
                id: result.id,
                kanji: result.kanji,
                reading: result.reading,
                romaji: result.romaji,
                meaning: result.meanings[0] ?? "",
                partOfSpeech: result.partOfSpeech,
                jlpt: result.jlpt,
              }}
            />
          </Group>
        </Group>

        {/* Romaji */}
        {result.romaji && (
          <Text size="sm" c="dimmed" fs="italic">
            {result.romaji}
          </Text>
        )}

        {/* POS badges */}
        {result.partOfSpeech.length > 0 && (
          <Group gap={4}>
            {result.partOfSpeech.slice(0, 3).map((pos) => (
              <Badge key={pos} color="gray" variant="outline" size="xs">
                {pos}
              </Badge>
            ))}
          </Group>
        )}

        {/* Meanings */}
        <Text size="sm" lineClamp={2}>
          {result.meanings.join("; ")}
        </Text>
      </Stack>
    </Card>
  );
}
