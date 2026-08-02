import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, UserCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CheckoutAuth = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="min-h-[75vh] flex items-center justify-center bg-cream-50 px-4 py-12 md:py-24">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold tracking-wide">
              ¿Cómo deseas continuar?
            </h1>
            <p className="font-body text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Elige cómo prefieres completar tu compra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Opción: Iniciar Sesión / Crear Cuenta */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-border p-8 md:p-10 hover:border-gold/50 transition-colors flex flex-col h-full shadow-sm"
            >
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-cream-100 flex items-center justify-center rounded-full text-gold-dark mb-6">
                  <UserPlus className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-2">Crear Cuenta o Ingresar</h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Guarda tus datos de envío para futuras compras, haz seguimiento de tus pedidos fácilmente y accede a beneficios exclusivos de AB.
                  </p>
                </div>
                <ul className="space-y-2.5 font-body text-[13px] text-ink/80 pt-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div> Pago exprés en el futuro
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div> Historial de pedidos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div> Acceso a novedades
                  </li>
                </ul>
              </div>
              
              <button
                onClick={() => navigate("/login?redirect=/checkout")}
                className="mt-10 w-full flex items-center justify-center gap-2 bg-ink text-white py-4 font-body text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-ink/90 transition-all group"
              >
                Continuar con mi cuenta
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Opción: Comprar como Invitado */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-border p-8 md:p-10 hover:border-gold/50 transition-colors flex flex-col h-full shadow-sm"
            >
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-cream-100 flex items-center justify-center rounded-full text-gold-dark mb-6">
                  <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-2">Pagar como Invitado</h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Completa tu compra rápidamente sin necesidad de registrarte. Solo pediremos los datos esenciales para procesar y entregar tu orden.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate("/checkout")}
                className="mt-10 w-full flex items-center justify-center gap-2 bg-transparent border-2 border-ink text-ink py-[14px] font-body text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-white transition-all group"
              >
                Pagar como Invitado
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutAuth;
