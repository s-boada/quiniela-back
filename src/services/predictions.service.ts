import { KNOCKOUT_STAGES } from "../lib/constants";
import { parseMatchDateAsUTC, isMatchUndetermined } from "../lib/helpers";
import { HttpError } from "../lib/http-error";
import { toApiPrediction } from "../lib/mappers";
import { matchRepository } from "../repositories/match.repository";
import { predictionRepository } from "../repositories/prediction.repository";

export async function upsertPrediction(payload: {
  userId: string;
  matchId: string;
  homeScoreRaw: unknown;
  awayScoreRaw: unknown;
  qualifiedTeamRaw: unknown;
}) {
  const homeScore = Number.parseInt(String(payload.homeScoreRaw), 10);
  const awayScore = Number.parseInt(String(payload.awayScoreRaw), 10);
  if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    throw new HttpError(400, "Marcadores inválidos");
  }

  const match = await matchRepository.findById(payload.matchId);
  if (!match) throw new HttpError(404, "Partido no encontrado");
  if (match.completed) throw new HttpError(400, "El partido ya finalizó");
  if (match.status === "IN_PLAY") throw new HttpError(400, "El partido está en vivo");
  if (isMatchUndetermined(match.homeTeam, match.awayTeam)) {
    throw new HttpError(400, "No puedes pronosticar hasta que se definan los equipos");
  }

  let qualifiedTeam: string | null = null;
  if (KNOCKOUT_STAGES.has(match.stage) && homeScore === awayScore) {
    qualifiedTeam = typeof payload.qualifiedTeamRaw === "string" ? payload.qualifiedTeamRaw.trim() : "";
    if (!qualifiedTeam) throw new HttpError(400, "Debes indicar cuál país clasifica en caso de empate");
    if (qualifiedTeam !== match.homeTeam && qualifiedTeam !== match.awayTeam) {
      throw new HttpError(400, "El país clasificado debe ser uno de los dos equipos del partido");
    }
  }

  const matchDate = parseMatchDateAsUTC(match.date);
  if (matchDate.getTime() - Date.now() < 5 * 60 * 1000) {
    throw new HttpError(400, "El tiempo límite para guardar este pronóstico ha expirado (5 minutos antes del inicio)");
  }

  const existing = await predictionRepository.findByUserAndMatch(payload.userId, payload.matchId);
  if (existing) {
    throw new HttpError(400, "Este pronóstico ya fue guardado y no puede editarse");
  }

  const prediction = await predictionRepository.create({
    userId: payload.userId,
    matchId: payload.matchId,
    homeScore,
    awayScore,
    qualifiedTeam
  });

  return { prediction: toApiPrediction(prediction) };
}
