import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/api";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body.username || "", req.body.password || "");
  res.json(result);
}

export async function register(req: Request, res: Response) {
  const result = await authService.register({
    firstName: req.body.firstName || "",
    lastName: req.body.lastName || "",
    documentId: req.body.documentId || "",
    email: req.body.email || "",
    username: req.body.username || "",
    password: req.body.password || ""
  });
  res.status(201).json(result);
}

export async function me(req: AuthenticatedRequest, res: Response) {
  res.json({ user: req.user });
}
