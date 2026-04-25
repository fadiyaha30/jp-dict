import Database from "better-sqlite3";
import path from "path";
import { mkdirSync, existsSync } from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "jdict.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT  NOT NULL,
    created_at  INTEGER NOT NULL
  )
`);

export interface DbUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export function getUserByUsername(username: string): DbUser | undefined {
  return db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as DbUser | undefined;
}

export function createUser(username: string, passwordHash: string): number {
  const result = db
    .prepare(
      "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)"
    )
    .run(username, passwordHash, Date.now());
  return result.lastInsertRowid as number;
}

export function usernameExists(username: string): boolean {
  const row = db
    .prepare("SELECT 1 FROM users WHERE username = ? COLLATE NOCASE")
    .get(username);
  return !!row;
}
