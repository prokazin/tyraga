CREATE TABLE users (
  id TEXT PRIMARY KEY,
  telegram_id INTEGER NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  nickname TEXT NOT NULL,
  authority INTEGER NOT NULL DEFAULT 0,
  chips INTEGER NOT NULL DEFAULT 0,
  energy INTEGER NOT NULL DEFAULT 100,
  energy_max INTEGER NOT NULL DEFAULT 100,
  skill_strength INTEGER NOT NULL DEFAULT 0,
  skill_cunning INTEGER NOT NULL DEFAULT 0,
  skill_charisma INTEGER NOT NULL DEFAULT 0,
  skill_tech INTEGER NOT NULL DEFAULT 0,
  skill_xp_json TEXT NOT NULL DEFAULT '{}',
  brigade_id TEXT,
  role TEXT,
  last_energy_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE brigades (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  overseer_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE active_moves (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES characters(id),
  move_key TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  finishes_at INTEGER NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0,
  notified INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_active_moves_character ON active_moves(character_id);
CREATE INDEX idx_active_moves_finishes ON active_moves(finishes_at, resolved);
CREATE INDEX idx_characters_brigade ON characters(brigade_id);
