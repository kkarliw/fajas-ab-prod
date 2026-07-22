import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Carefully curated: only full-body or well-composed photos
import img1 from "@/assets/Fajas AB/fotos grupales/_A9A4988.jpg"; // 3 models full body curtains - tall
import img2 from "@/assets/Fajas AB/fotos grupales/_A9A4578.jpg"; // 3 models elegant pose - square
import img3 from "@/assets/Fajas AB/ref samy/1.jpg";              // single model full body samy - tall
import img4 from "@/assets/Fajas AB/cinturilla reloj arena/3.jpg"; // cinturilla full body - square
import img5 from "@/assets/Fajas AB/fotos grupales/_A9A4461.jpg"; // 3 models sofa pose - wide
import img6 from "@/assets/Fajas AB/short moly/1.jpg";            // short moly full body - square

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

const EditorialGallery = () => {
  return (
    <section className="bg-cream border-b border-hairline py-16 lg:py-24 overflow-hidden">
      <div className="container-luxe">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="eyebrow text-ink/55 mb-3">Galería Editorial · AB</p>
            <h2 className="font-display font-light text-ink leading-[0.95] text-[32px] md:text-[46px] lg:text-[54px]">
              Piezas que <span className="italic text-gold">inspiran</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-ink/60 hover:text-gold transition-colors self-start md:self-end"
          >
            Ver colección completa <ArrowRight size={13} strokeWidth={1.6} />
          </Link>
        </div>

        {/* Grid Layout: 3 columns, varied heights */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.07 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
        >
          {/* Col 1: tall card spanning 2 rows */}
          <motion.div variants={itemVariants} className="relative overflow-hidden group row-span-2">
            <div className="relative h-full min-h-[420px] md:min-h-[560px]">
              <img
                src={img1}
                alt="3 modelos FAJAS AB fajas"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Link
                  to="/shop?cat=Fajas"
                  className="inline-flex items-center gap-1.5 text-white text-[10px] uppercase tracking-[0.22em] font-body hover:gap-3 transition-all duration-300"
                >
                  Fajas <ArrowRight size={11} strokeWidth={1.6} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Col 2, Row 1: square */}
          <motion.div variants={itemVariants} className="relative overflow-hidden group aspect-square">
            <img
              src={img2}
              alt="Modelos FAJAS AB"
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <Link to="/shop?cat=Fajas" className="inline-flex items-center gap-1.5 text-white text-[10px] uppercase tracking-[0.22em] font-body hover:gap-3 transition-all duration-300">
                Colección <ArrowRight size={11} strokeWidth={1.6} />
              </Link>
            </div>
          </motion.div>

          {/* Col 3, Row 1: square */}
          <motion.div variants={itemVariants} className="relative overflow-hidden group aspect-square">
            <img
              src={img3}
              alt="Faja SAMY modelo"
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <Link to="/shop?cat=Fajas" className="inline-flex items-center gap-1.5 text-white text-[10px] uppercase tracking-[0.22em] font-body hover:gap-3 transition-all duration-300">
                Faja SAMY <ArrowRight size={11} strokeWidth={1.6} />
              </Link>
            </div>
          </motion.div>

          {/* Col 2, Row 2: square */}
          <motion.div variants={itemVariants} className="relative overflow-hidden group aspect-square">
            <img
              src={img4}
              alt="Cinturilla reloj arena"
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <Link to="/shop?cat=Cinturillas" className="inline-flex items-center gap-1.5 text-white text-[10px] uppercase tracking-[0.22em] font-body hover:gap-3 transition-all duration-300">
                Cinturillas <ArrowRight size={11} strokeWidth={1.6} />
              </Link>
            </div>
          </motion.div>

          {/* Col 3, Row 2: square */}
          <motion.div variants={itemVariants} className="relative overflow-hidden group aspect-square">
            <img
              src={img6}
              alt="Short MOLY modelo"
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <Link to="/shop?cat=Shorts" className="inline-flex items-center gap-1.5 text-white text-[10px] uppercase tracking-[0.22em] font-body hover:gap-3 transition-all duration-300">
                Shorts <ArrowRight size={11} strokeWidth={1.6} />
              </Link>
            </div>
          </motion.div>

          {/* Full width bottom row */}
          <motion.div variants={itemVariants} className="relative overflow-hidden group col-span-2 md:col-span-3 aspect-[16/7] md:aspect-[21/8]">
            <img
              src={img5}
              alt="Modelos FAJAS AB sofa session"
              loading="lazy"
              className="w-full h-full object-cover object-center md:object-top transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
            <div className="absolute inset-y-0 left-6 md:left-10 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/60 font-body mb-2">Post Quirúrgico</p>
              <h3 className="font-display text-white text-[22px] md:text-[30px] leading-tight mb-3">
                Recuperación con <span className="italic text-[#d4af7a]">estilo</span>
              </h3>
              <Link
                to="/shop?cat=Fajas"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#d4af7a] hover:gap-4 transition-all duration-300"
              >
                Ver fajas <ArrowRight size={12} strokeWidth={1.6} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default EditorialGallery;
