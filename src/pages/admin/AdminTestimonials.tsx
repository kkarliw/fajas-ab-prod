import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Calendar,
  Star,
  Search,
  Plus,
  Filter
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminTestimonials, updateAdminTestimonialStatus, deleteAdminTestimonial, createAdminTestimonial } from "@/api/admin";

const AdminTestimonials = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Google Review Form State
  const [isAddingGoogle, setIsAddingGoogle] = useState(false);
  const [gName, setGName] = useState("");
  const [gContent, setGContent] = useState("");
  const [gRating, setGRating] = useState(5);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: getAdminTestimonials
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) => updateAdminTestimonialStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast({ title: "Estado Actualizado", description: "El estado del testimonio se ha guardado." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast({ title: "Testimonio Eliminado", description: "El testimonio ha sido borrado de la base de datos." });
    }
  });

  const createMutation = useMutation({
    mutationFn: createAdminTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast({ title: "Reseña Creada", description: "La reseña de Google ha sido añadida y aprobada." });
      setIsAddingGoogle(false);
      setGName("");
      setGContent("");
      setGRating(5);
    }
  });

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, status: "rejected" });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar permanentemente el testimonio de ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim() || !gContent.trim()) return;
    createMutation.mutate({
      name: gName.trim(),
      rating: gRating,
      content: gContent.trim(),
      status: "approved",
      source: "google"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Aprobado</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#C4A46A] bg-[#C4A46A]/10 px-2 py-0.5 rounded">Pendiente</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Rechazado</span>;
    }
  };

  const filtered = testimonials.filter((t: any) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.content.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Moderación de Testimonios y Reseñas">
      
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por cliente, comentario o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-md text-sm outline-none transition-all focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
          />
        </div>

        {/* Filter */}
        <div className="w-full md:w-auto flex items-center justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold w-full md:w-48"
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendientes de Aprobación</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
          
          <button
            onClick={() => setIsAddingGoogle(!isAddingGoogle)}
            className="h-10 px-4 bg-ink text-cream rounded-md text-sm font-semibold hover:bg-gold transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Añadir Reseña de Google
          </button>
        </div>
      </div>

      {/* Add Google Review Form */}
      {isAddingGoogle && (
        <form onSubmit={handleCreateGoogle} className="mb-8 bg-cream border border-border p-6 rounded-xl shadow-sm">
          <h3 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Nueva Reseña de Google
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Nombre del Cliente</label>
              <input required value={gName} onChange={e => setGName(e.target.value)} type="text" className="w-full h-10 px-3 bg-white border border-border rounded-md text-sm outline-none focus-visible:border-gold" placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Calificación</label>
              <select value={gRating} onChange={e => setGRating(Number(e.target.value))} className="w-full h-10 px-3 bg-white border border-border rounded-md text-sm outline-none focus-visible:border-gold">
                <option value={5}>5 Estrellas</option>
                <option value={4}>4 Estrellas</option>
                <option value={3}>3 Estrellas</option>
                <option value={2}>2 Estrellas</option>
                <option value={1}>1 Estrella</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Comentario</label>
              <textarea required value={gContent} onChange={e => setGContent(e.target.value)} className="w-full h-20 p-3 bg-white border border-border rounded-md text-sm outline-none focus-visible:border-gold resize-none" placeholder="Pega el comentario de Google aquí..." />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingGoogle(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-ink font-semibold">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-ink text-cream rounded-md text-sm font-semibold hover:bg-gold disabled:opacity-50">Guardar Reseña</button>
          </div>
        </form>
      )}

      {/* Testimonials List */}
      <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/5">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Calificación</th>
                  <th className="p-4 w-1/3">Comentario</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right">Acciones de Moderación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/5">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-ink flex items-center gap-2">
                        {t.name}
                        {t.source === "google" && (
                          <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg" title="Reseña de Google">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-0.5 text-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < t.rating ? "fill-gold" : "text-border fill-none"} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-ink leading-relaxed">
                      "{t.content}"
                    </td>
                    <td className="p-4">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="opacity-60" />
                        <span>{new Date(t.createdAt).toLocaleDateString("es-CO")}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Approve button */}
                        {t.status !== "approved" && (
                          <button
                            onClick={() => handleApprove(t.id)}
                            className="p-1.5 text-[#4E8B70] hover:bg-[#4E8B70]/10 rounded-md transition-colors"
                            title="Aprobar Testimonio"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {/* Reject button */}
                        {t.status !== "rejected" && (
                          <button
                            onClick={() => handleReject(t.id)}
                            className="p-1.5 text-[#8A3A2A] hover:bg-[#8A3A2A]/10 rounded-md transition-colors"
                            title="Rechazar / Ocultar"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        <span className="w-px h-4 bg-hairline/20 mx-1" />

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-ink font-semibold">No se encontraron testimonios</p>
            <p className="text-sm text-muted-foreground mt-1">Cuando los clientes compartan sus opiniones en la web, aparecerán aquí para moderación.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
