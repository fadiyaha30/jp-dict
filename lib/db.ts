import "server-only";
import Database from "better-sqlite3";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import type { FavoriteItem } from "./favorites";
import type { HistoryItem } from "./history";

const DATA_DIR = path.join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "jdict.db"));
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
`);

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
