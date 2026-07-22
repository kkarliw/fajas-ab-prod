const MarqueeBanner = () => {
  const text = "TECNOLOGÍA COLOMBIANA • NUEVA COLECCIÓN •  FAJAS AB • HECHO EN COLOMBIA • CALIDAD PREMIUM • ";
  
  return (
    <div className="bg-foreground text-primary-foreground py-3 overflow-hidden">
      <div className="marquee-track">
        {[0, 1].map((i) => (
          <span key={i} className="text-xs tracking-[0.3em] uppercase font-semibold whitespace-nowrap px-2">
            {text}{text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
