"use client";

import { signOut } from "next-auth/react";
import { Button } from "@mantine/core";

export default function LogoutButton() {
  return (
    <Button
      variant="subtle"
      color="gray"
      size="xs"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
