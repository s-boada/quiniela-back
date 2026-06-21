import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const userRepository = {
  findAll() {
    return prisma.user.findMany({ orderBy: { displayName: "asc" } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },
  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
};
