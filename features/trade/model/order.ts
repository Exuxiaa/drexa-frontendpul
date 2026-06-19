import { api } from "@/lib/api";

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "pending" | "open" | "filled" | "partially_filled" | "cancelled" | "rejected";

export interface Order {
  order_id: string;
  pair_id: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: number;
  quantity: number;
  filled_quantity: number;
  fee: number;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  trade_id: string;
  pair_id: string;
  side: OrderSide;
  role: "maker" | "taker";
  price: number;
  quantity: number;
  fee: number;
  executed_at: string;
}

export interface PlaceOrderRequest {
  pair_id: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  /** Omitted for market orders; required for limit/stop orders. */
  price?: number;
}

export interface PlaceOrderResponse {
  order_id?: string;
  user_id?: string;
  pair_id?: string;
  side?: OrderSide;
  type?: OrderType;
  status?: OrderStatus;
  price?: number;
  quantity?: number;
  filled_quantity?: number;
  locked_amount?: number;
  fee?: number;
  created_at?: string;
  updated_at?: string;
  message?: string;
  error?: string;
}

export const placeOrder = async (
  data: PlaceOrderRequest,
): Promise<PlaceOrderResponse> => {
  return api.post<PlaceOrderResponse>("/orders", data, {
    retryOnUnauthorized: false,
  });
};
