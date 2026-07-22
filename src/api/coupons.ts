import { client } from "./client";

export type ValidateCouponPayload = {
  code: string;
  cartTotal: number;
};

export type ValidateCouponResponse = {
  valid: boolean;
  couponId: string;
  code: string;
  type: string;
  discountCents: number;
};

export async function validateCoupon(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
  return client.post<ValidateCouponResponse>("/api/v1/coupons/validate", payload);
}
