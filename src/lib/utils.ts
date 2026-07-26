import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { productMedia } from "@/data/catalog";


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

  const noImageSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ESin Imagen%3C/text%3E%3C/svg%3E";
  return noImageSvg;
}
