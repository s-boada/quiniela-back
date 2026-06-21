import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as dataController from "../controllers/data.controller";

export const dataRouter = Router();

dataRouter.get("/", authMiddleware, asyncHandler(dataController.getData));
