"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getFavorites, removeFavorite, type FavoriteItem } from "@/lib/favorites";

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#eab308", N4: "#14b8a6", N5: "#1D9E75",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (isLoggedIn) {
      fetch("/api/favorites").then((r) => r.json()).then(setItems);
    } else {
      setItems(getFavorites());
    }
  }, [isLoggedIn, status]);

  async function handleRemove(id: string) {
    if (isLoggedIn) {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white/90 mb-1">Favorites</h1>
          <p className="text-sm" style={{ color: "rgba(29,158,117,0.7)" }}>
            {items.length} saved word{items.length !== 1 ? "s" : ""}
            {" · "}
            <span className="text-white/30">{isLoggedIn ? "synced to your account" : "stored locally"}</span>
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <span style={{ fontSize: "3rem", filter: "grayscale(0.2)" }}>⭐</span>
            <p className="font-semibold text-white/80">No favorites yet</p>
            <p className="text-sm text-white/40 text-center max-w-xs">
              Star words on search results or word pages to save them here.
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/word/${item.id}`} className="flex-1 min-w-0 no-underline">
                    <div
                      className="jp-text font-bold leading-none mb-1"
                      style={{ fontSize: "2rem", color: "rgba(255,255,255,0.95)" }}
                    >
                      {item.kanji}
                    </div>
                    {item.reading && item.reading !== item.kanji && (
                      <div className="jp-text text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {item.reading}
                      </div>
                    )}
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.jlpt && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: JLPT_COLORS[item.jlpt] + "22",
                          border: `1px solid ${JLPT_COLORS[item.jlpt]}55`,
                          color: JLPT_COLORS[item.jlpt],
                        }}
                      >
                        {item.jlpt}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      aria-label="Remove from favorites"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {item.romaji && (
                  <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.3)" }}>{item.romaji}</p>
                )}

                {item.partOfSpeech.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.partOfSpeech.slice(0, 3).map((pos) => (
                      <span
                        key={pos}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.2)", color: "rgba(29,158,117,0.9)" }}
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{item.meaning}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Saved {timeAgo(item.savedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
