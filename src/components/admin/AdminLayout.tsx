import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Inbox, 
  Mail, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  User,
  Ticket,
  MessageSquare,
  Settings
} from "lucide-react";
import { api } from "@/api";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const navigation = [
  { name: "Resumen", href: "/admin", icon: LayoutDashboard },
  { name: "Productos", href: "/admin/products", icon: ShoppingBag },
  { name: "Pedidos", href: "/admin/orders", icon: Receipt },
  { name: "Soporte PQR", href: "/admin/pqrs", icon: Inbox },
  { name: "Email Marketing", href: "/admin/subscribers", icon: Mail },
  { name: "Cupones", href: "/admin/coupons", icon: Ticket },
  { name: "Testimonios", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Ajustes", href: "/admin/settings", icon: Settings },
];

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("Administrador");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ab_session_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) setAdminName(parsed.name);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Fallback
      localStorage.removeItem("ab_session_v1");
      localStorage.removeItem("ab_access_token");
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row text-ink font-body">
      {/* Mobile Top Header */}
      <header className="md:hidden w-full h-16 bg-[#1A1A18] text-ink-soft border-b border-hairline/20 px-4 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 -ml-1 text-ink-soft hover:text-gold transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <span className="font-display text-[18px] uppercase tracking-wider text-gold-light">
            FAJAS AB
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-gold font-semibold">
          ADMIN
        </span>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-[#1A1A18] text-ink-soft p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-hairline/15 pb-4 mb-6">
              <span className="font-display text-[20px] tracking-wider text-gold-light">
                FAJAS AB
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-ink-soft hover:text-gold transition-colors p-1"
                aria-label="Cerrar menú"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded text-[12px] uppercase tracking-wider font-medium transition-all ${
                      isActive 
                        ? "bg-gold text-ink font-semibold" 
                        : "text-ink-soft/75 hover:bg-cream-2/5 hover:text-ink-soft"
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.0 : 1.4} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-hairline/15 pt-4 mt-auto space-y-3">
              <div className="flex items-center gap-2 px-4 py-2">
                <User size={15} className="text-gold" />
                <span className="text-[11px] uppercase tracking-widest text-ink-soft/85 truncate font-medium">
                  {adminName}
                </span>
              </div>
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2 text-[12px] uppercase tracking-wider text-ink-soft/70 hover:text-gold-light transition-colors font-medium"
              >
                <ExternalLink size={15} strokeWidth={1.4} />
                Ver Tienda
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-[12px] uppercase tracking-wider text-[#E87A65] hover:text-[#FF9D8A] transition-colors text-left font-medium"
              >
                <LogOut size={15} strokeWidth={1.4} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] lg:w-[280px] bg-[#1A1A18] text-ink-soft border-r border-hairline/20 p-6 flex-shrink-0 sticky top-0 h-screen z-30">
        <div className="border-b border-hairline/15 pb-6 mb-8 text-center">
          <span className="font-display text-[24px] tracking-[0.1em] text-gold-light block">
            FAJAS AB
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-gold mt-1.5 font-semibold block">
            Panel de Control
          </span>
        </div>

        <nav className="flex-1 space-y-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 ${
                  isActive 
                    ? "bg-gold text-ink" 
                    : "text-ink-soft/70 hover:bg-cream-2/5 hover:text-ink-soft"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.0 : 1.3} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-hairline/15 pt-6 space-y-4">
          <div className="flex items-center gap-2.5 px-4">
            <div className="w-6 h-6 rounded-full bg-gold-light/10 border border-gold/30 flex items-center justify-center text-gold">
              <User size={13} strokeWidth={1.5} />
            </div>
            <span className="text-[11px] uppercase tracking-[0.15em] text-ink-soft/80 truncate font-semibold">
              {adminName}
            </span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink-soft/60 hover:text-gold transition-colors font-semibold"
          >
            <ExternalLink size={14} strokeWidth={1.3} />
            Ver Tienda
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#E87A65] hover:text-[#FF9D8A] transition-colors text-left font-semibold"
          >
            <LogOut size={14} strokeWidth={1.3} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <h1 className="font-display text-[28px] sm:text-[36px] tracking-tight text-ink mb-2">
          {title}
        </h1>
        <div className="w-12 h-0.5 bg-gold mb-8" />
        
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
