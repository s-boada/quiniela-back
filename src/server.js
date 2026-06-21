require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  db,
  nowIso,
  getAllUsers,
  getUserById,
  getAllMatches,
  getMatchById,
  getAllPredictions,
  predictionsToMap,
  isMatchUndetermined,
  parseMatchDateAsUTC
} = require("./db");
const {
  verifyPassword,
  generatePassword,
  hashPassword,
  signToken,
  authMiddleware,
  adminMiddleware
} = require("./auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const TEAM_TRANSLATIONS = {
  Mexico: "México", "South Africa": "Sudáfrica", "South Korea": "Corea del Sur", "Czech Republic": "Chequia",
  Canada: "Canadá", "Bosnia and Herzegovina": "Bosnia y Herzegovina", USA: "EE.UU.", "United States": "EE.UU.",
  Paraguay: "Paraguay", Qatar: "Catar", Switzerland: "Suiza", Brazil: "Brasil", Morocco: "Marruecos",
  Haiti: "Haití", Scotland: "Escocia", Australia: "Australia", Turkey: "Turquía", Türkiye: "Turquía", Germany: "Alemania",
  Curacao: "Curazao", Curaçao: "Curazao", Netherlands: "Países Bajos", Japan: "Japón", "Ivory Coast": "Costa de Marfil",
  Ecuador: "Ecuador", Sweden: "Suecia", Tunisia: "Túnez", Spain: "España", "Cape Verde": "Cabo Verde",
  Belgium: "Bélgica", Egypt: "Egipto", "Saudi Arabia": "Arabia Saudita", Uruguay: "Uruguay", Iran: "Irán",
  "New Zealand": "Nueva Zelanda", France: "Francia", Senegal: "Senegal", Iraq: "Irak", Norway: "Noruega",
  Argentina: "Argentina", Algeria: "Argelia", Austria: "Austria", Jordan: "Jordania", Portugal: "Portugal",
  "DR Congo": "RD Congo", "Democratic Republic of the Congo": "RD Congo", England: "Inglaterra", Croatia: "Croacia",
  Ghana: "Ghana", Panama: "Panamá", Colombia: "Colombia", Uzbekistan: "Uzbekistán"
};

function translateTeam(engName) {
  if (!engName) return "";
  return TEAM_TRANSLATIONS[engName] || engName;
}

function translateLabel(label) {
  if (!label) return "";
  return label
    .replace(/Winner Group /g, "Ganador Grupo ")
    .replace(/Runner-up Group /g, "Segundo Grupo ")
    .replace(/3rd Group /g, "3ro Grupo ")
    .replace(/Winner Match /g, "Ganador Partido ")
    .replace(/Loser Match /g, "Perdedor Partido ");
}

const KNOCKOUT_STAGES = new Set([
  "Dieciseisavos de Final",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinales",
  "Final",
  "Tercer Puesto"
]);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", (req, res) => {
  const username = (req.body.username || "").trim().toLowerCase();
  const password = req.body.password || "";
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(username);
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const user = getUserById(row.id);
  const token = signToken(user);
  res.json({ token, user });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/data", authMiddleware, (_req, res) => {
  const users = getAllUsers();
  const matches = getAllMatches();
  const predictions = predictionsToMap(getAllPredictions());
  res.json({ users, matches, predictions });
});

app.get("/api/users", authMiddleware, (_req, res) => {
  res.json({ users: getAllUsers() });
});

