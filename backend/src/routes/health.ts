import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  }));

  app.get("/health-clean-db", async () => {
    const { prisma } = await import("../lib/prisma.js");
    
    // 1. Delete dependent relations for Orders
    await prisma.payment.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.pqrMessage.deleteMany();
    await prisma.pqrTicket.deleteMany();
    await prisma.couponRedemption.deleteMany();
    await prisma.inventoryMovement.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.newsletterSubscriber.deleteMany();

    // The user wants 3 fake testimonials connected to DB.
    // Let's delete all and create exactly 3.
    await prisma.testimonial.deleteMany();
    
    await prisma.testimonial.createMany({
      data: [
        {
          author: "Laura M.",
          initials: "LM",
          content: "Me encanta la textura de la faja, no se nota debajo de la ropa y moldea hermoso mi figura.",
          rating: 5,
          status: "published"
        },
        {
          author: "Sofía G.",
          initials: "SG",
          content: "Después de mi cirugía, esta faja ha sido mi mejor aliada. Muy cómoda y el nivel de compresión es perfecto.",
          rating: 5,
          status: "published"
        },
        {
          author: "Camila R.",
          initials: "CR",
          content: "Excelente atención al cliente y el envío fue rapidísimo. La faja superó mis expectativas totalmente.",
          rating: 5,
          status: "published"
        }
      ]
    });

    return { status: "cleaned and 3 fake testimonials created" };
  });
};
