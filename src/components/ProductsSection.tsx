import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import { CatalogProduct } from "@/data/catalog";
import ProductCard from "./ProductCard";

const ProductsSection = () => {
  const [active, setActive] = useState<string>("Ver Todo");

  // Fetch all published products once
  const { data: dbProducts = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const res = await getProducts({});
      return res;
    }
  });

  // Calculate dynamic filters based on available products
  const dynamicFilters = useMemo(() => {
    if (!dbProducts || dbProducts.length === 0) return ["Ver Todo"];
    
    const tags = new Set<string>();
    const categories = new Set<string>();
    
    dbProducts.forEach(p => {
      if (p.tag) tags.add(p.tag.toLowerCase());
      if (p.category) categories.add(p.category.toLowerCase());
    });

    const filters = ["Ver Todo"];
    if (tags.has("bestseller")) filters.push("Bestsellers");
    if (tags.has("new")) filters.push("Nuevos");
    if (tags.has("sale")) filters.push("Sale");
    if (tags.has("promo")) filters.push("Promo");

    return filters;
  }, [dbProducts]);

  // Ensure active filter is valid or reset to "Ver Todo"
  useEffect(() => {
    if (dynamicFilters.length > 0 && !dynamicFilters.includes(active)) {
      setActive(dynamicFilters[0]);
    }
  }, [dynamicFilters, active]);

  // Filter products locally based on active tab
  const filteredProducts = useMemo(() => {
    if (active === "Ver Todo") return dbProducts.slice(0, 4);
    
    if (active === "Bestsellers") return dbProducts.filter(p => p.tag === "bestseller").slice(0, 4);
    if (active === "Nuevos") return dbProducts.filter(p => p.tag === "new").slice(0, 4);
    if (active === "Sale") return dbProducts.filter(p => p.tag === "sale").slice(0, 4);
    if (active === "Promo") return dbProducts.filter(p => p.tag === "promo").slice(0, 4);
    
    // Fallback if somehow a category is still active
    return dbProducts.slice(0, 4);
  }, [dbProducts, active]);

  // Map backend ProductDTO to frontend CatalogProduct expected by ProductCard
  const list: CatalogProduct[] = filteredProducts.map(p => ({
    slug: p.slug,
    name: p.name,
    price: p.priceCents / 100,
    originalPrice: p.originalPriceCents ? p.originalPriceCents / 100 : undefined,
    image: p.images?.[0]?.url || "",
    gallery: p.images?.map((i: any) => i.url) || [],
    tag: p.tag as any,
    category: p.category as any,
    description: p.description,
    bullets: [],
    sizes: p.sizes || [],
    material: p.material || "",
    colors: p.colors || [],
    isOutOfStock: p.isOutOfStock,
  }));

  return (
    <section className="bg-cream border-b border-hairline">
      <div className="container-luxe py-16 lg:py-24">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-hairline">
          <div>
            <p className="eyebrow text-ink/55 mb-3">Selección FAJAS AB</p>
            <h2 className="font-display text-[36px] md:text-[44px] leading-[1] text-ink">
              Lo más <span className="italic text-gold">deseado</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 -mx-1 overflow-x-auto" role="tablist" aria-label="Filtros de productos">
            {dynamicFilters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={active === f}
                onClick={() => setActive(f)}
                className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-body transition-all duration-300 border whitespace-nowrap ${
                  active === f
                    ? "bg-ink text-gold-light border-ink"
                    : "bg-transparent text-ink/70 border-hairline hover:border-ink hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-4 sm:gap-y-10 mt-12 min-h-[400px] w-full">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center">
              <span className="text-ink/50 uppercase tracking-widest text-xs">Cargando...</span>
            </div>
          ) : list.length > 0 ? (
            list.map((p) => <ProductCard key={p.slug} product={p} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-ink/10 bg-white/50 rounded-sm">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-6 text-gold border border-hairline/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="font-display text-3xl text-ink mb-3">Próximamente</h3>
              <p className="text-muted-foreground text-[13px] max-w-md text-center leading-relaxed">
                Estamos preparando nuevas y exclusivas referencias para esta selección. Mientras tanto, descubre nuestras prendas favoritas.
              </p>
              <button 
                onClick={() => setActive("Bestsellers")}
                className="mt-8 px-8 py-3 bg-ink text-cream text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-colors"
              >
                Ver Bestsellers
              </button>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link to="/shop" className="btn-outline-ink hover-lift">
            Ver toda la colección <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
