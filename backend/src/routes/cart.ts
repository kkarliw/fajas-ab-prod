import type { FastifyPluginAsync } from "fastify";
import { cartService } from "../services/cartService.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const addItemSchema = z.object({
  slug: z.string(),
  size: z.string(),
  quantity: z.number().min(1).default(1),
  sessionId: z.string().optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().min(1),
});

const getSessionId = (request: any) => {
  return request.headers['x-session-id'] || request.query.sessionId || null;
};

export const cartRoutes: FastifyPluginAsync = async (app) => {
  // Decode + verify JWT from Authorization header without needing reply context.
  // Returns the userId (sub claim) or null for guests / invalid tokens.
  // This allows a Bearer-only request (no x-session-id) to work for logged-in users.
  function extractUserId(request: any): string | null {
    const authHeader = request.headers.authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    try {
      const decoded = app.jwt.verify(token) as any;
      // JWT payload uses 'sub' for user ID (set during login/register)
      return decoded?.sub ?? decoded?.id ?? null;
    } catch {
      return null; // expired / invalid — treat as guest
    }
  }

  app.get("/", async (request, reply) => {
    const userId = extractUserId(request);
    const sessionId = getSessionId(request);

    if (!userId && !sessionId) {
      return sendSuccess(reply, { items: [] });
    }

    const cart = await cartService.getCart(userId ?? undefined, sessionId ?? undefined);
    return sendSuccess(reply, cart || { items: [] });
  });

  app.post("/items", async (request, reply) => {
    const userId = extractUserId(request);
    const payload = addItemSchema.parse(request.body);
    const sessionId = payload.sessionId || getSessionId(request);

    if (!userId && !sessionId) {
      return reply.status(400).send({ ok: false, error: "Authentication or sessionId required" });
    }

    const cart = await cartService.getOrCreateCart(userId ?? undefined, sessionId ?? undefined);

    try {
      const item = await cartService.addItem(cart.id, payload.slug, payload.size, payload.quantity);
      return sendSuccess(reply, item);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err.message });
    }
  });

  app.patch("/items/:id", async (request, reply) => {
    const userId = extractUserId(request);
    const { id } = request.params as { id: string };
    const payload = updateItemSchema.parse(request.body);
    const sessionId = getSessionId(request);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true }
    });

    if (!cartItem) {
      return reply.status(404).send({ ok: false, error: "Item not found" });
    }

    // Logged-in user must own the cart; guest must own by sessionId
    const ownsCart =
      (userId !== null && cartItem.cart.userId === userId) ||
      (userId === null && sessionId !== null && cartItem.cart.sessionId === sessionId);

    if (!ownsCart) {
      return reply.status(404).send({ ok: false, error: "Item not found" });
    }

    try {
      const item = await cartService.updateItemQuantity(id, payload.quantity);
      return sendSuccess(reply, item);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err.message });
    }
  });

  app.delete("/items/:id", async (request, reply) => {
    const userId = extractUserId(request);
    const { id } = request.params as { id: string };
    const sessionId = getSessionId(request);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true }
    });

    if (!cartItem) {
      return reply.status(404).send({ ok: false, error: "Item not found" });
    }

    const ownsCart =
      (userId !== null && cartItem.cart.userId === userId) ||
      (userId === null && sessionId !== null && cartItem.cart.sessionId === sessionId);

    if (!ownsCart) {
      return reply.status(404).send({ ok: false, error: "Item not found" });
    }

    await cartService.removeItem(id);
    return sendSuccess(reply, { success: true });
  });

  app.post("/estimate", async (request, reply) => {
    const { items } = request.body as any;

    const subtotalCents = items.reduce((acc: number, item: any) => acc + (item.priceCents * item.quantity), 0);
    const shippingCents = subtotalCents > 15000000 ? 0 : 1500000;
    const totalCents = subtotalCents + shippingCents;

    return sendSuccess(reply, {
      items,
      subtotalCents,
      shippingCents,
      discountCents: 0,
      totalCents,
      coupon: null
    });
  });
};
