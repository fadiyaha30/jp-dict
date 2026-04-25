"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Stack,
  Text,
  Textarea,
  TextInput,
  Button,
  Group,
  Paper,
  ActionIcon,
  Divider,
  Anchor,
} from "@mantine/core";

interface UserExample {
  id: number;
  text: string;
  translation: string;
  created_at: number;
}

interface UserNotesProps {
  wordId: string;
}

export default function UserNotes({ wordId }: UserNotesProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [examples, setExamples] = useState<UserExample[]>([]);
  const [newText, setNewText] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [addingExample, setAddingExample] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/notes/${wordId}`)
      .then((r) => r.json())
      .then((data) => {
        setNote(data.note ?? "");
        setSavedNote(data.note ?? "");
        setExamples(data.examples ?? []);
      });
  }, [wordId, isLoggedIn]);

  async function handleSaveNote() {
    setSavingNote(true);
    await fetch(`/api/notes/${wordId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setSavedNote(note);
    setSavingNote(false);
  }

  async function handleAddExample(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setAddingExample(true);
    const res = await fetch(`/api/notes/${wordId}/examples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText, translation: newTranslation }),
    });
    const data = await res.json();
    setExamples((prev) => [
      ...prev,
      { id: data.id, text: newText, translation: newTranslation, created_at: Date.now() },
    ]);
    setNewText("");
    setNewTranslation("");
    setAddingExample(false);
  }

  async function handleDeleteExample(id: number) {
    await fetch(`/api/notes/${wordId}/examples/${id}`, { method: "DELETE" });
    setExamples((prev) => prev.filter((e) => e.id !== id));
  }

  if (status === "loading") return null;

  if (!isLoggedIn) {
    return (
      <Stack gap="md">
        <Divider />
        <Text size="sm" c="dimmed" ta="center">
          <Anchor component={Link} href="/login" c="green">Sign in</Anchor>{" "}
          to add personal notes and examples for this word.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Divider />

      <Text fw={600} size="sm" tt="uppercase" c="dimmed">
        My Notes
      </Text>

      {/* Note */}
      <Stack gap="xs">
        <Textarea
          placeholder="Add a personal note about this word — memory tricks, usage tips, context…"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          minRows={3}
          autosize
          radius="md"
        />
        <Group justify="flex-end">
          <Button
            size="xs"
            color="green"
            radius="xl"
            loading={savingNote}
            disabled={note === savedNote}
            onClick={handleSaveNote}
          >
            Save note
          </Button>
        </Group>
      </Stack>

      {/* My examples */}
      <Stack gap="sm">
        <Text size="sm" fw={500}>My Examples</Text>

        {examples.length === 0 && (
          <Text size="sm" c="dimmed">No examples yet. Add one below.</Text>
        )}

        {examples.map((ex) => (
          <Paper key={ex.id} withBorder p="sm" radius="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} className="jp-text">{ex.text}</Text>
                {ex.translation && (
                  <Text size="sm" c="dimmed">{ex.translation}</Text>
                )}
              </Stack>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => handleDeleteExample(ex.id)}
                aria-label="Delete example"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </ActionIcon>
            </Group>
          </Paper>
        ))}

        {/* Add example form */}
        <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
          <form onSubmit={handleAddExample}>
            <Stack gap="sm">
              <TextInput
                placeholder="Your example sentence (Japanese)"
                value={newText}
                onChange={(e) => setNewText(e.currentTarget.value)}
                radius="md"
                classNames={{ input: "jp-text" }}
              />
              <TextInput
                placeholder="Translation (optional)"
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.currentTarget.value)}
                radius="md"
              />
              <Group justify="flex-end">
                <Button
                  type="submit"
                  size="xs"
                  color="green"
                  radius="xl"
                  loading={addingExample}
                  disabled={!newText.trim()}
                >
                  Add example
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Stack>
  );
}
