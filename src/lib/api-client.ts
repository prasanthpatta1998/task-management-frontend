import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Supply a Cognito access token for protected endpoints. */
  accessToken?: string;
};

/** Shared JSON API client. Paths are relative to the API origin, e.g. /health/live. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, accessToken, headers: inputHeaders, ...requestOptions } = options;
  const headers = new Headers(inputHeaders);
  headers.set("Accept", "application/json");
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...requestOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`Cannot reach the API at ${API_BASE_URL}. Check that the backend is running.`, 0, "API_UNREACHABLE");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const bodyRecord = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const errorRecord = bodyRecord.error && typeof bodyRecord.error === "object"
      ? bodyRecord.error as Record<string, unknown>
      : {};
    throw new ApiError(
      typeof errorRecord.message === "string" ? errorRecord.message : `API request failed (${response.status})`,
      response.status,
      typeof errorRecord.code === "string" ? errorRecord.code : undefined,
      typeof errorRecord.requestId === "string" ? errorRecord.requestId : response.headers.get("x-request-id") || undefined,
    );
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
