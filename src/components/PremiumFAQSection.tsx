import { motion } from "framer-motion";
import { useState } from "react";

const items = [
  { title: "¿Cómo elijo mi talla?", content: "Usa la guía de tallas y mide cintura, cadera y busto. Si estás entre dos tallas, te asesoramos por WhatsApp." },
  { title: "¿Qué prenda debo comprar primero?", content: "Para uso diario recomendamos bodys o cinturillas suaves; para mayor control, fajas de compresión media o alta." },
  { title: "¿Hay cambios o devoluciones?", content: "Por motivos de higiene al tratarse de prendas de compresión de uso íntimo y médico, no realizamos cambios de talla ni devoluciones. La garantía aplica únicamente por defectos de fábrica reportados en las primeras 24 horas tras recibir el producto." },
];

const PremiumFAQSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 lg:py-28 px-4 bg-background">
      <div className="max-w-5xl mx-auto border-t border-foreground pt-5">
        <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground mb-4 font-body font-medium">Antes de comprar</p>
        <h2 className="font-display text-5xl sm:text-7xl font-semibold leading-[0.9] uppercase mb-10">Compra con seguridad</h2>
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div key={item.title}>
              <button onClick={() => setOpen(open === index ? -1 : index)} className="w-full py-6 flex items-center justify-between gap-6 text-left">
                <span className="font-display text-xl sm:text-2xl font-semibold">{item.title}</span>
                <span className="text-2xl text-gold">{open === index ? "−" : "+"}</span>
              </button>
              <motion.div initial={false} animate={{ height: open === index ? "auto" : 0 }} className="overflow-hidden">
                <p className="pb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground font-body">{item.content}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumFAQSection;