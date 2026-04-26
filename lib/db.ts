import "server-only";
import Database from "better-sqlite3";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import type { FavoriteItem } from "./favorites";
import type { HistoryItem } from "./history";

const DATA_DIR = path.join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "faya_dict.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id  TEXT    NOT NULL,
    kanji    TEXT    NOT NULL,
    reading  TEXT    NOT NULL,
    romaji   TEXT    NOT NULL,
    meaning  TEXT    NOT NULL,
    pos      TEXT    NOT NULL,
    jlpt     TEXT,
    saved_at INTEGER NOT NULL,
    UNIQUE(user_id, word_id)
  );

  CREATE TABLE IF NOT EXISTS history (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type      TEXT    NOT NULL,
    data      TEXT    NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id    TEXT    NOT NULL,
    note       TEXT    NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, word_id)
  );

  CREATE TABLE IF NOT EXISTS user_examples (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id     TEXT    NOT NULL,
    text        TEXT    NOT NULL,
    translation TEXT    NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS personal_notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phrase     TEXT    NOT NULL,
    meaning    TEXT    NOT NULL DEFAULT '',
    context    TEXT    NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grammar_favorites (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grammar_id TEXT    NOT NULL,
    pattern    TEXT    NOT NULL,
    meaning    TEXT    NOT NULL DEFAULT '',
    jlpt       TEXT    NOT NULL DEFAULT '',
    saved_at   INTEGER NOT NULL,
    UNIQUE(user_id, grammar_id)
  );
`);

// Migrations
try { db.exec("ALTER TABLE personal_notes ADD COLUMN word_id TEXT") } catch {}
try { db.exec("ALTER TABLE personal_notes ADD COLUMN word_kanji TEXT") } catch {}
try { db.exec("ALTER TABLE personal_notes ADD COLUMN grammar_id TEXT") } catch {}
try { db.exec("ALTER TABLE personal_notes ADD COLUMN grammar_pattern TEXT") } catch {}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export function getUserByUsername(username: string): DbUser | undefined {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as DbUser | undefined;
}

export function createUser(username: string, passwordHash: string): number {
  const result = db
    .prepare("INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)")
    .run(username, passwordHash, Date.now());
  return result.lastInsertRowid as number;
}

export function usernameExists(username: string): boolean {
  return !!db.prepare("SELECT 1 FROM users WHERE username = ? COLLATE NOCASE").get(username);
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export function getFavoritesByUserId(userId: number): FavoriteItem[] {
  const rows = db
    .prepare("SELECT * FROM favorites WHERE user_id = ? ORDER BY saved_at DESC")
    .all(userId) as any[];
  return rows.map((r) => ({
    id: r.word_id,
    kanji: r.kanji,
    reading: r.reading,
    romaji: r.romaji,
    meaning: r.meaning,
    partOfSpeech: JSON.parse(r.pos),
    jlpt: r.jlpt ?? null,
    savedAt: r.saved_at,
  }));
}

export function isFavoritedInDb(userId: number, wordId: string): boolean {
  return !!db
    .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND word_id = ?")
    .get(userId, wordId);
}

export function addFavoriteToDb(userId: number, item: Omit<FavoriteItem, "savedAt">) {
  db.prepare(`
    INSERT OR REPLACE INTO favorites
      (user_id, word_id, kanji, reading, romaji, meaning, pos, jlpt, saved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    item.id,
    item.kanji,
    item.reading,
    item.romaji,
    item.meaning,
    JSON.stringify(item.partOfSpeech),
    item.jlpt ?? null,
    Date.now()
  );
}

export function removeFavoriteFromDb(userId: number, wordId: string) {
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND word_id = ?").run(userId, wordId);
}

// ── History ───────────────────────────────────────────────────────────────────

const HISTORY_LIMIT = 50;

export function getHistoryByUserId(userId: number): HistoryItem[] {
  const rows = db
    .prepare("SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?")
    .all(userId, HISTORY_LIMIT) as any[];
  return rows.map((r) => JSON.parse(r.data) as HistoryItem);
}

export function addHistoryToDb(userId: number, item: HistoryItem) {
  // Deduplicate: remove existing same entry before inserting
  if (item.type === "search") {
    db.prepare(
      "DELETE FROM history WHERE user_id = ? AND type = 'search' AND json_extract(data,'$.query') = ? AND json_extract(data,'$.mode') = ?"
    ).run(userId, item.query, item.mode);
  } else {
    db.prepare(
      "DELETE FROM history WHERE user_id = ? AND type = 'word' AND json_extract(data,'$.id') = ?"
    ).run(userId, item.id);
  }

  db.prepare("INSERT INTO history (user_id, type, data, timestamp) VALUES (?, ?, ?, ?)").run(
    userId,
    item.type,
    JSON.stringify(item),
    item.timestamp
  );

  // Trim to limit
  db.prepare(`
    DELETE FROM history WHERE user_id = ? AND id NOT IN (
      SELECT id FROM history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    )
  `).run(userId, userId, HISTORY_LIMIT);
}

export function removeHistoryItemFromDb(userId: number, timestamp: number) {
  db.prepare(
    "DELETE FROM history WHERE user_id = ? AND json_extract(data,'$.timestamp') = ?"
  ).run(userId, timestamp);
}

export function clearHistoryFromDb(userId: number) {
  db.prepare("DELETE FROM history WHERE user_id = ?").run(userId);
}

// ── User Notes & Examples ─────────────────────────────────────────────────────

export interface DbUserNote {
  note: string;
  updated_at: number;
}

export interface DbUserExample {
  id: number;
  text: string;
  translation: string;
  created_at: number;
}

export function getUserNote(userId: number, wordId: string): DbUserNote | null {
  const row = db
    .prepare("SELECT note, updated_at FROM user_notes WHERE user_id = ? AND word_id = ?")
    .get(userId, wordId) as DbUserNote | undefined;
  return row ?? null;
}

export function saveUserNote(userId: number, wordId: string, note: string) {
  db.prepare(`
    INSERT INTO user_notes (user_id, word_id, note, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, word_id) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at
  `).run(userId, wordId, note, Date.now());
}

export function getUserExamples(userId: number, wordId: string): DbUserExample[] {
  return db
    .prepare("SELECT id, text, translation, created_at FROM user_examples WHERE user_id = ? AND word_id = ? ORDER BY created_at ASC")
    .all(userId, wordId) as DbUserExample[];
}

export function addUserExample(
  userId: number,
  wordId: string,
  text: string,
  translation: string
): number {
  const result = db
    .prepare("INSERT INTO user_examples (user_id, word_id, text, translation, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(userId, wordId, text, translation, Date.now());
  return result.lastInsertRowid as number;
}

export function deleteUserExample(userId: number, exampleId: number) {
  db.prepare("DELETE FROM user_examples WHERE id = ? AND user_id = ?").run(exampleId, userId);
}

// ── Personal Notes ────────────────────────────────────────────────────────────

export interface DbPersonalNote {
  id: number;
  phrase: string;
  meaning: string;
  context: string;
  word_id: string | null;
  word_kanji: string | null;
  grammar_id: string | null;
  grammar_pattern: string | null;
  created_at: number;
  updated_at: number;
}

const NOTE_COLS = "id, phrase, meaning, context, word_id, word_kanji, grammar_id, grammar_pattern, created_at, updated_at";

export function getPersonalNotes(userId: number): DbPersonalNote[] {
  return db
    .prepare(`SELECT ${NOTE_COLS} FROM personal_notes WHERE user_id = ? ORDER BY updated_at DESC`)
    .all(userId) as DbPersonalNote[];
}

export function getPersonalNotesByWord(userId: number, wordId: string): DbPersonalNote[] {
  return db
    .prepare(`SELECT ${NOTE_COLS} FROM personal_notes WHERE user_id = ? AND word_id = ? ORDER BY updated_at DESC`)
    .all(userId, wordId) as DbPersonalNote[];
}

export function getPersonalNotesByGrammar(userId: number, grammarId: string): DbPersonalNote[] {
  return db
    .prepare(`SELECT ${NOTE_COLS} FROM personal_notes WHERE user_id = ? AND grammar_id = ? ORDER BY updated_at DESC`)
    .all(userId, grammarId) as DbPersonalNote[];
}

export function addPersonalNote(
  userId: number,
  phrase: string,
  meaning: string,
  context: string,
  wordId?: string,
  wordKanji?: string,
  grammarId?: string,
  grammarPattern?: string
): number {
  const now = Date.now();
  const result = db
    .prepare("INSERT INTO personal_notes (user_id, phrase, meaning, context, word_id, word_kanji, grammar_id, grammar_pattern, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(userId, phrase, meaning, context, wordId ?? null, wordKanji ?? null, grammarId ?? null, grammarPattern ?? null, now, now);
  return result.lastInsertRowid as number;
}

export function updatePersonalNote(
  userId: number,
  noteId: number,
  phrase: string,
  meaning: string,
  context: string
) {
  db.prepare(
    "UPDATE personal_notes SET phrase = ?, meaning = ?, context = ?, updated_at = ? WHERE id = ? AND user_id = ?"
  ).run(phrase, meaning, context, Date.now(), noteId, userId);
}

export function deletePersonalNote(userId: number, noteId: number) {
  db.prepare("DELETE FROM personal_notes WHERE id = ? AND user_id = ?").run(noteId, userId);
}

// ── Grammar Favorites ─────────────────────────────────────────────────────────

export interface DbGrammarFavorite {
  id: number;
  grammar_id: string;
  pattern: string;
  meaning: string;
  jlpt: string;
  saved_at: number;
}

export function getGrammarFavoritesByUserId(userId: number): DbGrammarFavorite[] {
  return db
    .prepare("SELECT id, grammar_id, pattern, meaning, jlpt, saved_at FROM grammar_favorites WHERE user_id = ? ORDER BY saved_at DESC")
    .all(userId) as DbGrammarFavorite[];
}

export function isGrammarFavoritedInDb(userId: number, grammarId: string): boolean {
  return !!db
    .prepare("SELECT 1 FROM grammar_favorites WHERE user_id = ? AND grammar_id = ?")
    .get(userId, grammarId);
}

export function addGrammarFavoriteToDb(
  userId: number,
  grammarId: string,
  pattern: string,
  meaning: string,
  jlpt: string
) {
  db.prepare(
    "INSERT OR REPLACE INTO grammar_favorites (user_id, grammar_id, pattern, meaning, jlpt, saved_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, grammarId, pattern, meaning, jlpt, Date.now());
}

export function removeGrammarFavoriteFromDb(userId: number, grammarId: string) {
  db.prepare("DELETE FROM grammar_favorites WHERE user_id = ? AND grammar_id = ?").run(userId, grammarId);
}
