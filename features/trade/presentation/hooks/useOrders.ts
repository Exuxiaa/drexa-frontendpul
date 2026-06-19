import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelOrder,
  listOrders,
  listTrades,
  type OrderStatusFilter,
} from "../../model/order";

/** Query key roots so mutations can invalidate every related view at once. */
export const ordersKey = ["orders"] as const;
export const tradesKey = ["trades"] as const;

/**
 * Live order list for a status bucket, optionally scoped to one pair.
 * Polls so fills/cancels from the matching engine surface without a manual
 * refresh, and refetches on window focus.
 */
export function useOrders(
  status: OrderStatusFilter,
  pairId?: string,
  options: { refetchMs?: number; enabled?: boolean } = {},
) {
  const { refetchMs = 4000, enabled = true } = options;
  return useQuery({
    queryKey: [...ordersKey, status, pairId ?? "all"],
    queryFn: () => listOrders({ status, pairId }),
    refetchInterval: refetchMs,
    enabled,
  });
}

/** Live trade (fills) history, optionally polled. */
export function useTrades(options: { refetchMs?: number; enabled?: boolean } = {}) {
  const { refetchMs = 4000, enabled = true } = options;
  return useQuery({
    queryKey: [...tradesKey],
    queryFn: () => listTrades(100),
    refetchInterval: refetchMs,
    enabled,
  });
}

/** Cancels an order and refreshes every order/trade view. */
export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ordersKey });
      void qc.invalidateQueries({ queryKey: tradesKey });
    },
  });
}
