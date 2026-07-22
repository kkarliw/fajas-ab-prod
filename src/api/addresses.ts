import type { AddressDTO } from "@/types/dtos";
import { client } from "./client";

export type CreateAddressPayload = {
  name: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  department: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export async function getAddresses(): Promise<AddressDTO[]> {
  return client.get<AddressDTO[]>("/api/v1/addresses");
}

export async function createAddress(payload: CreateAddressPayload): Promise<AddressDTO> {
  return client.post<AddressDTO>("/api/v1/addresses", payload);
}

export async function deleteAddress(id: string): Promise<{ message: string }> {
  return client.delete<{ message: string }>(`/api/v1/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<AddressDTO> {
  return client.patch<AddressDTO>(`/api/v1/addresses/${id}/default`);
}
