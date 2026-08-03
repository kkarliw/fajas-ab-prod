import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  FolderOpen,
  AlertTriangle,
  Copy
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/api";
import { formatCOP } from "@/data/catalog";
import { toast } from "@/hooks/use-toast";

const defaultCategories = [
  { id: "cmrcbslex0003q277enepmagf", name: "Fajas" },
  { id: "cmrcbsleb0000q277rvxvmscs", name: "Brasieres" },
  { id: "cmrcbsles0002q277zo7bnmib", name: "Cinturillas" },
  { id: "cmrcbslem0001q2775nv9n5d5", name: "Shorts" },
  { id: "cmrcbslf20004q277mkcs5ayf", name: "Accesorios" },
];

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "" as string | number,
    originalPrice: "" as string | number,
    categoryId: "",
    material: "",
    description: "",
    sizes: "",
    colors: "",
    images: [] as string[],
    status: "published" as "published" | "draft" | "archived",
    isOutOfStock: false,
    stock: 10,
    tag: "",
    controlLevel: "",
    uses: "",
    seoTitle: "",
    seoDescription: ""
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const res = await api.admin.getAdminProducts();
      return Array.isArray(res) ? res : res.data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await api.admin.getCategories();
      return Array.isArray(res) ? res : res.data || [];
    }
  });

  const availableCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    return defaultCategories;
  }, [categories]);

  const resolveCategoryId = (p: any) => {
    if (p?.categoryId) {
      const found = availableCategories.find((c: any) => c.id === p.categoryId);
      if (found) return found.id;
    }
    if (p?.category) {
      const found = availableCategories.find((c: any) => c.name.toLowerCase() === String(p.category).toLowerCase());
      if (found) return found.id;
    }
    return availableCategories[0]?.id || "";
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.admin.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Producto Creado", description: "El producto ha sido añadido al catálogo." });
      setIsEditModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Hubo un problema creando el producto.", variant: "destructive" })
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.admin.updateProduct(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Producto Guardado", description: "El producto ha sido actualizado con éxito." });
      setIsEditModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Hubo un problema actualizando el producto.", variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Producto Archivado", description: "El producto ha sido enviado al archivo." });
      setIsDeleteModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "No se pudo archivar el producto.", variant: "destructive" })
  });

  const handleOpenEdit = (p: any) => {
    setCurrentProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      categoryId: resolveCategoryId(p),
      material: p.material || "",
      description: p.description || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes || "",
      colors: Array.isArray(p.colors) ? p.colors.join(", ") : p.colors || "",
      images: p.images ? p.images.map((img: any) => img.url) : (p.image ? [p.image] : []),
      status: p.status || "published",
      isOutOfStock: p.isOutOfStock || false,
      stock: p.stock ?? (p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 10),
      tag: p.tag || "",
      controlLevel: p.controlLevel || "",
      uses: p.uses || "",
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || ""
    });
    setIsEditModalOpen(true);
  };

  const handleDuplicate = (p: any) => {
    setCurrentProduct(null); // Force creation of a new product instead of updating
    const duplicateName = `${p.name} - Copia`;
    const duplicateSlug = `${p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-copia`;
    setFormData({
      name: duplicateName,
      slug: duplicateSlug,
      price: p.price ?? (p.basePriceCents ? p.basePriceCents / 100 : ""),
      originalPrice: p.originalPrice ?? (p.compareAtPriceCents ? p.compareAtPriceCents / 100 : ""),
      categoryId: resolveCategoryId(p),
      material: p.material || "",
      description: p.description || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes || "",
      colors: Array.isArray(p.colors) ? p.colors.join(", ") : p.colors || "",
      images: p.images ? p.images.map((img: any) => img.url) : (p.image ? [p.image] : []),
      status: "draft", // Save as draft by default
      isOutOfStock: p.isOutOfStock || false,
      stock: p.stock ?? (p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 10),
      tag: p.tag || "",
      controlLevel: p.controlLevel || "",
      uses: p.uses || "",
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || ""
    });
    setIsEditModalOpen(true);
    toast({ title: "Producto duplicado", description: "Modifica la copia y guarda los cambios." });
  };

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormData({
      name: "",
      slug: "",
      price: "",
      originalPrice: "",
      categoryId: availableCategories[0]?.id || "",
      material: "",
      description: "",
      sizes: "XS, S, M, L, XL",
      colors: "Cocoa",
      images: [],
      status: "published",
      isOutOfStock: false,
      stock: 10,
      tag: "",
      controlLevel: "",
      uses: "",
      seoTitle: "",
      seoDescription: ""
    });
    setIsEditModalOpen(true);
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (formData.images.length + files.length > 5) {
        toast({ title: "Límite excedido", description: "Puedes subir máximo 5 fotos por producto.", variant: "destructive" });
        return;
      }
      try {
        setIsUploadingImage(true);
        const uploadedUrls = [];
        for (const file of files) {
          const url = await api.admin.uploadImage(file);
          uploadedUrls.push(url);
        }
        setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        toast({ title: "Imágenes subidas", description: "Las imágenes se procesaron correctamente." });
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "No se pudo subir alguna imagen", variant: "destructive" });
      } finally {
        setIsUploadingImage(false);
        // Clear input so same file can be picked again if needed
        e.target.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleOpenDelete = (p: any) => {
    setCurrentProduct(p);
    setIsDeleteModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: "Error de validación",
        description: "Nombre y precio son campos requeridos.",
        variant: "destructive"
      });
      return;
    }
    if (isUploadingImage) {
      toast({
        title: "Espera un momento",
        description: "La imagen todavía se está subingo.",
        variant: "destructive"
      });
      return;
    }

    const sizesArray = formData.sizes.split(",").map(s => s.trim()).filter(Boolean);
    const colorsArray = formData.colors.split(",").map(c => c.trim()).filter(Boolean);
    
    const slug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const parseLocalPrice = (val: string | number) => {
      if (!val) return 0;
      const clean = String(val).replace(/\./g, '').replace(/,/g, '').replace(/\$/g, '').trim();
      return Number(clean) || 0;
    };

    const pData = {
      ...formData,
      id: currentProduct?.id,
      slug,
      price: parseLocalPrice(formData.price),
      originalPrice: formData.originalPrice ? parseLocalPrice(formData.originalPrice) : undefined,
      sizes: sizesArray.length ? sizesArray : ["Única"],
      colors: colorsArray.length ? colorsArray : ["Cocoa"],
      isOutOfStock: formData.isOutOfStock,
      tag: formData.tag || undefined,
    };

    if (currentProduct) {
      updateMutation.mutate(pData);
    } else {
      createMutation.mutate(pData);
    }
  };

  const handleDelete = () => {
    if (currentProduct) {
      deleteMutation.mutate(currentProduct.id);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || categoryFilter === "archived" || p.category === categoryFilter;
    const isNotArchived = categoryFilter === "archived" ? p.status === "archived" : p.status !== "archived";
    return matchesSearch && matchesCat && isNotArchived;
  });

  return (
    <AdminLayout title="Catálogo de Productos">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border/40 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-md text-sm outline-none transition-all focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-3 w-full sm:w-auto items-center justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-4 bg-background border border-border rounded-md text-sm outline-none focus-visible:border-gold"
          >
            <option value="all">Todas las Categorías</option>
            <option value="archived">Archivados</option>
            {availableCategories.map((c: any) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-5 inline-flex items-center gap-2 bg-gold-light text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-gold transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Products table list */}
      <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline/10 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold bg-[#1C1A17]/5">
                <th className="p-4 w-16">Foto</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Tallas</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/5">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-cream-2/5 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-16 bg-cream-2 border border-border/50 overflow-hidden flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.failed) {
                            target.dataset.failed = "true";
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f5f3ef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23a39e93'%3EFAJAS AB%3C/text%3E%3C/svg%3E";
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-ink leading-snug">{product.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground uppercase">{product.slug}</div>
                  </td>
                  <td className="p-4 font-body text-[13px] text-ink/80">{product.category}</td>
                  <td className="p-4 font-display font-medium text-[15px]">
                    {formatCOP(product.price)}
                    {product.originalPrice && (
                      <div className="text-[11px] text-muted-foreground line-through font-body">
                        {formatCOP(product.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map(s => (
                        <span key={s} className="text-[9px] font-bold border border-border px-1 py-0.5 rounded bg-cream">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {product.isOutOfStock || (product.stock !== undefined && product.stock <= 0) ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100/90 border border-red-200 px-2 py-1 rounded">
                        0 un. (Agotado)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-1 rounded">
                        {product.stock ?? (product.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || "10")} un.
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {product.status === "draft" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-ink/5 px-2 py-0.5 rounded">Borrador</span>
                      ) : product.status === "archived" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#8A3A2A] bg-[#8A3A2A]/10 px-2 py-0.5 rounded">Archivado</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[#4E8B70] bg-[#4E8B70]/10 px-2 py-0.5 rounded">Publicado</span>
                      )}
                      {product.isOutOfStock && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-white bg-red-600/90 px-2 py-0.5 rounded">Agotado</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 border border-border/50 text-ink/80 hover:bg-cream-2 hover:text-gold transition-all"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(product)}
                        className="p-2 border border-border/50 text-ink/80 hover:bg-cream-2 hover:text-gold transition-all"
                        title="Duplicar"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(product)}
                        className="p-2 border border-border/50 text-ink/80 hover:bg-cream-2 hover:text-gold transition-all"
                        title="Duplicar"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(product)}
                        className="p-2 border border-border/50 text-ink/80 hover:bg-[#8A3A2A]/10 hover:text-[#8A3A2A] transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground font-medium flex flex-col items-center gap-2">
                    <FolderOpen size={32} className="opacity-40" />
                    <span>No se encontraron productos.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-center justify-between border-b border-hairline/15 pb-4 mb-6">
              <h3 className="font-display text-[22px] font-semibold text-ink">
                {currentProduct ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-ink/65 hover:text-gold transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Images Upload */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70 flex justify-between">
                    <span>Fotos del Producto (Máx 5)</span>
                    <span className="text-muted-foreground">{formData.images.length}/5</span>
                  </label>
                  
                  {/* Grid de imágenes subidas */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative w-24 h-32 bg-cream-2 border border-border rounded overflow-hidden flex items-center justify-center flex-shrink-0 group">
                          <img 
                            src={url} 
                            alt={`Vista previa ${i + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                          {i === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center uppercase tracking-wider py-1 font-semibold">
                              Principal
                            </div>
                          )}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveImage(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            title="Borrar foto"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={isUploadingImage || formData.images.length >= 5}
                        className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[10px] file:uppercase file:font-semibold file:bg-[#C4A46A]/10 file:text-[#C4A46A] hover:file:bg-[#C4A46A]/20 file:cursor-pointer disabled:opacity-50"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {isUploadingImage ? "Subiendo imágenes..." : "Soporta formatos JPG, PNG, WEBP. Puedes seleccionar varias a la vez."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Referencia (Slug)</label>
                  <input
                    type="text"
                    placeholder="Auto-generar de nombre si está vacío"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    disabled={!!currentProduct}
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Precio (COP)</label>
                  <input
                    type="text"
                    placeholder="Ej. 150.000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                    required
                  />
                </div>

                {/* Original Price */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Precio Comparación (Descuento)</label>
                  <input
                    type="text"
                    placeholder="Vacío si no hay descuento. Ej. 200.000"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>
                     {/* Categoría & Etiqueta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
                      Categoría
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full h-11 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold font-medium"
                    >
                      {availableCategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
                      Etiqueta (Tag)
                    </label>
                    <select
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full h-11 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold font-medium"
                    >
                      <option value="">Sin etiqueta</option>
                      <option value="bestseller">Bestseller</option>
                      <option value="new">Nuevo</option>
                      <option value="sale">Sale (Descuento)</option>
                      <option value="promo">Promo Especial</option>
                      <option value="low_stock">Pocas Unidades</option>
                    </select>
                  </div>
                </div>
                  
                  {/* Stock & Agotado Controls */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Unidades Disponibles (Stock)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 10"
                        value={formData.stock}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData({ 
                            ...formData, 
                            stock: val, 
                            isOutOfStock: val <= 0 ? true : formData.isOutOfStock 
                          });
                        }}
                        className="w-full h-11 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Estado de Disponibilidad</label>
                      <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-border/60 rounded hover:bg-cream-2/20 transition-colors h-11">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isOutOfStock}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData({ 
                                ...formData, 
                                isOutOfStock: checked,
                                // When un-checking agotado, restore stock to 10 if it was 0
                                stock: !checked && formData.stock <= 0 ? 10 : (checked ? 0 : formData.stock)
                              });
                            }}
                            className="w-5 h-5 appearance-none border border-border rounded cursor-pointer bg-cream/5 checked:bg-red-600 checked:border-red-600 transition-all"
                          />
                          <svg className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none transition-opacity ${formData.isOutOfStock ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-ink">Marcar como AGOTADO</span>
                        </div>
                      </label>
                    </div>
                  </div>

                {/* Material */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Material</label>
                  <input
                    type="text"
                    placeholder="Ej. Lycra fría, Powernet"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>

                {/* Sizes */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Tallas (Separadas por comas)</label>
                  <input
                    type="text"
                    placeholder="Ej. XS, S, M, L, XL"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>

                {/* Colors */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Colores (Separados por comas)</label>
                  <input
                    type="text"
                    placeholder="Ej. Cocoa, Negro"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[80px] p-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Control Level */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Nivel de Control</label>
                  <select
                    value={formData.controlLevel}
                    onChange={(e) => setFormData({ ...formData, controlLevel: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  >
                    <option value="">Selecciona control</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
                
                {/* Uses */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Usos (Ej. Uso diario, Post-operatorio)</label>
                  <input
                    type="text"
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* SEO Section */}
              <div className="p-4 border border-border/60 bg-cream/30 rounded-lg space-y-4">
                <h4 className="text-[12px] uppercase tracking-widest font-semibold text-ink border-b border-border/50 pb-2">SEO & Metadatos</h4>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Ej. Faja Colombiana Reductora - Fajas AB"
                    className="w-full h-10 px-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">SEO Description</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Breve descripción para Google (máx. 160 caracteres)"
                    className="w-full min-h-[60px] p-3 bg-background border border-border rounded text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>


              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">Estado de Publicación</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === "published"}
                      onChange={() => setFormData({ ...formData, status: "published" })}
                      className="text-gold focus:ring-gold"
                    />
                    Publicado (Activo)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === "draft"}
                      onChange={() => setFormData({ ...formData, status: "draft" })}
                      className="text-gold focus:ring-gold"
                    />
                    Borrador
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === "archived"}
                      onChange={() => setFormData({ ...formData, status: "archived" })}
                      className="text-gold focus:ring-gold"
                    />
                    Archivado
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-hairline/15 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUploadingImage || createMutation.isPending || updateMutation.isPending}
                  className="h-10 px-5 border border-border text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-cream-2 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage || createMutation.isPending || updateMutation.isPending}
                  className="h-10 px-6 bg-gold-light text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploadingImage ? "Subiendo imagen..." : (currentProduct ? "Guardar Cambios" : "Crear Producto")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-6 text-center">
            <div className="flex items-center justify-center text-[#8A3A2A] mb-4">
              <AlertTriangle size={36} />
            </div>
            <h3 className="font-display text-[20px] font-semibold text-ink mb-2">¿Eliminar Producto?</h3>
            <p className="text-sm text-ink/75 mb-6">
              Esta acción eliminará definitivamente el producto <strong>{currentProduct?.name}</strong> del catálogo. ¿Deseas continuar?
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-10 px-5 border border-border text-ink uppercase tracking-wider text-[10px] font-semibold hover:bg-cream-2 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-10 px-6 bg-[#8A3A2A] text-[#F0E0D0] uppercase tracking-wider text-[10px] font-semibold hover:bg-[#8A3A2A]/85 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
