const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "quiniela.db");
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    avatar TEXT NOT NULL DEFAULT '⚽',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    api_id INTEGER,
    stage TEXT NOT NULL,
    "group" TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    date TEXT NOT NULL,
    real_home_score INTEGER,
    real_away_score INTEGER,
    completed INTEGER NOT NULL DEFAULT 0,
    status TEXT,
    live_home_score INTEGER,
    live_away_score INTEGER,
    minute TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS predictions (
    user_id TEXT NOT NULL,
    match_id TEXT NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, match_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );
`);

function transaction(fn) {
  db.exec("BEGIN");
  try {
    fn();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.id,
    displayName: row.display_name,
    role: row.role,
    avatar: row.avatar,
    createdAt: safeDate(row.created_at),
    updatedAt: safeDate(row.updated_at)
  };
}

function rowToMatch(row) {
  return {
    id: row.id,
    apiId: row.api_id,
    stage: row.stage,
    group: row.group,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    date: row.date,
    realHomeScore: row.real_home_score,
    realAwayScore: row.real_away_score,
    completed: !!row.completed,
    status: row.status || undefined,
    liveHomeScore: row.live_home_score,
    liveAwayScore: row.live_away_score,
    minute: row.minute,
    updatedAt: safeDate(row.updated_at)
  };
}

function rowToPrediction(row) {
  return {
    uid: row.user_id,
    userId: row.user_id,
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    updatedAt: safeDate(row.updated_at)
  };
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function getAllUsers() {
  return db.prepare("SELECT * FROM users ORDER BY display_name").all().map(rowToUser);
}

function getUserById(id) {
  return rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
}

function getAllMatches() {
  return db.prepare("SELECT * FROM matches ORDER BY date").all().map(rowToMatch);
}

function getMatchById(id) {
  return rowToMatch(db.prepare("SELECT * FROM matches WHERE id = ?").get(id));
}

function getAllPredictions() {
  return db.prepare("SELECT * FROM predictions").all().map(rowToPrediction);
}

function predictionsToMap(predictions) {
  const map = {};
  predictions.forEach((p) => {
    map[`${p.uid}_${p.matchId}`] = { homeScore: p.homeScore, awayScore: p.awayScore };
  });
  return map;
}

function isMatchUndetermined(match) {
  if (!match || !match.homeTeam || !match.awayTeam) return true;
  const placeholders = ["Ganador", "Segundo", "Perdedor", "Grupo", "3ro", "3er", "Winner", "Runner-up", "3rd", "Loser"];
  return placeholders.some((p) => match.homeTeam.includes(p) || match.awayTeam.includes(p));
}

function parseMatchDateAsUTC(dateStr) {
  if (!dateStr) return new Date();
  return new Date(dateStr.replace(" ", "T") + "Z");
}

module.exports = {
  db,
  transaction,
  nowIso,
  rowToUser,
  rowToMatch,
  rowToPrediction,
  getAllUsers,
  getUserById,
  getAllMatches,
  getMatchById,
  getAllPredictions,
  predictionsToMap,
  isMatchUndetermined,
  parseMatchDateAsUTC
};
