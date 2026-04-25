"use client";

import { useState } from "react";
import WordDefinitions from "@/components/WordDefinitions";
import ExampleSentences from "@/components/ExampleSentences";
import UserNotes from "@/components/UserNotes";
import Conjugation from "@/components/Conjugation";
import type { ConjugationTable } from "@/lib/conjugation";

interface WordPageTabsProps {
  word: any;
  examples: any[];
  searchWord: string;
  result: any;
  conjugation: ConjugationTable | null;
}

export default function WordPageTabs({ word, examples, searchWord, result, conjugation }: WordPageTabsProps) {
  const [activeTab, setActiveTab] = useState("definitions");

  const tabs = [
    { key: "definitions", label: "Definitions" },
    ...(conjugation ? [{ key: "conjugation", label: "Conjugation" }] : []),
    { key: "examples", label: `Examples${examples.length > 0 ? ` (${examples.length})` : ""}` },
    { key: "notes", label: "My Notes" },
  ];

  return (
    <>
      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-[#1D9E75]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "definitions" && <WordDefinitions word={word} />}
      {activeTab === "conjugation" && conjugation && <Conjugation table={conjugation} />}
      {activeTab === "examples" && <ExampleSentences examples={examples} word={searchWord} />}
      {activeTab === "notes" && <UserNotes wordId={result.id} />}
    </>
  );
}