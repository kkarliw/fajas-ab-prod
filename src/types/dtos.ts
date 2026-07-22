export type ProductTag = "bestseller" | "new" | "sale" | "promo" | "low_stock" | null;

export type PaymentStatus = "pending" | "approved" | "declined" | "refunded";

export type OrderStatus = "pending" | "processing" | "fulfilled" | "cancelled";

export type CouponType = "percentage" | "fixed" | "free_shipping";

export type CouponStatus = "active" | "inactive" | "expired";

export type PQRTicketType = "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";

export type PQRTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type PQRTicketPriority = "low" | "normal" | "high";

export interface ProductImageDTO {
  id?: number | string;
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductVariantDTO {
  id?: number | string;
  productId?: number | string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceCents: number;
  imageUrl?: string;
  status?: "active" | "inactive" | "out_of_stock";
}

export interface ProductDTO {
  id?: number | string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tag?: ProductTag;
  priceCents: number;
  originalPriceCents?: number | null;
  material?: string;
  controlLevel?: string;
  uses?: string;
  bullets?: string[];
  sizes?: string[];
  colors?: string[];
  status?: "draft" | "published" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductVariantDTO[];
  images: ProductImageDTO[];
  isOutOfStock?: boolean;
}

export interface CartItemDTO {
  id?: string;
  productId: number | string;
  variantId?: number | string | null;
  slug: string;
  name: string;
  imageUrl: string;
  size: string;
  color?: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
}

export interface CartDTO {
  id?: number | string;
  userId?: number | string | null;
  currency?: "COP";
  items: CartItemDTO[];
  subtotalCents: number;
  discountCents?: number;
  shippingCents?: number;
  totalCents: number;
  couponCode?: string | null;
}

export interface OrderItemDTO {
  id?: number | string;
  orderId?: number | string;
  productId: number | string;
  variantId?: number | string | null;
  slug: string;
  name: string;
  size: string;
  color?: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
  imageUrl?: string;
}

export interface AddressDTO {
  id?: number | string;
  userId?: number | string | null;
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  department: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface UserDTO {
  id?: number | string;
  role: "admin" | "ops" | "support" | "marketing" | "customer";
  name: string;
  email: string;
  phone?: string;
  status?: "active" | "blocked";
  emailVerifiedAt?: string | null;
  addresses?: AddressDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponDTO {
  id?: number | string;
  code: string;
  type: CouponType;
  value: number;
  minOrderCents?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  usageCount?: number;
  perUserLimit?: number | null;
  status: CouponStatus;
}

export interface PQRTicketDTO {
  id?: number | string;
  ticketNumber?: string;
  userId?: number | string | null;
  orderId?: number | string | null;
  fullName: string;
  email: string;
  phone?: string;
  type: PQRTicketType;
  status: PQRTicketStatus;
  priority?: PQRTicketPriority;
  subject: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDTO {
  id?: number | string;
  reference: string;
  userId?: number | string | null;
  customerName: string;
  email: string;
  phone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency?: "COP";
  subtotalCents: number;
  discountCents?: number;
  shippingCents?: number;
  totalCents: number;
  couponCode?: string | null;
  shippingAddress: AddressDTO;
  billingAddress?: AddressDTO | null;
  items: OrderItemDTO[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
