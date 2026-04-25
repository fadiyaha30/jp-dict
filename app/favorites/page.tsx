"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Stack,
  Text,
  Group,
  Badge,
  Button,
  SimpleGrid,
  Card,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { getFavorites, removeFavorite, type FavoriteItem } from "@/lib/favorites";

const JLPT_COLORS: Record<string, string> = {
  N1: "red", N2: "orange", N3: "yellow", N4: "teal", N5: "green",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  function handleRemove(id: string) {
    removeFavorite(id);
    setItems(getFavorites());
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="xl" fw={700}>Favorites</Text>
            <Text size="sm" c="dimmed">
              {items.length} saved word{items.length !== 1 ? "s" : ""}
            </Text>
          </Stack>
        </Group>

        {items.length === 0 ? (
          <Stack align="center" py="xl" gap="sm">
            <Text size="2rem">⭐</Text>
            <Text fw={600}>No favorites yet</Text>
            <Text size="sm" c="dimmed" ta="center">
              Star words on search results or word detail pages to save them here.
            </Text>
            <Button component={Link} href="/" color="green" variant="light" radius="xl" mt="sm">
              Start searching
            </Button>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {items.map((item) => (
              <Card
                key={item.id}
                withBorder
                shadow="xs"
                radius="md"
                padding="lg"
                className="hover:border-[#1D9E75] transition-colors"
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Link href={`/word/${item.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                      <Text
                        size="2rem"
                        fw={700}
                        className="jp-text"
                        style={{ lineHeight: 1.2, letterSpacing: "0.02em" }}
                      >
                        {item.kanji}
                      </Text>
                      {item.reading && item.reading !== item.kanji && (
                        <Text size="sm" c="dimmed" className="jp-text" mt={2}>
                          {item.reading}
                        </Text>
                      )}
                    </Link>
                    <Group gap="xs">
                      {item.jlpt && (
                        <Badge color={JLPT_COLORS[item.jlpt] ?? "gray"} variant="light" size="sm">
                          JLPT {item.jlpt}
                        </Badge>
                      )}
                      <Tooltip label="Remove from favorites" withArrow>
                        <ActionIcon
                          variant="filled"
                          color="yellow"
                          size="sm"
                          radius="xl"
                          onClick={() => handleRemove(item.id)}
                          aria-label="Remove from favorites"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {item.romaji && (
                    <Text size="sm" c="dimmed" fs="italic">{item.romaji}</Text>
                  )}

                  {item.partOfSpeech.length > 0 && (
                    <Group gap={4}>
                      {item.partOfSpeech.slice(0, 3).map((pos) => (
                        <Badge key={pos} color="gray" variant="outline" size="xs">{pos}</Badge>
                      ))}
                    </Group>
                  )}

                  <Text size="sm" lineClamp={2}>{item.meaning}</Text>

                  <Text size="xs" c="dimmed">Saved {timeAgo(item.savedAt)}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </main>
  );
}
