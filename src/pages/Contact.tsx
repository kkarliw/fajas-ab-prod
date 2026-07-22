import { useState } from "react";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, ArrowRight, Clock, Loader2 } from "lucide-react";
import { api } from "@/api";
import { contactSubjectOptions } from "@/data/colombiaData";

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [ticketNo, setTicketNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.pqr.createPqr({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject || "Consulta desde Formulario de Contacto",
        type: "peticion",
        message: form.message
      });
      setTicketNo(res.ticketNumber);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Ticker />
      <Navbar />
      <PromoBar />

      <section className="border-b border-hairline">
        <div className="container-luxe py-20 text-center max-w-2xl mx-auto">
          <p className="eyebrow text-ink/55 mb-4">Estamos para ti</p>
          <h1 className="font-display text-[44px] md:text-[56px] leading-[1.05] text-ink">
            Contáctanos
          </h1>
          <p className="mt-5 font-body text-[14px] text-ink/65">
            Escríbenos para asesoría de talla, pedidos al por mayor o cualquier inquietud.
            Respondemos en menos de 24 horas hábiles.
          </p>
        </div>
      </section>

      <section className="container-luxe py-20 grid lg:grid-cols-[1fr_1.4fr] gap-16">
        <aside className="space-y-8">
          {[
            { icon: Mail, title: "Email", value: "hola@abcollection.co", href: "mailto:hola@abcollection.co" },
            { icon: Phone, title: "WhatsApp", value: "+57 300 203 4943", href: "https://api.whatsapp.com/message/XKQGMZT677DBG1?autoload=1&app_absent=0&utm_source=ig" },
            { 
              icon: MapPin, 
              title: "Ubicación", 
              value: "C.C. Supercentro Los Ejecutivos II", 
              sub: "Cl. 31 #Local 96, Los Ejecutivos, Cartagena de Indias, Bolívar" 
            },
            {
              icon: Clock,
              title: "Horario de Atención",
              value: "Lun – Vie: 9:00 a.m. a 7:00 p.m.",
              sub: "Sábado: 9:00 a.m. a 5:00 p.m. | Domingo: Cerrado"
            }
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-4 border-b border-hairline pb-6">
              <span className="w-10 h-10 inline-flex items-center justify-center border border-hairline shrink-0">
                <b.icon size={16} strokeWidth={1.4} className="text-ink/80" />
              </span>
              <div>
                <p className="eyebrow text-ink/60 mb-1">{b.title}</p>
                {b.href ? (
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-[18px] sm:text-[20px] text-ink hover:text-gold transition-colors block leading-snug"
                  >
                    {b.value}
                  </a>
                ) : (
                  <p className="font-display text-[18px] sm:text-[20px] text-ink leading-snug">{b.value}</p>
                )}
                {b.sub && (
                  <p className="font-body text-[12px] sm:text-[13px] text-ink/60 mt-1 leading-relaxed">{b.sub}</p>
                )}
              </div>
            </div>
          ))}
        </aside>

        <form onSubmit={handleSubmit} className="bg-cream-2 p-8 lg:p-12 border border-hairline">
          {sent ? (
            <div className="text-center py-10">
              <p className="eyebrow text-gold mb-3">Mensaje enviado exitosamente</p>
              <h2 className="font-display text-[28px] text-ink mb-3">Gracias por escribirnos</h2>
              <p className="font-body text-[14px] text-ink/65 mb-4">
                Hemos registrado tu solicitud con el radicado <strong className="text-ink">#{ticketNo}</strong>.
              </p>
              <p className="font-body text-[13px] text-muted-foreground">
                Nuestro equipo te responderá a tu correo electrónico pronto.
              </p>
            </div>
          ) : (
            <>
              <p className="eyebrow text-ink/55 mb-2">Cuéntanos</p>
              <h2 className="font-display text-[28px] text-ink mb-8">Envíanos un mensaje</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Nombre completo"
                  id="name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Field
                  label="Correo electrónico"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  required
                />
                <Field
                  label="Teléfono"
                  id="tel"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                <div>
                  <label htmlFor="subject" className="eyebrow text-ink/65 mb-2 block">Motivo de tu consulta</label>
                  <select
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full bg-cream border border-hairline px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-ink font-medium"
                  >
                    <option value="">Selecciona el motivo...</option>
                    {contactSubjectOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="msg" className="eyebrow text-ink/65 mb-2 block">Mensaje</label>
                  <textarea
                    id="msg"
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-cream border border-hairline px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-ink"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-ink mt-8 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    Enviar mensaje <ArrowRight size={14} />
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </section>

      <Footer />
    </div>
  );
};

const Field = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = false
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="eyebrow text-ink/65 mb-2 block">{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full bg-cream border border-hairline px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-ink"
    />
  </div>
);

export default Contact;
