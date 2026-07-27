export type ApiErrorShape = {
  name: "ApiError";
  message: string;
  status: number;
  data?: unknown;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  retrying?: boolean;
};

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("VITE_API_URL is required. Set it in your frontend environment before starting the app.");
  }
  return baseUrl;
};

const ACCESS_TOKEN_KEY = "ab_access_token";
const SESSION_KEY = "ab_session_v1";

const clearSession = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage errors
  }
};

const setAccessToken = (token: string) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
};

const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

const normalizeError = async (response: Response): Promise<ApiErrorShape> => {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  const message =
    typeof data === "object" && data !== null && "error" in data && typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : `Request failed with status ${response.status}`;

  return {
    name: "ApiError",
    message,
    status: response.status,
    data,
  };
};

const unwrap = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as { data?: T } | T;
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const refreshAccessToken = async () => {
  const token = getAccessToken();
  
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {},
  });

  if (!response.ok) {
    if (token) { // Only clear session and redirect if there WAS an active session
      clearSession();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    throw await normalizeError(response);
  }

  const data = await unwrap<{ accessToken: string }>(response);
  setAccessToken(data.accessToken);
  return data.accessToken;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Send sessionId globally so backend knows who the cart belongs to, even for DELETE/PATCH requests
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("ab_cart_session_v1") : null;
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }

  const token = options.auth === false ? null : getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth !== false && !options.retrying) {
    const refreshedToken = await refreshAccessToken();
    return request<T>(path, {
      ...options,
      retrying: true,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${refreshedToken}`,
      },
    });
  }

  if (!response.ok) {
    throw await normalizeError(response);
  }

  return unwrap<T>(response);
};

export const client = {
  request,
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export const session = {
  setAccessToken,
  clear: clearSession,
};

export const mockDelay = async (ms = 400) =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
