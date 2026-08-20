import type { ApiError, ApiResponse } from "@hhlawyer/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
let refreshPromise: Promise<boolean> | undefined;

export class ApiClientError extends Error {
  constructor(public readonly error: ApiError["error"], public readonly status: number) {
    super(error.message);
    this.name = "ApiClientError";
  }
}

async function refreshSession() {
  refreshPromise ??= fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include", headers: { Accept: "application/json" } })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = undefined; });
  return refreshPromise;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, alreadyRetried = false): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init.headers },
  });
  const body = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (response.status === 401 && init.credentials === "include" && !alreadyRetried && !path.startsWith("/auth/")) {
    if (await refreshSession()) return apiFetch<T>(path, init, true);
  }
  if (!response.ok || !body || !body.success) {
    const fallback: ApiError["error"] = { code: "NETWORK_ERROR", message: "Unable to complete the request." };
    throw new ApiClientError(body && !body.success ? body.error : fallback, response.status);
  }
  return body.data;
}
