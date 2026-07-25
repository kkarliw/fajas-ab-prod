import { useEffect, useState } from "react";
import { 
  Settings, 
  Truck, 
  MessageCircle, 
  Mail, 
  Sparkles,
  Save,
  Undo,
  ImagePlus,
  Loader2,
  X
} from "lucide-react";
import { api } from "@/api";
import { uploadImage } from "@/api/admin";
import { StoreSettings } from "@/api/settings";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<StoreSettings>({
    standardShippingFee: 15000,
    expressShippingFee: 25000,
    freeShippingThreshold: 200000,
    contactPhone: "+573167890123",
    contactEmail: "contacto@fajasab.com",
    promoBarText: "ENVÍO GRATIS EN COMPRAS MAYORES A $200.000",
    promoPopup: {
      enabled: true,
      title: "10% de bienvenida",
      description: "Únete a nuestro club exclusivo y recibe un 10% de descuento en tu primera compra, además de acceso previo a nuevos lanzamientos.",
      couponCode: "BIENVENIDA10",
      imageUrl: ""
    }
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const { isLoading, data } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const data = await api.settings.getStoreSettings();
      if (data) setSettings(data);
      return data;
    },
  });

  const { data: activeCoupons = [] } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => {
      const coupons = await api.admin.getAdminCoupons();
      return coupons.filter((c: any) => c.status === "active");
    }
  });

  const mutation = useMutation({
    mutationFn: (newSettings: StoreSettings) => api.settings.updateStoreSettings(newSettings),
    onSuccess: (updated) => {
      queryClient.setQueryData(["storeSettings"], updated);
      toast({
        title: "Configuración Guardada",
        description: "Los ajustes de la tienda se han actualizado y aplicado exitosamente."
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error al guardar",
        description: err?.message || "Ocurrió un error al actualizar los ajustes.",
        variant: "destructive"
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settings.standardShippingFee < 0 || settings.expressShippingFee < 0) {
      toast({
        title: "Valores incorrectos",
        description: "Las tarifas de envío no pueden ser negativas.",
        variant: "destructive"
      });
      return;
    }

    mutation.mutate(settings);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      setSettings({
        ...settings,
        promoPopup: {
          ...settings.promoPopup,
          imageUrl: url
        }
      });
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente."
      });
    } catch (err: any) {
      toast({
        title: "Error al subir imagen",
        description: err.message || "No se pudo subir la imagen",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSettings({
      ...settings,
      promoPopup: {
        ...settings.promoPopup,
        imageUrl: undefined
      }
    });
  };

  const handleReset = () => {
    if (confirm("¿Deseas descartar los cambios no guardados y recargar los valores actuales?")) {
      if (data) setSettings(data);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configuración General">
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configuración de la Tienda">
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        
        {/* Section 1: Logistics */}
        <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-hairline/10 bg-[#1C1A17]/5 flex items-center gap-2">
            <Truck size={16} className="text-[#C4A46A]" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Tarifas de Despacho y Logística</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Costo Envío Estándar ($ COP)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: parseInt(e.target.value) || 0 })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                min={0}
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Costo de envío terrestre nacional regular.</p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Costo Envío Express ($ COP)</label>
              <input
                type="number"
                value={settings.expressShippingFee}
                onChange={(e) => setSettings({ ...settings, expressShippingFee: parseInt(e.target.value) || 0 })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                min={0}
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Costo para entregas urgentes o prioritarias.</p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Envío Gratis a partir de ($ COP)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold ?? ""}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                min={0}
                placeholder="Ej. 200000 (Dejar en blanco si no aplica)"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Si el subtotal supera este monto, el envío será gratis.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-hairline/10 bg-[#1C1A17]/5 flex items-center gap-2">
            <MessageCircle size={16} className="text-[#C4A46A]" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Información de Contacto y Soporte</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Teléfono de Soporte (WhatsApp)</label>
              <input
                type="text"
                placeholder="+573167890123"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Número completo con prefijo del país (ej. +57 para Colombia).</p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Correo de Contacto</label>
              <input
                type="email"
                placeholder="contacto@fajasab.com"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Dirección de correo electrónico oficial que figura en el footer.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Promotional Content */}
        <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-hairline/10 bg-[#1C1A17]/5 flex items-center gap-2">
            <Sparkles size={16} className="text-[#C4A46A]" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Contenido y Marketing</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Texto de la Barra Promocional</label>
              <input
                type="text"
                placeholder="Ej. ENVÍO GRATIS EN COMPRAS MAYORES A $200.000"
                value={settings.promoBarText}
                onChange={(e) => setSettings({ ...settings, promoBarText: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Este texto se muestra en la barra negra superior en todas las páginas de la tienda.</p>
            </div>
            
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Pop-up de Suscripción Inicial</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[11px] font-semibold uppercase">{settings.promoPopup.enabled ? 'Activado' : 'Desactivado'}</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={settings.promoPopup.enabled}
                      onChange={(e) => setSettings({ ...settings, promoPopup: { ...settings.promoPopup, enabled: e.target.checked } })}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${settings.promoPopup.enabled ? 'bg-gold' : 'bg-border'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${settings.promoPopup.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>

              {settings.promoPopup.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in bg-muted/30 p-4 rounded-lg border border-border/50">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Título</label>
                    <input
                      type="text"
                      value={settings.promoPopup.title}
                      onChange={(e) => setSettings({ ...settings, promoPopup: { ...settings.promoPopup, title: e.target.value } })}
                      className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Descripción</label>
                    <textarea
                      value={settings.promoPopup.description}
                      onChange={(e) => setSettings({ ...settings, promoPopup: { ...settings.promoPopup, description: e.target.value } })}
                      className="w-full h-20 p-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold resize-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Código del Cupón a Mostrar</label>
                    <select
                      value={settings.promoPopup.couponCode}
                      onChange={(e) => setSettings({ ...settings, promoPopup: { ...settings.promoPopup, couponCode: e.target.value } })}
                      className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold font-mono"
                      required
                    >
                      <option value="">-- Sin cupón o Seleccionar Cupón --</option>
                      {activeCoupons.map((coupon: any) => (
                        <option key={coupon.id} value={coupon.code}>
                          {coupon.code} ({coupon.type === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">El cupón seleccionado aparecerá cuando la persona deje su correo y le será enviado por email automáticamente.</p>
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Imagen del Pop-up</label>
                    {settings.promoPopup.imageUrl ? (
                      <div className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden border border-border shadow-sm">
                        <img
                          src={
                            settings.promoPopup.imageUrl.startsWith("http") || settings.promoPopup.imageUrl.startsWith("data")
                              ? settings.promoPopup.imageUrl
                              : `https://fajas-ab-prod.onrender.com${settings.promoPopup.imageUrl.startsWith("/") ? "" : "/"}${settings.promoPopup.imageUrl}`
                          }
                          alt="Pop-up"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/hero-luxe-1.jpg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full max-w-xs aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-gold hover:bg-gold/5 transition-colors cursor-pointer bg-background">
                        {uploadingImage ? (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Loader2 size={24} className="animate-spin mb-2" />
                            <span className="text-xs font-medium">Subiendo a la nube...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground text-center p-4">
                            <ImagePlus size={28} className="mb-2 opacity-50" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Subir Foto desde tu Equipo</span>
                            <span className="text-[10px] opacity-70 mt-1">Vertical 3:4 · JPG, PNG, WEBP</span>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    )}

                    <div className="max-w-md">
                      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">O pega una URL directa de la imagen:</label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/mi-banner.jpg"
                        value={settings.promoPopup.imageUrl || ""}
                        onChange={(e) => setSettings({ ...settings, promoPopup: { ...settings.promoPopup, imageUrl: e.target.value } })}
                        className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs outline-none focus:border-gold font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Live Preview Section */}
            {settings.promoPopup.enabled && (
              <div className="border-t border-border pt-6 mt-6">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink mb-4">Vista Previa en Vivo</h4>
                <div className="bg-black/80 p-8 rounded-xl flex items-center justify-center overflow-hidden relative min-h-[500px]">
                  
                  {/* Mini Popup Preview */}
                  <div className="w-[85%] max-w-[700px] h-auto bg-white rounded-none shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
                    <button type="button" className="absolute top-3 right-3 text-ink/40 hover:text-ink z-10 p-1">
                      <X size={20} strokeWidth={1.5} />
                    </button>
                    
                    {/* Image Side */}
                    <div className="w-full md:w-1/2 h-[200px] md:h-auto relative bg-cream">
                      {settings.promoPopup.imageUrl ? (
                        <img
                          src={
                            settings.promoPopup.imageUrl.startsWith("http") || settings.promoPopup.imageUrl.startsWith("data")
                              ? settings.promoPopup.imageUrl
                              : `https://fajas-ab-prod.onrender.com${settings.promoPopup.imageUrl.startsWith("/") ? "" : "/"}${settings.promoPopup.imageUrl}`
                          }
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/hero-luxe-1.jpg";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 flex-col gap-2">
                          <ImagePlus size={32} />
                          <span className="text-xs uppercase tracking-wider font-semibold">Imagen por defecto</span>
                        </div>
                      )}
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col items-center justify-center text-center bg-white">
                      <h2 className="font-display text-2xl md:text-3xl text-ink tracking-tight mb-3">
                        {settings.promoPopup.title || "Sin título"}
                      </h2>
                      <p className="font-body text-sm text-ink/70 mb-6 leading-relaxed">
                        {settings.promoPopup.description || "Sin descripción"}
                      </p>
                      
                      <div className="w-full space-y-3">
                        <input
                          type="email"
                          placeholder="Tu correo electrónico"
                          className="w-full h-11 px-4 bg-cream/30 border border-ink/20 text-ink placeholder:text-ink/40 text-sm focus:outline-none focus:border-gold transition-colors"
                          disabled
                        />
                        <button type="button" className="w-full h-11 bg-ink text-white font-body text-sm font-medium hover:bg-ink/90 transition-colors uppercase tracking-widest">
                          Obtener Descuento
                        </button>
                      </div>
                      
                      <p className="mt-4 text-[10px] text-ink/40 uppercase tracking-wider">
                        Al suscribirte, aceptas nuestras políticas.
                      </p>
                    </div>
                  </div>
                  
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="h-11 px-5 border border-border bg-background hover:bg-muted text-ink rounded-md text-sm transition-colors flex items-center gap-2"
          >
            <Undo size={16} />
            <span>Descartar</span>
          </button>
          
          <button
            type="submit"
            disabled={mutation.isPending}
            className="h-11 px-6 bg-[#C4A46A] hover:bg-[#B39359] text-white font-medium rounded-md text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            <span>{mutation.isPending ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>

      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
