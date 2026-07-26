import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart, formatCOP } from "@/context/CartContext";
import { getProductImageUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import type { CatalogProduct } from "@/data/catalog";

const CollapsiblePolicy = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/40 py-2.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.2em] font-bold text-ink/75 hover:text-ink transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          size={12}
          strokeWidth={1.0}
          className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="mt-2 pl-1 animate-fade-in">{children}</div>}
    </div>
  );
};

const CartDrawer = () => {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, count } = useCart();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const upsellRef = useRef<HTMLDivElement>(null);

  const cartTotal = subtotal;

  const scrollCarousel = (direction: "left" | "right") => {
    const container = upsellRef.current;
    if (!container) return;
    const scrollAmount = 160;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  // Fetch all products to use as upsells
  const { data: dbProducts = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getProducts
  });

  const inCartSlugs = items.map((it) => it.slug);
  
  // Transform DB products to CatalogProduct format for the UI
  const upsellProducts: CatalogProduct[] = dbProducts
    .filter((p) => !inCartSlugs.includes(p.slug))
    .slice(0, 3)
    .map(p => ({
      slug: p.slug,
      name: p.name,
      price: p.priceCents / 100,
      originalPrice: p.originalPriceCents ? p.originalPriceCents / 100 : undefined,
      image: getProductImageUrl(p.images?.[0]?.url, p.slug),
      gallery: p.images?.map(i => i.url) || [],
      tag: (p.tag === "bestseller" ? "Bestseller" : p.tag === "new" ? "Nuevo" : p.tag === "sale" ? "Sale" : null) as any,
      category: p.category as any,
      description: p.description,
      bullets: [],
      sizes: p.sizes || [],
      material: p.material || "",
      colors: p.colors || [],
    }));

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-foreground/45 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
            className="fixed right-0 top-0 z-[101] h-[100dvh] w-full sm:w-[460px] bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <header className="px-5 sm:px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink">
                  MI BOLSA ({count})
                </h2>
                <p className="text-[10px] text-muted-foreground font-body mt-1">
                  Disfruta de envíos nacionales rápidos e impuestos calculados al finalizar la compra.
                </p>
              </div>
              <button
                ref={closeBtnRef}
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="p-2 -mr-2 text-ink/70 hover:text-ink transition-colors focus:outline-none"
              >
                <X size={20} strokeWidth={1.0} />
              </button>
            </header>

            {/* Items & Body List */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-border">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="w-16 h-16 rounded-full bg-cream-2 flex items-center justify-center mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-ink/80">
                      <path d="M5 8h14l1.5 13H3.5L5 8z" />
                      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2 uppercase tracking-wide">Tu bolsa está vacía</h3>
                  <p className="text-xs text-muted-foreground mb-6 max-w-xs leading-relaxed font-body">
                    Descubre nuestras piezas y fajas de alta compresión y empieza a moldear tu silueta ideal.
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center justify-center bg-gold text-ink px-8 py-3.5 text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-gold/90 transition-colors"
                  >
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 p-5 sm:p-6 bg-background">
                      {/* Image */}
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="block w-20 h-24 sm:w-24 sm:h-28 bg-cream-2 overflow-hidden flex-shrink-0 border border-border/50 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={getProductImageUrl(item.image, item.slug)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getProductImageUrl(undefined, item.slug);
                          }}
                        />
                      </Link>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body font-bold">
                            {item.category ? item.category.toUpperCase() : ""}
                          </p>
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="block font-display text-xs font-bold tracking-wider text-ink uppercase hover:text-gold transition-colors mt-0.5 leading-snug"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs font-bold text-ink mt-0.5">
                            {formatCOP(item.price)}
                          </p>

                          <div className="text-[11px] text-ink/75 font-body pt-2 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p>Talla: <span className="font-bold text-ink">{item.size}</span></p>
                              {item.color && (
                                <p>Color: <span className="font-bold text-ink">{item.color}</span></p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 px-2.5 py-1.5 rounded transition-all font-semibold touch-manipulation"
                              aria-label={`Eliminar ${item.name} del carrito`}
                            >
                              <Trash2 size={12} strokeWidth={1.8} />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>

                        {/* Qty Selector */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center justify-between border border-border bg-background w-32 h-10 px-1 rounded">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              aria-label="Disminuir cantidad"
                              className="w-9 h-9 flex items-center justify-center hover:bg-cream-2 active:bg-cream-3 transition-all text-ink rounded active:scale-95 touch-manipulation"
                            >
                              {item.quantity === 1 ? <Trash2 size={14} strokeWidth={1.5} className="text-red-600" /> : <Minus size={14} strokeWidth={1.5} />}
                            </button>
                            <span className="text-sm font-bold tabular-nums text-ink px-2">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              aria-label="Aumentar cantidad"
                              className="w-9 h-9 flex items-center justify-center hover:bg-cream-2 active:bg-cream-3 transition-all text-ink rounded active:scale-95 touch-manipulation"
                            >
                              <Plus size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}



              {/* Frequently Bought Together (Upsell section) */}
              {items.length > 0 && upsellProducts.length > 0 && (
                <div className="p-5 sm:p-6 bg-background">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink">
                      COMPRADOS JUNTOS FRECUENTEMENTE
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollCarousel("left")}
                        className="w-6 h-6 border border-border flex items-center justify-center text-ink/75 hover:text-gold hover:border-gold transition-colors"
                        aria-label="Anterior"
                      >
                        <ChevronLeft size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCarousel("right")}
                        className="w-6 h-6 border border-border flex items-center justify-center text-ink/75 hover:text-gold hover:border-gold transition-colors"
                        aria-label="Siguiente"
                      >
                        <ChevronRight size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  <div ref={upsellRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                    {upsellProducts.map((p) => (
                      <Link
                        key={p.slug}
                        to={`/product/${p.slug}`}
                        onClick={closeCart}
                        className="shrink-0 w-[140px] snap-start group"
                      >
                        <div className="aspect-[3/4] bg-cream-2 overflow-hidden border border-border/50 relative">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <button
                            type="button"
                            className="absolute bottom-2 right-2 w-7 h-7 bg-background rounded-full border border-border flex items-center justify-center text-ink/70 hover:text-gold hover:border-gold transition-colors shadow-sm"
                            aria-label="Ver producto"
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground font-body mt-2 truncate">
                          {p.category}
                        </p>
                        <h4 className="text-[10px] font-bold uppercase tracking-tight text-ink mt-0.5 truncate group-hover:text-gold transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-ink font-semibold mt-0.5">
                          {formatCOP(p.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Policies inside Drawer Scroll Area */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 bg-background border-t border-border/40 text-left space-y-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink mb-3">NUESTRAS POLÍTICAS</h3>
                  <CollapsiblePolicy title="Términos & Condiciones">
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-body pt-1">
                      Al completar tu compra aceptas nuestros términos de servicio. Los pedidos no pueden ser modificados una vez confirmados.
                    </p>
                  </CollapsiblePolicy>
                  <CollapsiblePolicy title="Envíos & Procesamiento">
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-body pt-1">
                      Despachamos a toda Colombia en un plazo estimado de 2 a 5 días hábiles. Los costos de envío finales se calculan en la pantalla de pago según el destino de entrega.
                    </p>
                  </CollapsiblePolicy>
                  <CollapsiblePolicy title="Cambios & Garantía">
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-body pt-1">
                      Por motivos de higiene al tratarse de prendas de compresión de uso íntimo y médico, no se realizan cambios de talla ni devoluciones. La garantía aplica únicamente por defectos de fábrica reportados en las primeras 24 horas tras la entrega.
                    </p>
                  </CollapsiblePolicy>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <footer className="border-t border-border px-5 sm:px-6 py-5 bg-background flex flex-col gap-3">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block text-center bg-gold text-ink py-4 text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-gold/90 transition-colors"
                >
                  {formatCOP(cartTotal)} - Finalizar Compra
                </Link>

                <button
                  onClick={closeCart}
                  className="block text-center text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Seguir comprando
                </button>
              </footer>
            )}
          </motion.aside>
        </Fragment>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
