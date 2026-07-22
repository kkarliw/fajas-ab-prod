import { client } from "./client";

export async function getAdminStats() {
  return client.get<any>("/api/v1/admin/stats");
}

export async function getAdminOrders() {
  return client.get<any>("/api/v1/admin/orders");
}

export async function updateOrderStatus(orderId: string, status: string) {
  return client.patch<any>(`/api/v1/admin/orders/${orderId}/status`, { status });
}

export async function getAdminProducts() {
  return client.get<any>("/api/v1/admin/products");
}

export async function createProduct(productData: any) {
  return client.post<any>("/api/v1/admin/products", productData);
}

export async function updateProduct(productId: string, productData: any) {
  return client.put<any>(`/api/v1/admin/products/${productId}`, productData);
}

export async function updateProductStatus(productId: string, status: string) {
  return client.patch<any>(`/api/v1/admin/products/${productId}/status`, { status });
}

export async function deleteProduct(productId: string) {
  return client.delete<any>(`/api/v1/admin/products/${productId}`);
}

/**
 * Uploads an image file to the backend.
 * Uses fetch directly (not client.post) because we send FormData, not JSON.
 * Returns the public URL of the uploaded image (e.g. "/uploads/abc123.jpg").
 */
export async function uploadImage(file: File): Promise<string> {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  const token = localStorage.getItem("ab_access_token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/api/v1/admin/upload`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = "Error al subir la imagen.";
    try {
      const json = await response.json();
      errorMsg = json?.error || errorMsg;
    } catch {/* ignore */}
    throw new Error(errorMsg);
  }

  const json = await response.json();
  const url: string = json?.data?.url ?? json?.url;
  if (!url) throw new Error("El servidor no devolvió una URL válida.");
  return url;
}

export async function getAdminCoupons() {
  return client.get<any>("/api/v1/admin/coupons");
}

export async function createCoupon(couponData: any) {
  return client.post<any>("/api/v1/admin/coupons", couponData);
}

export async function updateCoupon(couponId: string, couponData: any) {
  return client.patch<any>(`/api/v1/admin/coupons/${couponId}`, couponData);
}

export async function deleteCoupon(couponId: string) {
  return client.delete<any>(`/api/v1/admin/coupons/${couponId}`);
}

export async function getAdminPqrs(status?: string) {
  const query = status && status !== "all" ? `?status=${status}` : "";
  return client.get<any>(`/api/v1/admin/pqr${query}`);
}

export async function updatePqr(id: string, status: string) {
  return client.patch<{ ok: boolean }>(`/api/v1/admin/pqr/${id}`, { status });
}

// ---------------------------------------------------------------------------
// SUBSCRIBERS
// ---------------------------------------------------------------------------

export async function getAdminSubscribers() {
  return client.get<any[]>("/api/v1/admin/subscribers");
}

export async function deleteAdminSubscriber(id: string) {
  return client.delete<{ deleted: boolean }>(`/api/v1/admin/subscribers/${id}`);
}

// ---------------------------------------------------------------------------
// CAMPAIGNS
// ---------------------------------------------------------------------------

export async function getAdminCampaigns() {
  return client.get<any[]>("/api/v1/admin/campaigns");
}

export async function createCampaign(data: { subject: string; content: string }) {
  return client.post<any>("/api/v1/admin/campaigns", data);
}

export async function deleteCampaign(id: string) {
  return client.delete<{ deleted: boolean }>(`/api/v1/admin/campaigns/${id}`);
}

// ==========================================
// Testimonials
// ==========================================

export async function getAdminTestimonials() {
  return client.get<any[]>("/api/v1/admin/testimonials");
}

export async function updateAdminTestimonialStatus(id: string, status: "pending" | "approved" | "rejected") {
  return client.patch(`/api/v1/admin/testimonials/${id}`, { status });
}

export async function deleteAdminTestimonial(id: string) {
  return client.delete(`/api/v1/admin/testimonials/${id}`);
}

export async function createAdminTestimonial(data: any) {
  return client.post("/api/v1/admin/testimonials", data);
}
