import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { INITIAL_MATCHES_FROM_R32 } from "./seed-data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL in environment (.env)");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  const adminUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminDisplayName = (process.env.ADMIN_DISPLAY_NAME || "Administrador").trim();
  const adminAvatar = process.env.ADMIN_AVATAR || "⚽";

  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  const now = new Date();

  await prisma.user.create({
    data: {
      id: adminUser,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      displayName: adminDisplayName,
      role: "admin",
      avatar: adminAvatar,
      createdAt: now,
      updatedAt: now
    }
  });

  await prisma.match.createMany({
    data: INITIAL_MATCHES_FROM_R32.map((match) => ({
      id: match.id,
      apiId: match.apiId,
      stage: match.stage,
      groupName: match.groupName,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      date: match.date,
      completed: false,
      status: "SCHEDULED",
      updatedAt: now
    }))
  });

  console.log(`Seed completado: 1 admin (${adminUser}) y ${INITIAL_MATCHES_FROM_R32.length} partidos desde Dieciseisavos.`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Password temporal del admin: ${adminPassword}`);
  }
}

main()
  .catch((error) => {
    console.error("Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
