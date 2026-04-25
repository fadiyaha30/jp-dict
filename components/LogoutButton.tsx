"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-white/40 hover:text-white/80 transition-colors"
    >
      Sign out
    </button>
  );
}
