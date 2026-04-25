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

  const inputH = size === "lg" ? "h-14" : "h-11";
  const fontSize = size === "lg" ? "text-base" : "text-sm";

  return (
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 px-4 ${inputH} rounded-2xl transition-all`}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(29,158,117,0.2)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: query ? "0 0 0 1px rgba(29,158,117,0.3), 0 0 20px rgba(29,158,117,0.08)" : "none",
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(29,158,117,0.7)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in English or Japanese…"
            disabled={isPending}
            className={`flex-1 bg-transparent border-none outline-none ${fontSize} text-white/90 placeholder:text-white/30 jp-text`}
          />
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{
              background: "rgba(29,158,117,0.2)",
              border: "1px solid rgba(29,158,117,0.35)",
              color: "#1D9E75",
            }}
          >
            {isPending ? "…" : "Search"}
          </button>
        </div>
      </form>

      {/* Mode toggle */}
      <div className="flex justify-center">
        <div
          className="flex rounded-xl overflow-hidden p-0.5 gap-0.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(29,158,117,0.12)" }}
        >
          {(["auto", "en", "jp"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                mode === m
                  ? { background: "rgba(29,158,117,0.25)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.4)" }
                  : { background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid transparent" }
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
