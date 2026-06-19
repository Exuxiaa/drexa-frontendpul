import { useState, useEffect, useCallback } from 'react';

export interface TickerData {
  sym: string;
  price: number;
  ch: number; // 24h percentage change
  vol: number; // 24h quote volume
  high: number;
  low: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

// Module-level state for singleton WebSocket
let sharedWs: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
let sharedTickers: Record<string, TickerData> = {};
let sharedOrderbooks: Record<string, OrderBook> = {};
let sharedIsConnected = false;

// Subscriptions
const tickerSubscribers = new Set<(tickers: Record<string, TickerData>) => void>();
const orderbookSubscribers = new Set<(obs: Record<string, OrderBook>) => void>();
const statusSubscribers = new Set<(connected: boolean) => void>();

function notifySubscribers() {
  tickerSubscribers.forEach((sub) => sub(sharedTickers));
  orderbookSubscribers.forEach((sub) => sub(sharedOrderbooks));
}

function notifyStatusSubscribers() {
  statusSubscribers.forEach((sub) => sub(sharedIsConnected));
}

function connectWebSocket() {
  if (sharedWs && (sharedWs.readyState === WebSocket.CONNECTING || sharedWs.readyState === WebSocket.OPEN)) {
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const wsUrl = baseUrl.replace(/^http/, 'ws') + 'market/ws';
  
  sharedWs = new WebSocket(wsUrl);

  sharedWs.onopen = () => {
    sharedIsConnected = true;
    reconnectAttempts = 0;
    notifyStatusSubscribers();
    console.log('Connected to market stream');
  };

  sharedWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'orderbook' && data.pair) {
        const sym = data.pair.replace('_USD', '').replace('_USDT', '').replace('_USDC', '');
        
        sharedOrderbooks = {
          ...sharedOrderbooks,
          [sym]: { bids: data.bids || [], asks: data.asks || [] }
        };

        // Derive price from the top of the book
        let price = sharedTickers[sym]?.price || 0;
        if (data.bids && data.bids.length > 0) {
          price = data.bids[0].price;
        } else if (data.asks && data.asks.length > 0) {
          price = data.asks[0].price;
        }

        if (price > 0) {
          const current = sharedTickers[sym];
          if (!current || current.price !== price) {
            sharedTickers = {
              ...sharedTickers,
              [sym]: {
                sym,
                price,
                ch: current?.ch || 0,
                vol: current?.vol || 0,
                high: current?.high || price,
                low: current?.low || price,
              }
            };
          }
        }
        notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to parse market data:', error);
    }
  };

  sharedWs.onclose = (event) => {
    sharedIsConnected = false;
    sharedWs = null;
    notifyStatusSubscribers();
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    console.log(`Market stream disconnected (code: ${event.code}, reason: ${event.reason || 'none'}). Reconnecting in ${delay}ms...`);
    reconnectTimeout = setTimeout(connectWebSocket, delay);
    reconnectAttempts++;
  };

  sharedWs.onerror = () => {
    if (sharedWs) sharedWs.close();
  };
}

function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (sharedWs) {
    sharedWs.onopen = null;
    sharedWs.onmessage = null;
    sharedWs.onclose = null;
    sharedWs.onerror = null;
    sharedWs.close();
    sharedWs = null;
  }
  sharedIsConnected = false;
  reconnectAttempts = 0;
}

export function useMarketStream() {
  const [tickers, setTickers] = useState<Record<string, TickerData>>(sharedTickers);
  const [orderbooks, setOrderbooks] = useState<Record<string, OrderBook>>(sharedOrderbooks);
  const [isConnected, setIsConnected] = useState(sharedIsConnected);

  useEffect(() => {
    // Add subscriptions
    tickerSubscribers.add(setTickers);
    orderbookSubscribers.add(setOrderbooks);
    statusSubscribers.add(setIsConnected);

    // Initial state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTickers(sharedTickers);
    setOrderbooks(sharedOrderbooks);
    setIsConnected(sharedIsConnected);

    let initTimeout: NodeJS.Timeout | null = null;

    // Only connect if this is the first subscriber
    if (tickerSubscribers.size === 1) {
      initTimeout = setTimeout(() => {
        connectWebSocket();
      }, 50);
    }

    return () => {
      if (initTimeout) clearTimeout(initTimeout);
      tickerSubscribers.delete(setTickers);
      orderbookSubscribers.delete(setOrderbooks);
      statusSubscribers.delete(setIsConnected);
      
      // If no more subscribers, disconnect to save resources
      if (tickerSubscribers.size === 0) {
        disconnectWebSocket();
      }
    };
  }, []);

  const getTicker = useCallback((sym: string) => tickers[sym], [tickers]);
  const getOrderbook = useCallback((sym: string) => orderbooks[sym], [orderbooks]);

  return { tickers, orderbooks, isConnected, getTicker, getOrderbook };
}
