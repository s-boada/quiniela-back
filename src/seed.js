require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { db, nowIso, transaction } = require("./db");
const { INITIAL_MATCHES, INITIAL_USERS, INITIAL_PREDICTIONS } = require("./seed-data");

const ADMIN_IDS = new Set(["jonathan", "yein"]);
const passwordsPath = path.join(__dirname, "..", "seed-passwords.json");

function generatePassword(length = 10) {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const existingCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
if (existingCount > 0) {
  console.log("Base de datos ya tiene usuarios. Seed omitido.");
  process.exit(0);
}

const passwords = {};
const insertUser = db.prepare(`
  INSERT INTO users (id, password_hash, display_name, role, avatar, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertMatch = db.prepare(`
  INSERT INTO matches (
    id, api_id, stage, "group", home_team, away_team, date,
    real_home_score, real_away_score, completed, status,
    live_home_score, live_away_score, minute, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPrediction = db.prepare(`
  INSERT INTO predictions (user_id, match_id, home_score, away_score, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

transaction(() => {
  const ts = nowIso();

  INITIAL_USERS.forEach((user) => {
    const plainPassword = generatePassword();
    passwords[user.id] = plainPassword;
    const role = ADMIN_IDS.has(user.id) ? "admin" : "user";
    insertUser.run(
      user.id,
      bcrypt.hashSync(plainPassword, 10),
      user.name,
      role,
      user.avatar || "⚽",
      ts,
      ts
    );
  });

  INITIAL_MATCHES.forEach((match) => {
    insertMatch.run(
      match.id,
      match.apiId ?? null,
      match.stage,
      match.group,
      match.homeTeam,
      match.awayTeam,
      match.date,
      match.realHomeScore,
      match.realAwayScore,
      match.completed ? 1 : 0,
      match.status || null,
      null,
      null,
      null,
      ts
    );
  });

  Object.entries(INITIAL_PREDICTIONS).forEach(([key, pred]) => {
    const underscoreIdx = key.indexOf("_");
    const userId = key.slice(0, underscoreIdx);
    const matchId = key.slice(underscoreIdx + 1);
    insertPrediction.run(userId, matchId, pred.homeScore, pred.awayScore, ts);
  });
});
fs.writeFileSync(passwordsPath, JSON.stringify(passwords, null, 2), "utf8");

console.log(`Seed completado: ${INITIAL_USERS.length} usuarios, ${INITIAL_MATCHES.length} partidos.`);
console.log(`Contraseñas guardadas en ${passwordsPath}`);