app.post("/api/users", authMiddleware, adminMiddleware, (req, res) => {
  const id = (req.body.id || "").trim().toLowerCase();
  const displayName = (req.body.displayName || "").trim();
  const role = (req.body.role || "user").trim().toLowerCase();
  const avatar = req.body.avatar || "⚽";
  let password = req.body.password;

  if (!id || !displayName) {
    return res.status(400).json({ error: "id y displayName son requeridos" });
  }
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ error: "Rol inválido" });
  }
  if (getUserById(id)) {
    return res.status(409).json({ error: "El usuario ya existe" });
  }

  if (!password) password = generatePassword();
  const ts = nowIso();
  db.prepare(`
    INSERT INTO users (id, password_hash, display_name, role, avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, hashPassword(password), displayName, role, avatar, ts, ts);

  res.status(201).json({ user: getUserById(id), password });
});

app.put("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const target = getUserById(id);
  if (!target) return res.status(404).json({ error: "Usuario no encontrado" });

  const displayName = (req.body.displayName ?? target.displayName).trim();
  const role = (req.body.role ?? target.role).trim().toLowerCase();
  const avatar = req.body.avatar ?? target.avatar;

  if (!displayName) return res.status(400).json({ error: "El nombre no puede estar vacío" });
  if (role !== "admin" && role !== "user") return res.status(400).json({ error: "Rol inválido" });

  const ts = nowIso();
  db.prepare(`
    UPDATE users SET display_name = ?, role = ?, avatar = ?, updated_at = ? WHERE id = ?
  `).run(displayName, role, avatar, ts, id);

  res.json({ user: getUserById(id) });
});

app.put("/api/users/:id/password", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  if (!getUserById(id)) return res.status(404).json({ error: "Usuario no encontrado" });

  const password = req.body.password || generatePassword();
  const ts = nowIso();
  db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(hashPassword(password), ts, id);
  res.json({ password });
});

app.delete("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
  }
  if (!getUserById(id)) return res.status(404).json({ error: "Usuario no encontrado" });

  db.prepare("DELETE FROM predictions WHERE user_id = ?").run(id);
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.put("/api/matches/:id", authMiddleware, adminMiddleware, (req, res) => {
  const match = getMatchById(req.params.id);
  if (!match) return res.status(404).json({ error: "Partido no encontrado" });

  const home = req.body.realHomeScore;
  const away = req.body.realAwayScore;
  if (home == null || away == null || Number.isNaN(Number(home)) || Number.isNaN(Number(away))) {
    return res.status(400).json({ error: "Debes ingresar ambos marcadores" });
  }

  const ts = nowIso();
  db.prepare(`
    UPDATE matches SET
      real_home_score = ?, real_away_score = ?, completed = 1, status = 'FINISHED',
      live_home_score = NULL, live_away_score = NULL, minute = NULL, updated_at = ?
    WHERE id = ?
  `).run(Number(home), Number(away), ts, req.params.id);

  res.json({ match: getMatchById(req.params.id) });
});

app.put("/api/matches/:id/team", authMiddleware, adminMiddleware, (req, res) => {
  const match = getMatchById(req.params.id);
  if (!match) return res.status(404).json({ error: "Partido no encontrado" });

  const side = (req.body.side || "").trim().toLowerCase();
  const teamName = (req.body.teamName || "").trim();
  if (side !== "home" && side !== "away") {
    return res.status(400).json({ error: "Lado inválido. Usa 'home' o 'away'" });
  }
  if (!teamName) {
    return res.status(400).json({ error: "El nombre del país no puede estar vacío" });
  }

  const knockoutStages = new Set([
    "Dieciseisavos de Final",
    "Octavos de Final",
    "Cuartos de Final",
    "Semifinales",
    "Final",
    "Tercer Puesto",
  ]);
  if (!knockoutStages.has(match.stage)) {
    return res.status(400).json({ error: "Solo se puede editar equipos en fase eliminatoria" });
  }

  const currentHome = match.homeTeam || "";
  const currentAway = match.awayTeam || "";
  if ((side === "home" && teamName === currentAway) || (side === "away" && teamName === currentHome)) {
    return res.status(400).json({ error: "Los equipos del partido deben ser distintos" });
  }

  const nextHome = side === "home" ? teamName : currentHome;
  const nextAway = side === "away" ? teamName : currentAway;
  const ts = nowIso();
  db.prepare(`
    UPDATE matches
    SET home_team = ?, away_team = ?, updated_at = ?
    WHERE id = ?
  `).run(nextHome, nextAway, ts, req.params.id);

  res.json({ match: getMatchById(req.params.id) });
});

app.post("/api/matches", authMiddleware, adminMiddleware, (req, res) => {
  const { stage, group, homeTeam, awayTeam, date } = req.body;
  if (!stage || !group || !homeTeam || !awayTeam || !date) {
    return res.status(400).json({ error: "Completa todos los campos del partido" });
  }
  if (homeTeam === awayTeam) {
    return res.status(400).json({ error: "Los equipos deben ser distintos" });
  }

  const id = `m_${Date.now()}`;
  const ts = nowIso();
  db.prepare(`
    INSERT INTO matches (
      id, api_id, stage, "group", home_team, away_team, date,
      real_home_score, real_away_score, completed, status,
      live_home_score, live_away_score, minute, updated_at
    ) VALUES (?, NULL, ?, ?, ?, ?, ?, NULL, NULL, 0, 'SCHEDULED', NULL, NULL, NULL, ?)
  `).run(id, stage, group, homeTeam, awayTeam, date.replace("T", " "), ts);

  res.status(201).json({ match: getMatchById(id) });
});

app.post("/api/matches/sync-live", authMiddleware, adminMiddleware, async (_req, res) => {
  const LIVE_API_URL = "https://worldcup26.ir/get/games";
  let games = null;

  try {
    const response = await fetch(LIVE_API_URL, { signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      const data = await response.json();
      games = data.games || data;
    }
  } catch (_err) {
    return res.status(502).json({ error: "No se pudo conectar con la API de resultados" });
  }

  if (!Array.isArray(games)) {
    return res.status(502).json({ error: "Respuesta inválida de la API externa" });
  }

  const localMatches = getAllMatches();
  let updates = 0;
  const ts = nowIso();

  const updateFinished = db.prepare(`
    UPDATE matches SET
      home_team = ?, away_team = ?, real_home_score = ?, real_away_score = ?,
      completed = 1, status = 'FINISHED', live_home_score = NULL, live_away_score = NULL,
      minute = NULL, updated_at = ? WHERE id = ?
  `);
  const updateLive = db.prepare(`
    UPDATE matches SET
      home_team = ?, away_team = ?, completed = 0, status = 'IN_PLAY',
      live_home_score = ?, live_away_score = ?, minute = ?,
      real_home_score = NULL, real_away_score = NULL, updated_at = ? WHERE id = ?
  `);

  games.forEach((realMatch) => {
    const apiId = parseInt(realMatch.id, 10);
    const localMatch = localMatches.find((m) => m.apiId === apiId);
    if (!localMatch) return;

    const homeName = realMatch.home_team_name_en
      ? translateTeam(realMatch.home_team_name_en)
      : translateLabel(realMatch.home_team_label || "");
    const awayName = realMatch.away_team_name_en
      ? translateTeam(realMatch.away_team_name_en)
      : translateLabel(realMatch.away_team_label || "");
    const finished = realMatch.finished === "TRUE";
    const isLive = realMatch.time_elapsed
      && realMatch.time_elapsed !== "finished"
      && realMatch.time_elapsed !== "notstarted";

    if (finished) {
      updateFinished.run(
        homeName || localMatch.homeTeam,
        awayName || localMatch.awayTeam,
        parseInt(realMatch.home_score, 10),
        parseInt(realMatch.away_score, 10),
        ts,
        localMatch.id
      );
      updates++;
    } else if (isLive) {
      updateLive.run(
        homeName || localMatch.homeTeam,
        awayName || localMatch.awayTeam,
        parseInt(realMatch.home_score, 10) || 0,
        parseInt(realMatch.away_score, 10) || 0,
        realMatch.time_elapsed || "45'",
        ts,
        localMatch.id
      );
      updates++;
    }
  });

  res.json({ updates, matches: getAllMatches() });
});

app.put("/api/predictions/:matchId", authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;
  const homeScore = parseInt(req.body.homeScore, 10);
  const awayScore = parseInt(req.body.awayScore, 10);
  const qualifiedTeamRaw = req.body.qualifiedTeam;

  if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return res.status(400).json({ error: "Marcadores inválidos" });
  }

  const match = getMatchById(matchId);
  if (!match) return res.status(404).json({ error: "Partido no encontrado" });
  if (match.completed) return res.status(400).json({ error: "El partido ya finalizó" });
  if (match.status === "IN_PLAY") return res.status(400).json({ error: "El partido está en vivo" });
  if (isMatchUndetermined(match)) {
    return res.status(400).json({ error: "No puedes pronosticar hasta que se definan los equipos" });
  }

  let qualifiedTeam = null;
  if (KNOCKOUT_STAGES.has(match.stage) && homeScore === awayScore) {
    qualifiedTeam = typeof qualifiedTeamRaw === "string" ? qualifiedTeamRaw.trim() : "";
    if (!qualifiedTeam) {
      return res.status(400).json({ error: "Debes indicar cuál país clasifica en caso de empate" });
    }
    if (qualifiedTeam !== match.homeTeam && qualifiedTeam !== match.awayTeam) {
      return res.status(400).json({ error: "El país clasificado debe ser uno de los dos equipos del partido" });
    }
  }

  const matchDate = parseMatchDateAsUTC(match.date);
  if (matchDate.getTime() - Date.now() < 5 * 60 * 1000) {
    return res.status(400).json({ error: "El tiempo límite para guardar este pronóstico ha expirado (5 minutos antes del inicio)" });
  }

  const existing = db.prepare("SELECT * FROM predictions WHERE user_id = ? AND match_id = ?").get(userId, matchId);
  if (existing) {
    return res.status(400).json({ error: "Este pronóstico ya fue guardado y no puede editarse" });
  }

  const ts = nowIso();
  db.prepare(`
    INSERT INTO predictions (user_id, match_id, home_score, away_score, qualified_team, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, matchId, homeScore, awayScore, qualifiedTeam, ts);

  res.json({
    prediction: { uid: userId, matchId, homeScore, awayScore, qualifiedTeam, updatedAt: ts }
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Quiniela API escuchando en http://localhost:${PORT}`);
});
