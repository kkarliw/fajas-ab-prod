import { Link } from "react-router-dom";
import { Heart, Droplets, Layers } from "lucide-react";
import { motion } from "framer-motion";
import careImg from "@/assets/Fajas AB/fotos grupales/_A9A4476.jpg";

const highlights = [
  {
    icon: Heart,
    title: "Uso diario consciente",
    copy: "Ajusta la compresión progresivamente y escucha a tu cuerpo para sentir soporte sin incomodidad.",
  },
  {
    icon: Droplets,
    title: "Cuidado premium",
    copy: "Lava a mano con jabón neutro, seca a la sombra y evita plancha o secadora para conservar la fibra.",
  },
  {
    icon: Layers,
    title: "Colocación perfecta",
    copy: "Coloca la faja por etapas: piernas, caderas, cintura y cierres de abajo hacia arriba para un fit parejo.",
  },
];

const CareHighlights = () => {
  return (
    <section className="bg-white border-y border-hairline overflow-hidden">
      <div className="container-luxe py-16 lg:py-24 grid gap-10 lg:grid-cols-[1fr_0.9fr] items-center">
        <div>
          <p className="eyebrow text-ink/60 mb-3">Guía FAJAS AB</p>
          <h2 className="font-display text-[34px] md:text-[48px] leading-tight text-ink mb-4">
            Cuida tu faja como una pieza de lujo
          </h2>
          <p className="font-body text-[15px] text-ink/70 leading-relaxed mb-8 max-w-2xl">
            Creamos una guía de uso y cuidado para que tu prenda mantenga la compresión ideal por más tiempo. Aprende cómo
            colocarla, lavarla y guardarla como una experta.
          </p>
          <Link
            to="/care"
            className="inline-flex items-center gap-2 border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.24em] font-body hover:bg-ink hover:text-ink-soft transition-colors"
          >
            Ver guía completa →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {highlights.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="border border-border bg-cream p-5 sm:p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-hairline flex items-center justify-center text-ink/70 shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-display text-xl text-ink leading-tight mb-2">{title}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full-width accent photo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative h-64 md:h-80 overflow-hidden border-t border-hairline"
      >
        <img
          src={careImg}
          alt="Cuidado de fajas FAJAS AB"
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 sm:px-16">
          <div className="max-w-md">
            <p className="font-display italic text-ink text-[22px] md:text-[28px] leading-snug">
              "Una prenda de compresión bien cuidada puede durar años con su compresión intacta."
            </p>
            <p className="eyebrow text-ink/55 mt-4">— Equipo FAJAS AB</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CareHighlights;
