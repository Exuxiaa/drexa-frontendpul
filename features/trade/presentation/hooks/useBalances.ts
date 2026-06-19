import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "@/lib/api";

/** Raw wallet balance row from GET /wallet/balances (amounts in smallest unit). */
interface RawBalance {
  currency?: string;
  Currency?: string;
  available?: number;
  Available?: number;
}

// Fiat-like currencies are stored in cents (2 dp); crypto uses the engine's
// 8-dp convention. Used only to derive a human display amount for the ticket.
const FIAT = new Set(["USD", "USDC", "USDT", "IDR", "EUR"]);

function toDisplay(currency: string, smallest: number): number {
  return smallest / (FIAT.has(currency.toUpperCase()) ? 100 : 1e8);
}

/**
 * Available balances keyed by upper-cased currency, in human units.
 * Returns an empty map (never throws) when the wallet has no balances yet.
 */
export function useBalances() {
  const query = useQuery({
    queryKey: ["wallet", "balances"],
    queryFn: () => api.get<RawBalance[]>("/wallet/balances"),
    refetchInterval: 10000,
  });

  const map = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of query.data ?? []) {
      const cur = (b.currency ?? b.Currency ?? "").toUpperCase();
      if (!cur) continue;
      m[cur] = toDisplay(cur, b.available ?? b.Available ?? 0);
    }
    return m;
  }, [query.data]);

  return { balances: map, isLoading: query.isLoading };
}
