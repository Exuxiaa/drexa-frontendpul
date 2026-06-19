/** Go API gateway base URL — set via NEXT_PUBLIC_API_URL in .env (defaults to local dev gateway). */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/+$/, '')

type ApiRequestInit = RequestInit & {
  retryOnUnauthorized?: boolean
}

function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

/**
 * Core fetch wrapper for all Go API calls.
 *
 * - Sends cookies (`credentials: 'include'`) so the gateway's session cookie is forwarded.
 * - On a 401, attempts a silent token refresh via `POST /auth/refresh` and retries once.
 * - Throws an `Error` enriched with a `status` property on any non-2xx response;
 *   the message prefers the API's `error` / `message` field over a generic HTTP string.
 * - Returns `undefined` for 204 No Content responses.
 */
async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { retryOnUnauthorized = true, ...requestInit } = init
  const headers = new Headers(requestInit.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const opts: RequestInit = {
    ...requestInit,
    credentials: 'include',
    headers,
  }

  let res = await fetch(apiUrl(path), {
    ...opts,
    headers: {
      ...opts?.headers,
      "ngrok-skip-browser-warning": "true",
    },
  });

  // Silent refresh: swap the session cookie and replay the original request once.
  if (retryOnUnauthorized && res.status === 401) {
    const refreshed = await fetch(apiUrl('/auth/refresh'), { method: 'POST', credentials: 'include' })
    if (refreshed.ok) {
      res = await fetch(apiUrl(path), {
        ...opts,
        headers: {
          ...opts?.headers,
          "ngrok-skip-browser-warning": "true",
        },
      });
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
 * const balance = await api.get<WalletBalance>('/wallet/balance/usd')
 * const order   = await api.post<Order>('/orders', { symbol, side, qty })
 */
export const api = {
  get: <T>(path: string, init?: ApiRequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    request<T>(path, {
      ...init,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string, init?: ApiRequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
}
