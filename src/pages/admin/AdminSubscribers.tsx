import { useEffect, useState } from "react";
import { 
  Search, 
  Mail, 
  Download, 
  Plus, 
  Trash2, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  Tag,
  ShoppingBag,
  Sparkles,
  X
} from "lucide-react";
import { api } from "@/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminDb, DbCampaign, DbCoupon, DbProduct } from "@/utils/adminDb";
import { formatCOP } from "@/data/catalog";
import { toast } from "@/hooks/use-toast";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
  source: string | null;
  status: string;
};

// Helper components for the Live Email Preview
type EmailPreviewProps = {
  subject: string;
  templateType: DbCampaign["templateType"];
  title: string;
  content: string;
  couponCode?: string;
  attachedProductSlugs?: string[];
  coupons: DbCoupon[];
  products: DbProduct[];
};

const EmailPreview = ({ 
  subject, 
  templateType, 
  title, 
  content, 
  couponCode, 
  attachedProductSlugs = [], 
  coupons, 
  products 
}: EmailPreviewProps) => {
  const selectedProducts = products.filter(p => attachedProductSlugs.includes(p.slug));
  const coupon = coupons.find(c => c.code === couponCode);

  return (
    <div className="border border-border/80 rounded-xl overflow-hidden shadow-lg bg-white text-ink text-left font-body w-full max-w-xl mx-auto">
      {/* Inbox Header Mockup */}
      <div className="bg-[#1A1A18]/5 p-3.5 border-b border-border/50 text-[11px] text-muted-foreground space-y-1 font-mono">
        <div><span className="font-semibold text-ink/70">De:</span> Fajas AB &lt;novedades@fajasab.com&gt;</div>
        <div><span className="font-semibold text-ink/70">Para:</span> suscriptor@ejemplo.com</div>
        <div><span className="font-semibold text-ink/70">Asunto:</span> <span className="text-ink font-sans font-medium">{subject || "(Sin asunto)"}</span></div>
      </div>

      {/* Email Body Container */}
      <div className="bg-[#FAF8F5] p-6 sm:p-8 flex flex-col items-center">
        {/* Email Header Logo */}
        <div className="text-center pb-4 border-b border-hairline/10 w-full mb-6">
          <span className="font-display text-[20px] tracking-[0.2em] text-[#1A1A18] font-bold block">FAJAS AB</span>
          <span className="text-[8px] uppercase tracking-[0.3em] text-[#C4A46A] mt-1 font-semibold block">Embrace Divine Form</span>
        </div>

        {/* Email Category Banner */}
        <div className={`w-full py-2 px-4 text-center text-xs font-bold uppercase tracking-wider mb-6 rounded ${
          templateType === "offer" 
            ? "bg-[#8A3A2A] text-white" 
            : templateType === "announcement" 
            ? "bg-[#1A1A18] text-white border border-[#C4A46A]/20" 
            : "bg-[#C4A46A]/10 text-[#C4A46A] border border-[#C4A46A]/20"
        }`}>
          {templateType === "offer" && "🔥 Oferta Exclusiva Limitada"}
          {templateType === "announcement" && "✨ Lanzamiento Exclusivo"}
          {templateType === "newsletter" && "📰 Boletín de Tendencias & Consejos"}
        </div>

        {/* Email Content */}
        <div className="w-full space-y-4 text-left">
          <h2 className="font-display text-[20px] font-semibold text-ink leading-snug">{title || "Título del Email"}</h2>
          <div 
            className="text-[13px] text-ink/80 leading-relaxed whitespace-pre-wrap email-content-preview" 
            dangerouslySetInnerHTML={{ __html: content || "Escribe el cuerpo del mensaje para previsualizarlo aquí..." }} 
          />
        </div>

        {/* Selected Products Attachment */}
        {selectedProducts.length > 0 && (
          <div className="w-full mt-6 space-y-4">
            {selectedProducts.map(product => (
              <div key={product.id} className="border border-border bg-white rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md border border-border/40" />
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <span className="text-[9px] uppercase tracking-wider bg-[#C4A46A]/10 text-[#C4A46A] px-1.5 py-0.5 rounded font-semibold">{product.category}</span>
                  <h4 className="font-display text-[14px] font-bold text-ink leading-tight">{product.name}</h4>
                  {product.material && <p className="text-[11px] text-muted-foreground">{product.material}</p>}
                  <p className="font-display text-[13px] font-bold text-[#8A3A2A]">{formatCOP(product.price)}</p>
                </div>
                <div className="w-full sm:w-auto h-9 px-4 bg-[#1A1A18] text-white rounded text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center transition-colors select-none">
                  Comprar
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Coupon Attachment */}
        {coupon && (
          <div className="w-full mt-6 border-2 border-dashed border-[#C4A46A] bg-[#C4A46A]/5 rounded-lg p-4 text-center space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block">CUPÓN DE DESCUENTO ADJUNTO</span>
            <div className="font-mono text-[20px] font-extrabold text-[#C4A46A] bg-white border border-[#C4A46A]/30 py-1 px-4 rounded inline-block tracking-widest shadow-sm select-all">
              {coupon.code}
            </div>
            <p className="text-[12px] text-ink font-medium">
              Ahorra <span className="text-[#8A3A2A] font-bold">{coupon.type === "percentage" ? `${coupon.value}%` : formatCOP(coupon.value)}</span> en tu pedido.
            </p>
            {coupon.minOrder && (
              <p className="text-[9px] text-muted-foreground">
                * Válido en compras superiores a {formatCOP(coupon.minOrder)}
              </p>
            )}
          </div>
        )}

        {/* Email Footer */}
        <div className="w-full border-t border-hairline/10 pt-6 mt-8 text-center text-[10px] text-muted-foreground space-y-2">
          <p className="font-semibold text-ink/75">© {new Date().getFullYear()} Fajas AB. Todos los derechos reservados.</p>
          <p>Recibiste este correo porque te suscribiste a las novedades de Fajas AB. Si deseas desuscribirte, haz clic en <span className="underline cursor-pointer hover:text-gold">cancelar suscripción</span>.</p>
        </div>
      </div>
    </div>
  );
};

const AdminSubscribers = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"subscribers" | "marketing">("subscribers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["adminSubscribers"],
    queryFn: async () => {
      const res = await api.admin.getAdminSubscribers();
      return res as Subscriber[];
    }
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["adminCampaigns"],
    queryFn: async () => {
      const res = await api.admin.getAdminCampaigns();
      return res.map((c: any) => {
        try {
          const payload = JSON.parse(c.content);
          return { ...c, ...payload };
        } catch {
          return { ...c, title: c.subject, templateType: "newsletter" };
        }
      });
    }
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => {
      const res = await api.admin.getAdminCoupons();
      return res.filter((c: any) => c.status === "active");
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const res = await api.admin.getAdminProducts();
      return res.filter((p: any) => p.status === "published");
    }
  });
  
  // Marketing Campaign form states
  const [campaignForm, setCampaignForm] = useState({
    subject: "",
    templateType: "offer" as DbCampaign["templateType"],
    title: "",
    content: "",
    couponCode: "",
    attachedProductSlugs: [] as string[]
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteAdminSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
    }
  });

  const addMutation = useMutation({
    mutationFn: (email: string) => api.subscribers.subscribeToNewsletter(email, "admin_panel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: { subject: string; content: string }) => api.admin.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCampaigns"] });
      toast({
        title: "¡Campaña Enviada!",
        description: `La campaña se envió con éxito a los suscriptores activos.`
      });
      setCampaignForm({
        subject: "",
        templateType: "offer",
        title: "",
        content: "",
        couponCode: "",
        attachedProductSlugs: []
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error al enviar",
        description: err.message || "Error desconocido",
        variant: "destructive"
      });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCampaigns"] });
      toast({
        title: "Campaña Eliminada",
        description: "La campaña ha sido removida del historial."
      });
    }
  });

  // Modal preview state
  const [previewingCampaign, setPreviewingCampaign] = useState<DbCampaign | null>(null);

  useEffect(() => {
    // Component mounted
  }, []);

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = newEmail.trim().toLowerCase();

    if (!emailTrimmed) {
      toast({
        title: "Campo requerido",
        description: "Por favor escribe un correo electrónico.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      toast({
        title: "Correo inválido",
        description: "Por favor ingresa un correo electrónico válido.",
        variant: "destructive"
      });
      return;
    }

    const exists = subscribers.some(s => s.email.toLowerCase() === emailTrimmed);
    if (exists) {
      toast({
        title: "Suscripción existente",
        description: "Este correo electrónico ya se encuentra registrado.",
        variant: "destructive"
      });
      return;
    }

    addMutation.mutate(emailTrimmed, {
      onSuccess: () => {
        setNewEmail("");
        setIsAdding(false);
        toast({
          title: "Suscriptor Agregado",
          description: `El correo ${emailTrimmed} ha sido agregado exitosamente.`
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "No se pudo agregar al suscriptor",
          variant: "destructive"
        });
      }
    });
  };

  const handleDeleteSubscriber = (id: string, email: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar a ${email} de la lista de boletín?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Suscriptor Eliminado",
            description: `El correo ${email} fue removido del boletín.`
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo eliminar al suscriptor",
            variant: "destructive"
          });
        }
      });
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay suscriptores para exportar.",
        variant: "destructive"
      });
      return;
    }

    const headers = ["ID", "Email", "Fecha Registro"];
    const rows = subscribers.map(s => [
      s.id,
      s.email,
      new Date(s.createdAt).toLocaleString("es-CO")
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suscriptores_fajasab_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación Exitosa",
      description: "Se ha descargado la lista de suscriptores en formato CSV."
    });
  };

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.subject || !campaignForm.title || !campaignForm.content) {
      toast({
        title: "Campos incompletos",
        description: "Por favor diligencia el asunto, título y contenido del correo.",
        variant: "destructive"
      });
      return;
    }

    // Stringify the payload into the content field for the backend
    const payload = JSON.stringify({
      templateType: campaignForm.templateType,
      title: campaignForm.title,
      content: campaignForm.content,
      couponCode: campaignForm.couponCode || undefined,
      attachedProductSlug: campaignForm.attachedProductSlug || undefined,
    });

    createCampaignMutation.mutate({
      subject: campaignForm.subject,
      content: payload
    });
  };

  const handleDeleteCampaign = (id: string, subject: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar el registro de la campaña "${subject}"?`)) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Boletín & Email Marketing">
      {/* Navigation Tabs */}
      <div className="flex border-b border-border/80 mb-8">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-6 py-3 font-display text-xs uppercase tracking-wider font-bold border-b-2 transition-all ${
            activeTab === "subscribers" 
              ? "border-gold text-ink" 
              : "border-transparent text-muted-foreground hover:text-ink"
          }`}
        >
          Lista de Suscriptores ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("marketing")}
          className={`px-6 py-3 font-display text-xs uppercase tracking-wider font-bold border-b-2 transition-all ${
            activeTab === "marketing" 
              ? "border-gold text-ink" 
              : "border-transparent text-muted-foreground hover:text-ink"
          }`}
        >
          Campañas de Email Marketing ({campaigns.length})
        </button>
      </div>

      {activeTab === "subscribers" ? (
        <>
          {/* Upper Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-md text-sm outline-none transition-all focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="h-10 px-4 flex items-center gap-2 bg-[#1C1A17] text-white hover:bg-[#2C2A26] rounded-md text-sm transition-colors"
              >
                <Plus size={16} />
                <span>Agregar Correo</span>
              </button>
              
              <button
                onClick={handleExportCSV}
                className="h-10 px-4 flex items-center gap-2 border border-border bg-background hover:bg-muted text-ink rounded-md text-sm transition-colors"
              >
                <Download size={16} />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Manual Registration Card (Expandable) */}
          {isAdding && (
            <form onSubmit={handleAddSubscriber} className="mb-8 p-6 bg-card border border-[#C4A46A]/30 rounded-xl shadow-sm animate-fade-in">
              <h3 className="font-display text-[16px] text-ink font-semibold mb-2">Registrar Nuevo Suscriptor</h3>
              <p className="text-[12px] text-muted-foreground mb-4">Ingresa manualmente el correo de un cliente para suscribirlo a las noticias y novedades.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="h-10 px-6 bg-[#C4A46A] hover:bg-[#B39359] text-white font-medium rounded-md text-sm transition-colors"
                  >
                    Suscribir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewEmail("");
                    }}
                    className="h-10 px-4 border border-border bg-background hover:bg-muted text-ink rounded-md text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Subscribers Table / Card List */}
          <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-hairline/10 bg-[#1C1A17]/5 flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Suscriptores: {filteredSubscribers.length} {filteredSubscribers.length !== subscribers.length && `(filtrados de ${subscribers.length})`}
              </span>
            </div>

            {filteredSubscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/2">
                      <th className="p-4">ID</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4">Fecha de Registro</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/5">
                    {filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">{sub.id}</td>
                        <td className="p-4 font-medium text-ink">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-[#C4A46A]" />
                            <span>{sub.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="opacity-60" />
                            <span>{new Date(sub.createdAt).toLocaleDateString("es-CO", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            className="p-1.5 text-muted-foreground hover:text-[#8A3A2A] hover:bg-[#8A3A2A]/5 rounded transition-all"
                            title="Eliminar Suscriptor"
                            aria-label={`Eliminar suscriptor ${sub.email}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Mail className="mx-auto w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-ink font-semibold">No se encontraron suscriptores</p>
                <p className="text-sm text-muted-foreground mt-1">Intenta con otro término de búsqueda o agrega un correo nuevo.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-10">
          
          {/* Main Campaign Builder Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Form: Redact Campaign */}
            <form onSubmit={handleSendCampaign} className="lg:col-span-6 bg-card border border-border/60 p-6 rounded-xl shadow-sm space-y-5 text-left animate-fade-in">
              <div className="flex items-center gap-2 pb-3 border-b border-hairline/10">
                <Sparkles size={18} className="text-[#C4A46A]" />
                <h3 className="font-display text-[16px] text-ink font-bold uppercase tracking-wide">Redactar Nueva Campaña</h3>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-bold">Tipo de Plantilla</label>
                <select
                  value={campaignForm.templateType}
                  onChange={(e) => setCampaignForm({ ...campaignForm, templateType: e.target.value as DbCampaign["templateType"] })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                >
                  <option value="offer">🔥 Oferta Especial / Descuento</option>
                  <option value="announcement">✨ Lanzamiento de Producto</option>
                  <option value="newsletter">📰 Boletín Informativo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-bold">Asunto del Correo (Subject)</label>
                <input
                  type="text"
                  placeholder="Ej. ¡10% de descuento solo por hoy! 🌟"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-bold">Título del Contenido (Email Title)</label>
                <input
                  type="text"
                  placeholder="Ej. ¡Luce tu figura con este regalo exclusivo!"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-bold">Mensaje (Cuerpo del Email)</label>
                <ReactQuill
                  theme="snow"
                  value={campaignForm.content}
                  onChange={(val) => setCampaignForm({ ...campaignForm, content: val })}
                  className="bg-background rounded-md text-sm border-none"
                  style={{ minHeight: '150px' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-bold">
                    <Tag size={12} className="text-[#C4A46A]" />
                    <span>Vincular Cupón (Opcional)</span>
                  </label>
                  <select
                    value={campaignForm.couponCode}
                    onChange={(e) => setCampaignForm({ ...campaignForm, couponCode: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded-md text-xs outline-none focus:border-gold"
                  >
                    <option value="">Ninguno</option>
                    {coupons.map((coupon) => (
                      <option key={coupon.id} value={coupon.code}>
                        {coupon.code} ({coupon.type === "percentage" ? `${coupon.value}%` : `${formatCOP(coupon.value)}`})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                    ¿No encuentras tu cupón? Créalo primero en la pestaña <strong className="text-ink">Cupones</strong> para asegurar que tenga las reglas de descuento correctas.
                  </p>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-bold flex items-center gap-1">
                    <ShoppingBag size={12} className="text-[#C4A46A]" />
                    Adjuntar Productos (Opcional)
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-border rounded-md bg-background p-2 space-y-1">
                    {products.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2 text-center">No hay productos disponibles</p>
                    ) : (
                      products.map((prod) => (
                        <label key={prod.id} className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded cursor-pointer text-xs">
                          <input 
                            type="checkbox" 
                            checked={campaignForm.attachedProductSlugs.includes(prod.slug)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCampaignForm({ ...campaignForm, attachedProductSlugs: [...campaignForm.attachedProductSlugs, prod.slug] });
                              } else {
                                setCampaignForm({ ...campaignForm, attachedProductSlugs: campaignForm.attachedProductSlugs.filter(s => s !== prod.slug) });
                              }
                            }}
                            className="accent-gold"
                          />
                          <span className="truncate">{prod.name} - {formatCOP(prod.price)}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#C4A46A] hover:bg-[#B39359] text-white font-medium rounded-md text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={16} />
                  <span>Enviar Campaña Masiva</span>
                </button>
              </div>
            </form>

            {/* Right Live Preview: Visual mockup of Email */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-bold text-center lg:text-left block">
                Previsualización en Vivo del Correo
              </span>
              <EmailPreview
                subject={campaignForm.subject}
                templateType={campaignForm.templateType}
                title={campaignForm.title}
                content={campaignForm.content}
                couponCode={campaignForm.couponCode}
                attachedProductSlugs={campaignForm.attachedProductSlugs}
                coupons={coupons}
                products={products}
              />
            </div>

          </div>

          {/* Past Campaigns History List */}
          <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden text-left">
            <div className="p-4 border-b border-hairline/10 bg-[#1C1A17]/5 flex justify-between items-center">
              <h3 className="font-display text-[15px] text-ink font-bold uppercase tracking-wider">Historial de Campañas Enviadas</h3>
              <span className="text-[11px] font-medium text-muted-foreground">Total: {campaigns.length}</span>
            </div>

            {campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/2">
                      <th className="p-4">ID Campaña</th>
                      <th className="p-4">Asunto / Campaña</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4 text-center">Destinatarios</th>
                      <th className="p-4">Fecha Envío</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/5">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-muted-foreground font-semibold">{camp.id}</td>
                        <td className="p-4 font-medium text-ink">
                          <div>{camp.subject}</div>
                          <div className="text-[11px] text-[#C4A46A] font-semibold">{camp.title}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            camp.templateType === "offer" 
                              ? "text-[#8A3A2A] bg-[#8A3A2A]/10" 
                              : camp.templateType === "announcement" 
                              ? "text-[#1A1A18] bg-[#1A1A18]/10" 
                              : "text-[#C4A46A] bg-[#C4A46A]/10"
                          }`}>
                            {camp.templateType === "offer" ? "Oferta" : camp.templateType === "announcement" ? "Lanzamiento" : "Boletín"}
                          </span>
                        </td>
                        <td className="p-4 text-center text-ink font-semibold">{camp.recipientCount}</td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {new Date(camp.createdAt).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setPreviewingCampaign(camp)}
                              className="p-1.5 text-muted-foreground hover:text-gold hover:bg-gold/10 rounded transition-all"
                              title="Ver Email"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(camp.id, camp.subject)}
                              className="p-1.5 text-muted-foreground hover:text-[#8A3A2A] hover:bg-[#8A3A2A]/5 rounded transition-all"
                              title="Eliminar Campaña"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground font-medium">
                No hay historial de campañas registradas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog for View Past Campaign */}
      {previewingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewingCampaign(null)} />
          <div className="relative bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 flex flex-col animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-card">
              <div className="text-left">
                <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">Detalle de Campaña Enviada - {previewingCampaign.id}</span>
                <h4 className="font-display font-bold text-[16px] text-ink">{previewingCampaign.subject}</h4>
              </div>
              <button
                onClick={() => setPreviewingCampaign(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-ink transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Email Preview */}
            <div className="p-6 overflow-y-auto flex-1 bg-cream-2/20">
              <EmailPreview
                subject={previewingCampaign.subject}
                templateType={previewingCampaign.templateType}
                title={previewingCampaign.title}
                content={previewingCampaign.content}
                couponCode={previewingCampaign.couponCode}
                attachedProductSlug={previewingCampaign.attachedProductSlug}
                coupons={coupons}
                products={products}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-border/80 flex justify-end bg-card">
              <button
                onClick={() => setPreviewingCampaign(null)}
                className="h-10 px-5 border border-border bg-background hover:bg-muted text-ink rounded-md text-sm transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSubscribers;
