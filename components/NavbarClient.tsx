"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { href: "/grammar", label: "Grammar" },
  { href: "/kana", label: "Kana" },
  { href: "/record", label: "Record" },
  { href: "/favorites", label: "Favorites" },
  { href: "/history", label: "History" },
  { href: "/notes", label: "Notes" },
  { href: "/quiz", label: "Quiz" },
];

export default function NavbarClient({ username }: { username: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(245,240,232,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <span className="jp-text text-xl font-black" style={{ color: "var(--accent)" }}>辞</span>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text)" }}>ファヤの辞書</span>
        </Link>

        <nav className="flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="text-sm px-3 py-1.5 rounded-md transition-all"
                style={{
                  color: active ? "var(--accent)" : "var(--muted)",
                  background: active ? "var(--accent-pale)" : "transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0">
          {username ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all"
                style={{
                  border: "1px solid var(--border)",
                  background: menuOpen ? "var(--accent-pale)" : "transparent",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  {username[0].toUpperCase()}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {username}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  style={{
                    color: "var(--muted)",
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-36 rounded-lg overflow-hidden shadow-md"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", top: "100%" }}
                >
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm transition-colors"
                style={{ color: pathname === "/login" ? "var(--accent)" : "var(--muted)" }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-1.5 rounded-full font-medium transition-all hover:opacity-90"
                style={{ background: "var(--accent)", color: "white" }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
