import type { DbMatch, DbPrediction, DbUser, ApiMatch, ApiPrediction, ApiUser } from "../types/api";
import { safeDate } from "./helpers";

export function toApiUser(user: DbUser): ApiUser {
  return {
    id: user.id,
    uid: user.id,
    displayName: user.displayName,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    documentId: user.documentId ?? null,
    email: user.email ?? null,
    role: user.role,
    avatar: user.avatar,
    createdAt: safeDate(user.createdAt),
    updatedAt: safeDate(user.updatedAt)
  };
}

export function toApiMatch(match: DbMatch): ApiMatch {
  return {
    id: match.id,
    apiId: match.apiId ?? null,
    stage: match.stage,
    group: match.groupName,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    date: match.date,
    realHomeScore: match.realHomeScore ?? null,
    realAwayScore: match.realAwayScore ?? null,
    completed: match.completed,
    status: match.status || undefined,
    liveHomeScore: match.liveHomeScore ?? null,
    liveAwayScore: match.liveAwayScore ?? null,
    minute: match.minute ?? null,
    updatedAt: safeDate(match.updatedAt)
  };
}

export function toApiPrediction(prediction: DbPrediction): ApiPrediction {
  return {
    uid: prediction.userId,
    userId: prediction.userId,
    matchId: prediction.matchId,
    homeScore: prediction.homeScore,
    awayScore: prediction.awayScore,
    qualifiedTeam: prediction.qualifiedTeam ?? null,
    updatedAt: safeDate(prediction.updatedAt)
  };
}

export function predictionsToMap(predictions: ApiPrediction[]): Record<string, { homeScore: number; awayScore: number; qualifiedTeam: string | null; }> {
  const map: Record<string, { homeScore: number; awayScore: number; qualifiedTeam: string | null; }> = {};
  predictions.forEach((prediction) => {
    map[`${prediction.uid}_${prediction.matchId}`] = {
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      qualifiedTeam: prediction.qualifiedTeam ?? null
    };
  });
  return map;
}
