import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/api";
import { getDashboardData } from "../services/data.service";

export async function getData(_req: AuthenticatedRequest, res: Response) {
  const data = await getDashboardData();
  res.json(data);
}
