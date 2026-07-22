import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";

const validateCouponSchema = z.object({
  code: z.string(),
  cartTotal: z.number().min(0)
});

export const couponsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/validate", async (request, reply) => {
    try {
      const { code, cartTotal } = validateCouponSchema.parse(request.body);
      
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (!coupon) {
        return reply.status(404).send({ ok: false, error: "Cupón no encontrado." });
      }

      if (coupon.status !== "active") {
        return reply.status(400).send({ ok: false, error: "Este cupón no está activo." });
      }

      const now = new Date();
      if (coupon.startsAt && coupon.startsAt > now) {
        return reply.status(400).send({ ok: false, error: "Este cupón aún no es válido." });
      }

      if (coupon.endsAt && coupon.endsAt < now) {
        return reply.status(400).send({ ok: false, error: "Este cupón ha expirado." });
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return reply.status(400).send({ ok: false, error: "Este cupón ha superado el límite de usos." });
      }

      if (coupon.minOrderCents && cartTotal < coupon.minOrderCents) {
        return reply.status(400).send({ ok: false, error: `Este cupón requiere una compra mínima de $${(coupon.minOrderCents / 100).toLocaleString()}` });
      }

      // Calculate discount
      let discountCents = 0;
      if (coupon.type === "fixed" && coupon.value) {
        discountCents = coupon.value * 100;
      } else if (coupon.type === "percentage" && coupon.value) {
        discountCents = Math.floor((cartTotal * coupon.value) / 100);
      } else if (coupon.type === "free_shipping") {
        // We handle free shipping separately, for now discount is 0 but we return the type
        discountCents = 0;
      }

      // Cap discount to cart total
      if (discountCents > cartTotal) {
        discountCents = cartTotal;
      }

      return sendSuccess(reply, {
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discountCents
      });

    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al validar el cupón." });
    }
  });
};
