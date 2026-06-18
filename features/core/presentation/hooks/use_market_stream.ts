import { useState, useEffect, useCallback } from 'react';

export interface TickerData {
  sym: string;
  price: number;
  ch: number; // 24h percentage change
  vol: number; // 24h quote volume
  high: number;
  low: number;
}

// Module-level state for singleton WebSocket
let sharedWs: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
let sharedTickers: Record<string, TickerData> = {};
let sharedIsConnected = false;

// Subscriptions
const subscribers = new Set<(tickers: Record<string, TickerData>) => void>();
const statusSubscribers = new Set<(connected: boolean) => void>();

function notifySubscribers() {
  subscribers.forEach((sub) => sub(sharedTickers));
}

function notifyStatusSubscribers() {
  statusSubscribers.forEach((sub) => sub(sharedIsConnected));
}

function connectWebSocket() {
  if (sharedWs && (sharedWs.readyState === WebSocket.CONNECTING || sharedWs.readyState === WebSocket.OPEN)) {
    return;
  }

  // Bypass Next.js API rewrites for WebSockets as it often drops upgrades in dev
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/v1/market/stream';
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
      if (Array.isArray(data)) {
        let updated = false;
        const nextTickers = { ...sharedTickers };

        for (const ticker of data) {
          if (ticker.e === '24hrMiniTicker') {
            const sym = ticker.s.replace('USDT', '');
            const c = parseFloat(ticker.c);
            const o = parseFloat(ticker.o);
            const h = parseFloat(ticker.h);
            const l = parseFloat(ticker.l);
            const vol = parseFloat(ticker.q);

            const ch = o > 0 ? ((c - o) / o) * 100 : 0;

            const current = nextTickers[sym];
            if (!current || current.price !== c || current.ch !== ch || current.vol !== vol) {
              nextTickers[sym] = { sym, price: c, ch, vol, high: h, low: l };
              updated = true;
            }
          }
        }

        if (updated) {
          sharedTickers = nextTickers;
          notifySubscribers();
        }
      }
    } catch (error) {
      console.error('Failed to parse market data:', error);
    }
  };

  sharedWs.onclose = () => {
    sharedIsConnected = false;
    sharedWs = null;
    notifyStatusSubscribers();
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    console.log(`Market stream disconnected. Reconnecting in ${delay}ms...`);
    reconnectTimeout = setTimeout(connectWebSocket, delay);
    reconnectAttempts++;
  };

  sharedWs.onerror = (error) => {
    console.error('Market stream error:', error);
    if (sharedWs) sharedWs.close();
  };
}

function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (sharedWs) {
    // Remove listeners so intentional close doesn't trigger error or reconnect
    sharedWs.onopen = null;
    sharedWs.onmessage = null;
    sharedWs.onclose = null;
    sharedWs.onerror = null;
    sharedWs.close();
    sharedWs = null;
  }
  sharedIsConnected = false;
  reconnectAttempts = 0;
  // Intentionally preserving sharedTickers so navigation between pages is instant
}

export function useMarketStream() {
  const [tickers, setTickers] = useState<Record<string, TickerData>>(sharedTickers);
  const [isConnected, setIsConnected] = useState(sharedIsConnected);

  useEffect(() => {
    // Add subscriptions
    subscribers.add(setTickers);
    statusSubscribers.add(setIsConnected);

    // Initial state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTickers(sharedTickers);
    setIsConnected(sharedIsConnected);

    // Only connect if this is the first subscriber
    if (subscribers.size === 1) {
      connectWebSocket();
    }

    return () => {
      subscribers.delete(setTickers);
      statusSubscribers.delete(setIsConnected);
      
      // If no more subscribers, disconnect to save resources
      if (subscribers.size === 0) {
        disconnectWebSocket();
      }
    };
  }, []);

  const getTicker = useCallback((sym: string) => {
    return tickers[sym];
  }, [tickers]);

  return { tickers, isConnected, getTicker };
}
