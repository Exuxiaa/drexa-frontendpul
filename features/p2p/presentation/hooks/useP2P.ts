import { useState, useEffect, useCallback } from "react";
import { 
  p2pApi, 
  P2PAdvertisement, 
  P2POrder, 
  P2PDispute, 
  AdFilter, 
  CreateAdInput, 
  CreateOrderInput, 
  OpenDisputeInput, 
  AdvertisementStatus 
} from "../model/p2p";

// ─── Query Hooks ──────────────────────────────────────────────────────────

export function useP2PAds(filter: AdFilter) {
  const [ads, setAds] = useState<P2PAdvertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await p2pApi.listAds(filter);
      setAds(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, loading, error, mutate: fetchAds };
}

export function useMyAds() {
  const [ads, setAds] = useState<P2PAdvertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await p2pApi.myAds();
      setAds(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, loading, error, mutate: fetchAds };
}

export function useMyOrders() {
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await p2pApi.myOrders();
      setOrders(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, mutate: fetchOrders };
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────

export function useCreateAd() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (data: CreateAdInput): Promise<P2PAdvertisement> => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.createAd(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useSetAdStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: string, status: AdvertisementStatus) => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.setAdStatus(id, status);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useCreateP2POrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (data: CreateOrderInput): Promise<P2POrder> => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.createOrder(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useMarkP2POrderPaid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: string, paymentProofUrl?: string): Promise<P2POrder> => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.markPaid(id, paymentProofUrl);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useReleaseP2POrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: string): Promise<P2POrder> => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.releaseOrder(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useCancelP2POrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: string): Promise<P2POrder> => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.cancelOrder(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useOpenP2PDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: string, data: OpenDisputeInput): Promise<P2PDispute> => {
    try {
      setLoading(true);
      setError(null);
      return await p2pApi.openDispute(id, data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
