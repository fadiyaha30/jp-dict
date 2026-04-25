"use client";

import Link from "next/link";
import { Group, Text, Badge } from "@mantine/core";
import LogoutButton from "./LogoutButton";

interface NavbarClientProps {
  username: string | null;
}

export default function NavbarClient({ username }: NavbarClientProps) {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Group justify="space-between" align="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Group gap="xs" align="center">
              <Text
                size="xl"
                fw={700}
                style={{ color: "#1D9E75", letterSpacing: "-0.02em" }}
              >
                辞
              </Text>
              <Text fw={600} size="lg" c="dark">
                JDict
              </Text>
            </Group>
          </Link>

          <Group gap="lg" align="center">
            <Link href="/favorites" style={{ textDecoration: "none" }}>
              <Text size="sm" c="dimmed" className="hover:text-[#1D9E75] transition-colors">
                Favorites
              </Text>
            </Link>
            <Link href="/history" style={{ textDecoration: "none" }}>
              <Text size="sm" c="dimmed" className="hover:text-[#1D9E75] transition-colors">
                History
              </Text>
            </Link>

            {username ? (
              <Group gap="sm" align="center">
                <Badge color="green" variant="light" size="sm">
                  {username}
                </Badge>
                <LogoutButton />
              </Group>
            ) : (
              <Group gap="sm">
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Text size="sm" c="dimmed" className="hover:text-[#1D9E75] transition-colors">
                    Sign in
                  </Text>
                </Link>
                <Link href="/register" style={{ textDecoration: "none" }}>
                  <Text size="sm" fw={500} style={{ color: "#1D9E75" }}>
                    Register
                  </Text>
                </Link>
              </Group>
            )}
          </Group>
        </Group>
      </div>
    </header>
  );
}
