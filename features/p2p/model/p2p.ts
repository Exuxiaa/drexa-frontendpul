import { api } from "@/lib/api";

export type AdvertisementStatus = "active" | "paused" | "completed";
export type OrderStatus = "created" | "paid" | "released" | "disputed" | "cancelled";
export type DisputeStatus = "open" | "resolved";

export interface P2PAdvertisement {
  advertisement_id: string;
  seller_id: string;
  pair_id: string;
  price: number;
  min_amount: number;
  max_amount: number;
  payment_method: string;
  payment_window: number;
  seller_address: string;
  status: AdvertisementStatus;
  created_at: string;
}

export interface P2POrder {
  p2p_order_id: string;
  advertisement_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  total_idr: number;
  status: OrderStatus;
  payment_proof_url?: string;
  escrow_wallet_id?: string;
  buyer_address: string;
  seller_address: string;
  on_chain_id: string;
  escrow_state: string;
  create_tx_hash?: string;
  release_tx_hash?: string;
  refund_tx_hash?: string;
  dispute_tx_hash?: string;
  created_at: string;
  paid_at?: string;
  released_at?: string;
  expired_at: string;
}

export interface P2PDispute {
  p2p_dispute_id: string;
  p2p_order_id: string;
  raised_by: string;
  reason: string;
  evidence_url?: string;
  status: DisputeStatus;
  resolved_by?: string;
  resolution: string;
  resolved_at?: string;
  created_at: string;
}

export interface OnChainEscrow {
  buyer: string;
  seller: string;
  amount_wei: string;
  state: string;
  created_at: number;
}

export interface AdFilter {
  pair_id?: string;
  payment_method?: string;
  status?: AdvertisementStatus;
  limit?: number;
  offset?: number;
}

export interface CreateAdInput {
  pair_id: string;
  price: number;
  min_amount: number;
  max_amount: number;
  payment_method: string;
  payment_window: number;
  seller_address: string;
}

export interface CreateOrderInput {
  advertisement_id: string;
  amount: number;
  buyer_address: string;
}

export interface OpenDisputeInput {
  reason: string;
  evidence_url?: string;
}

// ─── API Wrapper ──────────────────────────────────────────────────────────

export const p2pApi = {
  // Ads
  createAd: (data: CreateAdInput) => api.post<P2PAdvertisement>("/p2p/ads", data),
  listAds: (filter: AdFilter = {}) => {
    const params = new URLSearchParams();
    if (filter.pair_id) params.append("pair_id", filter.pair_id);
    if (filter.payment_method) params.append("payment_method", filter.payment_method);
    if (filter.status) params.append("status", filter.status);
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.offset) params.append("offset", filter.offset.toString());
    const query = params.toString();
    return api.get<P2PAdvertisement[]>(`/p2p/ads${query ? "?" + query : ""}`);
  },
  myAds: () => api.get<P2PAdvertisement[]>("/p2p/ads/mine"),
  getAd: (id: string) => api.get<P2PAdvertisement>(`/p2p/ads/${id}`),
  setAdStatus: (id: string, status: AdvertisementStatus) => api.post<{message: string}>(`/p2p/ads/${id}/status`, { status }),

  // Orders
  createOrder: (data: CreateOrderInput) => api.post<P2POrder>("/p2p/orders", data),
  myOrders: () => api.get<P2POrder[]>("/p2p/orders/mine"),
  getOrder: (id: string) => api.get<P2POrder>(`/p2p/orders/${id}`),
  escrowInfo: (id: string) => api.get<OnChainEscrow>(`/p2p/orders/${id}/escrow`),
  markPaid: (id: string, payment_proof_url?: string) => api.post<P2POrder>(`/p2p/orders/${id}/paid`, { payment_proof_url }),
  releaseOrder: (id: string) => api.post<P2POrder>(`/p2p/orders/${id}/release`),
  cancelOrder: (id: string) => api.post<P2POrder>(`/p2p/orders/${id}/cancel`),

  // Disputes
  openDispute: (id: string, data: OpenDisputeInput) => api.post<P2PDispute>(`/p2p/orders/${id}/dispute`, data),
};
