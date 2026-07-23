import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authService } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  const isDev = process.env.NODE_ENV === "development";
  const authRateLimit = { max: isDev ? 500 : 50, timeWindow: "15 minutes" };

  app.post(
    "/register",
    { config: { rateLimit: authRateLimit } },
    async (request, reply) => {
      const payload = registerSchema.parse(request.body);
      const result = await authService.register(payload);
      return sendSuccess(reply, result, 201);
    }
  );

  app.post(
    "/login",
    { config: { rateLimit: authRateLimit } },
    async (request, reply) => {
      const payload = loginSchema.parse(request.body);
      const result = await authService.login(payload, reply);
      return sendSuccess(reply, result);
    }
  );

  app.post("/verify-email", async (request, reply) => {
    const payload = z.object({ 
      email: z.string().email(),
      code: z.string().min(6).max(6)
    }).parse(request.body);
    const result = await authService.verifyEmail(payload, reply);
    return sendSuccess(reply, result);
  });

  app.post("/logout", async (_request, reply) => {
    await authService.logout(reply);
    return sendSuccess(reply, { ok: true });
  });

  app.post("/refresh", async (request, reply) => {
    const result = await authService.refresh(request);
    return sendSuccess(reply, result);
  });

  app.post("/forgot-password", async (request, reply) => {
    const payload = z.object({ email: z.string().email() }).parse(request.body);
    const result = await authService.forgotPassword(payload.email);
    return sendSuccess(reply, result);
  });

  app.post("/reset-password", async (request, reply) => {
    const payload = z.object({
      email: z.string().email(),
      code: z.string().min(6).max(6),
      newPassword: z.string().min(8)
    }).parse(request.body);
    const result = await authService.resetPassword(payload);
    return sendSuccess(reply, result);
  });
};
