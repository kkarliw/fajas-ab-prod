import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const items = [
  {
    q: "¿Cómo elijo mi talla?",
    a: "Usa la guía de tallas y mide cintura, cadera y busto con cinta. Cada referencia tiene una tabla específica; en caso de duda entre dos tallas, recomendamos la mayor para mayor comodidad de compresión.",
  },
  {
    q: "¿Qué prenda debo comprar primero?",
    a: "Depende de tu objetivo: para uso diario y silueta, comienza con un Body Sculpt; para definir cintura, una Cinturilla; para post operatorio, una Stage 1 con prescripción.",
  },
  {
    q: "¿Hay cambios o devoluciones?",
    a: "Al tratarse de prendas íntimas de compresión médica y posquirúrgica, por motivos de higiene no se realizan cambios de talla ni devoluciones. La garantía aplica únicamente por defectos de fábrica reportados en las primeras 24 horas tras recibir el producto.",
  },
  {
    q: "¿En cuánto tiempo recibo mi pedido?",
    a: "En Colombia despachamos de 2 a 5 días hábiles. Los envíos internacionales tardan de 5 a 12 días hábiles. El costo del envío se calcula en la pantalla de pago según el destino.",
  },
];

const FaqHome = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-cream border-b border-hairline">
      <div className="container-luxe py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="eyebrow text-ink/55 mb-4">Compra con seguridad</p>
          <h2 className="font-display text-[36px] md:text-[44px] leading-[1] text-ink">
            Resolvemos tus <span className="italic text-gold">dudas</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-hairline border-y border-hairline">
          {items.map((it, idx) => {
            const isOpen = open === idx;
            return (
              <div key={it.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-[20px] md:text-[22px] text-ink">{it.q}</span>
                  <span className="text-ink/70">
                    {isOpen ? <Minus size={18} strokeWidth={1.4} /> : <Plus size={18} strokeWidth={1.4} />}
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 font-body text-[14px] text-ink/70 leading-relaxed">
                      {it.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqHome;
