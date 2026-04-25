"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UserExample {
  id: number;
  text: string;
  translation: string;
  created_at: number;
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.625rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "var(--text)",
  outline: "none",
  width: "100%",
  fontFamily: "var(--font-noto-sans-jp), sans-serif",
  transition: "border-color 0.15s",
};

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
      <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>
        <Link href="/login" style={{ color: "var(--accent)" }} className="hover:underline">
          Sign in
        </Link>{" "}
        to add personal notes and examples.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Note */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Personal Note
        </p>
        <textarea
          placeholder="Memory tricks, usage tips, context…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <div className="flex justify-end">
          <button
            disabled={note === savedNote || savingNote}
            onClick={handleSaveNote}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {savingNote ? "Saving…" : "Save note"}
          </button>
        </div>
      </div>

      {/* Examples */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          My Examples
        </p>

        {examples.length === 0 && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No examples yet.</p>
        )}

        {examples.map((ex) => (
          <div
            key={ex.id}
            className="pl-4 py-1 group flex justify-between items-start gap-2"
            style={{ borderLeft: "2px solid var(--border)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="jp-text font-medium text-sm" style={{ color: "var(--text)" }}>{ex.text}</p>
              {ex.translation && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{ex.translation}</p>
              )}
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-xs px-2 py-1 rounded"
              style={{ background: "#fee2e2", color: "#dc2626", border: "none" }}
              onClick={() => handleDeleteExample(ex.id)}
              aria-label="Delete"
            >
              ×
            </button>
          </div>
        ))}

        <form onSubmit={handleAddExample} className="flex flex-col gap-2 pt-1">
          <input
            placeholder="Your example sentence"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={inputStyle}
            className="jp-text"
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <input
            placeholder="Translation (optional)"
            value={newTranslation}
            onChange={(e) => setNewTranslation(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newText.trim() || addingExample}
              className="px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {addingExample ? "Adding…" : "Add example"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
