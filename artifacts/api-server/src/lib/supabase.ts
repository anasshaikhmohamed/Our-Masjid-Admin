import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

export async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {},
  bearerToken?: string,
): Promise<{ status: number; data: T | null }> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  headers.Accept = "application/json";
  if (init.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (bearerToken) {
    headers.Authorization = bearerToken;
  }

  const response = await connectors.proxy("supabase", path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body.slice(0, 500)}`);
  }

  if (response.status === 204) return { status: response.status, data: null };
  return { status: response.status, data: (await response.json()) as T };
}

export async function supabaseGet<T>(path: string, bearerToken?: string): Promise<T> {
  const result = await supabaseRequest<T>(path, { method: "GET" }, bearerToken);
  return result.data as T;
}