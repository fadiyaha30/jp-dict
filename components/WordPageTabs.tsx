"use client";

import { useState } from "react";
import WordDefinitions from "@/components/WordDefinitions";
import ExampleSentences from "@/components/ExampleSentences";
import UserNotes from "@/components/UserNotes";
import Conjugation from "@/components/Conjugation";
import KanjiStrokes from "@/components/KanjiStrokes";
import type { ConjugationTable } from "@/lib/conjugation";

interface WordPageTabsProps {
  word: any;
  examples: any[];
  searchWord: string;
  result: any;
  conjugation: ConjugationTable | null;
  kanjiSvgs: { char: string; svg: string }[];
}

export default function WordPageTabs({ word, examples, searchWord, result, conjugation, kanjiSvgs }: WordPageTabsProps) {
  const [activeTab, setActiveTab] = useState("definitions");

  const tabs = [
    { key: "definitions", label: "Definitions" },
    ...(conjugation ? [{ key: "conjugation", label: "Conjugation" }] : []),
    ...(kanjiSvgs.length > 0 ? [{ key: "strokes", label: "Stroke Order" }] : []),
    { key: "examples", label: `Examples${examples.length > 0 ? ` (${examples.length})` : ""}` },
    { key: "notes", label: "My Notes" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex border-b mb-6"
        style={{ borderColor: "var(--border)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === tab.key ? "var(--accent)" : "var(--muted)",
              background: "none",
              border: "none",
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === "definitions" && <WordDefinitions word={word} />}
      {activeTab === "conjugation" && conjugation && <Conjugation table={conjugation} />}
      {activeTab === "strokes" && <KanjiStrokes chars={kanjiSvgs} />}
      {activeTab === "examples" && <ExampleSentences examples={examples} word={searchWord} />}
      {activeTab === "notes" && <UserNotes wordId={result.id} wordKanji={result.kanji} wordMeaning={result.meanings[0] ?? ""} />}
    </div>
  );
}
