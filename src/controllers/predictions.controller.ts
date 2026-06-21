import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/api";
import * as predictionsService from "../services/predictions.service";

export async function savePrediction(req: AuthenticatedRequest, res: Response) {
  const result = await predictionsService.upsertPrediction({
    userId: req.user!.id,
    matchId: String(req.params.matchId),
    homeScoreRaw: req.body.homeScore,
    awayScoreRaw: req.body.awayScore,
    qualifiedTeamRaw: req.body.qualifiedTeam
  });
  res.json(result);
}
