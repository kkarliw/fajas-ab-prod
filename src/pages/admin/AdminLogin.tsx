import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { login } from "@/api/auth";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      // After login, check that this user is actually an admin
      if (result.user.role !== "admin") {
        // Clear the session that was just persisted — not an admin
        localStorage.removeItem("ab_session_v1");
        setError("No tienes permisos de administrador. Comunícate con el equipo de Fajas AB.");
        setSubmitting(false);
        return;
      }

      toast({ title: "Acceso concedido", description: `Bienvenida al panel, ${result.user.name}.` });
      navigate("/admin/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Credenciales incorrectas.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5EFE6] via-[#EDE4D8] to-[#E5D9C8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1C1A17] mb-6">
            <ShieldAlert className="w-7 h-7 text-[#D4A96A]" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#1C1A17] tracking-tight mb-2">
            Panel de Administración
          </h1>
          <p className="text-sm text-[#1C1A17]/60 font-body">
            Acceso restringido. Solo personal autorizado.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#1C1A17]/10 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-[#1C1A17]/70">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C1A17]/40 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="fajasabcol@gmail.com"
                  className="w-full h-12 pl-11 pr-4 bg-[#F5EFE6]/60 border border-[#1C1A17]/20 rounded-lg text-sm font-body text-[#1C1A17] placeholder:text-[#1C1A17]/30 outline-none transition-all focus-visible:border-[#D4A96A] focus-visible:ring-2 focus-visible:ring-[#D4A96A]/30"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-[#1C1A17]/70">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C1A17]/40 pointer-events-none" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 bg-[#F5EFE6]/60 border border-[#1C1A17]/20 rounded-lg text-sm font-body text-[#1C1A17] placeholder:text-[#1C1A17]/30 outline-none transition-all focus-visible:border-[#D4A96A] focus-visible:ring-2 focus-visible:ring-[#D4A96A]/30"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full h-12 bg-[#1C1A17] text-[#D4A96A] uppercase tracking-widest text-[11px] font-semibold font-display rounded-lg hover:bg-[#1C1A17]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Ingresar al Panel"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1C1A17]/10 text-center">
            <a
              href="/"
              className="text-[11px] uppercase tracking-wider text-[#1C1A17]/50 hover:text-[#1C1A17] transition-colors font-display"
            >
              ← Volver a la tienda
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#1C1A17]/30 mt-6 font-body uppercase tracking-widest">
          Fajas AB · Acceso Restringido
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;
