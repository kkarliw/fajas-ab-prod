import type { ProductDTO } from "@/types/dtos";
import { client } from "./client";

export type GetProductsFilters = {
  q?: string;
  category?: string;
  tag?: string;
};

export async function getStaticCatalog(): Promise<ProductDTO[]> {
  try {
    const staticRes = await fetch("/catalog.json");
    if (staticRes.ok) {
      return await staticRes.json();
    }
  } catch (e) {}
  return [];
}

export async function getProducts(filters: GetProductsFilters = {}): Promise<ProductDTO[]> {
  const searchParams = new URLSearchParams();
  if (filters.q) searchParams.set("q", filters.q);
  if (filters.category) searchParams.set("category", filters.category);
  if (filters.tag) searchParams.set("tag", filters.tag);

  const query = searchParams.toString();
  const endpoint = `/api/v1/products${query ? `?${query}` : ""}`;

  // If there are search or filter queries, fetch live API directly
  if (query) {
    try {
      const data = await client.get<ProductDTO[]>(endpoint);
      if (Array.isArray(data)) return data;
    } catch (e) {}
    return getStaticCatalog();
  }

  // Hybrid strategy for main page catalog:
  // Return instant static catalog if Render is sleeping (>1.2s),
  // but quietly update UI with live DB data the moment Render responds!
  return new Promise((resolve) => {
    let resolved = false;

    // 1. Start live API fetch
    client.get<ProductDTO[]>(endpoint)
      .then((liveData) => {
        if (Array.isArray(liveData)) {
          if (!resolved) {
            resolved = true;
            resolve(liveData);
          } else {
            // Live API completed after fast fallback timeout.
            // Seamlessly update React Query cache so borrador/archived products disappear!
            if (typeof window !== "undefined" && (window as any).__queryClient) {
              (window as any).__queryClient.setQueryData(["products", "all"], liveData);
            }
          }
        }
      })
      .catch(() => {
        if (!resolved) {
          resolved = true;
          getStaticCatalog().then(resolve);
        }
      });

    // 2. Fast 1.2s timeout fallback so page NEVER hangs while Render awakes
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        getStaticCatalog().then(resolve);
      }
    }, 1200);
  });
}

export async function getProductBySlug(slug: string): Promise<ProductDTO> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    client.get<ProductDTO>(`/api/v1/products/${encodeURIComponent(slug)}`)
      .then((product) => {
        if (product) {
          if (!resolved) {
            resolved = true;
            resolve(product);
          } else {
            if (typeof window !== "undefined" && (window as any).__queryClient) {
              (window as any).__queryClient.setQueryData(["product", slug], product);
            }
          }
        }
      })
      .catch(() => {
        if (!resolved) {
          resolved = true;
          getStaticCatalog()
            .then(staticData => {
              const p = staticData.find(item => item.slug === slug);
              if (p) resolve(p);
              else reject(new Error("Producto no encontrado"));
            })
            .catch(reject);
        }
      });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        getStaticCatalog()
          .then(staticData => {
            const p = staticData.find(item => item.slug === slug);
            if (p) resolve(p);
            else reject(new Error("Producto no encontrado"));
          })
          .catch(reject);
      }
    }, 1200);
  });
}

export async function getRelated(slug: string): Promise<ProductDTO[]> {
  try {
    const related = await client.get<ProductDTO[]>(`/api/v1/products/${encodeURIComponent(slug)}/related`);
    if (Array.isArray(related)) return related;
  } catch (e) {}

  try {
    const staticData = await getStaticCatalog();
    const product = staticData.find(p => p.slug === slug);
    if (product && product.category) {
      return staticData.filter(p => p.category === product.category && p.slug !== slug).slice(0, 4);
    }
  } catch (e) {}

  return [];
}
