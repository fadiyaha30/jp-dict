"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Stack, Text, Group, Badge, ActionIcon, Button, Paper, Anchor } from "@mantine/core";
import { getHistory, clearHistory, removeItem, type HistoryItem } from "@/lib/history";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (isLoggedIn) {
      fetch("/api/history").then((r) => r.json()).then(setItems);
    } else {
      setItems(getHistory());
    }
  }, [isLoggedIn, status]);

  async function handleRemove(timestamp: number) {
    if (isLoggedIn) {
      await fetch(`/api/history/${timestamp}`, { method: "DELETE" });
      setItems((prev) => prev.filter((h) => h.timestamp !== timestamp));
    } else {
      removeItem(timestamp);
      setItems(getHistory());
    }
  }

  async function handleClear() {
    if (isLoggedIn) {
      await fetch("/api/history", { method: "DELETE" });
      setItems([]);
    } else {
      clearHistory();
      setItems([]);
    }
  }

  if (status === "loading") return null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="xl" fw={700}>History</Text>
            <Text size="sm" c="dimmed">
              Your recent searches and word views ·{" "}
              {isLoggedIn ? "synced to your account" : "stored locally"}
            </Text>
          </Stack>
          {items.length > 0 && (
            <Button variant="subtle" color="red" size="xs" onClick={handleClear}>
              Clear all
            </Button>
          )}
        </Group>

        {items.length === 0 ? (
          <Stack align="center" py="xl" gap="sm">
            <Text size="2rem">📖</Text>
            <Text fw={600}>No history yet</Text>
            <Text size="sm" c="dimmed">Words you view and searches you make will appear here.</Text>
            <Button component={Link} href="/" color="green" variant="light" radius="xl" mt="sm">
              Start searching
            </Button>
          </Stack>
        ) : (
          <Stack gap="xs">
            {items.map((item) => (
              <Paper key={item.timestamp} withBorder p="sm" radius="md">
                <Group justify="space-between" wrap="nowrap">
                  {item.type === "word" ? (
                    <Anchor component={Link} href={`/word/${item.id}`} underline="never" style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="sm" wrap="nowrap">
                        <Badge color="green" variant="light" size="sm" style={{ flexShrink: 0 }}>Word</Badge>
                        <Text fw={600} className="jp-text" truncate>{item.kanji}</Text>
                        {item.reading && item.reading !== item.kanji && (
                          <Text size="sm" c="dimmed" className="jp-text" truncate>{item.reading}</Text>
                        )}
                        <Text size="sm" c="dimmed" truncate style={{ flex: 1 }}>{item.meaning}</Text>
                      </Group>
                    </Anchor>
                  ) : (
                    <Anchor component={Link} href={`/search?q=${encodeURIComponent(item.query)}&mode=${item.mode}`} underline="never" style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="sm" wrap="nowrap">
                        <Badge color="blue" variant="light" size="sm" style={{ flexShrink: 0 }}>Search</Badge>
                        <Text truncate>"{item.query}"</Text>
                        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{item.mode}</Text>
                      </Group>
                    </Anchor>
                  )}
                  <Group gap="xs" style={{ flexShrink: 0 }}>
                    <Text size="xs" c="dimmed">{timeAgo(item.timestamp)}</Text>
                    <ActionIcon variant="subtle" color="gray" size="sm"
                      onClick={() => handleRemove(item.timestamp)} aria-label="Remove">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </main>
  );
}
