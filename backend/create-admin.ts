import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" }
  });

  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fajasab.com" },
    update: {
      passwordHash,
      roleId: adminRole.id
    },
    create: {
      email: "admin@fajasab.com",
      name: "Administrador",
      passwordHash,
      roleId: adminRole.id
    }
  });

  console.log("Admin user created/updated: admin@fajasab.com / admin123");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
