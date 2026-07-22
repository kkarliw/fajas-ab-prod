const items = [
  {
    title: "Envío nacional",
    desc: "A toda Colombia",
    icon: (
      <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-7">
        <rect x="1" y="6" width="28" height="18" />
        <path d="M29 12h10l7 6v6H29z" />
        <circle cx="11" cy="26" r="4" />
        <circle cx="37" cy="26" r="4" />
      </svg>
    ),
  },
  {
    title: "Garantía de Fábrica",
    desc: "24h para reportar defectos",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1" className="w-9 h-9">
        <path d="M6 20a14 14 0 0 1 24-9.9" />
        <path d="M30 4v6h-6" />
        <path d="M34 20a14 14 0 0 1-24 9.9" />
        <path d="M10 36v-6h6" />
      </svg>
    ),
  },
  {
    title: "Empaque premium",
    desc: "Listo para regalar",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1" className="w-9 h-9">
        <rect x="4" y="14" width="32" height="22" />
        <path d="M2 14h36v6H2z" />
        <path d="M20 14v22" />
        <path d="M20 14c-4-6-12-4-12 0 0 2 4 2 12 0zM20 14c4-6 12-4 12 0 0 2-4 2-12 0z" />
      </svg>
    ),
  },
  {
    title: "Atención",
    desc: "Lun – Vie: 9am – 7pm · Sáb: 9am – 5pm",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1" className="w-9 h-9">
        <path d="M6 22a14 14 0 0 1 28 0v8a3 3 0 0 1-3 3h-3v-12h6" />
        <path d="M6 22v8a3 3 0 0 0 3 3h3V21H6" />
      </svg>
    ),
  },
];

const ServiceStrip = () => (
  <section className="bg-cream-2 border-b border-hairline">
    <div className="container-luxe py-10 md:py-12">
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((it) => (
          <li key={it.title} className="flex flex-col items-center text-center gap-3 px-2">
            <span className="text-ink/80">{it.icon}</span>
            <div>
              <p className="eyebrow text-ink/80">{it.title}</p>
              <p className="font-body text-[12px] md:text-[13px] text-ink/60 mt-1.5 leading-relaxed">
                {it.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ServiceStrip;
