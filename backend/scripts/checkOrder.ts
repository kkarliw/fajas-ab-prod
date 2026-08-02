import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findUnique({
    where: { reference: "ORD-1785694160366-108DA934" }
  });
  console.log(order);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
