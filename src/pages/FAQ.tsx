import LegalLayout from "@/components/LegalLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const groups = [
  {
    title: "Tallas y Uso Médico",
    items: [
      {
        q: "¿Cómo elijo mi talla correctamente?",
        a: "Recomendamos revisar nuestra guía de tallas antes de comprar. Si tienes dudas, puedes contactarnos para asesorarte.",
      },
      {
        q: "¿Las fajas sirven después de una cirugía?",
        a: "Sí, nuestras fajas están diseñadas para brindar soporte postquirúrgico. Sin embargo, siempre recomendamos seguir las indicaciones de tu médico.",
      },
      {
        q: "¿Puedo usar la faja sin recomendación médica?",
        a: "Puedes usarla, pero para procesos postquirúrgicos recomendamos siempre consultar con un profesional de la salud.",
      },
    ],
  },
  {
    title: "Envíos y Logística",
    items: [
      {
        q: "¿Hacen envíos a todo Colombia?",
        a: "Sí, realizamos envíos a todo el país.",
      },
      {
        q: "¿Hacen envíos internacionales?",
        a: "Sí, enviamos a diferentes países. El tiempo de entrega puede variar según el destino.",
      },
      {
        q: "¿Cuánto tarda en llegar mi pedido?",
        a: "Colombia: 2 a 5 días hábiles · Internacional: 5 a 12 días hábiles.",
      },
      {
        q: "¿Cómo hago seguimiento a mi pedido?",
        a: "Una vez tu pedido sea enviado, recibirás la información correspondiente para hacer seguimiento (si aplica).",
      },
    ],
  },
  {
    title: "Cambios y Garantías",
    items: [
      {
        q: "¿Puedo cambiar la faja si no me queda?",
        a: "No realizamos cambios por talla. Por eso es muy importante verificar bien la guía antes de comprar.",
      },
      {
        q: "¿Qué pasa si mi producto llega con defecto?",
        a: "Puedes solicitar garantía dentro de las primeras 24 horas después de recibirlo. Nuestro equipo evaluará tu caso.",
      },
    ],
  },
  {
    title: "Pagos y Seguridad",
    items: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos pagos por link de pago y PSE.",
      },
      {
        q: "¿Es seguro comprar en la página?",
        a: "Sí, utilizamos plataformas de pago seguras y no almacenamos información financiera.",
      },
    ],
  },
];

const FAQ = () => (
  <LegalLayout
    eyebrow="Ayuda"
    title="Preguntas Frecuentes"
    intro="Resolvemos las dudas más comunes sobre nuestros productos, envíos, cambios, pagos y recomendaciones de uso."
  >
    {groups.map((g) => (
      <div key={g.title} className="mb-10">
        <h2>{g.title}</h2>
        <Accordion type="single" collapsible className="border-t border-hairline">
          {g.items.map((it, i) => (
            <AccordionItem
              key={i}
              value={`${g.title}-${i}`}
              className="border-b border-hairline"
            >
              <AccordionTrigger className="font-body text-[14px] text-ink hover:no-underline py-5 text-left">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="font-body text-[13px] text-ink/70 leading-relaxed pb-5">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    ))}
  </LegalLayout>
);

export default FAQ;
