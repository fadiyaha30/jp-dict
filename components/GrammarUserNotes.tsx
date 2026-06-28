"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { DbPersonalNote } from "@/lib/db";

interface NoteForm {
  phrase: string;
  meaning: string;
  context: string;
  additional_notes: string;
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

export default function GrammarUserNotes({
  grammarId,
  grammarPattern,
}: {
  grammarId: string;
  grammarPattern: string;
}) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  const [notes, setNotes] = useState<DbPersonalNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NoteForm>({ phrase: "", meaning: "", context: "", additional_notes: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NoteForm>({ phrase: "", meaning: "", context: "", additional_notes: "" });

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/personal-notes?grammarId=${encodeURIComponent(grammarId)}`)
      .then((r) => r.json())
      .then(setNotes);
  }, [grammarId, isLoggedIn]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phrase.trim()) return;
    setSaving(true);
    const res = await fetch("/api/personal-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, grammar_id: grammarId, grammar_pattern: grammarPattern }),
    });
    const { id } = await res.json();
    const now = Date.now();
    setNotes((prev) => [
      {
        id,
        phrase: form.phrase.trim(),
        meaning: form.meaning.trim(),
        context: form.context.trim(),
        additional_notes: form.additional_notes.trim(),
        word_id: null,
        word_kanji: null,
        grammar_id: grammarId,
        grammar_pattern: grammarPattern,
        created_at: now,
        updated_at: now,
      },
      ...prev,
    ]);
    setForm({ phrase: "", meaning: "", context: "", additional_notes: "" });
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
          ? { ...n, phrase: editForm.phrase.trim(), meaning: editForm.meaning.trim(), context: editForm.context.trim(), additional_notes: editForm.additional_notes.trim(), updated_at: Date.now() }
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
          ログイン
        </Link>{" "}
        してメモを追加できます。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {notes.length === 0 && !showAdd && (
        <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
          まだメモがありません。
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
            <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>メモを編集</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                  フレーズ・文 <span style={{ color: "#ef4444" }}>*</span>
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
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>意味・訳</label>
                <input type="text" value={editForm.meaning}
                  onChange={(e) => setEditForm({ ...editForm, meaning: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                  状況 <span style={{ color: "var(--muted)", fontWeight: 400 }}>（任意）</span>
                </label>
                <input type="text" value={editForm.context}
                  onChange={(e) => setEditForm({ ...editForm, context: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                  追記 <span style={{ color: "var(--muted)", fontWeight: 400 }}>（任意）</span>
                </label>
                <textarea
                  rows={2}
                  value={editForm.additional_notes}
                  onChange={(e) => setEditForm({ ...editForm, additional_notes: e.target.value })}
                  placeholder="補足・覚え方・使い方…"
                  className="resize-none"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditId(null)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}>キャンセル</button>
              <button type="submit" disabled={saving || !editForm.phrase.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: "var(--accent)", color: "white" }}>
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </form>
        ) : (
          <div key={note.id} className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="jp-text text-base font-medium leading-relaxed" style={{ color: "var(--text)" }}>
              {note.phrase}
            </p>
            {note.meaning && <p className="text-sm" style={{ color: "var(--text)" }}>{note.meaning}</p>}
            {note.context && <p className="text-xs italic" style={{ color: "var(--muted)" }}>📍 {note.context}</p>}
            {note.additional_notes && (
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{note.additional_notes}</p>
            )}
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => { setEditId(note.id); setEditForm({ phrase: note.phrase, meaning: note.meaning, context: note.context, additional_notes: note.additional_notes }); setShowAdd(false); }}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: "var(--subtle)", color: "var(--muted)" }}>編集</button>
              {confirmDeleteId === note.id ? (
                <>
                  <span className="text-xs self-center" style={{ color: "var(--muted)" }}>削除しますか？</span>
                  <button onClick={() => handleDelete(note.id)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>はい</button>
                  <button onClick={() => setConfirmDeleteId(null)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: "var(--subtle)", color: "var(--muted)" }}>いいえ</button>
                </>
              ) : (
                <button onClick={() => setConfirmDeleteId(note.id)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "var(--subtle)", color: "var(--muted)" }}>削除</button>
              )}
            </div>
          </div>
        )
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "var(--surface)", border: "1px solid #c7d2fe" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>新しいメモ</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                フレーズ・文 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea rows={2} value={form.phrase}
                onChange={(e) => setForm({ ...form, phrase: e.target.value })}
                placeholder={`${grammarPattern}を使った文…`}
                className="jp-text resize-none" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>意味・訳</label>
              <input type="text" value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                placeholder="訳または覚え方"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                状況 <span style={{ color: "var(--muted)", fontWeight: 400 }}>（任意）</span>
              </label>
              <input type="text" value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder="どこで出会いましたか？"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                追記 <span style={{ color: "var(--muted)", fontWeight: 400 }}>（任意）</span>
              </label>
              <textarea
                rows={2}
                value={form.additional_notes}
                onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                placeholder="補足・覚え方・使い方…"
                className="resize-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-mid)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowAdd(false); setForm({ phrase: "", meaning: "", context: "", additional_notes: "" }); }}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: "var(--subtle)", color: "var(--muted)" }}>キャンセル</button>
            <button type="submit" disabled={saving || !form.phrase.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--accent)", color: "white" }}>
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between">
        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--accent)", color: "white" }}>
            ＋ メモを追加
          </button>
        )}
        <Link href="/notes" className="text-xs ml-auto transition-colors hover:underline"
          style={{ color: "var(--muted)" }}>
          すべてのメモを見る →
        </Link>
      </div>
    </div>
  );
}
