import { useState } from "react";
import { 
  Search, 
  Eye, 
  X, 
  HelpCircle,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FolderOpen
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminPqrs, updatePqr } from "@/api/admin";

export type DbPQR = {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  type: "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  messages?: { senderType: string; message: string; createdAt: string }[];
};

const AdminPQRs = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Details Modal state
  const [selectedPqr, setSelectedPqr] = useState<DbPQR | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Form reply states
  const [status, setStatus] = useState<DbPQR["status"]>("open");
  const [response, setResponse] = useState("");

  const { data: pqrs = [], isLoading } = useQuery<DbPQR[]>({
    queryKey: ["admin", "pqrs", statusFilter],
    queryFn: () => getAdminPqrs(statusFilter)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updatePqr(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pqrs"] });
      toast({ title: "PQR Actualizada", description: `El ticket ha sido actualizado con éxito.` });
      setIsDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar PQR", variant: "destructive" });
    }
  });

  const handleOpenDetails = (p: DbPQR) => {
    setSelectedPqr(p);
    setStatus(p.status);
    setResponse(""); // Reseteamos la respuesta ya que es un mensaje nuevo
    setIsDetailsOpen(true);
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPqr) return;

    updateMutation.mutate({
      id: selectedPqr.id,
      data: {
        status,
        replyMessage: response.trim() || undefined
      }
    });
  };

  const getPqrTypeBadge = (type: DbPQR["type"]) => {
    switch (type) {
      case "queja":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Queja</span>;
      case "reclamo":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Reclamo</span>;
      case "peticion":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded">Petición</span>;
      case "sugerencia":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#C4A46A] bg-[#C4A46A]/10 px-2 py-0.5 rounded">Sugerencia</span>;
      case "felicitacion":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Felicitación</span>;
    }
  };

  const getPqrStatusBadge = (status: DbPQR["status"]) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Abierto</span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#C4A46A] bg-[#C4A46A]/10 px-2 py-0.5 rounded">En Proceso</span>;
      case "resolved":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Resuelto</span>;
      case "closed":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-ink/40 bg-ink/5 px-2 py-0.5 rounded">Cerrado</span>;
    }
  };

  const filtered = pqrs.filter(p => {
    const matchesSearch = p.ticketNumber.toLowerCase().includes(search.toLowerCase()) || 
                          p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.subject.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    // Status is filtered in the backend query, but we keep this for extra safety or client side filtering if statusFilter was 'all'.
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout title="Buzón de PQRs (Soporte)">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o asunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-md text-sm outline-none transition-all focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold w-full sm:w-auto"
          >
            <option value="all">Todos los Tipos</option>
            <option value="peticion">Petición</option>
            <option value="queja">Queja</option>
            <option value="reclamo">Reclamo</option>
            <option value="sugerencia">Sugerencia</option>
            <option value="felicitacion">Felicitación</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold w-full sm:w-auto"
          >
            <option value="all">Todos los Estados</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En Proceso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
      </div>

      {/* PQRs Table */}
      <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground font-medium">Cargando PQRs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/5">
                  <th className="p-4">ID Ticket</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Remitente</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Asunto</th>
                  <th className="p-4">Mensaje</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-right">Atender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/5">
                {filtered.map((pqr) => (
                  <tr key={pqr.id} className="hover:bg-cream-2/5 transition-colors">
                    <td className="p-4 font-mono text-[12px] font-bold text-ink/80">{pqr.ticketNumber}</td>
                    <td className="p-4 text-[12px] text-ink/75">
                      {new Date(pqr.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-ink leading-snug">{pqr.name}</div>
                      <div className="text-[11px] text-muted-foreground">{pqr.email}</div>
                    </td>
                    <td className="p-4">{getPqrTypeBadge(pqr.type)}</td>
                    <td className="p-4 font-medium text-ink/85">{pqr.subject}</td>
                    <td className="p-4">
                      <div className="text-[12px] text-ink/75 truncate max-w-[200px]" title={pqr.message}>
                        {pqr.message}
                      </div>
                    </td>
                    <td className="p-4 text-center">{getPqrStatusBadge(pqr.status)}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(pqr)}
                        className="p-2 border border-border/50 text-ink/80 hover:bg-cream-2 hover:text-gold transition-all"
                        title="Ver Detalles y Responder"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground font-medium flex flex-col items-center gap-2">
                      <FolderOpen size={32} className="opacity-40" />
                      <span>No se encontraron PQR registradas.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PQR Details & Reply Modal */}
      {isDetailsOpen && selectedPqr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-center justify-between border-b border-hairline/15 pb-4 mb-6">
              <div>
                <h3 className="font-display text-[22px] font-semibold text-ink">
                  Atención de PQR
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-mono text-[12px] font-bold text-ink-soft bg-ink/75 px-2 py-0.5 rounded">
                    {selectedPqr.ticketNumber}
                  </span>
                  {getPqrTypeBadge(selectedPqr.type)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="text-ink/65 hover:text-gold transition-colors p-1"
                disabled={updateMutation.isPending}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Ticket Information */}
              <div className="border border-border/50 p-4 rounded bg-cream-2/10 text-sm space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Nombre del Cliente</span>
                    <span className="text-ink font-medium">{selectedPqr.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Correo Electrónico</span>
                    <span className="text-ink font-medium">{selectedPqr.email}</span>
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Asunto</span>
                  <span className="text-ink font-semibold text-base">{selectedPqr.subject}</span>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Mensaje Enviado</span>
                  <p className="text-ink/80 bg-cream-2/40 p-3 border border-border/20 rounded leading-relaxed mt-1 font-body text-[13.5px]">
                    {selectedPqr.message}
                  </p>
                </div>
              </div>

              {/* Messages History */}
              {selectedPqr.messages && selectedPqr.messages.length > 0 && (
                <div className="space-y-3">
                  <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider">Historial de Respuestas</span>
                  <div className="space-y-3">
                    {selectedPqr.messages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-md text-[13.5px] border ${msg.senderType === 'admin' ? 'bg-gold/10 border-gold/30 ml-8' : 'bg-muted/30 border-border mr-8'}`}>
                        <div className="flex justify-between items-center mb-1 text-[11px] text-muted-foreground font-semibold">
                          <span className="uppercase">{msg.senderType === 'admin' ? 'Administrador' : 'Cliente'}</span>
                          <span>{new Date(msg.createdAt).toLocaleString("es-CO")}</span>
                        </div>
                        <p className="text-ink whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status and Reply Form */}
              <form onSubmit={handleSaveResponse} className="space-y-4 border border-border/50 p-4 rounded bg-cream-2/10">
                <h4 className="font-display text-[16px] font-semibold text-ink border-b border-hairline/10 pb-2">Responder a PQR</h4>
                
                {/* Status Selection */}
                <div className="space-y-1.5 w-full sm:w-1/2">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Estado del Caso</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    disabled={updateMutation.isPending}
                  >
                    <option value="open">Abierto (Pendiente)</option>
                    <option value="in_progress">En Proceso (Investigación)</option>
                    <option value="resolved">Resuelto / Contestada</option>
                    <option value="closed">Cerrado sin Respuesta</option>
                  </select>
                </div>

                {/* Response Text area */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Redactar Nueva Respuesta Oficial</label>
                  <textarea
                    placeholder="Escribe la respuesta formal que se le enviará al correo del cliente..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full min-h-[120px] p-3 bg-background border border-border rounded text-[13.5px] outline-none focus:border-gold font-body"
                    disabled={updateMutation.isPending}
                  />
                  <p className="text-[10px] text-muted-foreground">* Este mensaje se añadirá al historial del ticket.</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen(false)}
                    className="h-10 px-5 border border-border text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-cream-2 transition-colors disabled:opacity-50"
                    disabled={updateMutation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-gold text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-gold-dark hover:text-ink-soft transition-colors disabled:opacity-50"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Guardando..." : "Guardar y Responder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPQRs;
