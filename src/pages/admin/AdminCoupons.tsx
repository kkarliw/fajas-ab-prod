import { useState } from "react";
import { 
  Search, 
  Ticket, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  DollarSign,
  Percent
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { formatCOP } from "@/data/catalog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/api/admin";

type CouponType = "percentage" | "fixed" | "free_shipping";
type CouponStatus = "active" | "inactive" | "expired";

export type DbCoupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderCents?: number;
  status: CouponStatus;
  createdAt: string;
};

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(0);

  const { data: coupons = [], isLoading } = useQuery<DbCoupon[]>({
    queryKey: ["admin", "coupons"],
    queryFn: getAdminCoupons
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast({ title: "Cupón Creado", description: "El cupón ha sido creado con éxito." });
      setIsAdding(false);
      setCode("");
      setType("percentage");
      setValue(10);
      setMinOrder(0);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast({ title: "Cupón Actualizado", description: "El estado ha sido cambiado." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast({ title: "Cupón Eliminado", description: "El cupón ha sido eliminado." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar", variant: "destructive" });
    }
  });

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      toast({ title: "Código requerido", description: "Por favor escribe un código para el cupón.", variant: "destructive" });
      return;
    }
    if (value <= 0) {
      toast({ title: "Valor inválido", description: "El valor del descuento debe ser mayor que cero.", variant: "destructive" });
      return;
    }
    if (type === "percentage" && value > 100) {
      toast({ title: "Valor inválido", description: "El porcentaje de descuento no puede ser mayor a 100%.", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      code: cleanCode,
      type,
      value,
      minOrderCents: minOrder > 0 ? minOrder * 100 : undefined,
      status: "active"
    });
  };

  const handleToggleStatus = (coupon: DbCoupon) => {
    const nextStatus = coupon.status === "active" ? "inactive" : "active";
    updateMutation.mutate({ id: coupon.id, data: { status: nextStatus } });
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar el cupón ${code}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Gestión de Cupones de Descuento">
      {/* Actions bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-md text-sm outline-none transition-all focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
          />
        </div>

        {/* Add button */}
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full md:w-auto h-10 px-5 flex items-center justify-center gap-2 bg-[#1C1A17] text-white hover:bg-[#2C2A26] rounded-md text-sm transition-colors"
        >
          <Plus size={16} />
          <span>Crear Cupón</span>
        </button>
      </div>

      {/* Manual Coupon Creation Card */}
      {isAdding && (
        <form onSubmit={handleAddCoupon} className="mb-8 p-6 bg-card border border-[#C4A46A]/30 rounded-xl shadow-sm animate-fade-in space-y-4">
          <h3 className="font-display text-[16px] text-ink font-semibold">Crear Nuevo Cupón de Descuento</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Code */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Código del Cupón</label>
              <input
                type="text"
                placeholder="Ej. DIVINA15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none uppercase focus:border-gold"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Tipo de Descuento</label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as CouponType;
                  setType(val);
                  setValue(val === "percentage" ? 10 : 15000);
                }}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
              >
                <option value="percentage">Porcentual (%)</option>
                <option value="fixed">Valor Fijo ($ COP)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
                Descuento ({type === "percentage" ? "%" : "$ COP"})
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                min={1}
                required
              />
            </div>

            {/* Minimum Order */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Compra Mínima ($ COP)</label>
              <input
                type="number"
                placeholder="Opcional. Ej. 50000"
                value={minOrder || ""}
                onChange={(e) => setMinOrder(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-gold"
                min={0}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setCode("");
                setValue(10);
                setMinOrder(0);
              }}
              className="h-10 px-4 border border-border bg-background hover:bg-muted text-ink rounded-md text-sm transition-colors"
              disabled={createMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-6 bg-[#C4A46A] hover:bg-[#B39359] text-white font-medium rounded-md text-sm transition-colors disabled:opacity-50"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Guardando..." : "Guardar Cupón"}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Cargando cupones...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/5">
                  <th className="p-4">Código</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Descuento</th>
                  <th className="p-4">Compra Mínima</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Fecha Creación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/5">
                {filtered.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-ink">
                      <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-[#C4A46A]" />
                        <span>{coupon.code}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {coupon.type === "percentage" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded">
                          <Percent size={8} /> Porcentual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">
                          <DollarSign size={8} /> Valor Fijo
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-ink">
                      {coupon.type === "percentage" ? `${coupon.value}%` : formatCOP(coupon.value)}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {coupon.minOrderCents ? formatCOP(coupon.minOrderCents / 100) : "Ninguna"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className="flex items-center gap-1 focus:outline-none"
                        title="Cambiar estado"
                        disabled={updateMutation.isPending}
                      >
                        {coupon.status === "active" ? (
                          <>
                            <ToggleRight className="text-[#4E8B70] w-6 h-6" />
                            <span className="text-xs text-[#4E8B70] font-medium">Activo</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="text-muted-foreground w-6 h-6" />
                            <span className="text-xs text-muted-foreground">Inactivo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="opacity-60" />
                        <span>{new Date(coupon.createdAt).toLocaleDateString("es-CO")}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-1.5 text-muted-foreground hover:text-[#8A3A2A] hover:bg-[#8A3A2A]/5 rounded transition-all disabled:opacity-50"
                        title="Eliminar Cupón"
                        disabled={deleteMutation.isPending}
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
            <Ticket className="mx-auto w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-ink font-semibold">No hay cupones registrados</p>
            <p className="text-sm text-muted-foreground mt-1">Crea un cupón de descuento para incentivar las ventas en la tienda.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
