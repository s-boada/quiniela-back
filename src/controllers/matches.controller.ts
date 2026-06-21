import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/api";
import * as matchesService from "../services/matches.service";

export async function updateMatchScore(req: AuthenticatedRequest, res: Response) {
  const result = await matchesService.updateMatchScore(String(req.params.id), req.body.realHomeScore, req.body.realAwayScore);
  res.json(result);
}

export async function updateKnockoutTeam(req: AuthenticatedRequest, res: Response) {
  const result = await matchesService.updateKnockoutTeam(String(req.params.id), req.body.side, req.body.teamName);
  res.json(result);
}

export async function createMatch(req: AuthenticatedRequest, res: Response) {
  const result = await matchesService.createMatch(req.body);
  res.status(201).json(result);
}

export async function syncLiveMatches(_req: AuthenticatedRequest, res: Response) {
  const result = await matchesService.syncLiveMatches();
  res.json(result);
}
