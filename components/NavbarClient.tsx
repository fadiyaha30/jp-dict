"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function NavbarClient({ username }: { username: string | null }) {
  const pathname = usePathname();

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className="text-sm transition-colors"
      style={{ color: pathname === href ? "var(--accent)" : "var(--muted)" }}
    >
      {label}
    </Link>
  );

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

        <nav className="flex items-center gap-6">
          {link("/favorites", "Favorites")}
          {link("/history", "History")}
          {link("/notes", "Notes")}

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
              {link("/login", "Sign in")}
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
      </div>
    </header>
  );
}
