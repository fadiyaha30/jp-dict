"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/lib/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme} forceColorScheme="dark">
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}
