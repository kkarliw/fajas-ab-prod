import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, CheckCircle2 } from "lucide-react";
import { getProductImageUrl } from "@/lib/utils";

const sampleSales = [
  { name: "Carolina", city: "Medellín", item: "Faja ANDREA", size: "Talla S", minutes: "4 min", image: getProductImageUrl(undefined, "faja-andrea") },
  { name: "Andrea", city: "Bogotá D.C.", item: "Bra EMY", size: "Talla M", minutes: "9 min", image: getProductImageUrl(undefined, "bra-emy") },
  { name: "Valentina", city: "Cali", item: "Short MOLY", size: "Talla XS", minutes: "14 min", image: getProductImageUrl(undefined, "short-moly") },
  { name: "Mariana", city: "Cartagena", item: "Faja Reloj de Arena", size: "Talla M", minutes: "22 min", image: getProductImageUrl(undefined, "faja-reloj-de-arena") },
  { name: "Daniela", city: "Barranquilla", item: "Tabla Abdominal Luxe", size: "Talla Única", minutes: "31 min", image: getProductImageUrl(undefined, "tabla-abdominal-luxe") },
  { name: "Sofía", city: "Bucaramanga", item: "Cinturilla Látex", size: "Talla L", minutes: "45 min", image: getProductImageUrl(undefined, "cinturilla-latex") },
];

const HIDDEN_PATHS = ["/checkout", "/admin", "/account", "/login", "/verify"];

export default function SalesNotificationToast() {
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Hide on checkout, admin, account, login pages
  const isHiddenPage = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    // Show first toast after 8 seconds
    const initialTimer = setTimeout(() => {
      if (!dismissed) setCurrentIndex(0);
    }, 8000);

    // Loop through notifications every 22 seconds
    const interval = setInterval(() => {
      if (!dismissed) {
        setCurrentIndex((prev) => (prev === null ? 0 : (prev + 1) % sampleSales.length));
      }
    }, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  // Auto hide each toast after 6 seconds
  useEffect(() => {
    if (currentIndex !== null) {
      const hideTimer = setTimeout(() => {
        setCurrentIndex(null);
      }, 6000);
      return () => clearTimeout(hideTimer);
    }
  }, [currentIndex]);

  if (dismissed || isHiddenPage || currentIndex === null) return null;

  const current = sampleSales[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-6 left-6 z-40 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-black/10 shadow-2xl p-3.5 flex items-center gap-3.5"
      >
        {/* Product Thumbnail */}
        <div className="relative w-12 h-14 bg-cream rounded-xl overflow-hidden shrink-0 border border-black/5">
          <img src={current.image} alt={current.item} className="w-full h-full object-cover" />
          <div className="absolute top-0 right-0 bg-gold text-foreground p-0.5 rounded-bl">
            <CheckCircle2 size={10} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium mb-0.5">
            <ShoppingBag size={11} className="text-gold-dark" />
            <span>Hace {current.minutes}</span>
            <span>•</span>
            <span className="font-semibold text-foreground">{current.city}</span>
          </div>
          <p className="text-xs font-semibold text-foreground truncate">
            {current.name} compró <span className="text-gold-dark">{current.item}</span>
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {current.size} • Verificado
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setCurrentIndex(null);
            setDismissed(true);
          }}
          className="text-muted-foreground/60 hover:text-foreground p-1 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
