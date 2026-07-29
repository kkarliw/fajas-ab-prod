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
  
  if (!query) {
    try {
      const staticRes = await fetch("/catalog.json");
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        // Fire background request to wake up Render server quietly
        client.get<ProductDTO[]>('/api/v1/products').catch(() => {});
        return staticData;
      }
    } catch (e) {
      // fallback to standard API
    }
  }

  return await client.get<ProductDTO[]>(`/api/v1/products${query ? `?${query}` : ""}`);
}

export async function getProductBySlug(slug: string): Promise<ProductDTO> {
  try {
    const staticRes = await fetch("/catalog.json");
    if (staticRes.ok) {
      const staticData: ProductDTO[] = await staticRes.json();
      const product = staticData.find(p => p.slug === slug);
      if (product) {
        client.get<ProductDTO>(`/api/v1/products/${encodeURIComponent(slug)}`).catch(() => {});
        return product;
      }
    }
  } catch (e) {
    // fallback
  }
  return await client.get<ProductDTO>(`/api/v1/products/${encodeURIComponent(slug)}`);
}

export async function getRelated(slug: string): Promise<ProductDTO[]> {
  try {
    const staticRes = await fetch("/catalog.json");
    if (staticRes.ok) {
      const staticData: ProductDTO[] = await staticRes.json();
      const product = staticData.find(p => p.slug === slug);
      if (product && product.category) {
        const related = staticData.filter(p => p.category === product.category && p.slug !== slug).slice(0, 4);
        client.get<ProductDTO[]>(`/api/v1/products/${encodeURIComponent(slug)}/related`).catch(() => {});
        return related;
      }
    }
  } catch (e) {
    // fallback
  }
  return await client.get<ProductDTO[]>(`/api/v1/products/${encodeURIComponent(slug)}/related`);
}
