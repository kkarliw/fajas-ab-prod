import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  ShoppingBag, 
  HelpCircle, 
  Mail, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { api } from "@/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { formatCOP } from "@/data/catalog";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.admin.getAdminStats();
        setStats(res);
      } catch (error) {
        console.error("Error loading admin stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  // Compute metrics from real backend stats
  const totalSales = stats?.totalRevenue || 0;
  const pendingOrdersCount = stats?.statusCounts?.pending || 0;
  const activePqrsCount = stats?.activePqrsCount || 0;
  const subsCount = stats?.subsCount || 0;
  const recentOrders = stats?.recentOrders || [];

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Aprobado</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#C4A46A] bg-[#C4A46A]/10 px-2 py-0.5 rounded">Pendiente</span>;
      case "declined":
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Rechazado</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-ink/40 bg-ink/5 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const getShippingStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={14} className="text-[#4E8B70]" />;
      case "fulfilled":
        return <TrendingUp size={14} className="text-blue-500" />;
      case "unfulfilled":
      case "pending":
        return <Clock size={14} className="text-[#C4A46A]" />;
      case "cancelled":
      case "returned":
        return <XCircle size={14} className="text-[#8A3A2A]" />;
      default:
        return <Clock size={14} className="text-muted-foreground" />;
    }
  };

  const getShippingStatusText = (status: string): string => {
    switch (status) {
      case "delivered": return "Entregado";
      case "fulfilled": return "Enviado";
      case "unfulfilled":
      case "pending": return "Pendiente";
      case "cancelled":
      case "returned": return "Cancelado";
      default: return status || "Pendiente";
    }
  };

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

  return (
    <AdminLayout title="Resumen Ejecutivo">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1: Sales */}
        <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ventas Aprobadas</span>
            <p className="font-display text-[24px] sm:text-[28px] text-ink font-semibold leading-tight">{formatCOP(totalSales)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#4E8B70]/10 flex items-center justify-center text-[#4E8B70]">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Envíos Pendientes</span>
            <p className="font-display text-[24px] sm:text-[28px] text-ink font-semibold leading-tight">{pendingOrdersCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#C4A46A]/10 flex items-center justify-center text-[#C4A46A]">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Card 3: Active PQRs */}
        <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PQRs Activas</span>
            <p className="font-display text-[24px] sm:text-[28px] text-ink font-semibold leading-tight">{activePqrsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#8A3A2A]/10 flex items-center justify-center text-[#8A3A2A]">
            <HelpCircle size={20} />
          </div>
        </div>

        {/* Card 4: Subscribers */}
        <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Boletín (Susc.)</span>
            <p className="font-display text-[24px] sm:text-[28px] text-ink font-semibold leading-tight">{subsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center text-ink/60">
            <Mail size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-2 bg-card border border-border/60 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-hairline/10 mb-6">
              <h2 className="font-display text-[18px] uppercase tracking-wide text-ink font-semibold">Pedidos Recientes</h2>
              <Link to="/admin/orders" className="text-[11px] uppercase tracking-wider text-gold hover:text-gold-dark transition-colors inline-flex items-center gap-1 font-semibold">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    <th className="pb-3">ID Pedido</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Pago</th>
                    <th className="pb-3">Envío</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline/5">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-cream-2/5 transition-colors">
                      <td className="py-3.5 font-mono text-[12px] font-bold text-ink/80" title={order.id}>
                        {getShortRef(order)}
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium text-ink">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customerEmail}</div>
                      </td>
                      <td className="py-3.5 font-display font-medium text-[15px]">{formatCOP(order.total)}</td>
                      <td className="py-3.5">{getPaymentStatusBadge(order.paymentStatus)}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-[12px] font-medium">
                          {getShippingStatusIcon(order.shippingStatus)}
                          <span>{getShippingStatusText(order.shippingStatus)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">No hay pedidos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Quick Links */}
        <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-hairline/10 mb-6">
            <h2 className="font-display text-[18px] uppercase tracking-wide text-ink font-semibold">Accesos Rápidos</h2>
          </div>
          <div className="space-y-3">
            {[
              { to: "/admin/products", label: "Gestionar Productos", icon: ShoppingBag },
              { to: "/admin/orders", label: "Ver Órdenes", icon: TrendingUp },
              { to: "/admin/pqrs", label: "Soporte PQRs", icon: HelpCircle },
              { to: "/admin/subscribers", label: "Suscriptores", icon: Mail },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-gold/50 hover:bg-cream-2/20 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium text-ink group-hover:text-gold transition-colors">{label}</span>
                <ArrowRight size={14} className="ml-auto text-muted-foreground group-hover:text-gold transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
