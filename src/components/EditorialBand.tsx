import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
// Using best full-body curated group photos
import mainImg from "@/assets/Fajas AB/fotos grupales/_A9A4562.jpg"; // 3 models wall - elegant
import accentImg1 from "@/assets/Fajas AB/ref ariadna/1.jpg";        // single model full body faja
import accentImg2 from "@/assets/Fajas AB/fotos grupales/_A9A4285.jpg"; // 3 models close group

const EditorialBand = () => {
  return (
    <section className="bg-[#0f0d0a] text-white border-b border-white/10">
      <div className="grid lg:grid-cols-2 min-h-[560px]">
        {/* Left: editorial text */}
        <div className="px-6 sm:px-10 lg:px-16 py-20 lg:py-28 flex items-center order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <p className="uppercase tracking-[0.28em] text-[10px] text-[#d4af7a]/60 font-body mb-6">Nuestra historia · FAJAS AB</p>
            <h2 className="font-display font-light leading-[0.93]">
              <span className="block text-[42px] md:text-[58px] text-white">Siéntete</span>
              <span className="block italic text-[#d4af7a] text-[42px] md:text-[58px]">extraordinaria</span>
            </h2>
            <p className="mt-8 font-body text-[14px] md:text-[15px] text-white/60 leading-relaxed max-w-md">
              En AB creemos que cada mujer merece sentirse extraordinaria. Nuestras prendas
              de compresión combinan la más alta tecnología colombiana con un diseño que
              rivaliza con las grandes casas de moda.
            </p>
            <Link
              to="/about"
              className="mt-10 inline-flex items-center gap-2 bg-[#d4af7a] text-[#0f0d0a] uppercase tracking-[0.22em] text-[11px] font-medium px-8 py-4 hover:bg-white transition-colors duration-300"
            >
              Conocer más <ArrowRight size={14} strokeWidth={1.6} />
            </Link>
          </motion.div>
        </div>

        {/* Right: photo collage — 3 stacked photos */}
        <div className="relative min-h-[420px] lg:min-h-0 overflow-hidden order-1 lg:order-2 bg-[#0f0d0a]">
          {/* Main full-width background image */}
          <motion.img
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            src={mainImg}
            alt="Modelos FAJAS AB colección"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
            loading="lazy"
          />
          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-[#0f0d0a]/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0a]/40 to-transparent" />

          {/* Floating accent photo — top right */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-5 right-5 w-[38%] aspect-[3/4] overflow-hidden border border-white/15 shadow-2xl"
          >
            <img
              src={accentImg1}
              alt="Faja ARIADNA modelo"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </motion.div>

          {/* Floating accent photo — bottom left */}
          <motion.div
            initial={{ opacity: 0, x: -15, y: 15 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-16 left-5 w-[30%] aspect-square overflow-hidden border border-white/15 shadow-2xl hidden md:block"
          >
            <img
              src={accentImg2}
              alt="Modelos FAJAS AB"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </motion.div>

          {/* Quote overlay */}
          <p className="absolute bottom-8 right-5 left-[calc(38%+1.5rem)] font-display italic text-[#d4af7a] text-[16px] md:text-[19px] leading-snug md:hidden lg:block">
            "Piezas que se sienten editoriales."
          </p>
        </div>
      </div>
    </section>
  );
};

export default EditorialBand;
