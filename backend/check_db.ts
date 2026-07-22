import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); async function main() { const prods = await p.product.findMany(); console.log(prods.map(p => p.basePriceCents)); } main();
