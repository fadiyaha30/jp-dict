"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm transition-colors"
      style={{ color: "var(--muted)" }}
    >
      Sign out
    </button>
  );
}
