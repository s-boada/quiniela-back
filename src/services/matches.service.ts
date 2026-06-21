import { KNOCKOUT_STAGES, TEAM_TRANSLATIONS } from "../lib/constants";
import { HttpError } from "../lib/http-error";
import { toApiMatch } from "../lib/mappers";
import { translateLabel, translateTeam } from "../lib/helpers";
import { matchRepository } from "../repositories/match.repository";

export async function listMatches() {
  const matches = await matchRepository.findAll();
  return matches.map(toApiMatch);
}

export async function getMatchById(id: string) {
  const match = await matchRepository.findById(id);
  return match ? toApiMatch(match) : null;
}

export async function updateMatchScore(id: string, homeRaw: unknown, awayRaw: unknown) {
  const match = await matchRepository.findById(id);
  if (!match) throw new HttpError(404, "Partido no encontrado");

  const home = Number(homeRaw);
  const away = Number(awayRaw);
  if (Number.isNaN(home) || Number.isNaN(away)) {
    throw new HttpError(400, "Debes ingresar ambos marcadores");
  }

  const updated = await matchRepository.update(id, {
    realHomeScore: home,
    realAwayScore: away,
    completed: true,
    status: "FINISHED",
    liveHomeScore: null,
    liveAwayScore: null,
    minute: null
  });

  return { match: toApiMatch(updated) };
}

export async function updateKnockoutTeam(id: string, sideRaw: unknown, teamNameRaw: unknown) {
  const match = await matchRepository.findById(id);
  if (!match) throw new HttpError(404, "Partido no encontrado");

  const side = String(sideRaw || "").trim().toLowerCase();
  const teamName = String(teamNameRaw || "").trim();
  if (side !== "home" && side !== "away") throw new HttpError(400, "Lado inválido. Usa 'home' o 'away'");
  if (!teamName) throw new HttpError(400, "El nombre del país no puede estar vacío");
  if (!KNOCKOUT_STAGES.has(match.stage)) throw new HttpError(400, "Solo se puede editar equipos en fase eliminatoria");

  const currentHome = match.homeTeam || "";
  const currentAway = match.awayTeam || "";
  if ((side === "home" && teamName === currentAway) || (side === "away" && teamName === currentHome)) {
    throw new HttpError(400, "Los equipos del partido deben ser distintos");
  }

  const updated = await matchRepository.update(id, {
    homeTeam: side === "home" ? teamName : currentHome,
    awayTeam: side === "away" ? teamName : currentAway
  });

  return { match: toApiMatch(updated) };
}

export async function createMatch(payload: {
  stage?: string;
  group?: string;
  homeTeam?: string;
  awayTeam?: string;
  date?: string;
}) {
  const { stage, group, homeTeam, awayTeam, date } = payload;
  if (!stage || !group || !homeTeam || !awayTeam || !date) {
    throw new HttpError(400, "Completa todos los campos del partido");
  }
  if (homeTeam === awayTeam) throw new HttpError(400, "Los equipos deben ser distintos");

  const id = `m_${Date.now()}`;
  const created = await matchRepository.create({
    id,
    stage,
    groupName: group,
    homeTeam,
    awayTeam,
    date: date.replace("T", " "),
    status: "SCHEDULED"
  });

  return { match: toApiMatch(created) };
}

type LiveApiGame = {
  id: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
  finished?: string;
  time_elapsed?: string;
  home_score?: string;
  away_score?: string;
};

export async function syncLiveMatches() {
  const LIVE_API_URL = "https://worldcup26.ir/get/games";
  let games: LiveApiGame[] | null = null;

  try {
    const response = await fetch(LIVE_API_URL, { signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      const data = await response.json();
      games = (data.games || data) as LiveApiGame[];
    }
  } catch {
    throw new HttpError(502, "No se pudo conectar con la API de resultados");
  }

  if (!Array.isArray(games)) throw new HttpError(502, "Respuesta inválida de la API externa");

  const localMatches = await matchRepository.findAll();
  let updates = 0;

  for (const realMatch of games) {
    const apiId = Number.parseInt(realMatch.id, 10);
    const localMatch = localMatches.find((m) => m.apiId === apiId);
    if (!localMatch) continue;

    const homeName = realMatch.home_team_name_en
      ? translateTeam(realMatch.home_team_name_en, TEAM_TRANSLATIONS)
      : translateLabel(realMatch.home_team_label || "");
    const awayName = realMatch.away_team_name_en
      ? translateTeam(realMatch.away_team_name_en, TEAM_TRANSLATIONS)
      : translateLabel(realMatch.away_team_label || "");
    const finished = realMatch.finished === "TRUE";
    const isLive = !!realMatch.time_elapsed && realMatch.time_elapsed !== "finished" && realMatch.time_elapsed !== "notstarted";

    if (finished) {
      await matchRepository.update(localMatch.id, {
        homeTeam: homeName || localMatch.homeTeam,
        awayTeam: awayName || localMatch.awayTeam,
        realHomeScore: Number.parseInt(realMatch.home_score || "0", 10),
        realAwayScore: Number.parseInt(realMatch.away_score || "0", 10),
        completed: true,
        status: "FINISHED",
        liveHomeScore: null,
        liveAwayScore: null,
        minute: null
      });
      updates += 1;
    } else if (isLive) {
      await matchRepository.update(localMatch.id, {
        homeTeam: homeName || localMatch.homeTeam,
        awayTeam: awayName || localMatch.awayTeam,
        completed: false,
        status: "IN_PLAY",
        liveHomeScore: Number.parseInt(realMatch.home_score || "0", 10) || 0,
        liveAwayScore: Number.parseInt(realMatch.away_score || "0", 10) || 0,
        minute: realMatch.time_elapsed || "45'",
        realHomeScore: null,
        realAwayScore: null
      });
      updates += 1;
    }
  }

  const matches = (await listMatches()).filter((match) => KNOCKOUT_STAGES.has(match.stage));
  return { updates, matches };
}
