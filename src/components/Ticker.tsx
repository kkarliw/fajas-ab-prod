const items = [
  "Lujo posquirúrgico y de uso diario",
  "Nueva colección",
  "Fajas AB",
  "Hecho en Colombia",
  "Calidad premium",
  "Garantía por defectos de fábrica",
];

const Ticker = () => {
  const text = items.join("  ·  ") + "  ·  ";
  return (
    <div className="bg-ink text-ink-soft py-3 overflow-hidden">
      <div className="ticker">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="whitespace-nowrap px-6 text-[11px] uppercase font-body font-light"
            style={{ letterSpacing: "0.18em" }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
