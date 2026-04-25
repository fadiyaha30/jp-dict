"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  SegmentedControl,
  ActionIcon,
  Stack,
  Group,
} from "@mantine/core";

type Mode = "auto" | "en" | "jp";

interface SearchBarProps {
  defaultQuery?: string;
  defaultMode?: Mode;
  size?: "md" | "lg";
}

export default function SearchBar({
  defaultQuery = "",
  defaultMode = "auto",
  size = "lg",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
    });
  }

  return (
    <Stack gap="sm" w="100%">
      <form onSubmit={handleSubmit}>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search in English or Japanese…"
          size={size}
          radius="xl"
          disabled={isPending}
          rightSection={
            <ActionIcon
              type="submit"
              variant="filled"
              color="green"
              radius="xl"
              size={size === "lg" ? "lg" : "md"}
              loading={isPending}
              aria-label="Search"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </ActionIcon>
          }
          styles={{
            input: {
              fontFamily: "var(--font-noto-sans-jp), sans-serif",
              fontSize: size === "lg" ? "1.1rem" : undefined,
              paddingRight: "3rem",
            },
          }}
        />
      </form>
      <Group justify="center">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          data={[
            { label: "Auto", value: "auto" },
            { label: "EN → JP", value: "en" },
            { label: "JP → EN", value: "jp" },
          ]}
          color="green"
          radius="xl"
          size="sm"
        />
      </Group>
    </Stack>
  );
}
