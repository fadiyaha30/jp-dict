"use client";

import { useEffect } from "react";
import { pushWord } from "@/lib/history";

interface Props {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
}

export default function WordHistoryTracker({ id, kanji, reading, meaning }: Props) {
  useEffect(() => {
    pushWord(id, kanji, reading, meaning);
  }, [id, kanji, reading, meaning]);

  return null;
}
