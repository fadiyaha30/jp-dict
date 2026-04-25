"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { pushSearch } from "@/lib/history";

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
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const item = { type: "search" as const, query: query.trim(), mode, timestamp: Date.now() };
    if (isLoggedIn) {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } else {
      pushSearch(query.trim(), mode);
    }
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
    });
  }

  const isLg = size === "lg";

  return (
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-2 rounded-xl transition-all"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: isLg ? "0.625rem 0.875rem" : "0.5rem 0.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-mid)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--accent-pale)";
          }}
          onBlurCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in English or Japanese…"
            disabled={isPending}
            className={`flex-1 bg-transparent border-none outline-none jp-text ${isLg ? "text-base" : "text-sm"}`}
            style={{ color: "var(--text)" }}
          />
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {isPending ? "…" : "Search"}
          </button>
        </div>
      </form>

      {/* Mode toggle */}
      <div className="flex justify-center">
        <div
          className="flex rounded-lg overflow-hidden gap-px"
          style={{ background: "var(--border)", border: "1px solid var(--border)" }}
        >
          {(["auto", "en", "jp"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-4 py-1.5 text-xs font-medium transition-all"
              style={
                mode === m
                  ? { background: "var(--surface)", color: "var(--accent)", fontWeight: 600 }
                  : { background: "var(--subtle)", color: "var(--muted)" }
              }
            >
              {m === "auto" ? "Auto" : m === "en" ? "EN → JP" : "JP → EN"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
