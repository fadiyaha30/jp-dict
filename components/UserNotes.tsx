"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { DbPersonalNote } from "@/lib/db";

interface NoteForm {
  phrase: string;
  meaning: string;
  context: string;
}

const inputStyle: React.CSSProperties = {
  background: "var(--subtle)",
  border: "1px solid var(--border)",
  borderRadius: "0.625rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "var(--text)",
  outline: "none",
  width: "100%",
  fontFamily: "var(--font-noto-sans-jp), sans-serif",
};

export default function UserNotes({
  wordId,
  wordKanji,
  wordMeaning,
}: {
  wordId: string;
  wordKanji: string;
  wordMeaning: string;
}) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  const [notes, setNotes] = useState<DbPersonalNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NoteForm>({ phrase: "", meaning: wordMeaning, context: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NoteForm>({ phrase: "", meaning: "", context: "" });

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/personal-notes?wordId=${encodeURIComponent(wordId)}`)
      .then((r) => r.json())
      .then(setNotes);
  }, [wordId, isLoggedIn]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phrase.trim()) return;
    setSaving(true);
    const res = await fetch("/api/personal-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, word_id: wordId, word_kanji: wordKanji }),
    });
    const { id } = await res.json();
    const now = Date.now();
    setNotes((prev) => [
      {
        id,
        phrase: form.phrase.trim(),
        meaning: form.meaning.trim(),
        context: form.context.trim(),
        word_id: wordId,
        word_kanji: wordKanji,
        created_at: now,
        updated_at: now,
      },
      ...prev,
    ]);
    setForm({ phrase: "", meaning: wordMeaning, context: "" });
    setShowAdd(false);
    setSaving(false);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.phrase.trim() || editId === null) return;
    setSaving(true);
    await fetch(`/api/personal-notes/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editId
          ? { ...n, phrase: editForm.phrase.trim(), meaning: editForm.meaning.trim(), context: editForm.context.trim(), updated_at: Date.now() }
          : n
      )
    );
    setEditId(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/personal-notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setConfirmDeleteId(null);
  }

  if (status === "loading") return null;

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>
        <Link href="/login" style={{ color: "var(--accent)" }} className="hover:underline">
          Sign in
        </Link>{" "}
        to add personal notes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Notes list */}
      {notes.length === 0 && !showAdd && (
        <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
          No notes for this word yet.
        </p>
      )}

      {notes.map((note) =>
        editId === note.id ? (
          <form
            key={note.id}
            onSubmit={handleEdit}
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid #c7d2fe" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>Edit Note</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Phrase / Sentence <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  rows={2}
                  value={editForm.phrase}
                  onChange={(e) => setEditForm({ ...editForm, phrase: e.target.value })}
                  className="jp-text resize-none"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Meaning / Translation</label>
                <input
                  type="text"
                  value={editForm.meaning}
                  onChange={(e) => setEditForm({ ...editForm, meaning: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Context <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={editForm.context}
                  onChange={(e) => setEditForm({ ...editForm, context: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !editForm.phrase.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div
            key={note.id}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="jp-text text-base font-medium leading-relaxed" style={{ color: "var(--text)" }}>
              {note.phrase}
            </p>
            {note.meaning && (
              <p className="text-sm" style={{ color: "var(--text)" }}>{note.meaning}</p>
            )}
            {note.context && (
              <p className="text-xs italic" style={{ color: "var(--muted)" }}>📍 {note.context}</p>
            )}
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => { setEditId(note.id); setEditForm({ phrase: note.phrase, meaning: note.meaning, context: note.context }); setShowAdd(false); }}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}
              >
                Edit
              </button>
              {confirmDeleteId === note.id ? (
                <>
                  <span className="text-xs self-center" style={{ color: "var(--muted)" }}>Delete?</span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: "var(--subtle)", color: "var(--muted)" }}
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(note.id)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "var(--subtle)", color: "var(--muted)" }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "var(--surface)", border: "1px solid #c7d2fe" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>New Note</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Phrase / Sentence <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                rows={2}
                value={form.phrase}
                onChange={(e) => setForm({ ...form, phrase: e.target.value })}
                placeholder={`Your sentence using ${wordKanji}…`}
                className="jp-text resize-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Meaning / Translation</label>
              <input
                type="text"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                placeholder="Translation or memory tip"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Context <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder="Where did you hear it?"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowAdd(false); setForm({ phrase: "", meaning: wordMeaning, context: "" }); }}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: "var(--subtle)", color: "var(--muted)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.phrase.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--accent)", color: "white" }}
          >
            + Add note
          </button>
        )}
        <Link
          href="/notes"
          className="text-xs ml-auto transition-colors hover:underline"
          style={{ color: "var(--muted)" }}
        >
          View all personal notes →
        </Link>
      </div>
    </div>
  );
}
