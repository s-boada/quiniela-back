require("dotenv").config();
const { db, nowIso } = require("./db");

// Pronósticos olvidados en el seed inicial (m23: Ghana vs Panamá, m24: Uzbekistán vs Colombia)
const SEED_2_PREDICTIONS = [
  { userId: "jonathan", matchId: "m23", homeScore: 2, awayScore: 0 },
  { userId: "jonathan", matchId: "m24", homeScore: 0, awayScore: 3 },
  { userId: "jesus", matchId: "m23", homeScore: 2, awayScore: 0 },
  { userId: "jesus", matchId: "m24", homeScore: 0, awayScore: 1 },
  { userId: "anabell", matchId: "m23", homeScore: 2, awayScore: 0 },
  { userId: "anabell", matchId: "m24", homeScore: 1, awayScore: 2 },
  { userId: "yein", matchId: "m23", homeScore: 1, awayScore: 1 },
  { userId: "yein", matchId: "m24", homeScore: 0, awayScore: 2 },
  { userId: "nicolas", matchId: "m23", homeScore: 2, awayScore: 1 },
  { userId: "nicolas", matchId: "m24", homeScore: 0, awayScore: 3 },
  { userId: "jairo", matchId: "m23", homeScore: 1, awayScore: 2 },
  { userId: "jairo", matchId: "m24", homeScore: 1, awayScore: 2 }
];

const getExisting = db.prepare(`
  SELECT 1 FROM predictions WHERE user_id = ? AND match_id = ?
`);

const insertPrediction = db.prepare(`
  INSERT INTO predictions (user_id, match_id, home_score, away_score, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

const ts = nowIso();
let inserted = 0;
let skipped = 0;

SEED_2_PREDICTIONS.forEach((pred) => {
  if (getExisting.get(pred.userId, pred.matchId)) {
    skipped += 1;
    return;
  }
  insertPrediction.run(pred.userId, pred.matchId, pred.homeScore, pred.awayScore, ts);
  inserted += 1;
});

console.log(`Seed-2 completado: ${inserted} pronósticos insertados, ${skipped} omitidos (ya existían).`);
