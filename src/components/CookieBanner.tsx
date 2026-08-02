import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ab_cookie_consent");
    if (!consent) {
      // Pequeño retraso para que no aparezca instantáneamente
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ab_cookie_consent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Aún si declinan, guardamos para no volver a molestar
    localStorage.setItem("ab_cookie_consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto bg-ink text-cream p-5 md:p-6 rounded-lg shadow-2xl border border-gold/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
            
            <div className="flex-1 pr-6">
              <h3 className="font-display tracking-widest text-gold-light uppercase text-sm mb-2">
                Uso de Cookies
              </h3>
              <p className="text-cream-2/80 text-xs leading-relaxed max-w-3xl">
                Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
                Al continuar navegando, aceptas nuestro uso de cookies. Puedes leer más en nuestra{" "}
                <Link to="/privacy" onClick={() => setIsVisible(false)} className="text-gold hover:text-gold-light underline underline-offset-2">
                  Política de Privacidad
                </Link>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 border border-cream/20 text-cream hover:bg-cream/5 text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                Solo Necesarias
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-gold text-ink hover:bg-gold-light font-medium text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                Aceptar Todas
              </button>
            </div>
            
            <button 
              onClick={handleDecline}
              className="absolute top-4 right-4 text-cream/50 hover:text-cream transition-colors md:hidden"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
