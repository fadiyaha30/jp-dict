"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getFavorites } from "@/lib/favorites";
import { getHistory } from "@/lib/history";
import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Alert,
  Paper,
  Anchor,
  Divider,
} from "@mantine/core";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid username or password.");
      } else {
        // Migrate any localStorage data to the database
        const favorites = getFavorites();
        const history = getHistory();
        if (favorites.length > 0 || history.length > 0) {
          await fetch("/api/migrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites, history }),
          });
        }
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={420}>
        <Stack gap="lg">
          <Stack gap={4}>
            <Text size="xl" fw={700}>Welcome back</Text>
            <Text size="sm" c="dimmed">Sign in to your JDict account</Text>
          </Stack>

          {error && (
            <Alert color="red" variant="light">{error}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
                autoFocus
                autoComplete="username"
              />
              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                autoComplete="current-password"
              />
              <Button type="submit" color="green" radius="xl" loading={isPending} fullWidth mt="xs">
                Sign in
              </Button>
            </Stack>
          </form>

          <Divider />

          <Text size="sm" ta="center" c="dimmed">
            Don't have an account?{" "}
            <Anchor component={Link} href="/register" c="green">
              Create one
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </main>
  );
}
