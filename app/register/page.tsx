"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("パスワードが一致しません。"); return; }

    startTransition(async () => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "登録に失敗しました。"); return; }
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.error) { setError("アカウントを作成しましたが、ログインに失敗しました。手動でログインしてください。"); return; }
      router.push("/");
      router.refresh();
    });
  }

  const inputProps = (extra?: React.CSSProperties) => ({
    className: "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all",
    style: { background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)", ...extra },
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "var(--accent-mid)"),
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "var(--border)"),
  });

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-1 mb-8 text-center">
          <span className="jp-text text-3xl font-black" style={{ color: "var(--accent)" }}>辞</span>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>アカウント作成</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>ファヤの辞書に登録して学習記録を同期</p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted)" }}>ユーザー名</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ユーザー名を入力" required autoFocus autoComplete="username" {...inputProps()} />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>3〜20文字（英字・数字・アンダースコア）</p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted)" }}>パスワード</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password" {...inputProps()} />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>8文字以上</p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted)" }}>パスワード（確認）</label>
              <input
                type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" required autoComplete="new-password"
                {...inputProps(confirm && password !== confirm ? { borderColor: "#fca5a5" } : {})}
              />
              {confirm && password !== confirm && (
                <p className="text-xs mt-1.5" style={{ color: "#dc2626" }}>パスワードが一致しません</p>
              )}
            </div>

            <button
              type="submit" disabled={isPending}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 mt-1"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {isPending ? "作成中…" : "アカウントを作成"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: "var(--muted)" }}>
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" style={{ color: "var(--accent)" }} className="font-medium hover:underline">ログイン</Link>
        </p>
      </div>
    </main>
  );
}
