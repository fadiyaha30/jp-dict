"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ActionIcon, Tooltip } from "@mantine/core";

interface Props {
  grammarId: string;
  pattern: string;
  meaning: string;
  jlpt: string;
  size?: "sm" | "md" | "lg";
}

export default function GrammarFavoriteButton({ grammarId, pattern, meaning, jlpt, size = "md" }: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (status === "loading" || !isLoggedIn) return;
    fetch(`/api/grammar-favorites/${encodeURIComponent(grammarId)}`)
      .then((r) => r.json())
      .then((d) => setFavorited(d.favorited ?? false));
  }, [grammarId, isLoggedIn, status]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    const res = await fetch("/api/grammar-favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grammar_id: grammarId, pattern, meaning, jlpt }),
    });
    const data = await res.json();
    setFavorited(data.favorited);
  }

  if (!isLoggedIn) return null;

  return (
    <Tooltip label={favorited ? "Remove from favorites" : "Add to favorites"} withArrow>
      <ActionIcon
        variant={favorited ? "filled" : "subtle"}
        color={favorited ? "yellow" : "gray"}
        size={size}
        radius="xl"
        onClick={handleClick}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={favorited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </ActionIcon>
    </Tooltip>
  );
}
