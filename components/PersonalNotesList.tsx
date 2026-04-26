"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { DbPersonalNote } from "@/lib/db";

interface Props {
  initial: DbPersonalNote[];
  initialTab: string;
}

interface NoteForm {
  phrase: string;
  meaning: string;
  context: string;
  additional_notes: string;
}

const emptyForm = (): NoteForm => ({ phrase: "", meaning: "", context: "", additional_notes: "" });

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type Tab = "all" | "words" | "grammar";

export default function PersonalNotesList({ initial, initialTab }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<DbPersonalNote[]>(initial);
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || "all");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<NoteForm>(emptyForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NoteForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  function switchTab(t: Tab) {
    setTab(t);
    const params = new URLSearchParams(searchParams.toString());
    if (t === "all") params.delete("tab");
    else params.set("tab", t);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const byTab = notes.filter((n) => {
    if (tab === "words") return !!n.word_id;
    if (tab === "grammar") return !!n.grammar_id;
    return true;
  });

  const filtered = search.trim()
    ? byTab.filter(
        (n) =>
          n.phrase.includes(search) ||
          n.meaning.toLowerCase().includes(search.toLowerCase()) ||
          n.context.toLowerCase().includes(search.toLowerCase()) ||
          (n.word_kanji ?? "").includes(search) ||
          (n.grammar_pattern ?? "").includes(search)
      )
    : byTab;

  const wordCount = notes.filter((n) => !!n.word_id).length;
  const grammarCount = notes.filter((n) => !!n.grammar_id).length;

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
    setNotes([
      {
        id,
        phrase: addForm.phrase.trim(),
        meaning: addForm.meaning.trim(),
        context: addForm.context.trim(),
        additional_notes: addForm.additional_notes.trim(),
        word_id: null,
        word_kanji: null,
        grammar_id: null,
        grammar_pattern: null,
        created_at: now,
        updated_at: now,
      },
      ...notes,
    ]);
    setAddForm(emptyForm());
    setShowAdd(false);
    setSaving(false);
  }

  function startEdit(note: DbPersonalNote) {
    setEditId(note.id);
    setEditForm({ phrase: note.phrase, meaning: note.meaning, context: note.context, additional_notes: note.additional_notes });
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
        ? { ...n, phrase: editForm.phrase.trim(), meaning: editForm.meaning.trim(), context: editForm.context.trim(), additional_notes: editForm.additional_notes.trim(), updated_at: Date.now() }
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
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          ["all", "All", notes.length],
          ["words", "Words", wordCount],
          ["grammar", "Grammar", grammarCount],
        ] as [Tab, string, number][]).map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              background: tab === t ? "var(--accent)" + "18" : "var(--surface)",
              border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
              color: tab === t ? "var(--accent)" : "var(--muted)",
            }}
          >
            {label}
            <span className="ml-1.5 text-[10px]" style={{ opacity: 0.7 }}>{count}</span>
          </button>
        ))}
      </div>

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
            {search
              ? "Try a different search term."
              : tab === "grammar"
              ? "Open a grammar point and add a note there."
              : tab === "words"
              ? "Open a word and add a note there."
              : "Jot down phrases you hear and want to remember."}
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
      {note.additional_notes && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{note.additional_notes}</p>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 flex-wrap">
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
          {note.grammar_id && note.grammar_pattern && (
            <Link
              href={`/grammar/${note.grammar_id}`}
              className="jp-text text-xs px-2 py-0.5 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "#d97706" + "18", color: "#d97706" }}
            >
              {note.grammar_pattern}
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
            placeholder="e.g. Good work today"
            className="rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
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
            onChange={(e) => onChange({ ...form, context: e.target.value })}
            placeholder="e.g. Overheard at the office, from anime, etc."
            className="rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            Additional Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            rows={2}
            value={form.additional_notes}
            onChange={(e) => onChange({ ...form, additional_notes: e.target.value })}
            placeholder="Extra notes, mnemonics, usage tips…"
            className="rounded-xl px-4 py-2.5 text-sm resize-none outline-none"
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
