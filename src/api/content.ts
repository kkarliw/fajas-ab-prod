import { mockDelay } from "./client";

export type ContentPlacement = "home_hero" | "promo_bar" | "popup" | "footer" | "faq";

export type ContentBlockDTO = {
  id: string;
  placement: ContentPlacement;
  key: string;
  payload: Record<string, unknown>;
  status: "active" | "inactive";
  startsAt?: string | null;
  endsAt?: string | null;
  sortOrder?: number;
};

export async function getContentBlocks(placement: ContentPlacement): Promise<ContentBlockDTO[]> {
  // TODO: replace mock with client.get(...)
  await mockDelay();
  const blocks: ContentBlockDTO[] = [
    {
      id: `${placement}-1`,
      placement,
      key: `${placement}-promo`,
      payload: {
        title: "Bienvenida AB",
        subtitle: "10% en tu primera compra",
      },
      status: "active",
      sortOrder: 0,
    },
  ];

  return blocks;
}
