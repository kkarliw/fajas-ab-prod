import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { formatCOP, type CatalogProduct } from "@/data/catalog";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import logoFajasAb from "@/assets/fajas-ab-logo.png";

type SubLink = { label: string; to: string };
type NavItem = { label: string; to: string; children?: SubLink[] };

const primaryLinks: NavItem[] = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Shop",
    to: "/shop",
    children: [
      { label: "Todos los productos", to: "/shop" },
      { label: "Brasieres", to: "/shop?cat=Brasieres" },
      { label: "Fajas", to: "/shop?cat=Fajas" },
      { label: "Cinturillas", to: "/shop?cat=Cinturillas" },
      { label: "Shorts", to: "/shop?cat=Shorts" },
      { label: "Accesorios", to: "/shop?cat=Accesorios" },
      { label: "Sale", to: "/shop?cat=sale" },
    ],
  },
  {
    label: "Guía",
    to: "/size-guide",
    children: [
      { label: "Guía de tallas", to: "/size-guide" },
      { label: "Uso y cuidado", to: "/care" },
      { label: "Envíos y Garantía", to: "/shipping" },
    ],
  },
  {
    label: "Nosotros",
    to: "/about",
  },
  {
    label: "Contacto",
    to: "/contact",
  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location]);

  // Fetch all products to use for search suggestions
  const { data: dbProducts = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getProducts
  });

  // Transform DB products to CatalogProduct format for the UI
  const fullCatalog: CatalogProduct[] = dbProducts.map(p => ({
    slug: p.slug,
    name: p.name,
    price: p.priceCents / 100,
    originalPrice: p.originalPriceCents ? p.originalPriceCents / 100 : undefined,
    image: p.images?.[0]?.url || "",
    gallery: p.images?.map(i => i.url) || [],
    tag: (p.tag === "bestseller" ? "Bestseller" : p.tag === "new" ? "Nuevo" : p.tag === "sale" ? "Sale" : null) as any,
    category: p.category as any,
    description: p.description,
    bullets: [],
    sizes: p.sizes || [],
    material: p.material || "",
    colors: p.colors || [],
  }));

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50 bg-cream border-b border-hairline"
    >
      <div className="container-luxe">
        <div className="relative flex items-center justify-between h-16 md:h-24">
          {/* LEFT — desktop nav */}
          <nav aria-label="Principal" className="hidden lg:flex items-center gap-7 xl:gap-9">
            {primaryLinks.map((l) => (
              <div key={l.label} className="group relative">
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `nav-link nav-label inline-flex items-center gap-1 text-ink/85 hover:text-ink ${
                      isActive ? "text-ink" : ""
                    }`
                  }
                >
                  {l.label}
                  {l.children && (
                    <ChevronDown size={12} strokeWidth={1.4} className="opacity-60" />
                  )}
                </NavLink>
                {l.children && (
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full pt-3 z-50">
                    <div className="min-w-[220px] bg-cream border border-hairline shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] py-3">
                      {l.children.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className="block px-5 py-2 nav-label text-ink/75 hover:text-ink hover:bg-cream-2 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-ink p-1 -ml-1"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={1.0} /> : <Menu size={22} strokeWidth={1.0} />}
          </button>

          {/* CENTER — Logo */}
          <Link
            to="/"
            aria-label="FAJAS AB — inicio"
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
          >
            <img
              src={logoFajasAb}
              alt="FAJAS AB"
              className="h-14 md:h-20 w-auto select-none"
              draggable={false}
            />
          </Link>

          {/* RIGHT — actions */}
          <div className="flex items-center gap-4 md:gap-5 ml-auto">
            <button
              type="button"
              aria-label="Buscar productos"
              onClick={() => setSearchOpen(true)}
              className="inline-flex text-ink/80 hover:text-ink transition-colors"
            >
              <Search size={18} strokeWidth={1.0} />
            </button>
            <Link
              to="/account"
              aria-label="Mi cuenta"
              className="text-ink/80 hover:text-ink transition-colors hidden sm:inline-flex"
            >
              <User size={18} strokeWidth={1.0} />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Bolsa, ${count} artículos`}
              className="relative inline-flex items-center text-ink/80 hover:text-ink transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                <path d="M5 8h14l1.5 13H3.5L5 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-ink text-cream text-[10px] font-medium rounded-full min-w-[16px] h-[16px] inline-flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar (SKIMS style full-width overlay) */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-foreground/45 backdrop-blur-sm"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
            />
            
            {/* Search Panel */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="relative w-full bg-cream border-b border-hairline py-8 md:py-12 px-4 shadow-2xl"
            >
              <div className="max-w-4xl mx-auto relative">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-0 top-0 p-2 text-ink/70 hover:text-ink transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X size={20} strokeWidth={1.0} />
                </button>
                
                {/* Search Form */}
                <div className="mt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }
                    }}
                    className="flex items-center border-b border-ink/20 pb-3"
                  >
                    <Search size={22} strokeWidth={1.0} className="text-ink/60 mr-4 flex-shrink-0" />
                    <input
                      type="search"
                      autoFocus
                      placeholder="¿Qué estás buscando?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-[18px] md:text-[22px] font-body font-normal text-ink placeholder:text-ink/30 outline-none focus:ring-0 border-0 p-0"
                    />
                  </form>
                </div>

                {/* Suggestions & Popular searches */}
                <div className="mt-8 grid md:grid-cols-3 gap-8">
                  {/* Left Column: Popular Searches */}
                  <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-border/40 pb-6 md:pb-0 md:pr-6">
                    <h3 className="text-[10px] tracking-[0.2em] font-bold text-ink/40 uppercase mb-4">
                      Búsquedas Populares
                    </h3>
                    <ul className="space-y-3">
                      {["Fajas", "Cinturillas", "Shorts", "Brasieres", "Accesorios"].map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery(term);
                            }}
                            className="text-xs tracking-wider uppercase font-bold text-ink/75 hover:text-gold transition-colors text-left"
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Suggested Products */}
                  <div className="md:col-span-2">
                    <h3 className="text-[10px] tracking-[0.2em] font-bold text-ink/40 uppercase mb-4">
                      {searchQuery.trim() ? "Sugerencias de productos" : "Nuestros Bestsellers"}
                    </h3>

                    <div>
                      {(() => {
                        const query = searchQuery.toLowerCase().trim();
                        const suggestions = query 
                          ? fullCatalog.filter(
                              (p) =>
                                p.name.toLowerCase().includes(query) ||
                                p.category.toLowerCase().includes(query) ||
                                p.description.toLowerCase().includes(query)
                            ).slice(0, 4)
                          : fullCatalog.filter(p => p.tag === "Bestseller").slice(0, 4);

                        if (suggestions.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground font-body py-4">
                              No se encontraron resultados para "{searchQuery}"
                            </p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {suggestions.map((p) => (
                              <Link
                                key={p.slug}
                                to={`/product/${p.slug}`}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="group block"
                              >
                                <div className="aspect-[3/4] bg-cream-2 overflow-hidden border border-border/40 relative">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                                <h4 className="text-[10px] font-bold uppercase tracking-tight text-ink mt-2 group-hover:text-gold transition-colors truncate">
                                  {p.name}
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                                  {formatCOP(p.price)}
                                </p>
                              </Link>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            aria-label="Móvil"
            className="lg:hidden border-t border-hairline bg-cream overflow-hidden"
          >
            <div className="container-luxe py-6 flex flex-col gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {primaryLinks.map((l) => (
                <div key={l.label} className="border-b border-hairline/50 pb-2">
                  <NavLink 
                    to={l.to} 
                    className="nav-label text-ink block py-3 text-[14px] font-bold"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </NavLink>
                  {l.children && (
                    <div className="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-gold/30">
                      {l.children.map((s) => (
                        <Link
                          key={s.to}
                          to={s.to}
                          className="font-body text-[14px] text-ink/75 hover:text-ink py-2.5 px-2 active:bg-gold/10 rounded"
                          onClick={() => setOpen(false)}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/account" onClick={() => setOpen(false)} className="nav-label text-ink/70 py-3">Mi cuenta</Link>
                <Link to="/faq" onClick={() => setOpen(false)} className="nav-label text-ink/70 py-3">Preguntas Frecuentes</Link>
                <Link to="/pqr" onClick={() => setOpen(false)} className="nav-label text-ink/70 py-3">Radicar PQR</Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
