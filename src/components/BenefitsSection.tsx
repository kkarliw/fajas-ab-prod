import { motion } from "framer-motion";
import { Sparkles, Shield, Truck, RefreshCw } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Materiales Premium", description: "Telas de alta compresión importadas con tecnología de confort." },
  { icon: Shield, title: "Certificación Médica", description: "Aprobadas para uso post quirúrgico y recuperación." },
  { icon: Truck, title: "Envío Nacional", description: "Envíos seguros a toda Colombia de 2 a 5 días hábiles." },
  { icon: RefreshCw, title: "Garantía de Fábrica", description: "Respaldo por defectos de fábrica reportados en las primeras 24 horas." },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 lg:py-28 px-4 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3 font-medium">¿Por qué AB?</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground uppercase tracking-tight">
            La diferencia AB
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center border border-border">
                <feat.icon size={22} className="text-foreground" />
              </div>
              <h3 className="text-base sm:text-lg text-foreground mb-2 font-bold uppercase tracking-tight">{feat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
