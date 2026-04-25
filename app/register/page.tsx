"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  List,
} from "@mantine/core";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      // Auto sign-in after registration
      await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-16">
        <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={420}>
          <Stack gap="lg">
            <Stack gap={4}>
              <Text size="xl" fw={700}>
                Create an account
              </Text>
              <Text size="sm" c="dimmed">
                Join JDict to save your history across devices
              </Text>
            </Stack>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
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
                  description="3–20 characters, letters/numbers/underscores"
                />
                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  autoComplete="new-password"
                  description="At least 8 characters"
                />
                <PasswordInput
                  label="Confirm password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.currentTarget.value)}
                  required
                  autoComplete="new-password"
                  error={confirm && password !== confirm ? "Passwords do not match" : undefined}
                />
                <Button
                  type="submit"
                  color="green"
                  radius="xl"
                  loading={isPending}
                  fullWidth
                  mt="xs"
                >
                  Create account
                </Button>
              </Stack>
            </form>

            <Divider />

            <Text size="sm" ta="center" c="dimmed">
              Already have an account?{" "}
              <Anchor component={Link} href="/login" c="green">
                Sign in
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </main>
    </div>
  );
}
