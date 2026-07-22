import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Registered users:");
  users.forEach(u => console.log(`- ${u.email} (Role ID: ${u.roleId})`));
  await prisma.$disconnect();
}

main();
