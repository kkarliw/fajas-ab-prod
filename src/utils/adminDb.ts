import { catalog, CatalogProduct } from "@/data/catalog";

// Types for Mock Database
export type DbProduct = CatalogProduct & {
  id: string;
  status: "draft" | "published" | "archived";
};

export type DbOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  department: string;
  items: {
    slug: string;
    name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }[];
  total: number;
  paymentStatus: "pending" | "approved" | "declined" | "refunded";
  shippingStatus: "pending" | "shipped" | "delivered" | "cancelled";
  trackingCode?: string;
  createdAt: string;
};

export type DbPQR = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  response?: string;
  createdAt: string;
};

export type DbSubscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export type DbCoupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number;
  status: "active" | "inactive";
  createdAt: string;
};

export type DbStoreSettings = {
  standardShippingFee: number;
  expressShippingFee: number;
  contactPhone: string;
  contactEmail: string;
  promoBarText: string;
};

export type DbTestimonial = {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type DbCampaign = {
  id: string;
  subject: string;
  templateType: "offer" | "announcement" | "newsletter";
  title: string;
  content: string;
  couponCode?: string;
  attachedProductSlug?: string;
  recipientCount: number;
  status: "sent" | "draft";
  createdAt: string;
};


// Initial Mocks
const MOCK_ORDERS: DbOrder[] = [
  {
    id: "ORD-9823",
    customerName: "Natalia Rodríguez",
    customerEmail: "natalia.rod@gmail.com",
    customerPhone: "3124567890",
    address: "Calle 122 # 15-45, Apto 402",
    city: "Bogotá",
    department: "Cundinamarca",
    items: [
      { slug: "faja-ariadna", name: "Faja Ariadna", quantity: 1, price: 175000, size: "M", color: "Cocoa" },
      { slug: "bra-emy", name: "Bra EMY", quantity: 1, price: 70000, size: "S", color: "Cocoa" }
    ],
    total: 245000,
    paymentStatus: "approved",
    shippingStatus: "delivered",
    trackingCode: "ENV-882319",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: "ORD-9824",
    customerName: "Andrés Felipe Gómez",
    customerEmail: "andres.fg@yahoo.com",
    customerPhone: "3007654321",
    address: "Carrera 45 # 5a-12",
    city: "Medellín",
    department: "Antioquia",
    items: [
      { slug: "short-moly", name: "Short MOLY", quantity: 2, price: 115000, size: "L", color: "Cocoa" }
    ],
    total: 230000,
    paymentStatus: "approved",
    shippingStatus: "shipped",
    trackingCode: "ENV-882320",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: "ORD-9825",
    customerName: "Mariana Restrepo",
    customerEmail: "mariana.res@gmail.com",
    customerPhone: "3109876543",
    address: "Av El Poblado # 2Sur-120",
    city: "Medellín",
    department: "Antioquia",
    items: [
      { slug: "cinturilla-reloj-arena", name: "Cinturilla Reloj de Arena", quantity: 1, price: 120000, size: "S", color: "Negro" }
    ],
    total: 120000,
    paymentStatus: "pending",
    shippingStatus: "pending",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: "ORD-9826",
    customerName: "Camila Velez",
    customerEmail: "camila.velez@hotmail.com",
    customerPhone: "3154321098",
    address: "Calle 10 # 3-45",
    city: "Cali",
    department: "Valle del Cauca",
    items: [
      { slug: "bra-nat", name: "Bra NAT", quantity: 1, price: 100000, size: "M", color: "Cocoa" },
      { slug: "mentonera", name: "Mentonera", quantity: 1, price: 40000, size: "Unica", color: "Cocoa" }
    ],
    total: 140000,
    paymentStatus: "declined",
    shippingStatus: "cancelled",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10 hours ago
  }
];

const MOCK_PQRS: DbPQR[] = [
  {
    id: "PQR-1001",
    name: "Claudia Patricia Rojas",
    email: "clau.rojas@gmail.com",
    phone: "3167890123",
    type: "queja",
    subject: "Retraso en la entrega",
    message: "Hice el pedido el lunes y decía que llegaba en 48 horas, pero todavía no he recibido mi guía de rastreo ni el paquete. Agradezco pronta respuesta.",
    status: "in_progress",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "PQR-1002",
    name: "Sofía Martínez",
    email: "sofia.mtz@gmail.com",
    phone: "3209876541",
    type: "sugerencia",
    subject: "Más colores para el Bra NAT",
    message: "Me encanta el Bra NAT, me ayudó muchísimo con mi dolor de espalda. Sería maravilloso que también lo sacaran en color beige claro o blanco.",
    status: "resolved",
    response: "Estimada Sofía, agradecemos mucho tu sugerencia. Efectivamente, estamos planeando lanzar la variante en color Natural/Beige para finales de este año.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "PQR-1003",
    name: "Alejandra Castro",
    email: "ale.castro@outlook.com",
    phone: "3004561234",
    type: "peticion",
    subject: "Cambio de talla de faja",
    message: "Hola, compré una faja Ariadna en talla S pero me quedó muy justa en las piernas. ¿Cómo puedo hacer para cambiarla a talla M? Está totalmente nueva con sus etiquetas.",
    status: "open",
    createdAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_SUBSCRIBERS: DbSubscriber[] = [
  { id: "SUB-1", email: "maria.gomez@gmail.com", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "SUB-2", email: "felipe22@yahoo.com", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "SUB-3", email: "diana.luxe@outlook.com", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const MOCK_COUPONS: DbCoupon[] = [
  { id: "CP-1", code: "BIENVENIDA10", type: "percentage", value: 10, minOrder: 50000, status: "active", createdAt: new Date().toISOString() },
  { id: "CP-2", code: "DIVINA20K", type: "fixed", value: 20000, minOrder: 100000, status: "active", createdAt: new Date().toISOString() }
];

const DEFAULT_SETTINGS: DbStoreSettings = {
  standardShippingFee: 15000,
  expressShippingFee: 25000,
  contactPhone: "+573002034943",
  contactEmail: "contacto@fajasab.com",
  promoBarText: "ENVÍO GRATIS EN COMPRAS MAYORES A $200.000 COP"
};

const MOCK_TESTIMONIALS: DbTestimonial[] = [
  { id: "T-1", name: "Milena Gómez", city: "Bogotá", rating: 5, comment: "La faja Ariadna es de otro mundo. Cómoda y comprime justo lo necesario.", status: "approved", createdAt: new Date().toISOString() },
  { id: "T-2", name: "Sandra V.", city: "Medellín", rating: 5, comment: "Excelente atención y la calidad de las costuras es impecable. El bra Emy es súper suave.", status: "approved", createdAt: new Date().toISOString() }
];

const MOCK_CAMPAIGNS: DbCampaign[] = [
  {
    id: "CAMP-701",
    subject: "¡Llegó la nueva Cinturilla Reloj de Arena! ⌛",
    templateType: "announcement",
    title: "Nueva Faja Moldeadora de Alta Compresión",
    content: "Moldea tu figura al instante con nuestra nueva tecnología de costuras invisibles. Diseñada especialmente para tu comodidad diaria.",
    attachedProductSlug: "cinturilla-reloj-arena",
    recipientCount: 3,
    status: "sent",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "CAMP-702",
    subject: "10% de descuento de bienvenida en Fajas AB ✨",
    templateType: "offer",
    title: "¡Tu silueta divina te espera!",
    content: "Queremos darte la bienvenida oficial a nuestra familia. Usa este cupón especial en toda nuestra tienda virtual.",
    couponCode: "BIENVENIDA10",
    recipientCount: 3,
    status: "sent",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];


export const adminDb = {
  // 1. Products
  getProducts(): DbProduct[] {
    try {
      const raw = localStorage.getItem("ab_db_products");
      if (raw) return JSON.parse(raw) as DbProduct[];
      
      // Initialize with catalog
      const initial = catalog.map((p) => ({
        ...p,
        id: p.slug,
        status: "published" as const
      }));
      localStorage.setItem("ab_db_products", JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  },

  saveProducts(products: DbProduct[]) {
    try {
      localStorage.setItem("ab_db_products", JSON.stringify(products));
      // Sincronizar catálogo global local (para la sesión actual)
      window.dispatchEvent(new Event("ab_catalog_update"));
    } catch {
      // ignore
    }
  },

  updateProduct(updated: DbProduct) {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      products[idx] = updated;
      this.saveProducts(products);
    }
  },

  addProduct(newProduct: DbProduct) {
    const products = this.getProducts();
    products.unshift(newProduct);
    this.saveProducts(products);
  },

  deleteProduct(id: string) {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
  },

  // 2. Orders
  getOrders(): DbOrder[] {
    try {
      const raw = localStorage.getItem("ab_db_orders");
      if (raw) return JSON.parse(raw) as DbOrder[];
      
      localStorage.setItem("ab_db_orders", JSON.stringify(MOCK_ORDERS));
      return MOCK_ORDERS;
    } catch {
      return [];
    }
  },

  updateOrder(updated: DbOrder) {
    try {
      const orders = this.getOrders();
      const idx = orders.findIndex((o) => o.id === updated.id);
      if (idx !== -1) {
        orders[idx] = updated;
        localStorage.setItem("ab_db_orders", JSON.stringify(orders));
      }
    } catch {
      // ignore
    }
  },

  addOrder(newOrder: Omit<DbOrder, "id" | "createdAt">) {
    try {
      const orders = this.getOrders();
      const created: DbOrder = {
        ...newOrder,
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString()
      };
      orders.unshift(created);
      localStorage.setItem("ab_db_orders", JSON.stringify(orders));
      return created;
    } catch {
      return null;
    }
  },

  // 3. PQRs
  getPQRs(): DbPQR[] {
    try {
      const raw = localStorage.getItem("ab_db_pqrs");
      if (raw) return JSON.parse(raw) as DbPQR[];
      
      localStorage.setItem("ab_db_pqrs", JSON.stringify(MOCK_PQRS));
      return MOCK_PQRS;
    } catch {
      return [];
    }
  },

  updatePQR(updated: DbPQR) {
    try {
      const pqrs = this.getPQRs();
      const idx = pqrs.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        pqrs[idx] = updated;
        localStorage.setItem("ab_db_pqrs", JSON.stringify(pqrs));
      }
    } catch {
      // ignore
    }
  },

  addPQR(pqr: Omit<DbPQR, "id" | "status" | "createdAt">) {
    try {
      const pqrs = this.getPQRs();
      const created: DbPQR = {
        ...pqr,
        id: `PQR-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "open",
        createdAt: new Date().toISOString()
      };
      pqrs.unshift(created);
      localStorage.setItem("ab_db_pqrs", JSON.stringify(pqrs));
      return created;
    } catch {
      return null;
    }
  },

  // 4. Subscribers
  getSubscribers(): DbSubscriber[] {
    try {
      const raw = localStorage.getItem("ab_db_subscribers");
      if (raw) return JSON.parse(raw) as DbSubscriber[];
      
      localStorage.setItem("ab_db_subscribers", JSON.stringify(MOCK_SUBSCRIBERS));
      return MOCK_SUBSCRIBERS;
    } catch {
      return [];
    }
  },

  addSubscriber(email: string) {
    try {
      const subs = this.getSubscribers();
      if (subs.some((s) => s.email.toLowerCase() === email.toLowerCase())) return;
      const created: DbSubscriber = {
        id: `SUB-${subs.length + 1}`,
        email,
        createdAt: new Date().toISOString()
      };
      subs.unshift(created);
      localStorage.setItem("ab_db_subscribers", JSON.stringify(subs));
    } catch {
      // ignore
    }
  },

  // 5. Coupons
  getCoupons(): DbCoupon[] {
    try {
      const raw = localStorage.getItem("ab_db_coupons");
      if (raw) return JSON.parse(raw) as DbCoupon[];
      
      localStorage.setItem("ab_db_coupons", JSON.stringify(MOCK_COUPONS));
      return MOCK_COUPONS;
    } catch {
      return [];
    }
  },

  saveCoupons(coupons: DbCoupon[]) {
    try {
      localStorage.setItem("ab_db_coupons", JSON.stringify(coupons));
    } catch {
      // ignore
    }
  },

  addCoupon(coupon: Omit<DbCoupon, "id" | "createdAt">) {
    const coupons = this.getCoupons();
    const created: DbCoupon = {
      ...coupon,
      id: `CP-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    coupons.unshift(created);
    this.saveCoupons(coupons);
    return created;
  },

  updateCoupon(updated: DbCoupon) {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      coupons[idx] = updated;
      this.saveCoupons(coupons);
    }
  },

  deleteCoupon(id: string) {
    const coupons = this.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    this.saveCoupons(filtered);
  },

  // 6. Settings
  getSettings(): DbStoreSettings {
    try {
      const raw = localStorage.getItem("ab_db_settings");
      if (raw) return JSON.parse(raw) as DbStoreSettings;
      
      localStorage.setItem("ab_db_settings", JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: DbStoreSettings) {
    try {
      localStorage.setItem("ab_db_settings", JSON.stringify(settings));
      window.dispatchEvent(new Event("ab_settings_update"));
    } catch {
      // ignore
    }
  },

  // 7. Testimonials
  getTestimonials(): DbTestimonial[] {
    try {
      const raw = localStorage.getItem("ab_db_testimonials");
      if (raw) return JSON.parse(raw) as DbTestimonial[];
      
      localStorage.setItem("ab_db_testimonials", JSON.stringify(MOCK_TESTIMONIALS));
      return MOCK_TESTIMONIALS;
    } catch {
      return [];
    }
  },

  saveTestimonials(testimonials: DbTestimonial[]) {
    try {
      localStorage.setItem("ab_db_testimonials", JSON.stringify(testimonials));
      // Sync with old storefront format for compatibility
      const oldFormat = testimonials
        .filter(t => t.status === "approved")
        .map(t => ({
          name: t.name,
          email: "",
          message: `${"★".repeat(t.rating)} ${t.comment} - ${t.city}`,
          createdAt: t.createdAt
        }));
      localStorage.setItem("ab_testimonials_v1", JSON.stringify(oldFormat));
      window.dispatchEvent(new Event("ab_testimonials_update"));
    } catch {
      // ignore
    }
  },

  addTestimonial(testimonial: Omit<DbTestimonial, "id" | "status" | "createdAt">) {
    const list = this.getTestimonials();
    const created: DbTestimonial = {
      ...testimonial,
      id: `T-${Math.floor(100 + Math.random() * 900)}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    list.unshift(created);
    this.saveTestimonials(list);
    return created;
  },

  updateTestimonialStatus(id: string, status: DbTestimonial["status"]) {
    const list = this.getTestimonials();
    const idx = list.findIndex(t => t.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      this.saveTestimonials(list);
    }
  },

  deleteTestimonial(id: string) {
    const list = this.getTestimonials();
    const filtered = list.filter(t => t.id !== id);
    this.saveTestimonials(filtered);
  },

  // 8. Campaigns
  getCampaigns(): DbCampaign[] {
    try {
      const raw = localStorage.getItem("ab_db_campaigns");
      if (raw) return JSON.parse(raw) as DbCampaign[];
      
      localStorage.setItem("ab_db_campaigns", JSON.stringify(MOCK_CAMPAIGNS));
      return MOCK_CAMPAIGNS;
    } catch {
      return [];
    }
  },

  saveCampaigns(campaigns: DbCampaign[]) {
    try {
      localStorage.setItem("ab_db_campaigns", JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  },

  addCampaign(campaign: Omit<DbCampaign, "id" | "createdAt">) {
    const list = this.getCampaigns();
    const created: DbCampaign = {
      ...campaign,
      id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(created);
    this.saveCampaigns(list);
    return created;
  },

  deleteCampaign(id: string) {
    const list = this.getCampaigns();
    const filtered = list.filter(c => c.id !== id);
    this.saveCampaigns(filtered);
  }
};

