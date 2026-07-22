import { client } from "./client";

export type PromoPopupSettings = {
  enabled: boolean;
  title: string;
  description: string;
  couponCode: string;
  imageUrl?: string;
};

export type StoreSettings = {
  standardShippingFee: number;
  expressShippingFee: number;
  freeShippingThreshold?: number;
  contactPhone: string;
  contactEmail: string;
  promoBarText: string;
  promoPopup: PromoPopupSettings;
};

export async function getStoreSettings() {
  return client.get<StoreSettings>("/api/v1/settings");
}

export async function updateStoreSettings(settings: StoreSettings) {
  return client.patch<StoreSettings>("/api/v1/admin/settings", settings);
}
