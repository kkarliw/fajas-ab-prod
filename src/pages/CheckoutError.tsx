import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Info, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMemo } from "react";

const reasonMap: Record<string, string> = {
  payment_failed: "El banco declinó la transacción.",
  timeout: "La transacción tardó demasiado en responder.",
  cancelled: "El proceso de pago fue cancelado por el usuario.",
  stock: "Uno o más productos ya no tienen disponibilidad.",
};

const CheckoutError = () => {
  const [params] = useSearchParams();
  const reasonKey = params.get("reason") ?? "payment_failed";
  const reason = reasonMap[reasonKey] ?? "Ocurrió un problema al procesar tu compra.";

  const reference = useMemo(() => {
    try {
      const raw = localStorage.getItem("ab_last_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.reference;
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-10 w-full max-w-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-50 text-red-600 mb-8 border border-red-100 shadow-sm transition-transform hover:scale-105 duration-500">
            <AlertCircle size={40} strokeWidth={2} />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Pago no completado
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink mb-6">
            No se pudo completar el pago
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Tu pedido no fue confirmado. Por favor verifica que tus datos estén correctos e intenta nuevamente.
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full max-w-xl mb-12">
          <div className="bg-amber-50/50 border-l-4 border-amber-500 p-6 sm:p-8 rounded-r-sm shadow-sm flex items-start gap-4">
            <Info className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Detalle del error
              </h3>
              <p className="text-sm text-amber-800/80 leading-relaxed">
                {reason}
              </p>
              {reference && (
                <p className="text-xs text-amber-800/60 mt-3 font-medium">
                  Referencia de intento: <span className="uppercase font-semibold tracking-wider">{reference}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-xl flex flex-col gap-4 sm:gap-5 mb-12">
          <Link
            to="/checkout"
            className="w-full flex items-center justify-center bg-gold text-ink px-8 py-5 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-sm"
          >
            Intentar nuevamente
          </Link>
          <Link
            to="/shop"
            className="w-full flex items-center justify-center bg-cream-2 border border-border text-ink px-8 py-5 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-ink hover:text-cream transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a la tienda
          </Link>
        </div>

        {/* Accordion / Troubleshooting */}
        <div className="w-full max-w-xl border-t border-hairline pt-8">
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-ink cursor-pointer transition-colors duration-300 list-none">
              <HelpCircle size={14} />
              <span>¿Por qué pudo fallar mi pago?</span>
            </summary>
            <div className="mt-6 bg-cream-2 p-6 rounded-sm border border-hairline text-sm text-muted-foreground leading-relaxed space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="font-semibold text-ink mb-4">Causas más comunes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Fondos insuficientes en la cuenta o límite de crédito alcanzado.</li>
                <li>La tarjeta no está habilitada para compras por internet.</li>
                <li>Ingresaste incorrectamente el código de seguridad (CVV) o la fecha de vencimiento.</li>
                <li>El banco emisor bloqueó la transacción por seguridad (intenta contactar a tu banco).</li>
              </ul>
            </div>
          </details>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default CheckoutError;
