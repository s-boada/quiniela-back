require("dotenv").config();
const { db, nowIso } = require("./db");

// m23: Ghana vs Panamá | m24: Uzbekistán vs Colombia
const SEED_2_PREDICTIONS = [
  { userId: "jonathan", matchId: "m23", homeScore: 1, awayScore: 1 },
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

// Correcciones a pronósticos del seed inicial
const SEED_2_CORRECTIONS = [
  { userId: "anabell", matchId: "m1", homeScore: 0, awayScore: 0 }
];

const upsertPrediction = db.prepare(`
  INSERT INTO predictions (user_id, match_id, home_score, away_score, updated_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(user_id, match_id) DO UPDATE SET
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    updated_at = excluded.updated_at
`);

const ts = nowIso();
let upserted = 0;

[...SEED_2_PREDICTIONS, ...SEED_2_CORRECTIONS].forEach((pred) => {
  upsertPrediction.run(pred.userId, pred.matchId, pred.homeScore, pred.awayScore, ts);
  upserted += 1;
});

console.log(`Seed-2 completado: ${upserted} pronósticos insertados o actualizados.`);
