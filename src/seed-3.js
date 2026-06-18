require("dotenv").config();
const { db, nowIso } = require("./db");

// m23: Ghana vs Panamá | m24: Uzbekistán vs Colombia | m25: Chequia vs Sudáfrica
const SEED_3_PREDICTIONS = [
  { userId: "luis", matchId: "m23", homeScore: 2, awayScore: 0 },
  { userId: "luis", matchId: "m24", homeScore: 1, awayScore: 2 },
  { userId: "luis", matchId: "m25", homeScore: 2, awayScore: 1 },
  { userId: "angel", matchId: "m23", homeScore: 1, awayScore: 1 },
  { userId: "angel", matchId: "m24", homeScore: 1, awayScore: 2 },
  { userId: "jesus", matchId: "m25", homeScore: 1, awayScore: 0 }
];

const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
const matchCount = db.prepare("SELECT COUNT(*) AS count FROM matches").get().count;

if (userCount === 0 || matchCount === 0) {
  console.error("Error: la base de datos no tiene usuarios o partidos cargados.");
  console.error(`  Usuarios: ${userCount} | Partidos: ${matchCount}`);
  console.error("Ejecuta primero el seed inicial: yarn seed");
  process.exit(1);
}

const userExists = db.prepare("SELECT 1 FROM users WHERE id = ?");
const matchExists = db.prepare("SELECT 1 FROM matches WHERE id = ?");
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
let skipped = 0;
const missingUsers = new Set();
const missingMatches = new Set();

SEED_3_PREDICTIONS.forEach((pred) => {
  if (!userExists.get(pred.userId)) {
    missingUsers.add(pred.userId);
    skipped += 1;
    return;
  }
  if (!matchExists.get(pred.matchId)) {
    missingMatches.add(pred.matchId);
    skipped += 1;
    return;
  }
  upsertPrediction.run(pred.userId, pred.matchId, pred.homeScore, pred.awayScore, ts);
  upserted += 1;
});

console.log(`Seed-3 completado: ${upserted} pronósticos insertados o actualizados.`);

if (skipped > 0) {
  if (missingUsers.size) console.warn(`Usuarios no encontrados: ${[...missingUsers].join(", ")}`);
  if (missingMatches.size) console.warn(`Partidos no encontrados: ${[...missingMatches].join(", ")}`);
  console.warn(`${skipped} pronósticos omitidos.`);
  process.exit(1);
}
