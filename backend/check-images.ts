import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.productImage.findMany().then(imgs => console.log(imgs)).finally(() => prisma.$disconnect());
