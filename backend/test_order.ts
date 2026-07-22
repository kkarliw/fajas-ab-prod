import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function main() { const c = await prisma.cart.findFirst(); console.log(c.id); } main();
