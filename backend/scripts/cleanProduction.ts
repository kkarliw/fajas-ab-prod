import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  console.log("Cleaning database for production handover...");
  
  // 1. Transactions
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
  
  console.log("Cleaning campaigns, subscribers, and testimonials...");
  await prisma.campaign.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.testimonial.deleteMany();
  
  console.log("Cleaning carts...");
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  
  console.log("Cleaning non-admin users...");
  const adminEmail = "fajasabcol@gmail.com";
  
  // Find all users except the admin
  const nonAdmins = await prisma.user.findMany({
    where: { 
      email: { not: adminEmail } 
    }
  });
  
  const nonAdminIds = nonAdmins.map(u => u.id);
  
  if (nonAdminIds.length > 0) {
    // Delete their addresses first
    await prisma.userAddress.deleteMany({
      where: { userId: { in: nonAdminIds } }
    });
    
    // Delete the users
    await prisma.user.deleteMany({
      where: { id: { in: nonAdminIds } }
    });
    console.log(`Deleted ${nonAdminIds.length} test users.`);
  } else {
    console.log("No test users found to delete.");
  }

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
