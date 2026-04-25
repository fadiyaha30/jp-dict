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

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      await signIn("credentials", { username, password, redirect: false });
      router.push("/");
      router.refresh();
    });
  }

  const inputClass = "px-4 py-3 rounded-xl text-white/90 placeholder:text-white/25 outline-none transition-all bg-transparent";
  const inputStyle = { border: "1px solid rgba(29,158,117,0.2)", background: "rgba(255,255,255,0.03)" };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: "500px", height: "300px",
          background: "radial-gradient(ellipse, rgba(29,158,117,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(29,158,117,0.15)",
          boxShadow: "0 0 60px rgba(29,158,117,0.05)",
        }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">Create an account</h1>
          <p className="text-sm text-white/40">Join JDict to sync your progress</p>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              required
              autoFocus
              autoComplete="username"
              className={inputClass}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.55)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.2)")}
            />
            <p className="text-xs text-white/30">3–20 characters, letters/numbers/underscores</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputClass}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.55)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.2)")}
            />
            <p className="text-xs text-white/30">At least 8 characters</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputClass}
              style={{
                ...inputStyle,
                borderColor: confirm && password !== confirm ? "rgba(239,68,68,0.5)" : "rgba(29,158,117,0.2)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.55)")}
              onBlur={(e) => {
                e.target.style.borderColor =
                  confirm && password !== confirm ? "rgba(239,68,68,0.5)" : "rgba(29,158,117,0.2)";
              }}
            />
            {confirm && password !== confirm && (
              <p className="text-xs" style={{ color: "#fca5a5" }}>Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: "rgba(29,158,117,0.2)",
              border: "1px solid rgba(29,158,117,0.4)",
              color: "#1D9E75",
            }}
          >
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-sm text-white/35">
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#1D9E75" }} className="hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
