import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { api } from "@/api";
import img1 from "@/assets/Fajas AB/fotos grupales/_A9A4285.jpg";
import img2 from "@/assets/Fajas AB/fotos grupales/_A9A4288.jpg";
import img3 from "@/assets/Fajas AB/fotos grupales/_A9A4477.jpg";

const imagePositions = ["center 18%", "center 22%", "center 12%"] as const;

const defaultReviews = [
  {
    quote: "La faja Ariadna es de otro mundo. Cómoda, no se marca en la ropa y comprime justo lo necesario. ¡Súper recomendada!",
    author: "MILENA GÓMEZ",
    meta: "★★★★★",
    image: img1,
    source: "store"
  },
  {
    quote: "Excelente atención por WhatsApp y la calidad de las prendas es impecable. El bra Emy es súper suave para el postquirúrgico.",
    author: "SANDRA V.",
    meta: "★★★★★",
    image: img2,
    source: "store"
  },
  {
    quote: "Llegó súper rápido a Medellín. La tabla abdominal y la faja me ayudaron muchísimo en mi recuperación. 10/10.",
    author: "VALENTINA RESTREPO",
    meta: "★★★★★",
    image: img3,
    source: "store"
  }
];

const Reviews = () => {
  const [reviewsList, setReviewsList] = useState<any[]>(defaultReviews);
  const [i, setI] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.testimonials.getTestimonials();
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map((t: any, idx: number) => ({
            quote: t.content,
            author: t.name.toUpperCase(),
            meta: `${"★".repeat(t.rating)}`,
            image: idx % 3 === 0 ? img1 : idx % 3 === 1 ? img2 : img3,
            source: t.source
          }));
          setReviewsList(mapped);
        }
      } catch {
        // Keeps defaultReviews if backend is offline or sleeping
      }
    };
    
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviewsList.length === 0) return;
    const t = setInterval(() => {
      setI((x) => (x + 1) % reviewsList.length);
    }, 7000);
    return () => clearInterval(t);
  }, [reviewsList]);

  if (reviewsList.length === 0) {
    return null;
  }

  const r = reviewsList[i];

  return (
    <section className="bg-cream-2 border-b border-hairline overflow-hidden">
      <div className="grid lg:grid-cols-2 min-h-[380px]">
        {/* Image side */}
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={i}
              src={r.image}
              alt="Clienta FAJAS AB"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: imagePositions[i] }}
              loading="lazy"
              width="600"
              height="800"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-cream-2 via-cream-2/10 to-transparent lg:bg-gradient-to-r" />
        </div>

        {/* Text side */}
        <div className="container-luxe py-16 lg:py-24 flex flex-col justify-center text-center lg:text-left">
          <p className="eyebrow text-ink/55 mb-6">Lo que dicen nuestras clientas</p>
          <div className="flex items-center justify-center lg:justify-start gap-1 mb-8" aria-label="5 estrellas">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star key={k} size={16} strokeWidth={1.4} className="fill-gold text-gold" />
            ))}
            {r.source === "google" && (
              <div className="ml-3 px-2 py-0.5 bg-white rounded-full flex items-center gap-1.5 border border-black/5 shadow-sm">
                <svg viewBox="0 0 24 24" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[9px] font-semibold text-gray-700 tracking-wide uppercase">Google</span>
              </div>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="font-display italic text-ink text-[22px] md:text-[26px] leading-snug max-w-lg"
            >
              "{r.quote}"
            </motion.blockquote>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={`meta-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="mt-8 eyebrow text-ink/70">{r.author}</p>
              <p className="font-body text-[12px] text-ink/55 mt-1">{r.meta}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-3" role="tablist" aria-label="Reseñas">
            {reviewsList.map((_, k) => (
              <button
                key={k}
                role="tab"
                aria-selected={k === i}
                aria-label={`Ver reseña ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-1.5 transition-all ${k === i ? "w-8 bg-ink" : "w-3 bg-ink/25 hover:bg-ink/50"}`}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to="/testimonios/nuevo"
              className="inline-flex w-full sm:w-fit items-center justify-center bg-gold px-7 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-ink transition-colors hover:bg-gold/85"
            >
              Agregar testimonio
            </Link>
            <a
              href="https://share.google/PB0NTKFBelxgbQeGi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-fit items-center justify-center gap-2 border border-black/10 bg-white px-7 py-3 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-ink shadow-sm transition-all hover:border-black/20 hover:bg-gray-50"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Reseñas en Google
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
