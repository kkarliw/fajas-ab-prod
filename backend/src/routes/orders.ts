import type { FastifyPluginAsync } from "fastify";
import { orderService } from "../services/orderService.js";
import { paymentService } from "../services/paymentService.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../lib/prisma.js";

const createOrderSchema = z.object({
  cartId: z.string(),
  email: z.string().email(),
  phone: z.string(),
  customerName: z.string(),
  shippingAddress: z.any(),
  billingAddress: z.any().optional(),
  couponCode: z.string().optional(),
});

const confirmPaymentSchema = z.object({
  reference: z.string(),
  transactionId: z.string(),
  amountInCents: z.number(),
});

export const ordersRoutes: FastifyPluginAsync = async (app) => {
  const checkoutRateLimit = { max: process.env.NODE_ENV !== "production" ? 100 : 10, timeWindow: "15 minutes" };

  app.post("/", { config: { rateLimit: checkoutRateLimit } }, async (request, reply) => {
    try {
      const payload = createOrderSchema.parse(request.body);
      
      const order = await orderService.createOrderFromCart(
        payload.cartId,
        payload.email,
        payload.phone,
        payload.customerName,
        payload.shippingAddress,
        payload.billingAddress,
        payload.couponCode
      );
      
      const paymentData = paymentService.getPaymentUrl(order.reference, order.totalCents);
      console.log("PAYMENT DATA RETURNED TO FRONTEND:", paymentData);
      
      return sendSuccess(reply, { order, paymentUrl: paymentData }, 201);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err.message });
    }
  });

  app.post("/confirm-payment", async (request, reply) => {
    // SECURITY HARDENING: In production, block direct unverified payment approvals
    if (process.env.NODE_ENV === "production") {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.status(403).send({ ok: false, error: "Access denied. Production payments must be verified via Wompi Webhook signature." });
      }
    }

    try {
      const payload = confirmPaymentSchema.parse(request.body);
      await orderService.handlePaymentSuccess(payload.reference, payload.transactionId, payload.amountInCents);
      const order = await orderService.getOrderByIdOrReference(payload.reference);
      return sendSuccess(reply, { order });
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err.message });
    }
  });

  app.post("/decline-payment", async (request, reply) => {
    try {
      const payload = confirmPaymentSchema.parse(request.body);
      await orderService.handlePaymentFailure(payload.reference, payload.transactionId, payload.amountInCents);
      const order = await orderService.getOrderByIdOrReference(payload.reference);
      return sendSuccess(reply, { order });
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err.message });
    }
  });

  app.get("/", { preHandler: authenticate }, async (request, reply) => {
    const userPayload = request.user as any;
    const userId = userPayload.sub || userPayload.id;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const orders = await orderService.getOrders(userId, dbUser?.email);
    return sendSuccess(reply, orders);
  });

  app.get("/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userPayload = request.user as any;
    const userId = userPayload.sub || userPayload.id;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    
    const order = await orderService.getOrderByIdOrReference(id);
    
    if (!order) {
      return reply.status(404).send({ ok: false, error: "Order not found" });
    }
    
    if (userPayload.role !== "admin" && order.userId !== userId && order.email !== dbUser?.email) {
      return reply.status(404).send({ ok: false, error: "Order not found" });
    }
    
    return sendSuccess(reply, order);
  });
  const guestRateLimit = { max: process.env.NODE_ENV !== "production" ? 500 : 50, timeWindow: "15 minutes" };

  app.get("/guest/:reference", { config: { rateLimit: guestRateLimit } }, async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const { email } = request.query as { email?: string };

    if (!email) {
      return reply.status(400).send({ ok: false, error: "Email query param required" });
    }

    const order = await orderService.getOrderByIdOrReference(reference);
    
    if (!order || order.email !== email) {
      return reply.status(404).send({ ok: false, error: "Order not found" });
    }
    
    return sendSuccess(reply, order);
  });
};
