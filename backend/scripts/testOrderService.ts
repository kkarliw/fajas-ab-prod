import { PrismaClient } from "@prisma/client";
import { orderService } from "../src/services/orderService.js";

const prisma = new PrismaClient();

async function main() {
  const reference = "ORD-1785694160366-108DA934";
  const email = "prueba@fajasab.com";
  
  const order = await orderService.getOrderByIdOrReference(reference);
  console.log("Order found:", !!order);
  if (order) {
    console.log("Order email:", order.email);
    console.log("Match:", order.email === email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
