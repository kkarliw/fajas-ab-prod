import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, MapPin, LogOut, Loader2, CheckCircle2, Clock, XCircle, ChevronRight, ChevronDown, ExternalLink, Edit3, Mail, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/api";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import { colombianDepartments, colombianCitiesByDepartment } from "@/data/colombiaData";
import type { OrderDTO, UserDTO } from "@/types/dtos";

type Tab = "profile" | "orders" | "addresses";

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "Perfil", icon: User },
  { key: "orders", label: "Pedidos", icon: Package },
  { key: "addresses", label: "Direcciones", icon: MapPin },
];

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function Account() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Tab>("profile");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const [user, setUser] = useState<UserDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Add address modal state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    department: "",
    isDefault: false
  });

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    document.title = "Mi Cuenta · AB";
    
    Promise.all([
      api.auth.getMe(),
      api.orders.getOrders(),
      api.addresses.getAddresses().catch(() => [])
    ]).then(([userData, ordersData, addressesData]) => {
      setUser(userData);
      if (userData) {
        setProfileName(userData.name);
        setProfilePhone(userData.phone || "");
      }
      setOrders(ordersData);
      setAddresses(addressesData || []);
      setLoading(false);
    }).catch((err) => {
      if (err.status === 401 || err.status === 403) {
        navigate("/login");
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await api.auth.updateMe({ name: profileName, phone: profilePhone });
      setUser((prev) => (prev ? { ...prev, name: updated.name, phone: updated.phone } : updated));
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      alert(err?.message || "Error al actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const created = await api.addresses.createAddress(newAddr);
      setAddresses((prev) => [created, ...prev]);
      setShowAddressForm(false);
      setNewAddr({
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        department: "",
        isDefault: false
      });
    } catch (err: any) {
      alert(err?.message || "Error al guardar la dirección");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta dirección?")) return;
    try {
      await api.addresses.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.message || "Error al eliminar dirección");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updated = await api.addresses.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id
        }))
      );
    } catch (err: any) {
      alert(err?.message || "Error al actualizar dirección por defecto");
    }
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % tabs.length;
      tabRefs.current[next]?.focus();
      setActive(tabs[next].key);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + tabs.length) % tabs.length;
      tabRefs.current[prev]?.focus();
      setActive(tabs[prev].key);
    } else if (e.key === "Home") {
      e.preventDefault();
      tabRefs.current[0]?.focus();
      setActive(tabs[0].key);
    } else if (e.key === "End") {
      e.preventDefault();
      tabRefs.current[tabs.length - 1]?.focus();
      setActive(tabs[tabs.length - 1].key);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      /* ignore */
    }
    navigate("/login");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusDetails = (status: string) => {
    const map: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
      pending: { label: "Pendiente", icon: Clock, color: "text-amber-700", bg: "bg-amber-100" },
      processing: { label: "Procesando", icon: Loader2, color: "text-blue-700", bg: "bg-blue-100" },
      fulfilled: { label: "Entregado", icon: CheckCircle2, color: "text-green-700", bg: "bg-green-100" },
      cancelled: { label: "Cancelado", icon: XCircle, color: "text-red-700", bg: "bg-red-100" }
    };
    return map[status] || map.pending;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <Navbar />

      {/* Premium Hero Section */}
      <div className="bg-foreground text-background py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-gold/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-background/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />
        
        <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-3xl sm:text-4xl font-display font-medium text-foreground shadow-2xl shadow-gold/20 shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="text-center sm:text-left mt-2">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Hola, {user.name}
            </h1>
            <p className="text-background/70 text-sm tracking-wide">
              {user.email} • Miembro desde {new Date(user.createdAt).getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-16">
          
          {/* Navigation Sidebar */}
          <nav aria-label="Secciones de cuenta" className="sticky top-24">
            <div
              role="tablist"
              aria-orientation="vertical"
              className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((t, i) => {
                const Icon = t.icon;
                const selected = active === t.key;
                return (
                  <button
                    key={t.key}
                    ref={(el) => (tabRefs.current[i] = el)}
                    role="tab"
                    id={`tab-${t.key}`}
                    aria-controls={`panel-${t.key}`}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(t.key)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={`relative flex items-center gap-3 px-5 py-4 text-[12px] tracking-[0.15em] uppercase font-semibold whitespace-nowrap transition-colors rounded-xl outline-none group ${
                      selected ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                    }`}
                  >
                    {selected && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-white shadow-sm border border-black/5 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon size={16} className={selected ? "text-gold-dark" : "opacity-70"} />
                    {t.label}
                  </button>
                );
              })}
              
              <div className="hidden lg:block w-full h-px bg-border/60 my-4" />
              
              <button
                type="button"
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-3 px-5 py-4 text-[12px] tracking-[0.15em] uppercase font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors rounded-xl"
              >
                <LogOut size={16} className="opacity-70" /> Cerrar sesión
              </button>
            </div>
          </nav>

          {/* Tab Content Panels */}
          <section className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {active === "profile" && (
                <Panel key="profile" id="profile">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                        Información personal
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Gestiona tus datos personales y preferencias de contacto.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8 space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        label="Nombre completo"
                        defaultValue={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        icon={<User size={16} />}
                        required
                      />
                      <Input
                        label="Correo electrónico"
                        type="email"
                        defaultValue={user.email}
                        disabled
                        icon={<Mail size={16} />}
                      />
                      <Input
                        label="Teléfono"
                        type="tel"
                        defaultValue={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="Añadir teléfono..."
                        icon={<MapPin size={16} />}
                      />
                    </div>
                    
                    <div className="pt-4 flex justify-end border-t border-black/5">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-gold transition-colors shadow-md disabled:opacity-50"
                      >
                        <Edit3 size={14} />
                        {savingProfile ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                </Panel>
              )}

              {active === "orders" && (
                <Panel key="orders" id="orders">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                    Mis pedidos
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    Haz seguimiento a tus compras recientes y revisa tu historial.
                  </p>
                  
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-black/5 p-12 text-center shadow-sm flex flex-col items-center">
                      <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-6">
                        <Package size={32} className="text-gold-dark opacity-50" />
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2">Sin pedidos aún</h3>
                      <p className="text-muted-foreground text-sm max-w-md mb-8">
                        Cuando realices compras en nuestra tienda, aquí podrás ver su estado y hacerles seguimiento en tiempo real.
                      </p>
                      <Link
                        to="/shop"
                        className="bg-foreground text-background px-8 py-3.5 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-gold transition-colors"
                      >
                        Ir de compras
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((o) => {
                        const status = getStatusDetails(o.status);
                        const StatusIcon = status.icon;
                        const isExpanded = expandedOrderId === o.id;
                        const address = o.shippingAddressJson as any;
                        const addressStr = address
                          ? [address.addressLine1 || address.street, address.city, address.department || address.state].filter(Boolean).join(", ")
                          : "Dirección registrada en checkout";

                        return (
                          <div
                            key={o.id}
                            className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                              isExpanded ? "border-gold/50 shadow-md ring-1 ring-gold/20" : "border-black/5 shadow-sm hover:shadow-md hover:border-gold/30"
                            }`}
                          >
                            {/* Header bar - Clickable */}
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                              className="p-6 cursor-pointer select-none"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${status.bg} ${status.color}`}>
                                    <StatusIcon size={20} className={status.icon === Loader2 ? "animate-spin" : ""} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-1">
                                      <h3 className="font-display font-semibold text-lg">{o.reference}</h3>
                                      <span className={`text-[10px] uppercase tracking-[0.1em] font-bold px-2.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                                        {status.label}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(o.createdAt)} • {o.items?.length || 1} {o.items?.length === 1 ? 'artículo' : 'artículos'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pt-4 sm:pt-0 border-t sm:border-0 border-black/5">
                                  <div className="text-left sm:text-right">
                                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-0.5">Total</p>
                                    <p className="font-semibold text-lg tabular-nums">{formatPrice(o.totalCents / 100)}</p>
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                      isExpanded ? "bg-gold text-foreground rotate-180" : "bg-cream text-foreground group-hover:bg-gold group-hover:text-background"
                                    }`}
                                  >
                                    <ChevronDown size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Accordion Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="border-t border-black/5 bg-cream/30 px-6 pb-6 pt-4"
                                >
                                  {/* Address & Customer details */}
                                  <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-xl border border-black/5 text-xs">
                                    <div>
                                      <p className="uppercase tracking-[0.15em] text-[10px] font-bold text-muted-foreground mb-1">Cliente</p>
                                      <p className="font-medium text-foreground">{o.customerName || user.name}</p>
                                      <p className="text-muted-foreground">{o.email || user.email}</p>
                                      {o.phone && <p className="text-muted-foreground">Tel: {o.phone}</p>}
                                    </div>
                                    <div>
                                      <p className="uppercase tracking-[0.15em] text-[10px] font-bold text-muted-foreground mb-1">Dirección de Envío</p>
                                      <p className="font-medium text-foreground">{addressStr}</p>
                                      <p className="text-muted-foreground mt-0.5">Estado del pago: <span className="font-bold text-green-700 capitalize">{o.paymentStatus === 'approved' ? 'Aprobado' : o.paymentStatus}</span></p>
                                    </div>
                                  </div>

                                  {/* Items list */}
                                  <div className="space-y-3 mb-6">
                                    <p className="uppercase tracking-[0.15em] text-[10px] font-bold text-muted-foreground mb-2">Artículos en este pedido</p>
                                    {o.items && o.items.length > 0 ? (
                                      o.items.map((item: any, idx: number) => {
                                        const imgUrl = getProductImageUrl(item.product?.images?.[0]?.url, item.product?.slug || item.nameSnapshot);
                                        return (
                                          <div key={idx} className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-black/5">
                                            <img
                                              src={imgUrl}
                                              alt={item.nameSnapshot}
                                              className="w-14 h-16 object-cover object-center rounded-lg bg-cream-2 shrink-0 border border-black/5"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-display font-semibold text-sm truncate">{item.nameSnapshot}</h4>
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                Talla: <span className="font-semibold text-foreground">{item.sizeSnapshot}</span>
                                                {item.colorSnapshot && ` • Color: ${item.colorSnapshot}`}
                                              </p>
                                              <p className="text-xs font-medium text-foreground mt-1">
                                                Cantidad: {item.quantity} × {formatPrice(item.unitPriceCents / 100)}
                                              </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <span className="font-semibold text-sm text-foreground">{formatPrice(item.totalCents / 100)}</span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <p className="text-xs text-muted-foreground">No hay detalles de artículos cargados.</p>
                                    )}
                                  </div>

                                  {/* Order totals summary & CTA */}
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5">
                                    <div className="flex items-center gap-6 text-xs text-muted-foreground w-full sm:w-auto">
                                      <span>Subtotal: <strong className="text-foreground">{formatPrice(o.subtotalCents / 100)}</strong></span>
                                      <span>Envío: <strong className="text-foreground">{o.shippingCents === 0 ? "Gratis" : formatPrice(o.shippingCents / 100)}</strong></span>
                                    </div>
                                    <Link
                                      to={`/checkout/success?ref=${encodeURIComponent(o.reference)}`}
                                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-[11px] uppercase tracking-[0.18em] font-bold hover:bg-gold transition-colors shadow-sm"
                                    >
                                      <FileText size={14} />
                                      Ver Recibo Completo / Factura
                                      <ExternalLink size={13} />
                                    </Link>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              )}

              {active === "addresses" && (
                <Panel key="addresses" id="addresses">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                        Mis direcciones
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Guarda y gestiona tus direcciones de envío para compras más rápidas.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="bg-foreground text-background px-5 py-2.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-gold transition-colors shrink-0"
                    >
                      {showAddressForm ? "Cancelar" : "+ Nueva dirección"}
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm mb-8 space-y-4">
                      <h3 className="font-display font-semibold text-lg mb-2">Agregar nueva dirección</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="Nombre corto (Ej: Casa, Oficina)" defaultValue={newAddr.name} onChange={(e: any) => setNewAddr({ ...newAddr, name: e.target.value })} required />
                        <Input label="Teléfono de contacto" type="tel" defaultValue={newAddr.phone} onChange={(e: any) => setNewAddr({ ...newAddr, phone: e.target.value })} />
                        <Input label="Dirección (Línea 1)" defaultValue={newAddr.addressLine1} onChange={(e: any) => setNewAddr({ ...newAddr, addressLine1: e.target.value })} required />
                        <Input label="Apto / Casa / Info adicional" defaultValue={newAddr.addressLine2} onChange={(e: any) => setNewAddr({ ...newAddr, addressLine2: e.target.value })} />
                        
                        <div className="space-y-2">
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold ml-1">
                            Departamento
                          </label>
                          <select
                            value={newAddr.department}
                            onChange={(e) => setNewAddr({ ...newAddr, department: e.target.value, city: "" })}
                            required
                            className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none focus:border-gold focus:ring-4 focus:ring-gold/10"
                          >
                            <option value="">Selecciona departamento</option>
                            {colombianDepartments.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold ml-1">
                            Ciudad
                          </label>
                          {newAddr.department && colombianCitiesByDepartment[newAddr.department]?.length ? (
                            <select
                              value={newAddr.city}
                              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                              required
                              className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none focus:border-gold focus:ring-4 focus:ring-gold/10"
                            >
                              <option value="">Selecciona ciudad</option>
                              {colombianCitiesByDepartment[newAddr.department].map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={newAddr.city}
                              placeholder={newAddr.department ? "Escribe tu ciudad" : "Primero selecciona departamento"}
                              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                              required
                              className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none focus:border-gold focus:ring-4 focus:ring-gold/10"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddr.isDefault}
                          onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                          className="w-4 h-4 rounded text-gold focus:ring-gold"
                        />
                        <label htmlFor="isDefault" className="text-xs text-muted-foreground font-medium">
                          Usar como dirección predeterminada
                        </label>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="bg-gold text-foreground px-6 py-2.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-gold-dark transition-colors disabled:opacity-50"
                        >
                          {savingAddress ? "Guardando..." : "Guardar dirección"}
                        </button>
                      </div>
                    </form>
                  )}

                  {addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-black/5 p-12 text-center shadow-sm flex flex-col items-center">
                      <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-6">
                        <MapPin size={32} className="text-gold-dark opacity-50" />
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2">Sin direcciones guardadas</h3>
                      <p className="text-muted-foreground text-sm max-w-sm mb-6">
                        Agrega tu primera dirección para acelerar tus próximos pedidos.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((a) => (
                        <div key={a.id} className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-display font-semibold text-lg">{a.name}</h4>
                              {a.isDefault && (
                                <span className="bg-gold/20 text-gold-dark text-[10px] uppercase tracking-[0.1em] font-bold px-2.5 py-0.5 rounded-full">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground">{a.addressLine1} {a.addressLine2 ? `, ${a.addressLine2}` : ""}</p>
                            <p className="text-xs text-muted-foreground mt-1">{a.city}, {a.department}</p>
                            {a.phone && <p className="text-xs text-muted-foreground mt-0.5">Tel: {a.phone}</p>}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-black/5 text-xs">
                            {!a.isDefault ? (
                              <button
                                onClick={() => handleSetDefaultAddress(a.id)}
                                className="text-gold-dark font-semibold hover:underline"
                              >
                                Usar como principal
                              </button>
                            ) : <span />}
                            <button
                              onClick={() => handleDeleteAddress(a.id)}
                              className="text-destructive font-semibold hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden w-full flex items-center justify-center gap-2 mt-12 px-5 py-4 bg-white border border-black/5 rounded-xl text-[12px] tracking-[0.15em] uppercase font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors shadow-sm"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const Panel = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <motion.div
    role="tabpanel"
    id={`panel-${id}`}
    aria-labelledby={`tab-${id}`}
    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const Input = ({
  label,
  type = "text",
  defaultValue,
  disabled = false,
  placeholder,
  icon,
  onChange,
  required = false
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <div className="space-y-2 relative">
    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold ml-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60">
          {icon}
        </div>
      )}
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        className={`w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 ${icon ? 'pl-11' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-black/5' : 'hover:border-foreground/30'}`}
      />
    </div>
  </div>
);
