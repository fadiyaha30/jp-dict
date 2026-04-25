"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { isFavorited, toggleFavorite, type FavoriteItem } from "@/lib/favorites";

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, "savedAt">;
  size?: "sm" | "md" | "lg";
}

export default function FavoriteButton({ item, size = "md" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  // Read from localStorage only on the client
  useEffect(() => {
    setFavorited(isFavorited(item.id));
  }, [item.id]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite(item);
    setFavorited(next);
  }

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
