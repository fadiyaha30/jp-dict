"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Textarea, TextInput, Button, Group, ActionIcon, Text, Anchor } from "@mantine/core";

interface UserExample {
  id: number;
  text: string;
  translation: string;
  created_at: number;
}

export default function UserNotes({ wordId }: { wordId: string }) {
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
      <Text size="sm" c="dimmed" ta="center" py="xl">
        <Anchor component={Link} href="/login" c="green">Sign in</Anchor>{" "}
        to add personal notes and examples for this word.
      </Text>
    );
  }

  return (
    <div className="space-y-6">
      {/* Note */}
      <div className="space-y-2">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" className="tracking-widest">
          Personal Note
        </Text>
        <Textarea
          placeholder="Memory tricks, usage tips, context…"
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
            variant="light"
            radius="xl"
            loading={savingNote}
            disabled={note === savedNote}
            onClick={handleSaveNote}
          >
            Save note
          </Button>
        </Group>
      </div>

      {/* My examples */}
      <div className="space-y-3">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" className="tracking-widest">
          My Examples
        </Text>

        {examples.length === 0 && (
          <Text size="sm" c="dimmed">No examples yet.</Text>
        )}

        {examples.map((ex) => (
          <div
            key={ex.id}
            className="pl-4 border-l-2 group flex justify-between items-start gap-2"
            style={{ borderColor: "#1D9E7555" }}
          >
            <div className="flex-1 min-w-0">
              <p className="jp-text text-gray-900 font-medium text-sm">{ex.text}</p>
              {ex.translation && (
                <p className="text-xs text-gray-500 mt-0.5">{ex.translation}</p>
              )}
            </div>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={() => handleDeleteExample(ex.id)}
              aria-label="Delete"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </ActionIcon>
          </div>
        ))}

        {/* Add form */}
        <form onSubmit={handleAddExample} className="space-y-2 pt-1">
          <TextInput
            placeholder="Your example sentence"
            value={newText}
            onChange={(e) => setNewText(e.currentTarget.value)}
            radius="md"
            size="sm"
            classNames={{ input: "jp-text" }}
          />
          <TextInput
            placeholder="Translation (optional)"
            value={newTranslation}
            onChange={(e) => setNewTranslation(e.currentTarget.value)}
            radius="md"
            size="sm"
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
        </form>
      </div>
    </div>
  );
}
