import type { FastifyPluginAsync } from "fastify";
import { authRoutes } from "./auth.js";
import { cartRoutes } from "./cart.js";
import { categoriesRoutes } from "./categories.js";
import { ordersRoutes } from "./orders.js";
import { productsRoutes } from "./products.js";
import { webhooksRoutes } from "./webhooks.js";
import { adminRoutes } from "./admin.js";
import { uploadRoutes } from "./upload.js";
import { healthRoutes } from "./health.js";
import { couponsRoutes } from "./coupons.js";
import { pqrRoutes } from "./pqr.js";
import { testimonialsRoutes } from "./testimonials.js";
import { subscribersRoutes } from "./subscribers.js";
import { publicSettingsRoutes, adminSettingsRoutes } from "./settings.js";
import { addressesRoutes } from "./addresses.js";
import { authenticate } from "../middleware/authenticate.js";
import { authService } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional()
});

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(productsRoutes, { prefix: "/products" });
  await app.register(categoriesRoutes, { prefix: "/categories" });
  await app.register(cartRoutes, { prefix: "/cart" });
  await app.register(ordersRoutes, { prefix: "/orders" });
  await app.register(webhooksRoutes, { prefix: "/payments" });
  await app.register(adminRoutes, { prefix: "/admin" });
  await app.register(uploadRoutes, { prefix: "/admin" });
  await app.register(couponsRoutes, { prefix: "/coupons" });
  await app.register(pqrRoutes, { prefix: "/pqr" });
  await app.register(testimonialsRoutes, { prefix: "/testimonials" });
  await app.register(subscribersRoutes, { prefix: "/subscribers" });
  await app.register(publicSettingsRoutes, { prefix: "/settings" });
  await app.register(addressesRoutes, { prefix: "/addresses" });
  await app.register(healthRoutes);
  
  // Register admin settings route with admin authentication
  await app.register(async (adminApp) => {
    adminApp.addHook("preHandler", authenticate);
    adminApp.addHook("preHandler", async (req, reply) => {
      // Inline simple admin check, since authenticateAdmin might not be easily importable here without cycle
      const user = (req as any).user;
      if (!user || user.role !== "admin") {
        return reply.status(403).send({ ok: false, error: "Requiere rol de administrador" });
      }
    });
    await adminApp.register(adminSettingsRoutes);
  }, { prefix: "/admin/settings" });

  app.get("/me", { preHandler: authenticate }, async (request, reply) => {
    const result = await authService.me(request);
    return sendSuccess(reply, result.user);
  });

  app.patch("/me", { preHandler: authenticate }, async (request, reply) => {
    const payload = updateMeSchema.parse(request.body);
    const result = await authService.updateMe(request, payload);
    return sendSuccess(reply, result.user);
  });
};
