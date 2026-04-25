"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

interface NavbarClientProps {
  username: string | null;
}

export default function NavbarClient({ username }: NavbarClientProps) {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        pathname === href
          ? "text-[#1D9E75] font-medium"
          : "text-white/50 hover:text-white/90"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(9,15,11,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(29,158,117,0.12)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span
            className="jp-text text-2xl font-bold"
            style={{ color: "#1D9E75", textShadow: "0 0 20px rgba(29,158,117,0.5)" }}
          >
            辞
          </span>
          <span className="font-semibold text-white/90 tracking-tight">JDict</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLink("/favorites", "Favorites")}
          {navLink("/history", "History")}

          {username ? (
            <div className="flex items-center gap-3">
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: "rgba(29,158,117,0.15)",
                  border: "1px solid rgba(29,158,117,0.3)",
                  color: "#1D9E75",
                }}
              >
                {username}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {navLink("/login", "Sign in")}
              <Link
                href="/register"
                className="text-sm px-3 py-1 rounded-full font-medium transition-all"
                style={{
                  background: "rgba(29,158,117,0.15)",
                  border: "1px solid rgba(29,158,117,0.3)",
                  color: "#1D9E75",
                }}
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
