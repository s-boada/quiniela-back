import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as predictionsController from "../controllers/predictions.controller";

export const predictionsRouter = Router();

predictionsRouter.put("/:matchId", authMiddleware, asyncHandler(predictionsController.savePrediction));
