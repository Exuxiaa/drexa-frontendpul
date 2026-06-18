import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface CryptoAsset {
  currency: string;
  chain: string;
  network: string;
  address: string;
  balance: string; // decimal string in the coin's main unit
}

/** Currencies the Tatum-backed gateway can serve real on-chain addresses for. */
export const CRYPTO_SUPPORTED = ["BTC", "ETH"] as const;

export function isCryptoSupported(currency: string): boolean {
  return (CRYPTO_SUPPORTED as readonly string[]).includes(currency);
}

/**
 * Fetches (and lazily provisions) the user's on-chain deposit address + live
 * balance for a currency. Returns null for currencies without on-chain support
 * so the caller can fall back to its own placeholder.
 */
export function useCryptoAddress(currency: string) {
  const [data, setData] = useState<CryptoAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCryptoSupported(currency)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    api
      .get<CryptoAsset>(`/wallet/crypto/address/${currency}`)
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (active) {
          setError(e instanceof Error ? e.message : "Failed to load address");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currency]);

  return { data, loading, error };
}
