import type { FastifyPluginAsync } from "fastify";
import { addressService } from "../services/addressService.js";
import { authenticate } from "../middleware/authenticate.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";

const createAddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  department: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional()
});

export const addressesRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = userPayload.sub || userPayload.id;
    const addresses = await addressService.getAddresses(userId);
    return sendSuccess(reply, addresses);
  });

  app.post("/", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = userPayload.sub || userPayload.id;
    const payload = createAddressSchema.parse(request.body);
    const address = await addressService.createAddress(userId, payload);
    return sendSuccess(reply, address, 201);
  });

  app.delete("/:id", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = userPayload.sub || userPayload.id;
    const { id } = request.params as { id: string };
    const result = await addressService.deleteAddress(userId, id);
    return sendSuccess(reply, result);
  });

  app.patch("/:id/default", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = userPayload.sub || userPayload.id;
    const { id } = request.params as { id: string };
    const address = await addressService.setDefaultAddress(userId, id);
    return sendSuccess(reply, address);
  });
};
