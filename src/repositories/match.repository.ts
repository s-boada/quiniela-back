import { prisma } from "../lib/prisma";

export const matchRepository = {
  findAll() {
    return prisma.match.findMany({ orderBy: { date: "asc" } });
  },
  findById(id: string) {
    return prisma.match.findUnique({ where: { id } });
  },
  create(data: {
    id: string;
    stage: string;
    groupName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    status: string;
  }) {
    return prisma.match.create({ data });
  },
  update(id: string, data: Parameters<typeof prisma.match.update>[0]["data"]) {
    return prisma.match.update({ where: { id }, data });
  }
};
