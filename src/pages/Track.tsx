import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, MapPin, Truck, ChevronLeft, AlertCircle, UserPlus, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/api";
import { formatCOP } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const Track = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get("reference") || "";
  const initialEmail = searchParams.get("email") || "";

  const [view, setView] = useState<"decision" | "guest-form">(initialRef && initialEmail ? "guest-form" : "decision");

  const [reference, setReference] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (initialRef && initialEmail && !order && !loading) {
      // Auto-trigger search
      handleAutoTrack(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleAutoTrack = async (ref: string, em: string) => {
    setLoading(true);
    setError("");
    try {
      const cleanRef = ref.trim().replace(/^#/, "");
      const res = await api.orders.getGuestOrderByReference(cleanRef, em.trim());
      setOrder(res.data || res);
    } catch (err: any) {
      setError("No pudimos encontrar un pedido con esos datos. Verifica el número de orden y tu correo.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) return;
    
    setLoading(true);
    setError("");
    setOrder(null);
    
    try {
      // Remover '#' si el usuario lo pone
      const cleanRef = reference.trim().replace(/^#/, "");
      
      const res = await api.orders.getGuestOrderByReference(cleanRef, email.trim());
      // Si la API devuelve un wrapper { data, ... } o el objeto directo
      const orderData = res.data || res;
      setOrder(orderData);
    } catch (err: any) {
      setError("No pudimos encontrar un pedido con esos datos. Verifica el número de orden y tu correo.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="bg-[#C4A46A]/20 text-[#8B6E3C] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Pendiente</span>;
      case "processing": return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Procesando</span>;
      case "shipped": return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Enviado</span>;
      case "delivered": return <span className="bg-[#4E8B70]/20 text-[#4E8B70] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Entregado</span>;
      case "cancelled": return <span className="bg-[#8A3A2A]/20 text-[#8A3A2A] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Cancelado</span>;
      default: return <span className="bg-ink/10 text-ink/70 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">{status}</span>;
    }
  };

  const getTrackingUrl = (carrier?: string, num?: string) => {
    if (!num || !carrier) return null;
    const norm = carrier.toLowerCase();
    if (norm.includes("servientrega")) return `https://www.servientrega.com/wps/portal/Colombia/transaccional/rastreo-envio?id=${num}`;
    if (norm.includes("interrapidisimo") || norm.includes("inter rapidisimo")) return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${num}`;
    if (norm.includes("coordinadora")) return `https://www.coordinadora.com/portafolio-de-servicios/servicios-linea/rastrear-guias/?guia=${num}`;
    if (norm.includes("envia") || norm.includes("envía")) return `https://envia.co/rastreo?guia=${num}`;
    if (norm.includes("tcc")) return `https://tcc.com.co/rastreo-de-guias/?guia=${num}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-cream font-body flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 mt-20">
        <div className="w-full max-w-lg">
          <Link to="/" className="inline-flex items-center text-ink-light hover:text-gold transition-colors text-xs uppercase tracking-widest mb-8">
            <ChevronLeft size={16} className="mr-2" />
            Volver a la tienda
          </Link>
          
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-ink tracking-tight mb-4">Rastrea tu Pedido</h1>
            <p className="text-ink font-medium text-sm max-w-md mx-auto">
              Ingresa el número de orden (que recibiste por correo) y el email con el que realizaste la compra para ver el estado de tu envío.
            </p>
          </div>
          
          {!order && view === "decision" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Member Option */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-border p-8 hover:border-gold/50 transition-colors flex flex-col h-full shadow-sm"
              >
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 bg-cream-100 flex items-center justify-center rounded-full text-gold-dark mb-4">
                    <UserPlus className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink mb-2">Soy Miembro</h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      Inicia sesión para ver el historial completo de tus pedidos y su estado de envío en un solo lugar.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate("/login?redirect=/account")}
                  className="mt-8 w-full flex items-center justify-center gap-2 bg-ink text-white py-3.5 font-body text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-ink/90 transition-all group"
                >
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Guest Option */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-border p-8 hover:border-gold/50 transition-colors flex flex-col h-full shadow-sm"
              >
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 bg-cream-100 flex items-center justify-center rounded-full text-gold-dark mb-4">
                    <Package className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink mb-2">Compré como Invitado</h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      Rastrea tu pedido utilizando tu número de orden y el correo electrónico asociado a la compra.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setView("guest-form")}
                  className="mt-8 w-full flex items-center justify-center gap-2 bg-transparent border-2 border-ink text-ink py-[12px] font-body text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-white transition-all group"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          )}

          {!order && view === "guest-form" && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleTrack} 
              className="bg-cream-2 p-8 border border-gold/20 shadow-xl relative"
            >
              <button 
                type="button" 
                onClick={() => setView("decision")}
                className="absolute top-4 left-4 text-ink/50 hover:text-ink text-xs flex items-center gap-1 font-semibold uppercase tracking-widest"
              >
                <ChevronLeft size={14} /> Volver
              </button>
              <div className="space-y-6 mt-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ink/70 font-semibold mb-2">
                    Número de Orden
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej. ORD-17215982..."
                    className="w-full h-12 px-4 bg-cream border border-ink/10 focus:border-gold outline-none transition-colors text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ink/70 font-semibold mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full h-12 px-4 bg-cream border border-ink/10 focus:border-gold outline-none transition-colors text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-[#8A3A2A] bg-[#8A3A2A]/5 p-4 text-xs font-medium border border-[#8A3A2A]/20">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-ink text-cream hover:bg-gold hover:text-ink transition-colors flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={16} />
                      Buscar Pedido
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          <AnimatePresence>
            {order && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-cream-2 border border-gold/20 shadow-xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-ink text-cream p-6 border-b border-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gold mb-1 block">Detalles de Orden</span>
                    <h2 className="font-display text-xl tracking-wider">#{order.reference}</h2>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                  {/* General Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink/50 font-semibold mb-3">
                        <Package size={14} /> Resumen
                      </h3>
                      <p className="text-ink mb-1"><strong>Cliente:</strong> {order.customerName}</p>
                      <p className="text-ink mb-1"><strong>Total Pagado:</strong> {formatCOP(order.totalCents / 100)}</p>
                      <p className="text-ink"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString("es-CO")}</p>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink/50 font-semibold mb-3">
                        <MapPin size={14} /> Envío
                      </h3>
                      <p className="text-ink mb-1">{order.shippingAddressJson?.addressLine1}</p>
                      <p className="text-ink mb-1">{order.shippingAddressJson?.city}, {order.shippingAddressJson?.department}</p>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {(order.trackingNumber || (order.shipments && order.shipments[0]?.trackingNumber)) && (
                    <div className="bg-[#FAF8F5] border border-gold/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-ink/50 font-semibold block mb-1">Transportadora</span>
                        <p className="text-sm font-medium text-ink flex items-center gap-2">
                          <Truck size={16} className="text-gold" />
                          {order.carrier || (order.shipments && order.shipments[0]?.carrier) || "Servientrega"}
                        </p>
                        <p className="text-xs text-ink/70 mt-1">Guía: <strong>{order.trackingNumber || (order.shipments && order.shipments[0]?.trackingNumber)}</strong></p>
                      </div>
                      
                      {getTrackingUrl(
                        order.carrier || (order.shipments && order.shipments[0]?.carrier), 
                        order.trackingNumber || (order.shipments && order.shipments[0]?.trackingNumber)
                      ) && (
                        <a 
                          href={getTrackingUrl(
                            order.carrier || (order.shipments && order.shipments[0]?.carrier), 
                            order.trackingNumber || (order.shipments && order.shipments[0]?.trackingNumber)
                          )!}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-2.5 bg-ink text-cream hover:bg-gold hover:text-ink transition-colors text-[10px] uppercase tracking-[0.2em] font-semibold flex-shrink-0"
                        >
                          Rastrear Envío
                        </a>
                      )}
                    </div>
                  )}

                  <hr className="border-gold/10" />

                  {/* Items List */}
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-ink/50 font-semibold mb-4">Productos</h3>
                    <div className="space-y-4">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium text-ink">{item.quantity}x {item.nameSnapshot}</span>
                            <span className="text-xs text-ink/60 mt-0.5">Talla: {item.sizeSnapshot} {item.colorSnapshot ? `| Color: ${item.colorSnapshot}` : ''}</span>
                          </div>
                          <span className="font-semibold">{formatCOP(item.totalCents / 100)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Back button */}
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={() => { setOrder(null); setReference(""); }}
                      className="text-xs uppercase tracking-widest text-ink-soft hover:text-gold underline underline-offset-4 transition-colors"
                    >
                      Consultar otro pedido
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Track;
