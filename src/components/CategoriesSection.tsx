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
      <div className="relative pb-16 lg:pb-24 container-luxe">
        <div
          ref={railRef}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 pb-2"
        >
          {cats.map((c) => (
            <Link
              key={c.name}
              to={`/shop?cat=${encodeURIComponent(c.query)}`}
              className="group block relative overflow-hidden bg-[#F0E0D0]/30 transition-all duration-500 rounded-none w-full shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              {/* Aspect ratio container specific to fajas layout */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />
                
                {/* Overlay gradient - more subtle, focused on bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17]/80 via-[#1C1A17]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col items-center text-center transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-display text-[18px] md:text-[24px] text-white tracking-widest uppercase mb-2 drop-shadow-sm">
                    {c.name}
                  </h3>
                  <div className="overflow-hidden h-[0px] group-hover:h-[24px] transition-all duration-500 ease-out">
                    <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-semibold text-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      Explorar <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
