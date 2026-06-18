import { useEffect, useState } from "react";
import { fetchKlines, subscribeKline, TF_TO_INTERVAL, type Candle } from "@/lib/binance";

export type { Candle } from "@/lib/binance";

/**
 * Loads historical candlesticks for a symbol/timeframe and keeps the latest
 * candle updating in realtime via the Binance kline WebSocket.
 *
 * - The forming candle is updated in place (same open time).
 * - When a candle closes, a new one is appended and the window is trimmed to `limit`.
 */
export function useBinanceKlines(sym: string, tf: string, limit = 120) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const interval = TF_TO_INTERVAL[tf] ?? "1h";
    let active = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setCandles([]);

    fetchKlines(sym, interval, limit)
      .then((data) => {
        if (active) {
          setCandles(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = subscribeKline(sym, interval, (candle, closed) => {
      if (!active) return;
      setLive(true);
      setCandles((prev) => {
        if (prev.length === 0) return [candle];
        const last = prev[prev.length - 1];

        if (candle.t === last.t) {
          // Update the still-forming candle in place.
          const next = prev.slice();
          next[next.length - 1] = candle;
          return next;
        }
        if (candle.t > last.t) {
          // A new interval started — append and keep the window bounded.
          const next = prev.slice(closed ? -(limit - 1) : -(limit - 1));
          next.push(candle);
          return next;
        }
        return prev; // stale frame, ignore
      });
    });

    return () => {
      active = false;
      setLive(false);
      unsubscribe();
    };
  }, [sym, tf, limit]);

  return { candles, loading, live };
}
