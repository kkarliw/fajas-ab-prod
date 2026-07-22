import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";

const storeSettingsSchema = z.object({
  standardShippingFee: z.number().min(0),
  expressShippingFee: z.number().min(0),
  freeShippingThreshold: z.number().min(0).optional(),
  contactPhone: z.string(),
  contactEmail: z.string(),
  promoBarText: z.string(),
  promoPopup: z.object({
    enabled: z.boolean(),
    title: z.string(),
    description: z.string(),
    couponCode: z.string(),
    imageUrl: z.string().optional(),
  })
});

const defaultSettings = {
  standardShippingFee: 15000,
  expressShippingFee: 25000,
  contactPhone: "+573167890123",
  contactEmail: "contacto@fajasab.com",
  promoBarText: "ENVÍO GRATIS EN COMPRAS MAYORES A $200.000",
  promoPopup: {
    enabled: true,
    title: "10% de bienvenida",
    description: "Únete a nuestro club exclusivo y recibe un 10% de descuento en tu primera compra, además de acceso previo a nuevos lanzamientos.",
    couponCode: "BIENVENIDA10"
  }
};

export const publicSettingsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request, reply) => {
    try {
      const block = await prisma.contentBlock.findFirst({
        where: { placement: "global", key: "store_settings" }
      });

      if (!block || !block.payloadJson) {
        return sendSuccess(reply, defaultSettings);
      }

      return sendSuccess(reply, block.payloadJson);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al obtener configuraciones." });
    }
  });
};

export const adminSettingsRoutes: FastifyPluginAsync = async (app) => {
  app.patch("/", async (request, reply) => {
    try {
      const data = storeSettingsSchema.parse(request.body);

      const block = await prisma.contentBlock.findFirst({
        where: { placement: "global", key: "store_settings" }
      });

      if (block) {
        await prisma.contentBlock.update({
          where: { id: block.id },
          data: { payloadJson: data }
        });
      } else {
        await prisma.contentBlock.create({
          data: {
            placement: "global",
            key: "store_settings",
            payloadJson: data
          }
        });
      }

      return sendSuccess(reply, data);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al actualizar configuraciones." });
    }
  });
};
