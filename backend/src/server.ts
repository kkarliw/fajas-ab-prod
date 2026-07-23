import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function ensureAdminUsers() {
  try {
    const bcrypt = (await import("bcryptjs")).default;
    const { prisma } = await import("./lib/prisma.js");

    let adminRole = await prisma.role.findFirst({ where: { name: "admin" } });
    if (!adminRole) {
      adminRole = await prisma.role.create({ data: { name: "admin" } });
    }

    const hash = await bcrypt.hash("FajasAB2026!", 12);
    const adminEmails = ["fajasabcol@gmail.com", "admin@fajasab.com"];

    for (const email of adminEmails) {
      await prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: hash,
          roleId: adminRole.id,
          emailVerifiedAt: new Date()
        },
        create: {
          email,
          name: "Administrador FAJAS AB",
          passwordHash: hash,
          roleId: adminRole.id,
          emailVerifiedAt: new Date()
        }
      });
    }
    console.log("✅ Admin users ensured successfully.");
  } catch (err) {
    console.error("⚠️ Failed to ensure admin users:", err);
  }
}

await ensureAdminUsers();

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

