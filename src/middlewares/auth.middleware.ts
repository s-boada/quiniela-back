import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/api";
import { HttpError } from "../lib/http-error";
import { verifyToken } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";
import { toApiUser } from "../lib/mappers";

export async function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "No autenticado"));

  try {
    const payload = verifyToken(token);
    const userId = String(payload.sub || "");
    const dbUser = await userRepository.findById(userId);
    if (!dbUser) return next(new HttpError(401, "Usuario no encontrado"));

    req.user = toApiUser(dbUser);
    next();
  } catch {
    next(new HttpError(401, "Token inválido o expirado"));
  }
}

export function adminMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return next(new HttpError(403, "Acceso restringido a administradores"));
  }
  next();
}
