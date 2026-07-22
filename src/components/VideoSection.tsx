import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const videos = [
  {
    src: "/videos/faja-ariadna.mp4",
    poster: "",
    label: "Faja ARIADNA",
    sub: "Bestseller · Fajas",
    href: "/shop?cat=Fajas",
  },
  {
    src: "/videos/hero-video-1.mp4",
    poster: "",
    label: "Colección 2025",
    sub: "Sesión editorial",
    href: "/shop",
  },
  {
    src: "/videos/faja-samy.mp4",
    poster: "",
    label: "Faja SAMY",
    sub: "Nuevo · Con brasier",
    href: "/shop?cat=Fajas",
  },
];

const VideoSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const inView = useInView(sectionRef, { once: false, margin: "-120px" });

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      if (inView) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [inView]);

  return (
    <section ref={sectionRef} className="bg-[#0f0d0a] border-b border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-10 lg:px-16 pt-14 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.28em] text-[10px] text-[#d4af7a]/60 font-body mb-3">En movimiento · FAJAS AB</p>
          <h2 className="font-display font-light text-white leading-[0.92] text-[32px] md:text-[46px] lg:text-[56px]">
            Prendas que <span className="italic text-[#d4af7a]">se sienten</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/40 hover:text-[#d4af7a] transition-colors self-start md:self-end"
        >
          Ver toda la colección <ArrowRight size={13} strokeWidth={1.6} />
        </Link>
      </div>

      {/* 3 videos side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
        {videos.map((v, i) => (
          <motion.div
            key={v.src}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
            className="relative group overflow-hidden aspect-[9/14] md:aspect-[9/14] cursor-pointer"
          >
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={v.src}
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
            />
            {/* Always-on gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/55 font-body mb-1.5">{v.sub}</p>
              <h3 className="font-display text-white text-[20px] md:text-[22px] leading-tight mb-3">{v.label}</h3>
              <Link
                to={v.href}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#d4af7a] hover:gap-3 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                Ver prenda <ArrowRight size={11} strokeWidth={1.6} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA strip */}
      <div className="px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 border-t border-white/8">
        <p className="font-body text-[13px] text-white/40 max-w-sm text-center sm:text-left leading-relaxed">
          Todas nuestras prendas son elaboradas artesanalmente en Colombia con materiales premium.
        </p>
        <Link
          to="/shop"
          className="shrink-0 bg-[#d4af7a] text-[#0f0d0a] uppercase tracking-[0.22em] text-[11px] font-medium px-8 py-3.5 inline-flex items-center gap-2 hover:bg-white transition-colors duration-300"
        >
          Comprar ahora <ArrowRight size={13} strokeWidth={1.6} />
        </Link>
      </div>
    </section>
  );
};

export default VideoSection;
