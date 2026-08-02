import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

const luxuryStyles = `
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes float-glow-1 {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -40px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes float-glow-2 {
    0% { transform: translate(0px, 0px) scale(1); }
    50% { transform: translate(-30px, 30px) scale(1.15); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .luxury-bg {
    background: linear-gradient(-45deg, #0d0a08, #261b14, #120e0d, #2e221b, #0d0a08);
    background-size: 400% 400%;
    animation: gradient-shift 18s ease infinite;
  }
  .grain-overlay {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  }
  .glow-1 {
    animation: float-glow-1 20s ease-in-out infinite;
  }
  .glow-2 {
    animation: float-glow-2 25s ease-in-out infinite;
  }
`;

const NewsletterSection = () => {
  const { data: settings } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const data = await api.settings.getStoreSettings();
      return data;
    },
  });

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.subscribers.subscribeToNewsletter(email.trim(), "footer_newsletter");
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative py-24 lg:py-32 px-4 luxury-bg overflow-hidden border-b border-white/5">
      <style dangerouslySetInnerHTML={{ __html: luxuryStyles }} />

      {/* Retro grain filter overlay */}
      <div className="absolute inset-0 grain-overlay opacity-80 pointer-events-none" />

      {/* Floating ambient glow circles (luxury aura) */}
      <div className="absolute top-1/4 left-1/12 w-80 h-80 rounded-full bg-[#d4af7a]/6 blur-[120px] pointer-events-none glow-1" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#8a5c41]/8 blur-[140px] pointer-events-none glow-2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-3xl mx-auto text-center z-10"
      >
        <p className="text-[10px] tracking-[0.38em] uppercase text-[#d4af7a]/90 font-body mb-5 font-semibold">
          Club Exclusivo AB
        </p>
        <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-light leading-[0.95] text-white/95 mb-6 uppercase tracking-tight">
          Entra antes <br className="sm:hidden" />
          <span className="italic text-[#d4af7a]">que todas</span>
        </h2>
        <p className="max-w-md mx-auto text-[13px] sm:text-[14px] font-body text-white/60 leading-relaxed mb-12">
          Recibe invitaciones de preventa, lanzamientos privados y obtén un 10% de cortesía en tu primer pedido.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 max-w-lg mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/10 px-5 py-4 text-xs tracking-wider font-body text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af7a] focus:bg-white/[0.05] transition-all backdrop-blur-md rounded-none"
              />
              <button
                type="submit"
                disabled={!consent || !email || submitting}
                className="bg-white text-[#1a1510] hover:bg-[#d4af7a] hover:text-white px-9 py-4 text-[10px] tracking-[0.25em] uppercase font-display font-bold transition-all duration-300 disabled:opacity-30 disabled:bg-white/40 disabled:text-[#1a1510]/50 disabled:cursor-not-allowed rounded-none flex items-center justify-center min-w-[150px]"
              >
                {submitting ? "Cargando..." : "Suscribirse"}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
            <div className="flex items-start gap-2.5 text-left max-w-md mx-auto">
              <input
                id="newsletterConsent"
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 border-white/20 bg-transparent text-[#d4af7a] focus:ring-[#d4af7a]/30 accent-[#d4af7a] cursor-pointer"
              />
              <label htmlFor="newsletterConsent" className="text-[11px] text-white/50 cursor-pointer select-none leading-tight">
                Acepto la <a href="/privacy" target="_blank" className="text-white underline hover:text-[#d4af7a] transition-colors font-medium">política de privacidad</a> y el tratamiento de mis datos personales. <span className="text-destructive">*</span>
              </label>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-7 px-5 bg-white/[0.02] border border-white/10 rounded-[1rem] space-y-4 backdrop-blur-md"
          >
            <p className="text-sm font-semibold text-white/95">¡Te damos la bienvenida al Club!</p>
            {settings?.promoPopup?.showCoupon && settings?.promoPopup?.couponCode ? (
              <>
                <p className="text-xs text-white/60">Usa este cupón en el checkout para tu descuento:</p>
                <div className="inline-block bg-white text-[#1a1510] border border-dashed border-[#d4af7a] px-7 py-3 text-sm font-mono font-bold tracking-wider select-all rounded-md">
                  {settings.promoPopup.couponCode}
                </div>
                <p className="text-[10px] text-white/40">El cupón de cortesía ha sido registrado para tu cuenta.</p>
              </>
            ) : (
              <p className="text-xs text-white/60">Estarás recibiendo nuestras novedades y ofertas exclusivas directamente en tu bandeja de entrada.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default NewsletterSection;
