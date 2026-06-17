/** Go API gateway base URL — set via NEXT_PUBLIC_API_URL in .env */
const BASE = process.env.NEXT_PUBLIC_API_URL

/**
 * Core fetch wrapper for all Go API calls.
 *
 * - Sends cookies (`credentials: 'include'`) so the gateway's session cookie is forwarded.
 * - On a 401, attempts a silent token refresh via `POST /auth/refresh` and retries once.
 * - Throws an `Error` enriched with a `status` property on any non-2xx response;
 *   the message prefers the API's `error` / `message` field over a generic HTTP string.
 * - Returns `undefined` for 204 No Content responses.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const opts: RequestInit = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> ?? {}) },
    ...init,
  }

  let res = await fetch(BASE + path, opts)

  // Silent refresh: swap the session cookie and replay the original request once.
  if (res.status === 401) {
    const refreshed = await fetch(BASE + '/auth/refresh', { method: 'POST', credentials: 'include' })
    if (refreshed.ok) {
      res = await fetch(BASE + path, opts)
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; message?: string }
    throw Object.assign(new Error(body?.error ?? body?.message ?? `HTTP ${res.status}`), { status: res.status })
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/**
 * Typed API client. Import this wherever you need to call the Go gateway.
 *
 * @example
 * const balance = await api.get<WalletBalance>('/api/v1/wallet/balance')
 * const order   = await api.post<Order>('/api/v1/orders', { symbol, side, qty })
 */
export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
}
