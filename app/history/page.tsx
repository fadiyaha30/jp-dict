"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getHistory, clearHistory, removeItem, type HistoryItem } from "@/lib/history";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}時間前`;
  return `${Math.floor(hrs / 24)}日前`;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "word" | "search">("all");

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

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
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>履歴</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              閲覧・検索履歴 · {isLoggedIn ? "同期済み" : "ローカル保存"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
            >
              すべて削除
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex">
            <div
              className="flex rounded-lg overflow-hidden gap-px"
              style={{ background: "var(--border)", border: "1px solid var(--border)" }}
            >
              {(["all", "word", "search"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2.5 text-xs font-medium transition-all min-h-[44px]"
                  style={
                    filter === f
                      ? { background: "var(--surface)", color: "var(--accent)", fontWeight: 600 }
                      : { background: "var(--subtle)", color: "var(--muted)" }
                  }
                >
                  {f === "all" ? "すべて" : f === "word" ? "単語" : "検索"}
                </button>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <p className="text-4xl">📖</p>
            <p className="font-semibold" style={{ color: "var(--text)" }}>履歴がありません</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>見た単語や検索履歴がここに表示されます。</p>
            <Link href="/" className="mt-2 px-5 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--accent)", color: "white" }}>
              検索する
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {filter === "word" ? "単語の閲覧履歴がありません。" : "検索履歴がありません。"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((item) => (
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
                      単語
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
                      検索
                    </span>
                    <span className="truncate" style={{ color: "var(--text)" }}>&ldquo;{item.query}&rdquo;</span>
                    <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>{item.mode}</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs" style={{ color: "#c0b8ae" }}>{timeAgo(item.timestamp)}</span>
                  <button
                    onClick={() => handleRemove(item.timestamp)}
                    className="text-sm w-11 h-11 flex items-center justify-center rounded-lg transition-colors"
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
