import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  console.log("Users:", await prisma.user.count());
  const users = await prisma.user.findMany({ select: { email: true, role: { select: { name: true } } } });
  console.log(users);
  
  console.log("Orders:", await prisma.order.count());
  console.log("Carts:", await prisma.cart.count());
  console.log("Newsletter Subs:", await prisma.newsletterSubscriber.count());
  console.log("Coupons:", await prisma.coupon.count());
  console.log("Testimonials:", await prisma.testimonial.count());
}

check().catch(console.error).finally(() => prisma.$disconnect());
