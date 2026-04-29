"use client";

import { useState, useTransition, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getFavorites } from "@/lib/favorites";
import { getHistory } from "@/lib/history";

const field = {
  label: "text-xs font-semibold uppercase tracking-widest mb-1.5 block",
  input: "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all",
};

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.error) {
        setError("Invalid username or password.");
      } else {
        const favorites = getFavorites();
        const history = getHistory();
        if (favorites.length > 0 || history.length > 0) {
          await fetch("/api/migrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites, history }),
          });
        }
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-8 text-center">
          <span className="jp-text text-3xl font-black" style={{ color: "var(--accent)" }}>辞</span>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Sign in to your ファヤの辞書 account</p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={field.label} style={{ color: "var(--muted)" }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoFocus
                autoComplete="username"
                className={field.input}
                style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className={field.label} style={{ color: "var(--muted)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={field.input}
                style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 mt-1"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)" }} className="font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
