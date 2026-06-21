import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.middleware";
import * as usersController from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.get("/", authMiddleware, asyncHandler(usersController.listUsers));
usersRouter.post("/", authMiddleware, adminMiddleware, asyncHandler(usersController.createUser));
usersRouter.put("/:id", authMiddleware, adminMiddleware, asyncHandler(usersController.updateUser));
usersRouter.put("/:id/password", authMiddleware, adminMiddleware, asyncHandler(usersController.resetUserPassword));
usersRouter.delete("/:id", authMiddleware, adminMiddleware, asyncHandler(usersController.deleteUser));
