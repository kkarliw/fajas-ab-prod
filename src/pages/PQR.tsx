import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/api";

const PQR = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "", order: "", message: "" });
  const [success, setSuccess] = useState<any | false>(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.type || !form.message) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.pqr.createPqr({
        name: form.name,
        email: form.email,
        phone: form.phone,
        type: form.type as any,
        subject: form.order ? `PQR Pedido ${form.order}` : "Solicitud general",
        message: form.message
      });

      setSuccess({
        ticketNumber: res.ticketNumber,
        name: form.name,
        type: form.type,
        subject: form.order ? `PQR Pedido ${form.order}` : "Solicitud general",
        message: form.message
      });
      setForm({ name: "", email: "", phone: "", type: "", order: "", message: "" });
      toast({
        title: "PQR Enviado",
        description: "Tu solicitud ha sido registrada y será atendida pronto."
      });
    } catch (err: any) {
      toast({
        title: "Error de envío",
        description: err.message || "No se pudo registrar la solicitud en este momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="py-16 lg:py-24 px-4 print:py-0 print:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 print:hidden"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3 font-medium">Atención al Cliente</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground uppercase tracking-tight">
            PQR
          </h1>
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
            Peticiones, Quejas y Reclamos. Tu satisfacción es nuestra prioridad. 
            Completa el formulario y te responderemos en un máximo de 48 horas hábiles.
          </p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="print:hidden mb-8">
              <div className="w-16 h-16 rounded-full bg-[#4E8B70]/10 flex items-center justify-center text-[#4E8B70] mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">¡Solicitud Registrada!</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Tu PQR ha sido guardada en nuestra bandeja. Estaremos respondiendo a tu correo en el menor tiempo posible.</p>
            </div>
            
            {/* Ticket Receipt */}
            <div className="bg-white border-2 border-ink p-8 rounded-none text-left relative overflow-hidden shadow-[8px_8px_0_0_rgba(28,26,23,1)] print:shadow-none print:border-0 print:p-0">
              {/* Deco elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNIDAgMCBMIDEwIDggTCAyMCAwIiBmaWxsPSJub25lIiBzdHJva2U9IiMxQzFBMTciIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-repeat-x print:hidden"></div>
              
              <div className="border-b-2 border-dashed border-ink/30 pb-6 mb-6 text-center">
                <h1 className="font-display text-3xl tracking-widest uppercase font-bold text-ink mb-1">Fajas AB</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Comprobante de PQR</p>
                <div className="mt-4 font-mono text-lg font-bold text-ink bg-cream py-2 border border-ink/20 inline-block px-6">
                  {success.ticketNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Fecha</p>
                  <p className="text-xs font-medium text-ink font-mono">{new Date().toLocaleDateString('es-CO')} {new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Tipo de Solicitud</p>
                  <p className="text-xs font-bold text-ink uppercase tracking-wider">{success.type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Datos del Solicitante</p>
                  <p className="text-xs font-medium text-ink">{success.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Asunto</p>
                  <p className="text-sm font-semibold text-ink">{success.subject}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Mensaje enviado</p>
                  <p className="text-[11px] text-ink leading-relaxed whitespace-pre-wrap font-serif bg-cream-2/50 p-4 border border-hairline/20">{success.message}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-dashed border-ink/30 text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Conserve este comprobante para sus registros</p>
              </div>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-ink text-cream text-[11px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
              >
                <Download size={14} />
                Descargar como PDF
              </button>
              <button
                onClick={() => setSuccess(false)}
                className="text-[10px] font-bold uppercase tracking-wider underline hover:text-gold text-muted-foreground"
              >
                Enviar otra solicitud
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-transparent border border-border px-5 py-3.5 text-xs tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors w-full"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-transparent border border-border px-5 py-3.5 text-xs tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors w-full"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-transparent border border-border px-5 py-3.5 text-xs tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors w-full"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-transparent border border-border px-5 py-3.5 text-xs tracking-wider text-foreground focus:outline-none focus:border-foreground transition-colors w-full appearance-none"
              >
                <option value="" disabled>Tipo de solicitud</option>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
                <option value="sugerencia">Sugerencia</option>
                <option value="felicitacion">Felicitación</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Número de pedido (opcional)"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="bg-transparent border border-border px-5 py-3.5 text-xs tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors w-full"
            />

            <textarea
              placeholder="Describe tu petición, queja o reclamo en detalle"
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-transparent border border-border px-5 py-3.5 text-xs tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors w-full resize-none"
            />

            <div className="flex items-start gap-3">
              <input type="checkbox" id="privacy" className="mt-1 accent-foreground" required />
              <label htmlFor="privacy" className="text-xs text-muted-foreground leading-relaxed">
                Acepto la <a href="/privacy" className="underline hover:text-foreground">Política de Privacidad</a> y 
                autorizo el tratamiento de mis datos personales para la gestión de esta solicitud.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1A17] hover:bg-[#2C2A26] text-white h-12 uppercase tracking-[0.2em] text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </button>

            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              De acuerdo con la Ley 1755 de 2015, las peticiones serán resueltas dentro de los 15 días hábiles 
              siguientes a su recepción. Las quejas y reclamos serán atendidos en un plazo máximo de 15 días hábiles.
            </p>
          </motion.form>
        )}
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default PQR;
