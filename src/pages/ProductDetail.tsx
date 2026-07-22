import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, Heart, ImageOff, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Skeleton from "@/components/ui/Skeleton";
import LazyImage from "@/components/LazyImage";
import SizeCalculatorModal from "@/components/SizeCalculatorModal";
import { formatCOP, type CatalogProduct } from "@/data/catalog";
import { useCart } from "@/context/CartContext";
import { getProductBySlug, getRelated, getProducts } from "@/api/products";
import type { ProductDTO } from "@/types/dtos";

const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL"];

// Removed mapTag since tag now matches the schema 1:1
const toCatalogProduct = (product: ProductDTO): CatalogProduct => {
  const gallery = product.images.map((image) => image.url);
  const sizes = Array.from(new Set(product.variants.map((variant) => variant.size).filter(Boolean) as string[]));
  const colors = Array.from(new Set(product.variants.map((variant) => variant.color).filter(Boolean) as string[]));

  return {
    slug: product.slug,
    name: product.name,
    price: Math.round(product.priceCents / 100),
    originalPrice: product.originalPriceCents ? Math.round(product.originalPriceCents / 100) : undefined,
    image: gallery[0] ?? "",
    gallery,
    tag: product.tag as CatalogProduct["tag"],
    category: product.category as CatalogProduct["category"],
    description: product.description,
    bullets: product.bullets ?? [],
    sizes: sizes.length ? sizes : defaultSizes,
    material: product.material ?? "Lycra",
    control: product.controlLevel,
    uses: product.uses,
    colors: colors.length ? colors : ["Natural", "Arena", "Negro"],
    isOutOfStock: (product as any).isOutOfStock, // Need to cast as any just in case the type isn't fully updated yet, though it should be since it's from backend
  };
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [related, setRelated] = useState<CatalogProduct[]>([]);
  const [size, setSize] = useState<string>(defaultSizes[0]);
  const [activeTab, setActiveTab] = useState<"details" | "fit" | "shipping">("details");
  const [thumb, setThumb] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [sizeCalcOpen, setSizeCalcOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);
  const lastTouchTime = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    if (!slug) return;

    void Promise.all([getProductBySlug(slug), getRelated(slug)]).then(([productData, relatedData]) => {
      if (!mounted) return;
      const mapped = toCatalogProduct(productData);
      setProduct(mapped);
      setRelated(relatedData.map(toCatalogProduct));
      setSize(mapped.sizes[0] ?? defaultSizes[0]);
      setThumb(0);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes[0] ?? defaultSizes[0]);
    setThumb(0);
  }, [product]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return (product.gallery?.length ? product.gallery : [product.image]);
  }, [product]);

  // Fetch all products to use for complements
  const { data: dbProducts = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getProducts
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

  const complements = useMemo(() => {
    if (!product || fullCatalog.length === 0) return [];
    const isMainGarment = ["Fajas", "Brasieres", "Shorts", "Cinturillas"].includes(product.category);
    if (isMainGarment) {
      return fullCatalog.filter((p) => p.category === "Accesorios" && p.slug !== product.slug).slice(0, 4);
    }
    return fullCatalog.filter((p) => ["Fajas", "Brasieres"].includes(p.category) && p.slug !== product.slug).slice(0, 4);
  }, [product, fullCatalog]);

  const hasHeroImage = Boolean(product && (gallery[0] ?? product.image));

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = zoomRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTouchTime.current < DOUBLE_TAP_DELAY) {
      setZoom((prev) => {
        const active = !prev.active;
        if (active) {
          const touch = e.touches[0];
          const el = zoomRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const x = ((touch.clientX - rect.left) / rect.width) * 100;
            const y = ((touch.clientY - rect.top) / rect.height) * 100;
            return { active, x, y };
          }
        }
        return { ...prev, active };
      });
      e.preventDefault();
    }
    lastTouchTime.current = now;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!zoom.active) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    const el = zoomRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoom({ active: true, x, y });
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-cream">
        <Ticker />
        <Navbar />
        <PromoBar />
        <div className="container-luxe py-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/55">
            <Skeleton variant="text" className="h-3 w-16" />
            <Skeleton variant="text" className="h-3 w-3" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        </div>
        <section className="container-luxe pb-16 grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <Skeleton variant="image" className="relative aspect-[3/4] bg-cream-2" />
            <div className="grid grid-cols-4 gap-3 mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="image" className="aspect-square bg-cream-2" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-12 w-4/5" />
            <Skeleton variant="text" className="h-4 w-28" />
            <Skeleton variant="text" className="h-8 w-36" />
            <Skeleton variant="card" className="h-12 bg-cream-2" />
            <Skeleton variant="card" className="h-12 bg-cream-2" />
          </div>
        </section>
      </div>
    );
  }

  const currentGallery = gallery.length ? gallery : [product.image];

  return (
    <div className="min-h-screen bg-cream">
      <Ticker />
      <Navbar />
      <PromoBar />

      <div className="container-luxe py-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/55">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-ink">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="container-luxe pb-16 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div
            ref={zoomRef}
            onMouseMove={handleZoomMove}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="relative aspect-[3/4] overflow-hidden bg-cream-2 group"
            style={zoom.active ? { touchAction: "none" } : undefined}
          >
            {hasHeroImage ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={thumb}
                  src={currentGallery[thumb] ?? currentGallery[0]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className={`w-full h-full object-cover ${zoom.active ? "scale-[2.2] transition-transform duration-100" : "transition-transform duration-300"}`}
                  style={zoom.active ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                />
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink/35">
                <ImageOff size={40} strokeWidth={1.4} />
                <span className="text-[11px] uppercase tracking-[0.18em]">Sin foto disponible</span>
              </div>
            )}

            {/* Left and Right navigation buttons */}
            {hasHeroImage && currentGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumb((prev) => (prev === 0 ? currentGallery.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 hover:bg-background rounded-full border border-border flex items-center justify-center text-ink/75 hover:text-ink transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 duration-200"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={18} strokeWidth={1.2} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumb((prev) => (prev === currentGallery.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 hover:bg-background rounded-full border border-border flex items-center justify-center text-ink/75 hover:text-ink transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 duration-200"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={18} strokeWidth={1.2} />
                </button>
              </>
            )}
            
            {zoom.active && window.matchMedia("(pointer: coarse)").matches && (
              <div className="absolute bottom-4 right-4 bg-ink/75 backdrop-blur-sm text-ink-soft text-[9px] eyebrow tracking-[0.18em] px-3 py-1.5 pointer-events-none z-20">
                Doble toque para alejar
              </div>
            )}
          </div>

          {/* Thumbnails grid */}
          <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: `repeat(${currentGallery.length}, minmax(0, 1fr))` }}>
            {hasHeroImage
              ? currentGallery.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setThumb(i)}
                    className={`aspect-square overflow-hidden border transition-all duration-200 ${thumb === i ? "border-ink ring-1 ring-ink" : "border-border hover:border-ink/50"}`}
                  >
                    <LazyImage src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square border border-border bg-cream-2 flex items-center justify-center text-ink/25">
                    <ImageOff size={20} strokeWidth={1.4} />
                  </div>
                ))}
          </div>
        </div>

        <div className="space-y-6">
          <p className="eyebrow text-gold">{product.category}</p>
          <h1 className="font-display text-[36px] md:text-[48px] leading-[1.05]">{product.name}</h1>
          <div className="flex items-center gap-2 text-[12px] text-ink/60">
            <Check size={14} className="text-gold shrink-0" />
            <span>{product.bullets.length} beneficios incluidos</span>
          </div>
          <p className="font-display text-[24px] text-ink">{formatCOP(product.price)}</p>
          {product.originalPrice && <p className="font-body text-[12px] text-ink/45 line-through">{formatCOP(product.originalPrice)}</p>}

          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="eyebrow text-ink/70">Selecciona talla</p>
              <button
                type="button"
                onClick={() => setSizeCalcOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-gold-dark font-semibold hover:underline bg-gold/10 px-3 py-1 rounded-full border border-gold/20 transition-all hover:bg-gold/20"
              >
                <Sparkles size={13} /> Recomendador de talla inteligente
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-12 h-11 px-3 text-[12px] uppercase tracking-[0.18em] border ${
                    size === s ? "bg-ink text-ink-soft border-ink font-bold" : "border-hairline text-ink/80 hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="eyebrow text-ink/70">Color disponible</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <span key={c} className="px-3 py-2 text-[11px] uppercase tracking-[0.16em] border border-border">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={product.isOutOfStock}
            onClick={() =>
              addItem({
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                size,
              })
            }
            className={`w-full h-12 text-[11px] uppercase tracking-[0.22em] font-bold transition-colors ${
              product.isOutOfStock 
                ? 'bg-cream-2 text-ink/40 cursor-not-allowed border border-hairline' 
                : 'bg-gold hover:bg-gold/90 text-ink'
            }`}
          >
            {product.isOutOfStock ? 'Agotado Temporalmente' : 'Agregar al carrito'}
          </button>

          <div className="grid gap-3 text-[13px] leading-7 text-ink/80">
            <p>{product.description}</p>
            <ul className="space-y-2">
              {product.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check size={16} className="text-gold mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex gap-4 text-[11px] uppercase tracking-[0.18em] border-b border-border pb-px">
              {(["details", "fit", "shipping"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 border-b-2 -mb-px transition-all duration-200 ${
                    activeTab === tab ? "border-ink text-ink font-bold" : "border-transparent text-ink/55 hover:text-ink"
                  }`}
                >
                  {tab === "details" ? "Detalles" : tab === "fit" ? "Ajuste" : "Envíos"}
                </button>
              ))}
            </div>

            <div className="mt-5 text-[13px] text-ink/80 leading-relaxed min-h-[120px]">
              <AnimatePresence mode="wait">
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2.5"
                  >
                    <p><strong>Material:</strong> {product.material}</p>
                    <p><strong>Colores disponibles:</strong> {product.colors.join(", ")}</p>
                    <p><strong>Categoría:</strong> {product.category}</p>
                    <p className="text-[12px] text-ink/55 mt-4 italic">Nuestras prendas están elaboradas con los más altos estándares de calidad, garantizando durabilidad y cuidado de tu piel en el uso diario o posquirúrgico.</p>
                  </motion.div>
                )}

                {activeTab === "fit" && (
                  <motion.div
                    key="fit"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {product.control && (
                      <div>
                        <p className="mb-2"><strong>Nivel de control:</strong> {product.control}</p>
                        {/* Visual control level gauge bar */}
                        <div className="w-full max-w-xs h-1.5 bg-border rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-500 ${
                              product.control.toLowerCase().includes("muy alto") || product.control.toLowerCase().includes("muy alta")
                                ? "w-full bg-gold"
                                : product.control.toLowerCase().includes("alto") || product.control.toLowerCase().includes("alta")
                                ? "w-3/4 bg-gold/90"
                                : "w-2/4 bg-gold/70"
                            }`}
                          />
                        </div>
                        <div className="w-full max-w-xs flex justify-between text-[9px] text-ink/45 mt-1 uppercase tracking-widest font-mono">
                          <span>Bajo</span>
                          <span>Medio</span>
                          <span>Alto</span>
                          <span>Muy Alto</span>
                        </div>
                      </div>
                    )}
                    {product.uses && (
                      <p><strong>Uso recomendado:</strong> {product.uses}</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "shipping" && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2.5"
                  >
                    <p><strong>Envíos nacionales:</strong> Despachamos a toda Colombia de 2 a 5 días hábiles. El costo del envío es calculado al momento del pago según la ubicación de destino.</p>
                    <p><strong>Garantía y devoluciones:</strong> Por ser prendas íntimas de compresión médica y posquirúrgica, por motivos de higiene no se realizan cambios de talla ni devoluciones. La garantía aplica únicamente por defectos de fábrica reportados en las primeras 24 horas posteriores a la entrega.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe pb-12">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-[26px] md:text-[32px] uppercase tracking-tight">También te puede gustar</h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink/60 font-medium">{related.length} productos</span>
        </div>
        <div className="flex overflow-x-auto xl:grid xl:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory pb-4 -mx-4 px-4 xl:mx-0 xl:px-0">
          {related.map((item) => (
            <div key={item.slug} className="w-[78%] sm:w-[45%] xl:w-auto shrink-0 snap-start">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>

      {complements.length > 0 && (
        <section className="container-luxe pb-20 border-t border-border/40 pt-12">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-[26px] md:text-[32px] uppercase tracking-tight">Completa tu look</h2>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink/60 font-medium">Recomendados</span>
          </div>
          <div className="flex overflow-x-auto xl:grid xl:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory pb-4 -mx-4 px-4 xl:mx-0 xl:px-0">
            {complements.map((item) => (
              <div key={item.slug} className="w-[78%] sm:w-[45%] xl:w-auto shrink-0 snap-start">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      <SizeCalculatorModal
        isOpen={sizeCalcOpen}
        onClose={() => setSizeCalcOpen(false)}
        availableSizes={product.sizes}
        onSelectSize={(selectedSize) => setSize(selectedSize)}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;
