import { prisma } from "../lib/prisma";

export const predictionRepository = {
  findAll() {
    return prisma.prediction.findMany();
  },
  findByUserAndMatch(userId: string, matchId: string) {
    return prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId
        }
      }
    });
  },
  create(data: {
    userId: string;
    matchId: string;
    homeScore: number;
    awayScore: number;
    qualifiedTeam: string | null;
  }) {
    return prisma.prediction.create({ data });
  },
  deleteByUserId(userId: string) {
    return prisma.prediction.deleteMany({ where: { userId } });
  }
};
