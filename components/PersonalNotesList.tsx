"use client";

import { useState } from "react";
import Link from "next/link";
import type { DbPersonalNote } from "@/lib/db";

interface Props {
  initial: DbPersonalNote[];
}

interface NoteForm {
  phrase: string;
  meaning: string;
  context: string;
}

const emptyForm = (): NoteForm => ({ phrase: "", meaning: "", context: "" });

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PersonalNotesList({ initial }: Props) {
  const [notes, setNotes] = useState<DbPersonalNote[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<NoteForm>(emptyForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NoteForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? notes.filter(
        (n) =>
          n.phrase.includes(search) ||
          n.meaning.toLowerCase().includes(search.toLowerCase()) ||
          n.context.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  async function handleAdd() {
    if (!addForm.phrase.trim()) return;
    setSaving(true);
    const res = await fetch("/api/personal-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    const { id } = await res.json();
    const now = Date.now();
    setNotes([{ id, ...addForm, phrase: addForm.phrase.trim(), meaning: addForm.meaning.trim(), context: addForm.context.trim(), word_id: null, word_kanji: null, created_at: now, updated_at: now }, ...notes]);
    setAddForm(emptyForm());
    setShowAdd(false);
    setSaving(false);
  }

  function startEdit(note: DbPersonalNote) {
    setEditId(note.id);
    setEditForm({ phrase: note.phrase, meaning: note.meaning, context: note.context });
  }

  async function handleEdit() {
    if (!editForm.phrase.trim() || editId === null) return;
    setSaving(true);
    await fetch(`/api/personal-notes/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setNotes(notes.map((n) =>
      n.id === editId
        ? { ...n, phrase: editForm.phrase.trim(), meaning: editForm.meaning.trim(), context: editForm.context.trim(), updated_at: Date.now() }
        : n
    ));
    setEditId(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/personal-notes/${id}`, { method: "DELETE" });
    setNotes(notes.filter((n) => n.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none jp-text"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <button
          onClick={() => { setShowAdd(true); setEditId(null); }}
          className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "var(--accent)", color: "white" }}
        >
          + New Note
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <NoteFormCard
          form={addForm}
          onChange={setAddForm}
          onSave={handleAdd}
          onCancel={() => { setShowAdd(false); setAddForm(emptyForm()); }}
          saving={saving}
          title="New Note"
        />
      )}

      {/* Empty state */}
      {filtered.length === 0 && !showAdd && (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-3xl">📝</p>
          <p className="font-semibold" style={{ color: "var(--text)" }}>
            {search ? "No matching notes" : "No notes yet"}
          </p>
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            {search ? "Try a different search term." : "Jot down phrases you hear and want to remember."}
          </p>
        </div>
      )}

      {/* Notes list */}
      <div className="flex flex-col gap-3">
        {filtered.map((note) =>
          editId === note.id ? (
            <NoteFormCard
              key={note.id}
              form={editForm}
              onChange={setEditForm}
              onSave={handleEdit}
              onCancel={() => setEditId(null)}
              saving={saving}
              title="Edit Note"
            />
          ) : (
            <NoteCard key={note.id} note={note} onEdit={startEdit} onDelete={handleDelete} />
          )
        )}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: DbPersonalNote;
  onEdit: (n: DbPersonalNote) => void;
  onDelete: (id: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p className="jp-text text-xl leading-relaxed font-medium" style={{ color: "var(--text)" }}>
        {note.phrase}
      </p>
      {note.meaning && (
        <p className="text-sm" style={{ color: "var(--text)" }}>{note.meaning}</p>
      )}
      {note.context && (
        <p className="text-xs italic" style={{ color: "var(--muted)" }}>📍 {note.context}</p>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {formatDate(note.updated_at)}
          </span>
          {note.word_id && note.word_kanji && (
            <Link
              href={`/word/${note.word_id}`}
              className="jp-text text-xs px-2 py-0.5 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "var(--subtle)", color: "var(--accent)" }}
            >
              {note.word_kanji}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-xs" style={{ color: "var(--muted)" }}>Delete?</span>
              <button
                onClick={() => onDelete(note.id)}
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(note)}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteFormCard({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  title,
}: {
  form: NoteForm;
  onChange: (f: NoteForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  title: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "var(--surface)", border: "1px solid #c7d2fe" }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{title}</p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            Phrase / Sentence <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            rows={2}
            value={form.phrase}
            onChange={(e) => onChange({ ...form, phrase: e.target.value })}
            placeholder="e.g. お疲れ様でした"
            className="jp-text rounded-xl px-4 py-2.5 text-base resize-none outline-none"
            style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Meaning / Translation</label>
          <input
            type="text"
            value={form.meaning}
            onChange={(e) => onChange({ ...form, meaning: e.target.value })}
            placeholder="e.g. Good work today / Thank you for your hard work"
            className="rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            Context <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional — where did you hear it?)</span>
          </label>
          <input
            type="text"
            value={form.context}
            onChange={(e) => onChange({ ...form, context: e.target.value })}
            placeholder="e.g. Overheard at the office, from anime, etc."
            className="rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm"
          style={{ background: "var(--subtle)", color: "var(--muted)" }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !form.phrase.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
