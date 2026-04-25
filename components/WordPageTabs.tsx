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
    <div
      className="rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(29,158,117,0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex border-b px-1 pt-1"
        style={{ borderColor: "rgba(29,158,117,0.1)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-3 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === tab.key ? "#1D9E75" : "rgba(255,255,255,0.4)",
              background: "transparent",
              border: "none",
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: "#1D9E75", boxShadow: "0 0 8px rgba(29,158,117,0.6)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === "definitions" && <WordDefinitions word={word} />}
        {activeTab === "conjugation" && conjugation && <Conjugation table={conjugation} />}
        {activeTab === "examples" && <ExampleSentences examples={examples} word={searchWord} />}
        {activeTab === "notes" && <UserNotes wordId={result.id} />}
      </div>
    </div>
  );
}
