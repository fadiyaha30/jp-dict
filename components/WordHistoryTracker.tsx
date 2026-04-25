"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { pushWord } from "@/lib/history";

interface Props {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
}

export default function WordHistoryTracker({ id, kanji, reading, meaning }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const item = { type: "word" as const, id, kanji, reading, meaning, timestamp: Date.now() };
    if (isLoggedIn) {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } else {
      pushWord(id, kanji, reading, meaning);
    }
  }, [id, kanji, reading, meaning, isLoggedIn]);

  return null;
}
