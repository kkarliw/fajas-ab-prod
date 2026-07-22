import type { FastifyPluginAsync } from "fastify";
import { paymentService } from "../services/paymentService.js";
import { orderService } from "../services/orderService.js";
import { sendSuccess } from "../utils/response.js";

export const webhooksRoutes: FastifyPluginAsync = async (app) => {
  app.post("/webhook", async (request, reply) => {
    // Wompi sends events to this webhook
    const event = request.body as any;

    if (!event || !event.signature) {
      return reply.status(400).send({ ok: false, error: "Missing event signature" });
    }

    const isValid = paymentService.verifyWebhookSignature(event);
    
    if (!isValid) {
      app.log.warn(`Invalid Wompi webhook signature for event: ${event.event}`);
      // Return 200 anyway so Wompi doesn't retry infinitely on misconfigured secrets during testing
      return sendSuccess(reply, { received: true, valid: false });
    }

    if (event.event === "transaction.updated") {
      const { transaction } = event.data;
      const reference = transaction.reference;
      
      if (transaction.status === "APPROVED") {
        await orderService.handlePaymentSuccess(reference, transaction.id, transaction.amount_in_cents);
      } else if (transaction.status === "DECLINED" || transaction.status === "ERROR") {
        await orderService.handlePaymentFailure(reference, transaction.id, transaction.amount_in_cents);
      }
    }

    return sendSuccess(reply, { received: true, valid: true });
  });
};
