import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

const PromoBar = () => {
  const { data: settings } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const data = await api.settings.getStoreSettings();
      return data;
    },
  });

  const promoText = settings?.promoBarText || "Tecnología Colombiana · Garantía de Calidad · Hecho en Colombia";

  return (
    <div className="bg-gold text-ink text-center py-2.5 text-[11px] uppercase font-body" style={{ letterSpacing: "0.2em" }}>
      {promoText}
    </div>
  );
};

export default PromoBar;
