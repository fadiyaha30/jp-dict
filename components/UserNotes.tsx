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

const glassInput = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(29,158,117,0.15)",
  color: "rgba(255,255,255,0.85)",
  borderRadius: "0.75rem",
  outline: "none",
  width: "100%",
  fontFamily: "var(--font-noto-sans-jp), sans-serif",
  fontSize: "0.875rem",
  padding: "0.625rem 0.875rem",
  transition: "border-color 0.2s",
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
      <p className="text-sm text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
        <Link href="/login" style={{ color: "#1D9E75" }} className="hover:underline">
          Sign in
        </Link>{" "}
        to add personal notes and examples for this word.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Note */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Personal Note
        </p>
        <textarea
          placeholder="Memory tricks, usage tips, context…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ ...glassInput, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.45)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.15)")}
        />
        <div className="flex justify-end">
          <button
            disabled={note === savedNote || savingNote}
            onClick={handleSaveNote}
            className="px-4 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
            style={{
              background: "rgba(29,158,117,0.15)",
              border: "1px solid rgba(29,158,117,0.3)",
              color: "#1D9E75",
            }}
          >
            {savingNote ? "Saving…" : "Save note"}
          </button>
        </div>
      </div>

      {/* My examples */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          My Examples
        </p>

        {examples.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No examples yet.</p>
        )}

        {examples.map((ex) => (
          <div
            key={ex.id}
            className="pl-4 py-1 group flex justify-between items-start gap-2 transition-all"
            style={{ borderLeft: "2px solid rgba(29,158,117,0.25)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="jp-text font-medium text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>
                {ex.text}
              </p>
              {ex.translation && (
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {ex.translation}
                </p>
              )}
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}
              onClick={() => handleDeleteExample(ex.id)}
              aria-label="Delete"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add form */}
        <form onSubmit={handleAddExample} className="flex flex-col gap-2 pt-1">
          <input
            placeholder="Your example sentence"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={glassInput}
            className="jp-text"
            onFocus={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.45)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.15)")}
          />
          <input
            placeholder="Translation (optional)"
            value={newTranslation}
            onChange={(e) => setNewTranslation(e.target.value)}
            style={glassInput}
            onFocus={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.45)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(29,158,117,0.15)")}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newText.trim() || addingExample}
              className="px-4 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
              style={{
                background: "rgba(29,158,117,0.15)",
                border: "1px solid rgba(29,158,117,0.3)",
                color: "#1D9E75",
              }}
            >
              {addingExample ? "Adding…" : "Add example"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
