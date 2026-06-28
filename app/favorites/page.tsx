"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getFavorites, removeFavorite, type FavoriteItem } from "@/lib/favorites";

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}時間前`;
  return `${Math.floor(hrs / 24)}日前`;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (isLoggedIn) fetch("/api/favorites").then((r) => r.json()).then(setItems);
    else setItems(getFavorites());
  }, [isLoggedIn, status]);

  async function handleRemove(id: string) {
    if (isLoggedIn) {
      await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setItems((prev) => prev.filter((f) => f.id !== id));
    } else {
      removeFavorite(id);
      setItems(getFavorites());
    }
  }

  if (status === "loading") return null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>お気に入り</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {items.length}単語保存済み ·{" "}
            {isLoggedIn ? "アカウントと同期済み" : "ローカル保存"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <p className="text-4xl">⭐</p>
            <p className="font-semibold" style={{ color: "var(--text)" }}>お気に入りがありません</p>
            <p className="text-sm text-center" style={{ color: "var(--muted)", maxWidth: "20rem" }}>
              検索結果や単語ページで☆を押してここに保存できます。
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--accent)", color: "white" }}
            >
              検索する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div key={item.id} className="card bg-white p-5 flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/word/${item.id}`} className="flex-1 min-w-0 no-underline group">
                    <div
                      className="jp-text font-bold leading-none mb-1 group-hover:text-[var(--accent)] transition-colors"
                      style={{ fontSize: "2rem", color: "var(--text)" }}
                    >
                      {item.kanji}
                    </div>
                    {item.reading && item.reading !== item.kanji && (
                      <div className="jp-text text-sm" style={{ color: "var(--muted)" }}>{item.reading}</div>
                    )}
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {item.jlpt && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{ background: JLPT_COLORS[item.jlpt] + "18", color: JLPT_COLORS[item.jlpt] }}
                      >
                        {item.jlpt}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-11 h-11 flex items-center justify-center rounded-lg transition-all"
                      style={{ background: "#fef3c7", color: "#d97706", border: "none" }}
                      aria-label="Remove"
                    >
                      ★
                    </button>
                  </div>
                </div>
                <div style={{ height: "1px", background: "var(--border)" }} />
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{item.meaning}</p>
                <p className="text-xs" style={{ color: "#c0b8ae" }}>{timeAgo(item.savedAt)}に保存</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
