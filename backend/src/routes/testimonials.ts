import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";

const createTestimonialSchema = z.object({
  name: z.string().min(2),
  rating: z.number().min(1).max(5),
  content: z.string().min(10)
});

export const testimonialsRoutes: FastifyPluginAsync = async (app) => {
  // Get approved testimonials for the public store
  app.get("/", async (request, reply) => {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(reply, testimonials);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: "Error al obtener reseñas." });
    }
  });

  // Submit a new testimonial from the public store
  app.post("/", async (request, reply) => {
    try {
      const data = createTestimonialSchema.parse(request.body);
      const testimonial = await prisma.testimonial.create({
        data: {
          name: data.name,
          rating: data.rating,
          content: data.content,
          status: "pending", // Store reviews start as pending
          source: "store"
        }
      });
      return sendSuccess(reply, testimonial, 201);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al crear la reseña." });
    }
  });
};
