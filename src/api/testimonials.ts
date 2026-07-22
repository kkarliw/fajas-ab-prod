import { client } from "./client";

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  source: "store" | "google";
  createdAt: string;
};

export type CreateTestimonialPayload = {
  name: string;
  rating: number;
  content: string;
};

export async function getTestimonials() {
  return client.get<Testimonial[]>("/api/v1/testimonials");
}

export async function createTestimonial(payload: CreateTestimonialPayload) {
  return client.post<Testimonial>("/api/v1/testimonials", payload);
}
