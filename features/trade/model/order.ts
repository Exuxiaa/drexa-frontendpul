import { api } from "@/lib/api";

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop-limit" | "oco";
export type OrderStatus =
  | "pending"
  | "open"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "untriggered";

export interface PlaceOrderRequest {
  pair_id: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  /** Limit price — required for limit/stop-limit and the take-profit leg of OCO. */
  price?: number;
  /** Trigger price — required for stop-limit and OCO. */
  stop_price?: number;
}

/** An order row as returned by the Go backend (snake_case JSON). */
export interface Order {
  order_id: string;
  user_id: string;
  pair_id: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price?: number;
  stop_price?: number;
  quantity: number;
  filled_quantity: number;
  locked_amount: number;
  fee: number;
  oco_group_id?: string;
  created_at: string;
  updated_at: string;
}

/** One of the caller's executed fills, annotated with their side and role. */
export interface TradeView {
  trade_id: string;
  pair_id: string;
  order_id: string;
  side: OrderSide;
  role: "maker" | "taker";
  price: number;
  quantity: number;
  fee: number;
  executed_at: string;
}

/** The place-order response is the created Order plus a possible error envelope. */
export type PlaceOrderResponse = Partial<Order> & {
  message?: string;
  error?: string;
};

export const placeOrder = async (
  data: PlaceOrderRequest,
): Promise<PlaceOrderResponse> => {
  return api.post<PlaceOrderResponse>("/orders", data, {
    retryOnUnauthorized: false,
  });
};

/** Cancels a resting order (or a dormant stop) owned by the caller. */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  return api.del<Order>(`/orders/${encodeURIComponent(orderId)}`);
};

export type OrderStatusFilter = "all" | "open" | "closed";

/** Lists the caller's orders, newest first. */
export const listOrders = async (
  opts: { status?: OrderStatusFilter; pairId?: string; limit?: number } = {},
): Promise<Order[]> => {
  const params = new URLSearchParams();
  if (opts.status) params.set("status", opts.status);
  if (opts.pairId) params.set("pair_id", opts.pairId);
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return api.get<Order[]>(`/orders${qs ? `?${qs}` : ""}`);
};

/** Lists the caller's executed fills, newest first. */
export const listTrades = async (limit = 100): Promise<TradeView[]> => {
  return api.get<TradeView[]>(`/trades?limit=${limit}`);
};
