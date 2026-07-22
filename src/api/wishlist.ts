import type { ProductDTO } from "@/types/dtos";
import { getProducts } from "./products";
import { mockDelay } from "./client";

export async function getWishlist(): Promise<ProductDTO[]> {
  // TODO: replace mock with client.get(...)
  await mockDelay();
  return (await getProducts()).slice(0, 3);
}

export async function addToWishlist(id: string | number): Promise<{ ok: true; id: string | number }> {
  // TODO: replace mock with client.post(...)
  await mockDelay();
  return { ok: true, id };
}

export async function removeFromWishlist(id: string | number): Promise<{ ok: true; id: string | number }> {
  // TODO: replace mock with client.post(...)
  await mockDelay();
  return { ok: true, id };
}
