import { api } from "@/lib/api";

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop-limit" | "oco";
export type OrderStatus = "open" | "filled" | "partially_filled" | "cancelled" | "rejected";

export interface PlaceOrderRequest {
  pair_id: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  /** Omitted for market orders; required for limit/stop orders. */
  price?: number;
}

export interface PlaceOrderResponse {
  OrderID?: string;
  UserID?: string;
  PairID?: string;
  Side?: OrderSide;
  Type?: OrderType;
  Status?: OrderStatus;
  Price?: number;
  Quantity?: number;
  FilledQuantity?: number;
  LockedAmount?: number;
  Fee?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  Message?: string;
  Error?: string;
}

export const placeOrder = async (
  data: PlaceOrderRequest,
): Promise<PlaceOrderResponse> => {
  return api.post<PlaceOrderResponse>("/orders", data, {
    retryOnUnauthorized: false,
  });
};
