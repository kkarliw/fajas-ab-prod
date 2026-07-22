import type { UserDTO } from "@/types/dtos";
import { client, session } from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type AuthResponse = {
  user: UserDTO;
  accessToken: string;
};

const persistSession = (user: UserDTO, accessToken: string) => {
  session.setAccessToken(accessToken);
  try {
    localStorage.setItem(
      "ab_session_v1",
      JSON.stringify({
        user,
        accessToken,
      }),
    );
  } catch {
    // ignore storage errors
  }
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await client.post<AuthResponse>("/api/v1/auth/login", { email, password }, { auth: false });
  persistSession(result.user, result.accessToken);
  return result;
}

export type RegisterResponse = {
  message: string;
};

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const result = await client.post<RegisterResponse>("/api/v1/auth/register", payload, { auth: false });
  // Do not persist session because they need to verify email
  return result;
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const result = await client.post<AuthResponse>("/api/v1/auth/verify-email", { email, code }, { auth: false });
  persistSession(result.user, result.accessToken);
  return result;
}

export async function logout(): Promise<{ ok: true }> {
  const result = await client.post<{ ok: true }>("/api/v1/auth/logout", {});
  session.clear();
  return result;
}

export async function getMe(): Promise<UserDTO> {
  return client.get<UserDTO>("/api/v1/me");
}

export async function updateMe(payload: { name?: string; phone?: string }): Promise<UserDTO> {
  return client.patch<UserDTO>("/api/v1/me", payload);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return client.post<{ message: string }>("/api/v1/auth/forgot-password", { email }, { auth: false });
}

export async function resetPassword(payload: { email: string; code: string; newPassword: string }): Promise<{ message: string }> {
  return client.post<{ message: string }>("/api/v1/auth/reset-password", payload, { auth: false });
}
