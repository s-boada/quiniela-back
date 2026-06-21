import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
