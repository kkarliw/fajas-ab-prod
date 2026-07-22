import type { ProductDTO } from "@/types/dtos";
import { client } from "./client";

export type GetProductsFilters = {
  q?: string;
  category?: string;
  tag?: string;
};

export async function getProducts(filters: GetProductsFilters = {}): Promise<ProductDTO[]> {
  const searchParams = new URLSearchParams();
  if (filters.q) searchParams.set("q", filters.q);
  if (filters.category) searchParams.set("category", filters.category);
  if (filters.tag) searchParams.set("tag", filters.tag);

  const query = searchParams.toString();
  return await client.get<ProductDTO[]>(`/api/v1/products${query ? `?${query}` : ""}`);
}

export async function getProductBySlug(slug: string): Promise<ProductDTO> {
  return await client.get<ProductDTO>(`/api/v1/products/${encodeURIComponent(slug)}`);
}

export async function getRelated(slug: string): Promise<ProductDTO[]> {
  return await client.get<ProductDTO[]>(`/api/v1/products/${encodeURIComponent(slug)}/related`);
}
