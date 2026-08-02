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
  const endpoint = `/api/v1/products${query ? `?${query}` : ""}`;
  
  try {
    const data = await client.get<ProductDTO[]>(endpoint);
    if (Array.isArray(data)) {
      return data;
    }
  } catch (e) {
    // If backend is unavailable or sleeping, fallback to static catalog
  }

  try {
    const staticRes = await fetch("/catalog.json");
    if (staticRes.ok) {
      return await staticRes.json();
    }
  } catch (e) {
    // fallback failed
  }

  return [];
}

export async function getProductBySlug(slug: string): Promise<ProductDTO> {
  try {
    const product = await client.get<ProductDTO>(`/api/v1/products/${encodeURIComponent(slug)}`);
    if (product) return product;
  } catch (e) {
    // Fallback to static catalog.json
  }

  try {
    const staticRes = await fetch("/catalog.json");
    if (staticRes.ok) {
      const staticData: ProductDTO[] = await staticRes.json();
      const product = staticData.find(p => p.slug === slug);
      if (product) return product;
    }
  } catch (e) {}

  throw new Error("Producto no encontrado");
}

export async function getRelated(slug: string): Promise<ProductDTO[]> {
  try {
    const related = await client.get<ProductDTO[]>(`/api/v1/products/${encodeURIComponent(slug)}/related`);
    if (Array.isArray(related)) return related;
  } catch (e) {
    // Fallback to static catalog.json
  }

  try {
    const staticRes = await fetch("/catalog.json");
    if (staticRes.ok) {
      const staticData: ProductDTO[] = await staticRes.json();
      const product = staticData.find(p => p.slug === slug);
      if (product && product.category) {
        return staticData.filter(p => p.category === product.category && p.slug !== slug).slice(0, 4);
      }
    }
  } catch (e) {}

  return [];
}
