import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import popupImg from "@/assets/Fajas AB/fotos grupales/_A9A4843.jpg";
import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

const PromoPopup = () => {
  const { data: settings } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const data = await api.settings.getStoreSettings();
      return data;
    },
  });

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !settings.promoPopup?.enabled) {
      return;
    }
    try {
      const hasSeen = localStorage.getItem("ab_promo_seen");
      if (!hasSeen) {
        const timer = window.setTimeout(() => setOpen(true), 2500); // Wait 2.5s
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors in private browsing
      const timer = window.setTimeout(() => setOpen(true), 2500);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try {
      localStorage.setItem("ab_promo_seen", "true");
    } catch {
      /* ignore */
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;
    
    setSubmitting(true);
    setError(null);
    try {
      await api.subscribers.subscribeToNewsletter(email.trim(), "promo_popup");
      setSubmitted(true);
      localStorage.setItem("ab_promo_seen", "true");
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings || !settings.promoPopup?.enabled) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/35 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            className="relative w-full max-w-3xl bg-background text-foreground shadow-2xl rounded-[1.5rem] border border-border overflow-hidden grid grid-cols-1 md:grid-cols-2"
          >
            {/* Left Panel: Photo (Visible only on desktop) */}
            <div className="relative hidden md:block aspect-[4/5] bg-cream-2 overflow-hidden">
              <img
                src={settings.promoPopup?.imageUrl || popupImg}
                alt="Colección Fajas AB"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>

            {/* Right Panel: Content */}
            <div className="p-7 sm:p-10 flex flex-col justify-center relative">
              <button
                onClick={handleClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X size={18} />
              </button>

              <p className="text-xs tracking-[0.28em] uppercase text-gold mb-3 font-body font-medium">
                Primera compra
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-none mb-3">
                {settings.promoPopup.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-body">
                {settings.promoPopup.description}
              </p>
              
              {!submitted ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico"
                    className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
                  />

                  <div className="flex items-start gap-2.5">
                    <input
                      id="popupConsent"
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 border-border text-gold focus:ring-gold/30 accent-gold cursor-pointer"
                    />
                    <label htmlFor="popupConsent" className="text-[11px] text-muted-foreground cursor-pointer select-none leading-tight">
                      Acepto las <a href="/privacy" target="_blank" className="text-foreground underline hover:text-gold transition-colors font-medium">políticas de privacidad</a> y autorizo el envío de promociones u ofertas exclusivas. <span className="text-destructive">*</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!consent || !email || submitting}
                    className="w-full bg-gold text-ink py-3.5 text-xs tracking-[0.2em] uppercase font-display font-bold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Recibir descuento"}
                  </button>
                </form>
              ) : (
                <motion.div className="text-center py-5 px-4 bg-cream-2 border border-gold-light/40 rounded-xl space-y-3">
                  <p className="text-sm font-semibold text-ink">¡Suscripción exitosa!</p>
                  <p className="text-xs text-muted-foreground">Usa el siguiente cupón en tu checkout:</p>
                  <div className="inline-block bg-background border border-dashed border-gold px-5 py-2 text-sm font-mono font-bold tracking-wider text-gold select-all rounded-md">
                    {settings.promoPopup.couponCode}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Cópialo y aplícalo en el carrito.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;