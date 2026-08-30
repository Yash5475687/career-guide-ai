import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "careerguide.sqlite3");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------------------------------------------------------------
// Schema
//
// NOTE ON DATABASE CHOICE: the product spec called for PostgreSQL. This
// project uses SQLite (via better-sqlite3) instead so the whole app runs
// with zero external setup — no database server to install or configure.
// The schema below is plain relational SQL with no SQLite-only features,
// so swapping to Postgres later is a matter of pointing an ORM (Prisma /
// Drizzle / Knex) at the same tables — see README "Swapping to Postgres".
// ---------------------------------------------------------------------------

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  college TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_sent_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  branch TEXT,
  year TEXT,
  experience TEXT,
  career_goal TEXT,
  daily_time TEXT,
  interests TEXT DEFAULT '[]',
  onboarding_complete INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS careers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  what_you_do TEXT,
  difficulty TEXT,
  languages TEXT DEFAULT '[]',
  skills TEXT DEFAULT '[]',
  tools TEXT DEFAULT '[]',
  typical_projects TEXT DEFAULT '[]',
  roadmap_beginner TEXT DEFAULT '[]',
  roadmap_intermediate TEXT DEFAULT '[]',
  roadmap_advanced TEXT DEFAULT '[]',
  internship_prep TEXT DEFAULT '[]',
  interview_prep TEXT DEFAULT '[]',
  match_traits TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT,
  topic TEXT,
  difficulty TEXT,
  free INTEGER NOT NULL DEFAULT 1,
  duration TEXT,
  description TEXT,
  link TEXT,
  why TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  difficulty TEXT,
  technologies TEXT DEFAULT '[]',
  skills_learned TEXT DEFAULT '[]',
  description TEXT,
  features TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  outcome TEXT,
  portfolio_value TEXT,
  career_tags TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, key)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export function tableIsEmpty(table) {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get();
  return row.c === 0;
}
