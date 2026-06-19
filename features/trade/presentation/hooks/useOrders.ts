import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Order, Trade } from "../../model/order";

export function useOrders(pairId?: string) {
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const pairQuery = pairId ? `?pair_id=${pairId}` : "";
      
      // Fetch open orders
      const openRes = await api.get<{ orders: Order[] }>(`/orders${pairQuery ? pairQuery + '&' : '?'}status=open`).catch(() => null);
      if (openRes?.orders) setOpenOrders(openRes.orders);

      // Fetch order history (filled, cancelled, rejected)
      // Since backend doesn't support multiple status query yet, we might fetch all and filter locally,
      // or just hit the base endpoint and filter.
      const allRes = await api.get<{ orders: Order[] }>(`/orders${pairQuery}`).catch(() => null);
      if (allRes?.orders) {
        setHistoryOrders(allRes.orders.filter(o => o.status !== "open" && o.status !== "pending"));
        // if openRes failed, fallback to filtering allRes for open orders too
        if (!openRes?.orders) {
          setOpenOrders(allRes.orders.filter(o => o.status === "open" || o.status === "pending"));
        }
      }

      // Fetch trades
      const tradesRes = await api.get<{ trades: Trade[] }>(`/trades${pairQuery}`).catch(() => null);
      if (tradesRes?.trades) setTrades(tradesRes.trades);

    } catch (err) {
      console.error("Failed to fetch orders/trades", err);
    } finally {
      setLoading(false);
    }
  }, [pairId]);

  const cancelOrder = useCallback(async (orderId: string) => {
    setCancelling(prev => new Set(prev).add(orderId));
    try {
      await api.delete(`/orders/${orderId}`);
      // Optimistically remove from open orders list
      setOpenOrders(prev => prev.filter(o => o.order_id !== orderId));
      // Refresh in background to pull the cancelled order into history
      refresh();
      // Optionally trigger an event to refresh wallet
      window.dispatchEvent(new Event("wallet-refresh"));
    } catch (err) {
      console.error("Failed to cancel order", err);
    } finally {
      setCancelling(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, [refresh]);

  useEffect(() => {
    const t = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(t);
  }, [refresh]);

  // Re-fetch when an order is placed elsewhere (the order ticket fires
  // "orders-refresh" after a successful POST /orders) so a new order appears
  // here immediately. A small delay lets the trade settle server-side first.
  useEffect(() => {
    const onRefresh = () => window.setTimeout(refresh, 250);
    window.addEventListener("orders-refresh", onRefresh);
    return () => window.removeEventListener("orders-refresh", onRefresh);
  }, [refresh]);

  return { openOrders, historyOrders, trades, loading, refresh, cancelOrder, cancelling };
}
