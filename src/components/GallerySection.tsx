import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import product1 from "@/assets/Fajas AB/fotos grupales/_A9A4285.jpg";
import product2 from "@/assets/Fajas AB/fotos grupales/_A9A4288.jpg";
import product3 from "@/assets/Fajas AB/fotos grupales/_A9A4461.jpg";
import product4 from "@/assets/Fajas AB/fotos grupales/_A9A4562.jpg";

const gallery = [
  { image: product1, label: "Control suave" },
  { image: product2, label: "Body sculpt" },
  { image: product3, label: "Cintura definida" },
  { image: product4, label: "Compresión diaria" },
];

const GallerySection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="py-20 lg:py-28 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 mb-10 border-t border-foreground pt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground mb-4 font-body font-medium">Galería AB</p>
          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[0.88] uppercase text-foreground">
            Piezas que se sienten editoriales
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground font-body">
          Una selección visual de siluetas, texturas y prendas pensadas para elevar la rutina diaria.
        </p>
      </div>

      <motion.div style={{ x }} className="flex gap-3 sm:gap-5 px-4 w-max">
        {gallery.map((item, index) => (
          <article
            key={item.label}
            className={`${index === 1 ? "w-[56vw] sm:w-[46vw] lg:w-[44rem]" : "w-[44vw] sm:w-[28vw] lg:w-[18rem]"} relative h-[23rem] sm:h-[28rem] overflow-hidden bg-cream-dark rounded-[1.6rem]`}
          >
            <img src={item.image} alt={item.label} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/60 to-transparent">
              <p className="text-[10px] sm:text-xs tracking-[0.18em] uppercase text-cream font-body">{item.label}</p>
            </div>
          </article>
        ))}
      </motion.div>
    </section>
  );
};

export default GallerySection;