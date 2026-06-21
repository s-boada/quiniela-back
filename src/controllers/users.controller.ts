import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/api";
import * as usersService from "../services/users.service";

export async function listUsers(_req: AuthenticatedRequest, res: Response) {
  const users = await usersService.listUsers();
  res.json({ users });
}

export async function createUser(req: AuthenticatedRequest, res: Response) {
  const result = await usersService.createUser(req.body);
  res.status(201).json(result);
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  const result = await usersService.updateUser(String(req.params.id), req.body);
  res.json(result);
}

export async function resetUserPassword(req: AuthenticatedRequest, res: Response) {
  const result = await usersService.resetUserPassword(String(req.params.id), req.body.password);
  res.json(result);
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const result = await usersService.deleteUser(String(req.params.id), req.user!.id);
  res.json(result);
}
