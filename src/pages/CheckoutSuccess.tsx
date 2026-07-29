import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Package, Truck, Copy, Download, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCOP } from "@/context/CartContext";
import { getProductImageUrl } from "@/lib/utils";
import { api } from "@/api";

// Raw Prisma item with nested product
type OrderItem = any; 

type OrderSummary = {
  reference: string;
  total: number;
  subtotal: number;
  shipping: number;
  items: number;
  email?: string;
};

const readFallbackOrder = (): OrderSummary | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ab_last_order");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OrderSummary>;
    if (!parsed.reference) return null;
    return {
      reference: parsed.reference,
      total: parsed.total ?? 0,
      subtotal: parsed.subtotal ?? 0,
      shipping: parsed.shipping ?? 0,
      items: parsed.items ?? 0,
      email: parsed.email
    };
  } catch {
    return null;
  }
};

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const [fullOrder, setFullOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const reference = params.get("ref") || readFallbackOrder()?.reference || "AB-000000";

  const orderSummary = useMemo<OrderSummary>(() => {
    const fallback = readFallbackOrder();
    return {
      reference,
      total: fallback?.total ?? 0,
      subtotal: fallback?.subtotal ?? 0,
      shipping: fallback?.shipping ?? 0,
      items: fallback?.items ?? 0,
    };
  }, [reference]);

  useEffect(() => {
    if (reference && reference !== "AB-000000") {
      const fallback = readFallbackOrder();
      const email = fallback?.email;

      const tryFetchGuest = () => {
        if (email) {
          api.orders.getGuestOrderByReference(reference, email)
            .then(data => setFullOrder(data))
            .catch(err => console.error("Error fetching guest order:", err));
        }
      };

      const hasSession = !!localStorage.getItem("ab_access_token");
      if (hasSession) {
        api.orders.getOrderByReference(reference)
          .then(data => setFullOrder(data))
          .catch(() => tryFetchGuest());
      } else {
        tryFetchGuest();
      }
    }
  }, [reference]);

  const copyRef = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderStatus = fullOrder?.status || "pending";
  const stepIndex = 
    (orderStatus === "delivered" || orderStatus === "fulfilled") ? 3 :
    orderStatus === "shipped" ? 2 :
    orderStatus === "processing" ? 1 : 
    0;

  const progressWidths = ["15%", "50%", "85%", "100%"];
  const currentProgressWidth = progressWidths[stepIndex];

  const steps = [
    { label: "Pago confirmado", active: stepIndex >= 0 },
    { label: "Preparando pedido", active: stepIndex >= 1 },
    { label: "Enviado", active: stepIndex >= 2 },
    { label: "Entregado", active: stepIndex >= 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700 print:py-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 print:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f0f9f0] text-green-600 mb-8 border border-green-100 shadow-sm transition-transform hover:scale-105 duration-500 print:hidden">
            <Check size={40} strokeWidth={2} />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {stepIndex === 0 ? "Pago Aprobado" : stepIndex === 1 ? "Pedido en Preparación" : stepIndex === 2 ? "Pedido Enviado" : "Pedido Entregado"}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink mb-6">
            {stepIndex >= 3 ? "Tu pedido ha sido entregado" : "Tu pedido está en camino"}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed print:hidden">
            Te notificaremos por correo a <span className="font-medium text-ink">{fullOrder?.email || "tu cuenta"}</span> cuando el pedido sea despachado.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-24 print:hidden">
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-green-500 transition-all duration-1000" style={{ width: currentProgressWidth }} />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 bg-cream px-2 sm:px-4">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-[2px] z-10 bg-cream transition-colors duration-500
                    ${step.active ? 'border-green-500' : 'border-border'}`}
                  >
                    {step.active && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full" />}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-center max-w-[90px]
                    ${step.active ? 'text-ink' : 'text-muted-foreground/50'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24 print:grid-cols-4 print:gap-4 print:mb-12">
          <InfoCard label="Referencia">
            <div className="flex items-center gap-3">
              <span className="font-display text-base font-semibold truncate">{reference}</span>
              <button 
                onClick={copyRef} 
                className="text-muted-foreground hover:text-ink transition-colors p-1.5 rounded-full hover:bg-hairline focus:outline-none focus:ring-2 focus:ring-gold print:hidden"
                title="Copiar referencia"
                aria-label="Copiar referencia"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </InfoCard>

          <InfoCard label="Cliente">
            <span className="font-display text-base font-semibold truncate block">
              {fullOrder ? fullOrder.customerName : "-"}
            </span>
          </InfoCard>

          <InfoCard label="Estado">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f9f0] text-green-700 text-xs font-semibold tracking-wide border border-green-100 print:border-none print:px-0 print:bg-transparent">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 print:hidden" />
              Confirmado
            </div>
          </InfoCard>

          <InfoCard label="Dirección">
            <span className="text-sm font-medium text-muted-foreground leading-snug line-clamp-2">
              {fullOrder?.shippingAddressJson ? (
                [
                  fullOrder.shippingAddressJson.addressLine1 || fullOrder.shippingAddressJson.street,
                  fullOrder.shippingAddressJson.city,
                  fullOrder.shippingAddressJson.department || fullOrder.shippingAddressJson.state
                ].filter(Boolean).join(", ")
              ) : "-"}
            </span>
          </InfoCard>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start print:block">
          
          {/* Main Column: Items */}
          <div className="lg:col-span-7 space-y-8 print:mb-12">
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-8 border-b border-hairline pb-4">
              Artículos del pedido
            </h2>
            
            <div className="space-y-8">
              {fullOrder ? (
                fullOrder.items.map((item: OrderItem, idx: number) => {
                  const imageUrl = getProductImageUrl(item.product?.images?.[0]?.url, item.product?.slug || item.nameSnapshot);
                  return (
                    <div key={idx} className="flex gap-6 group print:break-inside-avoid">
                      <div className="w-24 h-32 sm:w-28 sm:h-36 bg-cream-2 shrink-0 overflow-hidden rounded-sm border border-hairline print:hidden">
                        <img 
                          src={imageUrl} 
                          alt={item.nameSnapshot}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-2">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="font-display text-lg font-semibold leading-tight">{item.nameSnapshot}</h3>
                          <span className="font-semibold text-lg text-right shrink-0">{formatCOP(item.totalCents / 100)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground/80 mb-4">
                          {item.sizeSnapshot} / {item.colorSnapshot}
                        </p>
                        <div className="mt-auto">
                          <span className="inline-flex text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Cantidad ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Cargando detalles de los productos...
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Summary & Actions */}
          <div className="lg:col-span-5 space-y-6 print:block">
            
            <div className="bg-cream-2 border border-border p-8 rounded-sm shadow-sm transition-all duration-300 hover:shadow-md print:border-none print:shadow-none print:p-0">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-8">
                Resumen
              </h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink">{formatCOP(fullOrder ? fullOrder.subtotalCents / 100 : orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span className="font-medium text-ink">{fullOrder ? (fullOrder.shippingCents === 0 ? "Gratis" : formatCOP(fullOrder.shippingCents / 100)) : (orderSummary.shipping === 0 ? "Gratis" : formatCOP(orderSummary.shipping))}</span>
                </div>
                {(fullOrder?.discountCents > 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuentos</span>
                    <span className="font-medium">-{formatCOP(fullOrder.discountCents / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Impuestos</span>
                  <span className="font-medium text-ink">Calculados en el checkout</span>
                </div>
                
                <div className="pt-6 mt-6 border-t border-hairline flex justify-between items-end">
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">Total Pagado</span>
                  <span className="font-display text-3xl sm:text-4xl font-semibold leading-none">
                    {formatCOP(fullOrder ? fullOrder.totalCents / 100 : orderSummary.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-ink text-cream p-6 rounded-sm shadow-sm flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:bg-ink/95 print:hidden">
              <Package className="w-5 h-5 mt-1 text-gold shrink-0" />
              <div>
                <h3 className="font-display font-semibold text-base mb-2 tracking-wide">¿Qué sigue?</h3>
                <p className="text-sm text-cream/70 leading-relaxed font-light">
                  Prepararemos tu pedido. Cuando sea enviado recibirás un correo electrónico con la guía de seguimiento.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 print:hidden">
              <Link
                to="/account"
                className="w-full flex items-center justify-between bg-gold text-ink px-8 py-5 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 transition-all duration-300 shadow-sm hover:shadow-md rounded-sm group"
              >
                Ver mis pedidos
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="w-full text-center bg-cream-2 border border-border text-ink px-8 py-5 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-ink hover:text-cream transition-all duration-300 shadow-sm hover:shadow-md rounded-sm"
              >
                Seguir comprando
              </Link>
              {fullOrder && (
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-8 py-5 text-xs tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-ink transition-all duration-300 rounded-sm"
                >
                  <Download size={14} />
                  Descargar Factura PDF
                </button>
              )}
            </div>
          </div>
        </div>

      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

const InfoCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="bg-cream-2 border border-hairline p-6 rounded-sm shadow-sm hover:shadow-md hover:border-border transition-all duration-300 flex flex-col justify-center min-h-[100px] group">
    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted-foreground/70 mb-3 group-hover:text-muted-foreground transition-colors">{label}</p>
    <div className="flex items-center">
      {children}
    </div>
  </div>
);

export default CheckoutSuccess;
