import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import catBrasieres from "@/assets/Fajas AB/fotos grupales/_A9A4442.jpg";
import catFajas from "@/assets/Fajas AB/fotos grupales/_A9A4843.jpg";
import catCinturillas from "@/assets/Fajas AB/cinturilla reloj arena/3.jpg";
import catShorts from "@/assets/Fajas AB/short moly/1.jpg";
import catPostop from "@/assets/Fajas AB/fotos grupales/_A9A4461.jpg";
import catAccesorios from "@/assets/Fajas AB/mentonera/1.jpg";

function CatTile({ name, image, query, sub }: { name: string; image: string; query: string; sub: string }) {
  return (
    <Link
      to={`/shop?cat=${encodeURIComponent(query)}`}
      className="group relative overflow-hidden block w-full h-full"
    >
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-3 lg:p-4 text-center">
        <p
          className="text-white uppercase drop-shadow-sm"
          style={{ fontFamily: "'Jost', sans-serif", fontSize: "clamp(10px, 1.1vw, 13px)", fontWeight: 500, letterSpacing: "0.22em" }}
        >
          {name}
        </p>
        <p
          className="text-white/60 uppercase mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block"
          style={{ fontFamily: "'Jost', sans-serif", fontSize: "8px", letterSpacing: "0.2em" }}
        >
          {sub}
        </p>
      </div>
    </Link>
  );
}

const CategoriesSection = () => (
  <section className="bg-cream border-b border-hairline py-8 lg:py-12">
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12">
      <header className="flex items-end justify-between gap-6 mb-6">
        <div>
          <p className="eyebrow text-ink/55 mb-2">Nuestras colecciones</p>
          <h2 className="font-display text-[26px] md:text-[36px] lg:text-[42px] leading-[1] text-ink">
            Compra por <span className="italic text-gold">colección</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="hidden md:inline-flex items-center gap-2 nav-label text-ink hover:text-gold transition-colors shrink-0"
        >
          Ver todas <ArrowRight size={14} strokeWidth={1.6} />
        </Link>
      </header>

      {/*
        MOSAIC LAYOUT (como referencia editorial):
        Mobile:  2 cols stacked
        Desktop: 3 cols × 2 rows, altura fija para que entre en 1 pantalla

        Col 1: Brasieres (alto 2/3) + Shorts (corto 1/3)
        Col 2: Post Quirúrgico (corto 1/3) + Fajas (alto 2/3)
        Col 3: Cinturillas (alto 2/3) + Accesorios (corto 1/3)
      */}

      {/* Mobile: simple 2-col grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:hidden">
        {[
          { name: "Brasieres",       image: catBrasieres,   query: "Brasieres",   sub: "Soporte & moldeo" },
          { name: "Fajas",           image: catFajas,       query: "Fajas",       sub: "Control total" },
          { name: "Cinturillas",     image: catCinturillas, query: "Cinturillas", sub: "Cintura definida" },
          { name: "Shorts",          image: catShorts,      query: "Shorts",      sub: "Perfil ideal" },
          { name: "Post Quirúrgico", image: catPostop,      query: "Fajas",       sub: "Recuperación experta" },
          { name: "Accesorios",      image: catAccesorios,  query: "Accesorios",  sub: "Complementos AB" },
        ].map((c) => (
          <div key={c.name} className="relative aspect-[3/4] overflow-hidden">
            <CatTile {...c} />
          </div>
        ))}
      </div>

      {/* Desktop: 3-col grid regular para que entren bien las fotos sin cortarse */}
      <div className="hidden lg:grid grid-cols-3 gap-3">
        {[
          { name: "Brasieres",       image: catBrasieres,   query: "Brasieres",   sub: "Soporte & moldeo" },
          { name: "Fajas",           image: catFajas,       query: "Fajas",       sub: "Control total" },
          { name: "Cinturillas",     image: catCinturillas, query: "Cinturillas", sub: "Cintura definida" },
          { name: "Shorts",          image: catShorts,      query: "Shorts",      sub: "Perfil ideal" },
          { name: "Post Quirúrgico", image: catPostop,      query: "Fajas",       sub: "Recuperación experta" },
          { name: "Accesorios",      image: catAccesorios,  query: "Accesorios",  sub: "Complementos AB" },
        ].map((c) => (
          <div key={c.name} className="relative aspect-square xl:aspect-[5/4] overflow-hidden">
            <CatTile {...c} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
