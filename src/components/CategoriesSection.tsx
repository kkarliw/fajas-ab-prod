import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// Best full-body shots for each category — using 1.jpg (portrait/full body) not detail shots
import catBrasieres from "@/assets/Fajas AB/fotos grupales/_A9A4442.jpg"; // 3 models brasieres full
import catFajas from "@/assets/Fajas AB/fotos grupales/_A9A4843.jpg";     // 2 models fajas full body
import catCinturillas from "@/assets/Fajas AB/cinturilla reloj arena/3.jpg"; // cinturilla full body
import catShorts from "@/assets/Fajas AB/short moly/1.jpg";               // short full body
import catPostop from "@/assets/Fajas AB/fotos grupales/_A9A4461.jpg";     // 3 models postquirurgico
import catAccesorios from "@/assets/Fajas AB/mentonera/1.jpg";            // mentonera full

type Cat = { name: string; image: string; cta: string; query: string; sub: string; objectPos?: string };

const cats: Cat[] = [
  { name: "Brasieres",       image: catBrasieres,   cta: "Ver brasieres",       query: "Brasieres",   sub: "Soporte & moldeo",         objectPos: "center top" },
  { name: "Fajas",           image: catFajas,       cta: "Ver fajas",           query: "Fajas",       sub: "Control total",            objectPos: "center top" },
  { name: "Cinturillas",     image: catCinturillas, cta: "Ver cinturillas",     query: "Cinturillas", sub: "Cintura definida",         objectPos: "center top" },
  { name: "Shorts",          image: catShorts,      cta: "Ver shorts",          query: "Shorts",      sub: "Perfil ideal",             objectPos: "center top" },
  { name: "Post Quirúrgico", image: catPostop,      cta: "Ver post quirúrgico", query: "Fajas",       sub: "Recuperación experta",    objectPos: "center top" },
  { name: "Accesorios",      image: catAccesorios,  cta: "Ver accesorios",      query: "Accesorios",  sub: "Complementos AB",         objectPos: "center center" },
];

const CategoriesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const translateX = useTransform(scrollYProgress, [0, 1], ["-3%", "4%"]);
  const sidePadding = "clamp(1.8rem, 6vw, 5rem)";

  const scroll = (dir: "prev" | "next") => {
    const el = railRef.current;
    if (!el) return;
    const amt = el.clientWidth * 0.75 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: amt, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="bg-cream border-b border-hairline overflow-hidden">
      <div className="container-luxe pt-16 lg:pt-24 pb-6">
        <header className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ink/55 mb-3">Nuestras colecciones</p>
            <h2 className="font-display text-[32px] md:text-[44px] lg:text-[52px] leading-[1] text-ink">
              Compra por <span className="italic text-gold">colección</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 nav-label text-ink hover:text-gold transition-colors"
          >
            Ver todas <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        </header>
      </div>

      {/* Carousel rail */}
      <div className="relative pb-16 lg:pb-24">
        <motion.div
          ref={railRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none"
          style={{
            paddingLeft: sidePadding,
            paddingRight: sidePadding,
            x: translateX,
          }}
        >
          {cats.map((c) => (
            <Link
              key={c.name}
              to={`/shop?cat=${encodeURIComponent(c.query)}`}
              className="relative shrink-0 snap-start group block"
              style={{ width: "min(78vw, 300px)" }}
            >
              {/* Card image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.06]"
                  style={{ objectPosition: c.objectPos ?? "center top" }}
                />
                {/* Subtle bottom gradient always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Sub label bottom-left */}
                <div className="absolute bottom-14 left-4">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/80 font-body">{c.sub}</span>
                </div>
              </div>
              {/* CTA bar */}
              <div className="absolute left-3 right-3 bottom-3">
                <span className="block w-full bg-white text-ink text-center py-3 nav-label tracking-[0.2em] transition-all duration-300 group-hover:bg-ink group-hover:text-white">
                  {c.cta}
                </span>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Prev/Next arrows */}
        <button
          type="button"
          aria-label="Anterior categoría"
          onClick={() => scroll("prev")}
          className="hidden md:inline-flex absolute left-4 top-[45%] -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.10)] transition-transform hover:scale-105 z-10"
        >
          <ArrowLeft size={16} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          aria-label="Siguiente categoría"
          onClick={() => scroll("next")}
          className="hidden md:inline-flex absolute right-4 top-[45%] -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.10)] transition-transform hover:scale-105 z-10"
        >
          <ArrowRight size={16} strokeWidth={1.6} />
        </button>
      </div>
    </section>
  );
};

export default CategoriesSection;
