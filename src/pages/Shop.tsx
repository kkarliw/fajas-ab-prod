import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { formatCOP, type CatalogProduct } from "@/data/catalog";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowRight, X, Grid2x2, Grid3x3, LayoutGrid } from "lucide-react";

const chips = ["Bestseller", "Postquirúrgico", "Uso Diario", "Alta Compresión", "Fajas", "Brasieres", "Cinturillas", "Shorts", "Accesorios"];
const colorPalette: Record<string, string> = {
  Cocoa: "#8A5C41",
  Negro: "#1C1A17",
  Arena: "#D4BFA6",
  Natural: "#F7E6D4",
};
const unique = <T,>(items: T[]) => Array.from(new Set(items));
const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const compareSizes = (a: string, b: string) => {
  const ai = sizeOrder.indexOf(a);
  const bi = sizeOrder.indexOf(b);
  if (ai === -1 && bi === -1) return a.localeCompare(b, "es");
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
};
const types = ["Brasieres", "Fajas", "Cinturillas", "Shorts", "Accesorios"];

type Section = "color" | "price" | "type" | "size" | "material" | "availability";

function FilterAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-hairline py-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <span className="eyebrow text-ink">{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="pt-4">{children}</div>}
    </div>
  );
}

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const showFilter = params.get("filter") !== "false";
  const [cols, setCols] = useState<2 | 3 | 4>(3);

  const [chip, setChip] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<Record<Section, boolean>>({
    color: true,
    price: true,
    type: true,
    size: false,
    material: false,
    availability: false,
  });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 400000]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateParams = (entries: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(entries).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const catParam = params.get("cat");
    if (catParam && chips.includes(catParam)) {
      setChip((prev) => (prev === catParam ? prev : catParam));
    } else if (!catParam) {
      setChip((prev) => (prev === null ? prev : null));
    }
  }, [params]);

  const { data: dbProducts = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      return await getProducts();
    }
  });

  const fullCatalog: CatalogProduct[] = useMemo(() => {
    return dbProducts.map(p => ({
      slug: p.slug,
      name: p.name,
      price: p.priceCents / 100,
      originalPrice: p.originalPriceCents ? p.originalPriceCents / 100 : undefined,
      image: p.images?.[0]?.url || "",
      gallery: p.images?.map(i => i.url) || [],
      tag: p.tag as any,
      category: p.category as any,
      isOutOfStock: p.isOutOfStock,
      description: p.description,
      bullets: [],
      sizes: p.sizes || [],
      material: p.material || "",
      colors: p.colors || [],
    }));
  }, [dbProducts]);

  const sizeOptions = useMemo(() => unique(fullCatalog.flatMap((p) => p.sizes)).sort(compareSizes), [fullCatalog]);
  const colors = useMemo(() => unique(fullCatalog.flatMap((p) => p.colors)).map((name) => ({
    name,
    hex: colorPalette[name] ?? "#E1DBD3",
  })), [fullCatalog]);
  const materialOptions = useMemo(() => unique(fullCatalog.map((p) => p.material).filter(Boolean)), [fullCatalog]);

  const filteredProducts = useMemo(() => {
    return fullCatalog.filter((p: CatalogProduct) => {
      if (chip) {
        const fullText = `${p.name} ${p.description || ""} ${p.material || ""}`.toLowerCase();
        if (chip === "Bestseller" && p.tag !== "bestseller") return false;
        else if (chip === "Postquirúrgico" && !fullText.includes("postquir") && !fullText.includes("cirug") && !fullText.includes("recupera")) return false;
        else if (chip === "Uso Diario" && !fullText.includes("diari") && !fullText.includes("confort") && !fullText.includes("diaria")) return false;
        else if (chip === "Alta Compresión" && !fullText.includes("alta") && !fullText.includes("powernet") && !fullText.includes("látex") && !fullText.includes("firme")) return false;
        else if (["Brasieres", "Fajas", "Cinturillas", "Shorts", "Accesorios"].includes(chip) && p.category !== chip)
          return false;
      }
      if (selectedColors.length && !p.colors.some((c) => selectedColors.includes(c))) return false;
      if (selectedTypes.length && !selectedTypes.includes(p.category)) return false;
      if (selectedSizes.length && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
      if (selectedMaterials.length && !selectedMaterials.includes(p.material)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [chip, selectedColors, selectedTypes, selectedSizes, selectedMaterials, priceRange, fullCatalog]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const products = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const FiltersUI = (
    <div>
      <FilterAccordion
        title="Color"
        open={openSection.color}
        onToggle={() => setOpenSection((s) => ({ ...s, color: !s.color }))}
      >
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => {
            const on = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={on}
                aria-label={c.name}
                onClick={() =>
                  setSelectedColors((prev) =>
                    on ? prev.filter((x) => x !== c.name) : [...prev, c.name],
                  )
                }
                className={`w-7 h-7 border ${on ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : "border-hairline"}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            );
          })}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title="Precio"
        open={openSection.price}
        onToggle={() => setOpenSection((s) => ({ ...s, price: !s.price }))}
      >
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={400000}
            step={10000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full accent-[hsl(var(--gold))]"
            aria-label="Precio máximo"
          />
          <div className="flex items-center justify-between text-[12px] text-ink/70 font-body">
            <span>{formatCOP(priceRange[0])}</span>
            <span>{formatCOP(priceRange[1])}</span>
          </div>
        </div>
      </FilterAccordion>

      <FilterAccordion
        title="Tipo de prenda"
        open={openSection.type}
        onToggle={() => setOpenSection((s) => ({ ...s, type: !s.type }))}
      >
        <ul className="space-y-2.5">
          {types.map((t) => {
            const on = selectedTypes.includes(t);
            return (
              <li key={t}>
                <label className="flex items-center gap-3 text-[13px] text-ink/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setSelectedTypes((prev) =>
                        on ? prev.filter((x) => x !== t) : [...prev, t],
                      )
                    }
                    className="accent-[hsl(var(--ink))]"
                  />
                  {t}
                </label>
              </li>
            );
          })}
        </ul>
      </FilterAccordion>

      <FilterAccordion
        title="Talla"
        open={openSection.size}
        onToggle={() => setOpenSection((s) => ({ ...s, size: !s.size }))}
      >
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => {
            const on = selectedSizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setSelectedSizes((prev) =>
                    on ? prev.filter((x) => x !== s) : [...prev, s],
                  )
                }
                className={`min-w-10 h-10 px-3 text-[12px] uppercase tracking-[0.18em] border ${
                  on ? "bg-ink text-ink-soft border-ink" : "border-hairline text-ink/80 hover:border-ink"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title="Material"
        open={openSection.material}
        onToggle={() => setOpenSection((s) => ({ ...s, material: !s.material }))}
      >
        <ul className="space-y-2.5">
          {materialOptions.map((m) => {
            const on = selectedMaterials.includes(m);
            return (
              <li key={m}>
                <label className="flex items-center gap-3 text-[13px] text-ink/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setSelectedMaterials((prev) =>
                        on ? prev.filter((x) => x !== m) : [...prev, m],
                      )
                    }
                    className="accent-[hsl(var(--ink))]"
                  />
                  {m}
                </label>
              </li>
            );
          })}
        </ul>
      </FilterAccordion>

      <FilterAccordion
        title="Disponibilidad"
        open={openSection.availability}
        onToggle={() => setOpenSection((s) => ({ ...s, availability: !s.availability }))}
      >
        <ul className="space-y-2.5">
          <li>
            <label className="flex items-center gap-3 text-[13px] text-ink/80">
              <input type="checkbox" defaultChecked className="accent-[hsl(var(--ink))]" /> En stock
            </label>
          </li>
          <li>
            <label className="flex items-center gap-3 text-[13px] text-ink/80">
              <input type="checkbox" className="accent-[hsl(var(--ink))]" /> Agotado
            </label>
          </li>
        </ul>
      </FilterAccordion>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <Ticker />
      <Navbar />
      <PromoBar />

      {/* Hero banner */}
      <section className="relative bg-ink text-ink-soft overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_rgba(196,164,106,0.25),transparent_60%)]" />
        <div className="container-luxe py-20 lg:py-28 relative text-center">
          <p className="eyebrow text-gold-light/80 mb-5">FAJAS AB</p>
          <h1 className="font-display text-[44px] md:text-[56px] leading-[1] text-ink-soft">
            Toda la <span className="italic text-gold">colección</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto font-body text-[14px] text-ink-soft/70">
            Diseñadas para moldear, estilizar y realzar tu figura natural.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setChip((prev) => (prev === c ? null : c))}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border transition-colors ${
                  chip === c
                    ? "bg-gold-light text-ink border-gold-light"
                    : "border-ink-soft/30 text-ink-soft/85 hover:border-ink-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="container-luxe pt-8 sm:pt-10 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) setDrawerOpen(true);
            else updateParams({ filter: showFilter ? "false" : "true" });
          }}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink hover:text-gold transition-colors"
        >
          <SlidersHorizontal size={14} strokeWidth={1.4} />
          {showFilter ? "Ocultar filtros" : "Mostrar filtros"}
        </button>

        <div className="flex items-center gap-4 sm:gap-6 order-3 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
          <p className="font-body text-[12px] text-ink/60">
            {products.length} de {fullCatalog.length}
          </p>
          <div className="hidden sm:flex items-center gap-1 border border-hairline">
            {([
              { n: 2, Icon: Grid2x2 },
              { n: 3, Icon: Grid3x3 },
              { n: 4, Icon: LayoutGrid },
            ] as const).map(({ n, Icon }) => (
              <button
                key={n}
                onClick={() => setCols(n)}
                aria-label={`Ver ${n} columnas`}
                aria-pressed={cols === n}
                className={`w-9 h-9 inline-flex items-center justify-center transition-colors ${
                  cols === n ? "bg-ink text-ink-soft" : "text-ink/60 hover:text-ink"
                }`}
              >
                <Icon size={14} strokeWidth={1.4} />
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Body */}
      <section className={`container-luxe py-10 grid gap-8 lg:gap-10 ${showFilter ? "lg:grid-cols-[240px_1fr]" : "lg:grid-cols-1"}`}>
        {showFilter && (
          <aside className="hidden lg:block sticky top-24 self-start">
            {FiltersUI}
          </aside>
        )}

        <div>
          <div
            className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 ${
              cols === 2
                ? "lg:grid-cols-2"
                : cols === 3
                ? "lg:grid-cols-3"
                : "lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>


          {!filteredProducts.length && (
            <p className="text-center font-body text-[14px] text-ink/60 py-20">
              No encontramos productos con los filtros seleccionados.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-16 flex items-center justify-center gap-3" aria-label="Paginación">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-label="Anterior"
                  className="w-9 h-9 inline-flex items-center justify-center border border-hairline text-ink hover:border-ink"
                >
                  <ChevronLeft size={14} />
                </button>
              )}

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-9 h-9 inline-flex items-center justify-center text-[12px] ${
                      isCurrent
                        ? "bg-ink text-ink-soft font-semibold"
                        : "border border-hairline text-ink/70 hover:border-ink"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-label="Siguiente"
                  className="w-9 h-9 inline-flex items-center justify-center border border-hairline text-ink hover:border-ink"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </nav>
          )}
        </div>
      </section>

      {/* Mobile drawer for filters */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-cream max-h-[85vh] overflow-y-auto p-6 border-t border-hairline">
            <div className="flex items-center justify-between mb-4">
              <p className="eyebrow text-ink">Filtros</p>
              <button onClick={() => setDrawerOpen(false)} aria-label="Cerrar filtros">
                <X size={18} />
              </button>
            </div>
            {FiltersUI}
            <button
              onClick={() => setDrawerOpen(false)}
              className="btn-ink w-full mt-6"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Shop;
