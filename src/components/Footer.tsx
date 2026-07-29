import { Link } from "react-router-dom";
import logoFajasAb from "@/assets/fajas-ab-logo.png";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

const colShop = ["Brasieres", "Fajas", "Cinturillas", "Shorts", "Accesorios", "Sale"];
const colInfo = [
  { label: "Sobre Nosotros", to: "/about" },
  { label: "Guía de Tallas", to: "/size-guide" },
  { label: "Uso y Cuidado", to: "/care" },
  { label: "Envíos y Garantía", to: "/shipping" },
  { label: "Preguntas Frecuentes", to: "/faq" },
  { label: "PQR", to: "/pqr" },
];

const colAbout = [
  { label: "Nuestra Historia", to: "/about" },
  { label: "Términos", to: "/terms" },
  { label: "Privacidad", to: "/privacy" },
];

const Footer = () => {
  const [waLink, setWaLink] = useState("https://wa.me/573002034943");

  const { data: settings } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const data = await api.settings.getStoreSettings();
      return data;
    },
  });

  useEffect(() => {
    if (settings?.contactPhone) {
      const cleanPhone = settings.contactPhone.replace(/\D/g, "");
      setWaLink(`https://wa.me/${cleanPhone}`);
    }
  }, [settings]);

  const colSupport = [
    { label: "Contacto", to: "/contact" },
    { label: "WhatsApp", to: waLink },
    { label: "Mi Cuenta", to: "/account" },
    { label: "Rastreo de Pedido", to: "/account" },
  ];

  return (
    <footer className="bg-[#1A1A18] text-ink-soft">
      <div className="container-luxe py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-14">
          {/* About column with logo */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <img
              src={logoFajasAb}
              alt="FAJAS AB"
              className="h-16 w-auto mb-5 opacity-90"
              loading="lazy"
            />
            <p className="font-body text-[13px] text-ink-soft/70 leading-relaxed max-w-xs">
              Fajas diseñadas en Colombia. Compresión que se siente como segunda piel,
              estética que se siente editorial.
            </p>
            <ul className="mt-6 space-y-3">
              {colAbout.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="font-body text-[13px] text-ink-soft/65 hover:text-gold-light transition-colors">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-ink-soft/70 mb-5">Comprar</h4>
            <ul className="space-y-3">
              {colShop.map((l) => (
                <li key={l}>
                  <Link to="/shop" className="font-body text-[13px] text-ink-soft/65 hover:text-gold-light transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-ink-soft/70 mb-5">Información</h4>
            <ul className="space-y-3">
              {colInfo.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="font-body text-[13px] text-ink-soft/65 hover:text-gold-light transition-colors">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-ink-soft/70 mb-5">Soporte</h4>
            <ul className="space-y-3">
              {colSupport.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="font-body text-[13px] text-ink-soft/65 hover:text-gold-light transition-colors">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-ink-soft/55">
              <a
                href="https://www.instagram.com/fajasab?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors"
              >
                IG
              </a>
              <span aria-hidden>·</span>
              <a
                href="https://www.tiktok.com/@fajasab?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors"
              >
                TK
              </a>
              <span aria-hidden>·</span>
              <a
                href="https://www.facebook.com/p/Posquirurgicos_AB-100065494119104/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors"
              >
                FB
              </a>
              <span aria-hidden>·</span>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors"
              >
                WA
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-ink-soft/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft/45">
            © 2026 FAJAS AB. Todos los derechos reservados.
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft/45">
            Hecho en Colombia · Fajas diseñadas con amor y dedicación.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
