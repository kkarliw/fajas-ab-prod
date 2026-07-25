import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let productsCache: { key: string; data: any; expiresAt: number } | null = null;

export const invalidateProductCache = () => {
  productsCache = null;
};

export const productService = {
  async getProducts(filters: { q?: string; category?: string; tag?: string }) {
    const cacheKey = JSON.stringify(filters || {});
    const now = Date.now();

    if (productsCache && productsCache.key === cacheKey && productsCache.expiresAt > now) {
      return productsCache.data;
    }

    const where: any = { status: 'published' };
    
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
      ];
    }
    
    if (filters.category) {
      where.category = {
        slug: filters.category.toLowerCase()
      };
    }
    
    if (filters.tag) {
      where.tag = filters.tag;
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
      },
    });

    const result = products.map(mapToDTO);
    productsCache = {
      key: cacheKey,
      data: result,
      expiresAt: now + 5 * 60 * 1000 // Cache for 5 minutes
    };

    return result;
  },

  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
      },
    });

    if (!product) return null;
    return mapToDTO(product);
  },

  async getRelated(slug: string) {
    const currentProduct = await prisma.product.findUnique({
      where: { slug },
      select: { categoryId: true },
    });

    if (!currentProduct) return [];

    const related = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        slug: { not: slug },
        status: 'published',
      },
      take: 4,
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
      },
    });

    return related.map(mapToDTO);
  },
};

import { Prisma } from '@prisma/client';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
    images: {
      orderBy: { sortOrder: 'asc' };
    };
  };
}>;

function mapToDTO(product: ProductWithRelations) {
  // Extract unique sizes and colors from variants
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(new Set(product.variants.map((v) => v.colorName).filter(Boolean))) as string[];
  
  // Find original price if there's any variant with a different compareAt price, else fallback
  const compareAtPriceCents = product.compareAtPriceCents;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category.name as any,
    tag: product.tag as any,
    priceCents: product.basePriceCents,
    originalPriceCents: compareAtPriceCents || null,
    material: product.material || "",
    control: product.controlLevel || "",
    uses: product.uses || "",
    bullets: [], // We didn't store bullets in db, we could parse description or leave empty
    sizes,
    colors,
    stock: product.variants.reduce((acc, v) => acc + v.stock, 0),
    isOutOfStock: product.variants.reduce((acc, v) => acc + v.stock, 0) === 0,
    status: product.status as any,
    seoTitle: product.seoTitle || `${product.name} | FAJAS AB`,
    seoDescription: product.seoDescription || product.description,
    variants: product.variants.map((v) => ({
      id: v.id,
      productId: product.id,
      size: v.size || "",
      color: v.colorName || "",
      sku: v.sku,
      stock: v.stock,
      priceCents: v.priceCents || product.basePriceCents,
      status: v.status as any,
    })),
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || product.name,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    })),
  };
}
