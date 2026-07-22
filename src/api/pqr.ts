import { client } from "./client";

export type CreatePqrPayload = {
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  type: "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
  subject: string;
  message: string;
};

export type CreatePqrResponse = {
  ticketNumber: string;
  id: string;
};

export async function createPqr(payload: CreatePqrPayload) {
  return client.post<CreatePqrResponse>("/api/v1/pqr", payload);
}

export async function getPqrStatus(ticketNumber: string) {
  return client.get<any>(`/api/v1/pqr/${ticketNumber}`);
}
