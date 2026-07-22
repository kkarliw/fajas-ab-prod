import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";

type SizeCalculatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
  availableSizes?: string[];
};

const standardSizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function SizeCalculatorModal({
  isOpen,
  onClose,
  onSelectSize,
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
}: SizeCalculatorModalProps) {
  const [waist, setWaist] = useState<number>(70);
  const [hip, setHip] = useState<number>(95);
  const [preference, setPreference] = useState<"high" | "medium">("high");
  const [calculated, setCalculated] = useState(false);
  const [recommendedSize, setRecommendedSize] = useState<string>("S");
  const [adviceNote, setAdviceNote] = useState<string>("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    let rawSize = "M";

    // Calculation logic based on waist and hips (in cm)
    if (waist <= 63 && hip <= 90) {
      rawSize = "XS";
    } else if (waist <= 71 && hip <= 98) {
      rawSize = "S";
    } else if (waist <= 79 && hip <= 106) {
      rawSize = "M";
    } else if (waist <= 87 && hip <= 114) {
      rawSize = "L";
    } else if (waist <= 95 && hip <= 122) {
      rawSize = "XL";
    } else {
      rawSize = "XXL";
    }

    // Filter against available sizes for this specific garment
    const sizes = availableSizes.length > 0 ? availableSizes : ["XS", "S", "M", "L", "XL", "XXL"];
    let finalSize = rawSize;
    let limitNote = "";

    const rawIdx = standardSizeOrder.indexOf(rawSize);

    // Get max and min available size indices
    const availableIndices = sizes
      .map((s) => standardSizeOrder.indexOf(s))
      .filter((idx) => idx !== -1)
      .sort((a, b) => a - b);

    if (availableIndices.length > 0) {
      const minIdx = availableIndices[0];
      const maxIdx = availableIndices[availableIndices.length - 1];

      if (rawIdx > maxIdx) {
        // Calculated size is larger than available max size
        finalSize = standardSizeOrder[maxIdx];
        limitNote = `Este diseño está disponible hasta la talla ${finalSize}. Te sugerimos la talla ${finalSize} para máxima compresión.`;
      } else if (rawIdx < minIdx) {
        // Calculated size is smaller than available min size
        finalSize = standardSizeOrder[minIdx];
        limitNote = `Este diseño está disponible a partir de la talla ${finalSize}. Te sugerimos la talla ${finalSize}.`;
      } else if (!sizes.includes(rawSize)) {
        // Find nearest available size
        const closestIdx = availableIndices.reduce((prev, curr) =>
          Math.abs(curr - rawIdx) < Math.abs(prev - rawIdx) ? curr : prev
        );
        finalSize = standardSizeOrder[closestIdx];
        limitNote = `Te recomendamos la talla ${finalSize} disponible en esta prenda.`;
      }
    }

    let note = "";
    if (limitNote) {
      note = limitNote;
    } else if (preference === "high" && (waist % 8 >= 6 || hip % 8 >= 6)) {
      note = "Tus medidas están en el límite superior. Para compresión máxima te recomendamos esta talla, pero si prefieres mayor libertad de movimiento puedes elegir la talla siguiente.";
    } else {
      note = "Esta talla te brindará la compresión anatómica ideal moldeando tu figura cómodamente.";
    }

    setRecommendedSize(finalSize);
    setAdviceNote(note);
    setCalculated(true);
  };

  const handleApply = () => {
    if (onSelectSize) {
      onSelectSize(recommendedSize);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden relative"
        >
          {/* Header */}
          <div className="bg-foreground text-background p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-background transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] font-bold mb-1">
              <Sparkles size={14} /> Recomendador Inteligente FAJAS AB
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              Encuentra tu Talla Perfecta
            </h3>
            <p className="text-xs text-background/70 mt-1">
              Calculamos la talla según las medidas de tu cuerpo y las tallas disponibles de esta prenda.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {!calculated ? (
              <form onSubmit={handleCalculate} className="space-y-6">
                {/* Waist Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="uppercase tracking-wider text-muted-foreground">1. Medida de Cintura (cm)</span>
                    <span className="text-gold-dark font-mono font-bold text-base bg-gold/10 px-3 py-0.5 rounded-full">
                      {waist} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={120}
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer h-2 bg-cream-2 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>50 cm</span>
                    <span>85 cm</span>
                    <span>120 cm</span>
                  </div>
                </div>

                {/* Hips Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="uppercase tracking-wider text-muted-foreground">2. Medida de Cadera (cm)</span>
                    <span className="text-gold-dark font-mono font-bold text-base bg-gold/10 px-3 py-0.5 rounded-full">
                      {hip} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={65}
                    max={140}
                    value={hip}
                    onChange={(e) => setHip(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer h-2 bg-cream-2 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>65 cm</span>
                    <span>100 cm</span>
                    <span>140 cm</span>
                  </div>
                </div>

                {/* Preference Switcher */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    3. Nivel de ajuste deseado:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreference("high")}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        preference === "high"
                          ? "border-gold bg-gold/10 shadow-sm font-semibold text-foreground ring-1 ring-gold"
                          : "border-black/5 hover:border-gold/30 text-muted-foreground"
                      }`}
                    >
                      <span className="block font-bold text-sm mb-0.5">Alta Compresión</span>
                      <span className="text-[10px] opacity-80">Moldeo firme e intencional</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreference("medium")}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        preference === "medium"
                          ? "border-gold bg-gold/10 shadow-sm font-semibold text-foreground ring-1 ring-gold"
                          : "border-black/5 hover:border-gold/30 text-muted-foreground"
                      }`}
                    >
                      <span className="block font-bold text-sm mb-0.5">Confort Diario</span>
                      <span className="text-[10px] opacity-80">Compresión media suave</span>
                    </button>
                  </div>
                </div>

                {/* Display available sizes notice */}
                <div className="text-[11px] text-muted-foreground/80 flex items-center justify-between border-t border-black/5 pt-3">
                  <span>Tallas disponibles en esta prenda:</span>
                  <span className="font-semibold text-foreground bg-cream px-2 py-0.5 rounded border border-black/5">
                    {availableSizes.join(", ")}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-foreground text-background py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-gold transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Calcular mi Talla Ideal
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gold/20 text-gold-dark rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1">
                    Tu Talla Recomendada es:
                  </p>
                  <div className="inline-block bg-gradient-to-br from-gold to-gold-dark text-foreground font-display text-5xl font-bold px-8 py-3 rounded-2xl shadow-lg border border-gold/30">
                    Talla {recommendedSize}
                  </div>
                </div>

                <div className="bg-cream/60 p-4 rounded-2xl border border-black/5 text-xs text-muted-foreground text-left leading-relaxed">
                  <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-gold-dark" /> Recomendación de prenda:
                  </p>
                  {adviceNote}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCalculated(false)}
                    className="flex-1 py-3 border border-black/10 rounded-xl text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:bg-black/5"
                  >
                    Volver a medir
                  </button>
                  {onSelectSize && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="flex-1 bg-foreground text-background py-3 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-gold transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      Elegir Talla {recommendedSize} <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
