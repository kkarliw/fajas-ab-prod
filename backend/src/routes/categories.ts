import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";

export const categoriesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request, reply) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" }
      });
      return sendSuccess(reply, categories);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al obtener categorías" });
    }
  });
};
