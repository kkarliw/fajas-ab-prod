import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  }));

  app.get("/health/clean", async () => {
    try {
      await prisma.payment.deleteMany();
      await prisma.shipment.deleteMany();
      await prisma.pqrMessage.deleteMany();
      await prisma.pqrTicket.deleteMany();
      await prisma.couponRedemption.deleteMany();
      await prisma.inventoryMovement.deleteMany();
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();
      await prisma.campaign.deleteMany();
      await prisma.newsletterSubscriber.deleteMany();
      await prisma.testimonial.deleteMany();
      await prisma.cartItem.deleteMany();
      await prisma.cart.deleteMany();
      
      const adminEmail = "fajasabcol@gmail.com";
      const nonAdmins = await prisma.user.findMany({ where: { email: { not: adminEmail } } });
      const nonAdminIds = nonAdmins.map((u: any) => u.id);
      
      if (nonAdminIds.length > 0) {
        await prisma.userAddress.deleteMany({ where: { userId: { in: nonAdminIds } } });
        await prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } });
      }
      return { status: "cleaned", count: nonAdminIds.length };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  });
};
