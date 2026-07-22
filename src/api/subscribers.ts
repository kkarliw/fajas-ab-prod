import { client } from "./client";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: string | null;
  status: "active" | "unsubscribed";
  createdAt: string;
};

export async function subscribeToNewsletter(email: string, source?: string) {
  return client.post<NewsletterSubscriber>("/api/v1/subscribers", { email, source });
}
