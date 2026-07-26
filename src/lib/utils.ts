import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { productMedia } from "@/data/catalog";
import product1 from "@/assets/product-1.jpg";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const slugify = (s?: string): string => {
  if (!s) return "";
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export function getProductImageUrl(url?: string, slugOrName?: string): string {
  if (url && (url.includes("placeholder") || url.startsWith("/placeholder"))) {
    url = undefined;
  }

  if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:"))) {
    return url;
  }

  if (url && url.startsWith("/uploads/")) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://fajas-ab-prod.onrender.com";
    return `${baseUrl}${url}`;
  }

  const slugKey = slugify(slugOrName);
  if (slugKey && productMedia[slugKey]?.[0]) {
    return productMedia[slugKey][0];
  }

  if (slugKey) {
    const keyMatch = Object.keys(productMedia).find(
      (k) => slugKey.includes(k) || k.includes(slugKey)
    );
    if (keyMatch && productMedia[keyMatch]?.[0]) {
      return productMedia[keyMatch][0];
    }
  }

  return product1;
}
