import "server-only";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "freshcart_token";
const API_BASE = process.env.FRESHCART_API_BASE ?? "https://ecommerce.routemisr.com/api/v1";
const API_BASE_V2 = API_BASE.replace(/\/v1\/?$/, "/v2");

export async function callAuthApi(path: string, options: { method?: "POST" | "PUT" | "GET" | "DELETE"; body?: unknown; token?: string; version?: 1 | 2; bearer?: boolean } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${options.version === 2 ? API_BASE_V2 : API_BASE}${path}`, {
      method: options.method ?? "POST",
      headers: { "Content-Type": "application/json", ...(options.token ? { token: options.token, ...(options.bearer ? { Authorization: `Bearer ${options.token}` } : {}) } : {}) },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      signal: controller.signal,
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, result: result as Record<string, unknown> };
  } catch {
    return { ok: false, status: 502, result: { message: "The account service is temporarily unavailable. Please try again." } as Record<string, unknown> };
  } finally { clearTimeout(timeout); }
}

export async function currentToken() { return (await cookies()).get(AUTH_COOKIE)?.value; }

export async function verifiedIdentity(token: string) {
  const verification = await callAuthApi("/auth/verifyToken", { method: "GET", token });
  if (!verification.ok) return undefined;
  const root = verification.result;
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : {};
  const decoded = root.decoded && typeof root.decoded === "object" ? root.decoded as Record<string, unknown> : data.decoded && typeof data.decoded === "object" ? data.decoded as Record<string, unknown> : {};
  const user = root.user && typeof root.user === "object" ? root.user as Record<string, unknown> : data.user && typeof data.user === "object" ? data.user as Record<string, unknown> : {};
  let claims: Record<string, unknown> = {};
  try { const payload = token.split(".")[1]; if (payload) claims = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as Record<string, unknown>; } catch { /* The upstream verifier remains authoritative. */ }
  const id = [decoded.id, decoded._id, user.id, user._id, data.id, data._id, claims.id, claims._id, claims.sub].find(value => typeof value === "string");
  const role = [decoded.role, user.role, data.role, claims.role].find(value => typeof value === "string");
  return typeof id === "string" ? { id, role: typeof role === "string" ? role : undefined } : undefined;
}

export function wishlistProducts(result: Record<string, unknown>): Array<Record<string, unknown>> {
  const data = result.data;
  const list = Array.isArray(data) ? data : data && typeof data === "object"
    ? ((data as Record<string, unknown>).products ?? (data as Record<string, unknown>).wishlist)
    : undefined;
  if (!Array.isArray(list)) return [];
  return list.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const product = item.product && typeof item.product === "object" ? item.product as Record<string, unknown> : item;
    return typeof product._id === "string" ? [product] : [];
  });
}
