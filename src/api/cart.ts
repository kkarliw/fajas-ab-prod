import type { CartDTO, CartItemDTO, CouponDTO } from "@/types/dtos";
import { client } from "./client";

export type EstimateCartPayload = {
  items: CartItemDTO[];
  coupon?: string;
};

export type EstimateCartResponse = CartDTO & {
  coupon?: CouponDTO | null;
};

export async function estimateCart(items: CartItemDTO[], coupon?: string): Promise<EstimateCartResponse> {
  return client.post<EstimateCartResponse>("/api/v1/cart/estimate", { items, coupon });
}

export async function getCart(sessionId?: string): Promise<{ id?: string, items: any[] }> {
  const query = sessionId ? `?sessionId=${sessionId}` : '';
  return client.get(`/api/v1/cart${query}`);
}

export async function addItemToCart(slug: string, size: string, color: string | undefined, quantity: number, sessionId?: string) {
  return client.post("/api/v1/cart/items", { slug, size, color, quantity, sessionId });
}

export async function updateCartItem(itemId: string, quantity: number) {
  return client.patch(`/api/v1/cart/items/${itemId}`, { quantity });
}

export async function removeCartItem(itemId: string) {
  return client.delete(`/api/v1/cart/items/${itemId}`);
}
