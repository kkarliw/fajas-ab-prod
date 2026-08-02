import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = searchParams.get("email");

  useEffect(() => {
    document.title = "Verificar código · AB";
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
      return;
    }

    const newCode = [...code];
    newCode[index] = value[value.length - 1]; // Only take the last character typed
    setCode(newCode);

    if (index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      
      const nextIndex = Math.min(pastedData.length, 5);
      focusInput(nextIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("El código debe tener 6 dígitos.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await api.auth.verifyEmail(email!, fullCode);
      const redirectTo = searchParams.get("redirect") || "/account";
      navigate(redirectTo);
    } catch (err: any) {
      setErrorMsg(err.message || "Código inválido o expirado. Intenta nuevamente.");
      setLoading(false);
      setCode(Array(6).fill(""));
      focusInput(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Premium Background Blurs */}
      <div aria-hidden className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-cream-dark/40 blur-[150px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[460px] w-full bg-card/80 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-12 text-center"
        >
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-8 text-gold-dark shadow-inner">
            <Mail size={32} strokeWidth={1.5} />
          </div>
          
          <h1 className="font-display text-3xl font-semibold mb-3 tracking-tight text-foreground">Revisa tu correo</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-10 px-4">
            Hemos enviado un código de seguridad a <br />
            <strong className="text-foreground font-medium">{email}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between gap-2 sm:gap-3">
                {code.map((digit, idx) => (
                  <motion.input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    autoFocus={idx === 0}
                    animate={errorMsg ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-12 h-14 sm:w-14 sm:h-16 bg-background/50 border-2 rounded-xl text-center text-2xl font-display font-medium text-foreground outline-none transition-all
                      ${digit ? "border-gold shadow-[0_0_15px_rgba(196,164,106,0.2)]" : "border-border/60 hover:border-border"} 
                      focus:border-gold focus:ring-4 focus:ring-gold/10
                      ${errorMsg ? "!border-destructive/60 !bg-destructive/5 text-destructive" : ""}`}
                  />
                ))}
              </div>
              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[13px] text-destructive font-body text-center"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={loading || code.join("").length !== 6}
              className="w-full h-14 inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-xl text-[11px] tracking-[0.22em] uppercase font-display font-bold hover:bg-gold hover:shadow-xl hover:shadow-gold/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    Verificar cuenta
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-10 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Usar otra dirección de correo
          </button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
