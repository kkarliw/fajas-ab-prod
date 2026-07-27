import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cartService = {
  async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) return null;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return cart;
  },

  async createCart(userId?: string, sessionId?: string) {
    return await prisma.cart.create({
      data: {
        userId,
        sessionId,
      },
      include: { items: { include: { product: true, variant: true } } },
    });
  },

  async getOrCreateCart(userId?: string, sessionId?: string) {
    let cart = await this.getCart(userId, sessionId);
    if (!cart) {
      cart = await this.createCart(userId, sessionId);
    }
    return cart;
  },

  async addItem(cartId: string, slug: string, size: string, color: string | undefined, quantity: number) {
    // Look up product and variant
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) throw new Error("Product not found");

    const variant = await prisma.productVariant.findFirst({
      where: { 
        productId: product.id, 
        size,
        ...(color ? { colorName: color } : {})
      }
    });
    
    if (!variant) throw new Error(`Variant not found for size ${size}${color ? ` and color ${color}` : ''}`);

    const productId = product.id;
    const variantId = variant.id;

    if (variant.stock - variant.reservedStock < quantity) {
      throw new Error("Not enough stock available");
    }

    // Check if item exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId, productId, variantId },
    });

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true, variant: true },
      });
    }

    return await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId,
        quantity,
      },
      include: { product: true, variant: true },
    });
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { variant: true } });
    if (!item || !item.variant) throw new Error("Item not found");

    if (item.variant.stock - item.variant.reservedStock < quantity) {
      throw new Error("Not enough stock available");
    }

    return await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true, variant: true },
    });
  },

  async removeItem(itemId: string) {
    return await prisma.cartItem.delete({
      where: { id: itemId },
    });
  },

  async mergeCarts(sessionId: string, userId: string) {
    const sessionCart = await prisma.cart.findFirst({ where: { sessionId }, include: { items: true } });
    if (!sessionCart || sessionCart.items.length === 0) return;

    const userCart = await this.getOrCreateCart(userId);

    for (const item of sessionCart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: userCart.id, productId: item.productId, variantId: item.variantId },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { cartId: userCart.id },
        });
      }
    }

    // Delete session cart
    await prisma.cart.delete({ where: { id: sessionCart.id } });
  }
};
