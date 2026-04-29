"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getFavorites, removeFavorite, type FavoriteItem } from "@/lib/favorites";
import type { DbGrammarFavorite } from "@/lib/db";

const JLPT_COLORS: Record<string, string> = {
  N1: "#ef4444", N2: "#f97316", N3: "#d97706", N4: "#0d9488", N5: "#4f46e5",
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

type Tab = "words" | "grammar";

export default function FavoritesClient() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "words");
  const [wordItems, setWordItems] = useState<FavoriteItem[]>([]);
  const [grammarItems, setGrammarItems] = useState<DbGrammarFavorite[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (isLoggedIn) {
      fetch("/api/favorites").then((r) => r.json()).then(setWordItems);
      fetch("/api/grammar-favorites").then((r) => r.json()).then(setGrammarItems);
    } else {
      setWordItems(getFavorites());
    }
  }, [isLoggedIn, status]);

  function switchTab(t: Tab) {
    setTab(t);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function handleRemoveWord(id: string) {
    if (isLoggedIn) {
      await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setWordItems((prev) => prev.filter((f) => f.id !== id));
    } else {
      removeFavorite(id);
      setWordItems(getFavorites());
    }
  }

  async function handleRemoveGrammar(grammarId: string) {
    await fetch("/api/grammar-favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grammar_id: grammarId, pattern: "", meaning: "", jlpt: "" }),
    });
    setGrammarItems((prev) => prev.filter((g) => g.grammar_id !== grammarId));
  }

  if (status === "loading") return null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Favorites</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {isLoggedIn ? "Synced to your account." : "Stored locally."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            ["words", "Words", wordItems.length],
            ["grammar", "Grammar", grammarItems.length],
          ] as [Tab, string, number][]).map(([t, label, count]) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
              style={{
                background: tab === t ? "var(--accent)" + "18" : "var(--surface)",
                border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
                color: tab === t ? "var(--accent)" : "var(--muted)",
              }}
            >
              {label}
              <span className="ml-1.5 text-[10px]" style={{ opacity: 0.7 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Words tab */}
        {tab === "words" && (
          wordItems.length === 0 ? (
            <EmptyState
              emoji="⭐"
              title="No favorite words yet"
              description="Star words on search results or word pages to save them here."
              cta={{ label: "Start searching", href: "/" }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wordItems.map((item) => (
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
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={{ background: JLPT_COLORS[item.jlpt] + "18", color: JLPT_COLORS[item.jlpt] }}>
                          {item.jlpt}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveWord(item.id)}
                        className="text-xs px-2 py-1 rounded-lg transition-all"
                        style={{ background: "#fef3c7", color: "#d97706", border: "none" }}
                        aria-label="Remove"
                      >
                        ★
                      </button>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "var(--border)" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{item.meaning}</p>
                  <p className="text-xs" style={{ color: "#c0b8ae" }}>Saved {timeAgo(item.savedAt)}</p>
                </div>
              ))}
            </div>
          )
        )}

        {/* Grammar tab */}
        {tab === "grammar" && (
          !isLoggedIn ? (
            <EmptyState
              emoji="文"
              title="Sign in to save grammar"
              description="Grammar favorites require an account."
              cta={{ label: "Sign in", href: "/login" }}
            />
          ) : grammarItems.length === 0 ? (
            <EmptyState
              emoji="文"
              title="No favorite grammar points yet"
              description="Star grammar points on their detail pages to save them here."
              cta={{ label: "Browse grammar", href: "/grammar" }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grammarItems.map((item) => {
                const color = JLPT_COLORS[item.jlpt] ?? "var(--accent)";
                return (
                  <div key={item.grammar_id} className="card bg-white p-5 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/grammar/${item.grammar_id}`} className="flex-1 min-w-0 no-underline group">
                        <div
                          className="jp-text font-bold leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
                          style={{ fontSize: "1.3rem", color: "var(--text)" }}
                        >
                          {item.pattern}
                        </div>
                      </Link>
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={{ background: color + "18", color }}>
                          {item.jlpt}
                        </span>
                        <button
                          onClick={() => handleRemoveGrammar(item.grammar_id)}
                          className="text-xs px-2 py-1 rounded-lg transition-all"
                          style={{ background: "#fef3c7", color: "#d97706", border: "none" }}
                          aria-label="Remove"
                        >
                          ★
                        </button>
                      </div>
                    </div>
                    <div style={{ height: "1px", background: "var(--border)" }} />
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{item.meaning}</p>
                    <p className="text-xs" style={{ color: "#c0b8ae" }}>Saved {timeAgo(item.saved_at)}</p>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </main>
  );
}

function EmptyState({
  emoji,
  title,
  description,
  cta,
}: {
  emoji: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-20">
      <p className="text-4xl jp-text">{emoji}</p>
      <p className="font-semibold" style={{ color: "var(--text)" }}>{title}</p>
      <p className="text-sm text-center" style={{ color: "var(--muted)", maxWidth: "20rem" }}>{description}</p>
      <Link href={cta.href} className="mt-2 px-5 py-2 rounded-xl text-sm font-medium"
        style={{ background: "var(--accent)", color: "white" }}>
        {cta.label}
      </Link>
    </div>
  );
}
