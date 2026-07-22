import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import aboutImg from "@/assets/about-brand.jpg";

const AboutSection = () => {
  return (
    <section className="bg-background text-foreground py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <motion.div
          initial={{ y: 90, rotate: -3 }}
          whileInView={{ y: 0, rotate: -2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 overflow-hidden bg-cream-dark"
        >
          <img src={aboutImg} alt="AB Brand Story" loading="lazy" width={1200} height={800} className="w-full h-[420px] sm:h-[560px] object-cover" />
        </motion.div>

        <motion.div
          initial={{ y: 90 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 lg:pl-10"
        >
          <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground mb-5 font-body font-medium">Nuestra historia</p>
          <h2 className="font-display text-[14vw] sm:text-7xl lg:text-[7.5rem] font-semibold leading-[0.84] mb-8 uppercase">
            Siéntete
            <br />
            <span className="text-gold font-medium">AB</span>
          </h2>
          <p className="max-w-xl text-sm sm:text-base font-medium leading-relaxed text-muted-foreground mb-6">
            En AB, creemos que cada mujer merece sentirse extraordinaria. Nuestras prendas de compresión 
            combinan la más alta tecnología colombiana con un diseño que rivaliza con las grandes casas de moda.
          </p>
          <p className="max-w-xl text-sm sm:text-base font-medium leading-relaxed text-muted-foreground mb-10">
            Cada pieza es cuidadosamente elaborada con materiales premium que moldean, estilizan y realzan 
            tu figura natural, brindándote la confianza que mereces.
          </p>
          <Link
            to="/about"
            className="inline-block bg-gold text-ink hover:bg-gold/90 px-10 py-3.5 text-xs tracking-[0.25em] uppercase font-black transition-colors"
          >
            Conocer Más
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
