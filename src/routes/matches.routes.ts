import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.middleware";
import * as matchesController from "../controllers/matches.controller";

export const matchesRouter = Router();

matchesRouter.put("/:id", authMiddleware, adminMiddleware, asyncHandler(matchesController.updateMatchScore));
matchesRouter.put("/:id/team", authMiddleware, adminMiddleware, asyncHandler(matchesController.updateKnockoutTeam));
matchesRouter.post("/", authMiddleware, adminMiddleware, asyncHandler(matchesController.createMatch));
matchesRouter.post("/sync-live", authMiddleware, adminMiddleware, asyncHandler(matchesController.syncLiveMatches));
