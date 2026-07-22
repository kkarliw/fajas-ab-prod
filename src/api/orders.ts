import type { AddressDTO, OrderDTO } from "@/types/dtos";
import { client } from "./client";

export type InitiateCheckoutPayload = {
  cartId: string;
  customerName: string;
  email: string;
  phone?: string;
  shippingAddress: any;
  billingAddress?: any;
  couponCode?: string;
};

export async function getOrders(): Promise<OrderDTO[]> {
  return client.get<OrderDTO[]>("/api/v1/orders");
}

export async function getOrderByReference(reference: string): Promise<OrderDTO> {
  return client.get<OrderDTO>(`/api/v1/orders/${encodeURIComponent(reference)}`);
}
export async function getGuestOrderByReference(reference: string, email: string): Promise<OrderDTO> {
  return client.get<OrderDTO>(`/api/v1/orders/guest/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`, { auth: false });
}

export async function initiateCheckout(payload: InitiateCheckoutPayload): Promise<any> {
  return client.post<any>("/api/v1/orders", payload);
}

export async function confirmPayment(payload: { reference: string; transactionId: string; amountInCents: number }): Promise<any> {
  return client.post<any>("/api/v1/orders/confirm-payment", payload, { auth: false });
}
