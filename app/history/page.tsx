"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getHistory, clearHistory, removeItem, type HistoryItem } from "@/lib/history";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (isLoggedIn) {
      fetch("/api/history").then((r) => r.json()).then(setItems);
    } else {
      setItems(getHistory());
    }
  }, [isLoggedIn, status]);

  async function handleRemove(timestamp: number) {
    if (isLoggedIn) {
      await fetch(`/api/history/${timestamp}`, { method: "DELETE" });
      setItems((prev) => prev.filter((h) => h.timestamp !== timestamp));
    } else {
      removeItem(timestamp);
      setItems(getHistory());
    }
  }

  async function handleClear() {
    if (isLoggedIn) {
      await fetch("/api/history", { method: "DELETE" });
      setItems([]);
    } else {
      clearHistory();
      setItems([]);
    }
  }

  if (status === "loading") return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white/90 mb-1">History</h1>
            <p className="text-sm text-white/30">
              Recent word views &amp; searches ·{" "}
              <span style={{ color: "rgba(29,158,117,0.7)" }}>
                {isLoggedIn ? "synced" : "stored locally"}
              </span>
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(239,68,68,0.7)",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <span style={{ fontSize: "3rem" }}>📖</span>
            <p className="font-semibold text-white/80">No history yet</p>
            <p className="text-sm text-white/40 text-center">
              Words you view and searches you make will appear here.
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(29,158,117,0.15)",
                border: "1px solid rgba(29,158,117,0.3)",
                color: "#1D9E75",
              }}
            >
              Start searching
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.timestamp}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(29,158,117,0.1)",
                }}
              >
                {item.type === "word" ? (
                  <Link
                    href={`/word/${item.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0 no-underline"
                  >
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{
                        background: "rgba(29,158,117,0.12)",
                        border: "1px solid rgba(29,158,117,0.25)",
                        color: "#1D9E75",
                      }}
                    >
                      Word
                    </span>
                    <span className="jp-text font-semibold text-white/85 truncate">{item.kanji}</span>
                    {item.reading && item.reading !== item.kanji && (
                      <span className="jp-text text-sm text-white/40 truncate">{item.reading}</span>
                    )}
                    <span className="text-sm text-white/35 truncate flex-1">{item.meaning}</span>
                  </Link>
                ) : (
                  <Link
                    href={`/search?q=${encodeURIComponent(item.query)}&mode=${item.mode}`}
                    className="flex items-center gap-3 flex-1 min-w-0 no-underline"
                  >
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#818cf8",
                      }}
                    >
                      Search
                    </span>
                    <span className="text-white/70 truncate">&ldquo;{item.query}&rdquo;</span>
                    <span className="text-xs text-white/30">{item.mode}</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-white/25">{timeAgo(item.timestamp)}</span>
                  <button
                    onClick={() => handleRemove(item.timestamp)}
                    aria-label="Remove"
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all text-white/20 hover:text-white/60"
                    style={{ background: "transparent", border: "none" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
