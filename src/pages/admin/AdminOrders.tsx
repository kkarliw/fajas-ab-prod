import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Eye, 
  X, 
  FolderOpen
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/api";
import { formatCOP } from "@/data/catalog";
import { toast } from "@/hooks/use-toast";

type DbOrder = {
  id: string;
  reference?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  department?: string;
  date: string;
  createdAt?: string;
  total: number;
  paymentStatus: "pending" | "approved" | "declined" | "refunded";
  shippingStatus: "pending" | "shipped" | "delivered" | "cancelled" | "processing" | "fulfilled";
  trackingCode?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
};

const AdminOrders = () => {

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [shippingFilter, setShippingFilter] = useState("all");
  
  // Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Form edit states
  const [paymentStatus, setPaymentStatus] = useState<DbOrder["paymentStatus"]>("pending");
  const [shippingStatus, setShippingStatus] = useState<DbOrder["shippingStatus"]>("pending");
  const [carrier, setCarrier] = useState("Servientrega");
  const [trackingCode, setTrackingCode] = useState("");

  const queryClient = useQueryClient();

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const res = await api.admin.getAdminOrders();
      return Array.isArray(res) ? res : res.data || [];
    }
  });

  const getShortRef = (o: any) => {
    if (o.reference && o.reference.startsWith("ORD-")) {
      const parts = o.reference.split("-");
      const lastPart = parts[parts.length - 1];
      return `#AB-${lastPart.toUpperCase()}`;
    }
    if (o.reference && o.reference.length <= 10) {
      return o.reference.startsWith("#") ? o.reference : `#${o.reference}`;
    }
    const cleanId = (o.id || o.reference || "").replace(/[^a-zA-Z0-9]/g, "");
    return `#AB-${cleanId.slice(-6).toUpperCase()}`;
  };

  const formatDate = (raw?: any) => {
    if (!raw) return "Reciente";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "Reciente";
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const orders: DbOrder[] = useMemo(() => {
    return rawOrders.map((o: any) => {
      const formattedRef = getShortRef(o);
      const rawDate = o.createdAt || o.date || o.updatedAt;
      const formattedDate = formatDate(rawDate);

      return {
        id: o.id,
        reference: formattedRef,
        customerName: o.customerName || o.user?.name || "Desconocido",
        customerEmail: o.email || o.user?.email || "Sin email",
        customerPhone: o.phone || o.user?.phone || "Sin teléfono",
        address: o.shippingAddressJson?.addressLine1 || "",
        city: o.shippingAddressJson?.city || "",
        department: o.shippingAddressJson?.department || "",
        date: formattedDate,
        createdAt: formattedDate,
        total: o.totalCents ? o.totalCents / 100 : (o.total || 0),
        paymentStatus: o.paymentStatus || "pending",
        shippingStatus: o.status || "pending",
        trackingCode: o.shipments?.[0]?.trackingNumber || o.trackingNumber || "", 
        carrier: o.shipments?.[0]?.carrier || o.carrier || "Servientrega",
        items: o.items?.map((i: any) => ({
          name: i.nameSnapshot || i.name || "Producto",
          quantity: i.quantity || 1,
          price: i.unitPriceCents ? i.unitPriceCents / 100 : (i.price || 0),
          size: i.sizeSnapshot || i.size || "Única",
          color: i.colorSnapshot || i.color || ""
        })) || []
      };
    });
  }, [rawOrders]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, trackingCode, paymentStatus, carrier }: { id: string; status: string; trackingCode?: string; paymentStatus?: string; carrier?: string }) => 
      api.admin.updateOrderStatus(id, status, trackingCode, paymentStatus, carrier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast({
        title: "Pedido y Guía Actualizados",
        description: `Se guardaron los estados y el número de guía.`
      });
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido.",
        variant: "destructive"
      });
    }
  });

  const handleOpenDetails = (o: DbOrder) => {
    setSelectedOrder(o);
    setPaymentStatus(o.paymentStatus);
    setShippingStatus(o.shippingStatus);
    setCarrier(o.carrier || "Servientrega");
    setTrackingCode(o.trackingCode || "");
    setIsDetailsOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    updateStatusMutation.mutate({
      id: selectedOrder.id,
      status: shippingStatus,
      trackingCode,
      paymentStatus,
      carrier
    });
  };

  const getPaymentStatusBadge = (status: DbOrder["paymentStatus"]) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Aprobado</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#C4A46A] bg-[#C4A46A]/10 px-2 py-0.5 rounded">Pendiente</span>;
      case "declined":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Rechazado</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-ink/45 bg-ink/5 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const getShippingStatusBadge = (status: DbOrder["shippingStatus"]) => {
    switch (status) {
      case "fulfilled":
      case "delivered":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Entregado</span>;
      case "processing":
      case "shipped":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded">Procesando/Enviado</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#C4A46A] bg-[#C4A46A]/10 px-2 py-0.5 rounded">Pendiente</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Cancelado</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-ink/45 bg-ink/5 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    const matchesShipping = shippingFilter === "all" || o.shippingStatus === shippingFilter;
    return matchesSearch && matchesPayment && matchesShipping;
  });

  return (
    <AdminLayout title="Gestión de Pedidos">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-md text-sm outline-none transition-all focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center justify-end">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold w-full sm:w-auto"
          >
            <option value="all">Todos los Pagos</option>
            <option value="approved">Aprobado</option>
            <option value="pending">Pendiente</option>
            <option value="declined">Rechazado</option>
          </select>

          <select
            value={shippingFilter}
            onChange={(e) => setShippingFilter(e.target.value)}
            className="h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold w-full sm:w-auto"
          >
            <option value="all">Todos los Envíos</option>
            <option value="pending">Pendiente</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/5">
                <th className="p-4">ID Pedido</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Productos</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado Pago</th>
                <th className="p-4">Estado Envío</th>
                <th className="p-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/5">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-cream-2/5 transition-colors">
                  <td className="p-4 font-mono text-[12px] font-bold text-ink/80" title={order.id}>
                    {order.reference}
                  </td>
                  <td className="p-4 text-[12px] text-ink/75">
                    {order.date}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-ink leading-snug">{order.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">{order.customerEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[12px] text-ink/80 truncate max-w-[180px]" title={order.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(", ")}>
                      {order.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(", ")}
                    </div>
                  </td>
                  <td className="p-4 font-display font-semibold text-[15px]">{formatCOP(order.total)}</td>
                  <td className="p-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                  <td className="p-4">{getShippingStatusBadge(order.shippingStatus)}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(order)}
                      className="p-2 border border-border/50 text-ink/80 hover:bg-cream-2 hover:text-gold transition-all"
                      title="Ver Detalles"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground font-medium flex flex-col items-center gap-2">
                    <FolderOpen size={32} className="opacity-40" />
                    <span>No se encontraron pedidos registrados.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-center justify-between border-b border-hairline/15 pb-4 mb-6">
              <div>
                <h3 className="font-display text-[22px] font-semibold text-ink">
                  Detalle del Pedido
                </h3>
                <span className="font-mono text-[12px] font-bold text-ink-soft bg-ink/75 px-2 py-0.5 rounded mt-1.5 inline-block">
                  {selectedOrder.reference || `#AB-${selectedOrder.id.slice(-6).toUpperCase()}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="text-ink/65 hover:text-gold transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="space-y-4 border border-border/50 p-4 rounded bg-cream-2/10">
                <h4 className="font-display text-[16px] font-semibold text-ink border-b border-hairline/10 pb-2">Información del Cliente</h4>
                <div className="space-y-2 text-[13px]">
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Nombre</span>
                    <span className="text-ink font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Correo Electrónico</span>
                    <span className="text-ink font-medium">{selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Teléfono de Contacto</span>
                    <span className="text-ink font-medium">{selectedOrder.customerPhone}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Dirección de Envío</span>
                    <span className="text-ink font-medium">
                      {selectedOrder.address}, {selectedOrder.city} - {selectedOrder.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status Form */}
              <form onSubmit={handleSaveStatus} className="space-y-4 border border-border/50 p-4 rounded bg-cream-2/10 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-display text-[16px] font-semibold text-ink border-b border-hairline/10 pb-2">Estado del Pedido</h4>
                  
                  {/* Payment Status */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Estado de Pago</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="approved">Aprobado / Exitoso</option>
                      <option value="declined">Rechazado / Fallido</option>
                      <option value="refunded">Reembolsado</option>
                    </select>
                  </div>

                  {/* Shipping Status */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Estado de Envío</label>
                    <select
                      value={shippingStatus}
                      onChange={(e) => setShippingStatus(e.target.value as any)}
                      className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="processing">Procesando / Despachado</option>
                      <option value="fulfilled">Entregado / Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>

                  {/* Carrier Selection */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Empresa de Transporte</label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    >
                      <option value="Servientrega">Servientrega</option>
                      <option value="Interrapidísimo">Interrapidísimo</option>
                      <option value="Envía Colvanes">Envía Colvanes</option>
                      <option value="Coordinadora">Coordinadora</option>
                      <option value="TCC">TCC</option>
                      <option value="Deprisa">Deprisa</option>
                      <option value="Domina">Domina / Mensajería Urbana</option>
                      <option value="Otra">Otra Transportadora</option>
                    </select>
                  </div>

                  {/* Tracking Code */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Número de Guía / Rastreo</label>
                    <input
                      type="text"
                      placeholder="Ej. 91823746501"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-gold text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-gold-dark hover:text-ink-soft transition-colors mt-4"
                >
                  Actualizar Estados
                </button>
              </form>
            </div>

            {/* Items Purchased List */}
            <div className="border border-border/50 p-4 rounded bg-cream-2/10">
              <h4 className="font-display text-[16px] font-semibold text-ink border-b border-hairline/10 pb-2 mb-4">Productos Adquiridos</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={`${item.slug}-${index}`} className="flex items-center justify-between text-sm py-2 border-b border-hairline/5 last:border-0 last:pb-0">
                    <div>
                      <span className="font-medium text-ink block">{item.name}</span>
                      <span className="text-[11px] text-muted-foreground font-semibold uppercase">
                        Talla: {item.size} · Color: {item.color} · Cantidad: {item.quantity}
                      </span>
                    </div>
                    <span className="font-display font-medium text-[15px]">
                      {formatCOP(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-base font-semibold border-t border-hairline/10 pt-4 mt-2">
                  <span className="text-ink">Total del Pedido</span>
                  <span className="font-display text-[18px] text-gold-dark">{formatCOP(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
