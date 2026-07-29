import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  console.log("Cleaning test data from database...");
  
  // 1. Delete dependent relations for Orders
  console.log("Cleaning payments and shipments...");
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  
  console.log("Cleaning support tickets...");
  await prisma.pqrMessage.deleteMany();
  await prisma.pqrTicket.deleteMany();
  
  console.log("Cleaning coupon redemptions...");
  await prisma.couponRedemption.deleteMany();
  
  console.log("Cleaning inventory movements...");
  await prisma.inventoryMovement.deleteMany();
  
  console.log("Cleaning orders...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  
  console.log("Cleaning carts...");
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  
  console.log("Cleaning newsletters...");
  await prisma.newsletterSubscriber.deleteMany();
  
  // Note: We don't delete Testimonials because they are requested to be kept as real data.
  // Note: We don't delete Users to avoid dropping the admin user or other related records not cleaned.

  console.log("Database cleaned successfully! Ready for production.");
}

clean()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
