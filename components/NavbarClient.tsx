"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LogoutButton from "./LogoutButton";

export default function NavbarClient({ username }: { username: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/favorites", label: "Favorites" },
    { href: "/history", label: "History" },
    { href: "/notes", label: "Notes" },
    { href: "/quiz", label: "Quiz" },
  ];

  const isActive = (href: string) => pathname === href;

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
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="jp-text text-xl font-black" style={{ color: "var(--accent)" }}>辞</span>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text)" }}>ファヤの辞書</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm transition-colors"
              style={{ color: isActive(href) ? "var(--accent)" : "var(--muted)" }}
            >
              {label}
            </Link>
          ))}

          {username ? (
            <div className="flex items-center gap-3">
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "1px solid #c7d2fe" }}
              >
                {username}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm transition-colors"
                style={{ color: isActive("/login") ? "var(--accent)" : "var(--muted)" }}
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
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg transition-colors"
          style={{ color: "var(--text)" }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-0.5 transition-all origin-center"
            style={{
              background: "var(--text)",
              transform: menuOpen ? "translateY(8px) rotate(45deg)" : undefined,
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all"
            style={{
              background: "var(--text)",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all origin-center"
            style={{
              background: "var(--text)",
              transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : undefined,
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="sm:hidden border-t px-4 py-4 flex flex-col gap-4"
          style={{
            background: "rgba(245,240,232,0.97)",
            borderColor: "var(--border)",
          }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium py-1 transition-colors"
              style={{ color: isActive(href) ? "var(--accent)" : "var(--text)" }}
            >
              {label}
            </Link>
          ))}

          <div
            className="border-t pt-4 flex flex-col gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            {username ? (
              <>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium self-start"
                  style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "1px solid #c7d2fe" }}
                >
                  {username}
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive("/login") ? "var(--accent)" : "var(--text)" }}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 rounded-full font-medium text-center transition-all hover:opacity-90"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
