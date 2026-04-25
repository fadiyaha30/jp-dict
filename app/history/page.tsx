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
    if (isLoggedIn) fetch("/api/history").then((r) => r.json()).then(setItems);
    else setItems(getHistory());
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
    if (isLoggedIn) { await fetch("/api/history", { method: "DELETE" }); setItems([]); }
    else { clearHistory(); setItems([]); }
  }

  if (status === "loading") return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>History</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Recent views &amp; searches · {isLoggedIn ? "synced" : "stored locally"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <p className="text-4xl">📖</p>
            <p className="font-semibold" style={{ color: "var(--text)" }}>No history yet</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Words you view and searches you make will appear here.</p>
            <Link href="/" className="mt-2 px-5 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--accent)", color: "white" }}>
              Start searching
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {items.map((item) => (
              <div
                key={item.timestamp}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all hover:border-[var(--accent-mid)]"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {item.type === "word" ? (
                  <Link href={`/word/${item.id}`} className="flex items-center gap-3 flex-1 min-w-0 no-underline">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium shrink-0"
                      style={{ background: "var(--accent-pale)", color: "var(--accent)" }}
                    >
                      Word
                    </span>
                    <span className="jp-text font-semibold truncate" style={{ color: "var(--text)" }}>{item.kanji}</span>
                    {item.reading && item.reading !== item.kanji && (
                      <span className="jp-text text-sm truncate" style={{ color: "var(--muted)" }}>{item.reading}</span>
                    )}
                    <span className="text-sm truncate flex-1" style={{ color: "var(--muted)" }}>{item.meaning}</span>
                  </Link>
                ) : (
                  <Link href={`/search?q=${encodeURIComponent(item.query)}&mode=${item.mode}`} className="flex items-center gap-3 flex-1 min-w-0 no-underline">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium shrink-0"
                      style={{ background: "#f1f0ff", color: "#6366f1" }}
                    >
                      Search
                    </span>
                    <span className="truncate" style={{ color: "var(--text)" }}>&ldquo;{item.query}&rdquo;</span>
                    <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>{item.mode}</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs" style={{ color: "#c0b8ae" }}>{timeAgo(item.timestamp)}</span>
                  <button
                    onClick={() => handleRemove(item.timestamp)}
                    className="text-xs w-5 h-5 flex items-center justify-center rounded transition-colors"
                    style={{ color: "var(--muted)", background: "none", border: "none" }}
                    aria-label="Remove"
                  >
                    ×
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
