import type { Match, Prediction, User } from "@prisma/client";
import type { Request } from "express";

export type ApiUser = {
  id: string;
  uid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  documentId: string | null;
  email: string | null;
  role: string;
  avatar: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ApiMatch = {
  id: string;
  apiId: number | null;
  stage: string;
  group: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  realHomeScore: number | null;
  realAwayScore: number | null;
  completed: boolean;
  status?: string;
  liveHomeScore: number | null;
  liveAwayScore: number | null;
  minute: string | null;
  updatedAt: string | null;
};

export type ApiPrediction = {
  uid: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  qualifiedTeam: string | null;
  updatedAt: string | null;
};

export type AuthenticatedRequest = Request & {
  user?: ApiUser;
};

export type DbUser = User;
export type DbMatch = Match;
export type DbPrediction = Prediction;
