/**
 * Binance public market-data client for realtime candlesticks.
 *
 * Uses the public, key-free market-data mirrors (`*.binance.vision`) — the same
 * hosts the Go gateway streams from — so no API key or auth is required.
 *
 * - `fetchKlines`     loads historical candles over REST for the initial paint.
 * - `subscribeKline`  opens a WebSocket that pushes the forming candle every
 *                     ~2s and emits `closed=true` on the final tick of each
 *                     interval, so the caller knows when to append a new candle.
 */

// Configurable via env so the candlestick source can be swapped without code changes.
const REST_BASE = process.env.NEXT_PUBLIC_BINANCE_REST_URL || "https://data-api.binance.vision/api/v3";
const WS_BASE = process.env.NEXT_PUBLIC_BINANCE_WS_URL || "wss://data-stream.binance.vision/ws";

export interface Candle {
  t: number; // open time (ms) — identifies the candle
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Maps the trade-page timeframe labels to Binance kline intervals. */
export const TF_TO_INTERVAL: Record<string, string> = {
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
  "1W": "1w",
};

/** Drexa quotes everything against USDT on Binance (e.g. "BTC" → "BTCUSDT"). */
export function toBinancePair(sym: string): string {
  return `${sym.toUpperCase()}USDT`;
}

export async function fetchKlines(sym: string, interval: string, limit = 120): Promise<Candle[]> {
  const url = `${REST_BASE}/klines?symbol=${toBinancePair(sym)}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`binance /klines ${res.status}`);

  // Each kline: [openTime, open, high, low, close, volume, closeTime, ...]
  const raw: unknown[][] = await res.json();
  return raw.map((k) => ({
    t: Number(k[0]),
    o: parseFloat(k[1] as string),
    h: parseFloat(k[2] as string),
    l: parseFloat(k[3] as string),
    c: parseFloat(k[4] as string),
  }));
}

/**
 * Subscribes to the live kline stream for a symbol/interval.
 * Returns an unsubscribe function that detaches handlers and closes the socket.
 */
export function subscribeKline(
  sym: string,
  interval: string,
  onCandle: (candle: Candle, closed: boolean) => void,
): () => void {
  const stream = `${toBinancePair(sym).toLowerCase()}@kline_${interval}`;
  const ws = new WebSocket(`${WS_BASE}/${stream}`);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const k = msg?.k;
      if (!k) return;
      onCandle(
        { t: Number(k.t), o: parseFloat(k.o), h: parseFloat(k.h), l: parseFloat(k.l), c: parseFloat(k.c) },
        Boolean(k.x), // x = is this kline closed?
      );
    } catch {
      // ignore malformed frames
    }
  };

  return () => {
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    // readyState 0 = CONNECTING, 1 = OPEN — close() is safe in both
    ws.close();
  };
}
