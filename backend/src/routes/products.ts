import type { FastifyPluginAsync } from "fastify";
import { productService } from "../services/productService.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";

const getProductsQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
});

export const productsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request, reply) => {
    const query = getProductsQuerySchema.parse(request.query);
    const products = await productService.getProducts(query);
    return sendSuccess(reply, products);
  });

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const product = await productService.getProductBySlug(slug);
    
    if (!product) {
      return reply.status(404).send({ ok: false, error: "Product not found" });
    }
    
    return sendSuccess(reply, product);
  });

  app.get("/:slug/related", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const related = await productService.getRelated(slug);
    return sendSuccess(reply, related);
  });
};
