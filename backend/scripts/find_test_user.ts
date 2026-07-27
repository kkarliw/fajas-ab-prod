import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('LATEST 5 USERS IN HOSTINGER DB:', users.map(u => ({ email: u.email, roleId: u.roleId, verified: u.emailVerifiedAt })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
