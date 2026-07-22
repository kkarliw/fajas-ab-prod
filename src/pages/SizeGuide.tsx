import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sizeData = [
  { size: "XS", cintura: "58-62", cadera: "82-86", busto: "78-82", peso: "45-50" },
  { size: "S", cintura: "63-67", cadera: "87-91", busto: "83-87", peso: "50-57" },
  { size: "M", cintura: "68-72", cadera: "92-96", busto: "88-92", peso: "57-65" },
  { size: "L", cintura: "73-78", cadera: "97-102", busto: "93-97", peso: "65-73" },
  { size: "XL", cintura: "79-85", cadera: "103-108", busto: "98-103", peso: "73-82" },
  { size: "2XL", cintura: "86-92", cadera: "109-114", busto: "104-110", peso: "82-92" },
  { size: "3XL", cintura: "93-100", cadera: "115-122", busto: "111-118", peso: "92-105" },
];

const measureSteps = [
  {
    title: "Cintura",
    description: "Mide la parte más estrecha de tu torso, generalmente justo encima del ombligo. Mantén la cinta nivelada y no aprietes demasiado.",
  },
  {
    title: "Cadera",
    description: "Mide la parte más ancha de tus caderas, pasando la cinta por el punto más prominente de los glúteos.",
  },
  {
    title: "Busto",
    description: "Mide alrededor de la parte más llena de tu busto, manteniendo la cinta recta en la espalda.",
  },
  {
    title: "Torso",
    description: "Para bodys y fajas completas, mide desde el hombro pasando por la entrepierna y subiendo hasta el mismo punto del hombro.",
  },
];

const productRecommendations = [
  {
    product: "Fajas de Control",
    recommendation: "Si estás entre dos tallas, elige la más grande. La compresión alta hará que se ajuste perfectamente.",
    idealFor: "Control diario, eventos especiales",
  },
  {
    product: "Bodys",
    recommendation: "Selecciona tu talla habitual. Nuestros bodys tienen elasticidad extra para un ajuste cómodo.",
    idealFor: "Uso diario, debajo de vestidos",
  },
  {
    product: "Cinturillas",
    recommendation: "Elige según tu medida de cintura exacta. La cinturilla debe quedar firme pero no incómoda.",
    idealFor: "Ejercicio, moldeo de cintura",
  },
  {
    product: "Post Quirúrgicas",
    recommendation: "Consulta con tu médico. Generalmente se recomienda la talla que usabas antes de la cirugía.",
    idealFor: "Recuperación, post operatorio",
  },
];

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState<"tabla" | "medirte" | "recomendaciones">("tabla");

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 lg:py-16 px-4"
      >
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3 font-medium">Tu talla perfecta</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-tight">
          Guía de Tallas
        </h1>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
          Encuentra tu talla ideal para una compresión perfecta y comodidad todo el día.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <div className="flex border-b border-border">
          {[
            { key: "tabla" as const, label: "Tabla de Medidas" },
            { key: "medirte" as const, label: "Cómo Medirte" },
            { key: "recomendaciones" as const, label: "Por Producto" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3 px-6 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
                activeTab === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {activeTab === key && (
                <motion.div layoutId="size-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        {activeTab === "tabla" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-4 px-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">Talla</th>
                    <th className="py-4 px-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">Cintura (cm)</th>
                    <th className="py-4 px-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">Cadera (cm)</th>
                    <th className="py-4 px-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">Busto (cm)</th>
                    <th className="py-4 px-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">Peso (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((row, i) => (
                    <tr key={row.size} className={`border-b border-border ${i % 2 === 0 ? "bg-cream-dark" : ""}`}>
                      <td className="py-4 px-4 font-bold text-foreground">{row.size}</td>
                      <td className="py-4 px-4 text-muted-foreground">{row.cintura}</td>
                      <td className="py-4 px-4 text-muted-foreground">{row.cadera}</td>
                      <td className="py-4 px-4 text-muted-foreground">{row.busto}</td>
                      <td className="py-4 px-4 text-muted-foreground">{row.peso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-cream-dark border border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">Nota Importante</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Si te encuentras entre dos tallas, te recomendamos elegir la talla más grande para mayor comodidad.
                Todas nuestras prendas están diseñadas con materiales de alta elasticidad que se adaptan a tu cuerpo.
                Si tienes dudas, no dudes en contactarnos por WhatsApp.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "medirte" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="grid sm:grid-cols-2 gap-6">
              {measureSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border border-border bg-background"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-foreground text-background text-sm font-bold">
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 p-8 bg-foreground text-cream">
              <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Consejos para medir correctamente</h3>
              <ul className="space-y-3">
                {[
                  "Usa una cinta métrica flexible, no una regla rígida.",
                  "Mide directamente sobre la piel o sobre ropa interior ligera.",
                  "Mantén la cinta nivelada y paralela al suelo.",
                  "No aprietes la cinta, debe estar ajustada pero cómoda.",
                  "Mide por la mañana, antes de comer, para medidas más precisas.",
                  "Si es posible, pide ayuda a alguien para mayor exactitud.",
                ].map((tip) => (
                  <li key={tip} className="text-sm text-cream/80 flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === "recomendaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="space-y-6">
              {productRecommendations.map((rec, i) => (
                <motion.div
                  key={rec.product}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-border p-8 bg-background"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-2">{rec.product}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{rec.recommendation}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground uppercase tracking-wider">Ideal para: </span>
                        {rec.idealFor}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center p-8 bg-cream-dark border border-border">
              <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-2">¿Aún tienes dudas?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Nuestro equipo está listo para ayudarte a encontrar tu talla perfecta.
              </p>
              <a
                href="https://api.whatsapp.com/message/XKQGMZT677DBG1?autoload=1&app_absent=0&utm_source=ig"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold text-ink px-10 py-3.5 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 transition-colors"
              >
                Escríbenos por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SizeGuide;
