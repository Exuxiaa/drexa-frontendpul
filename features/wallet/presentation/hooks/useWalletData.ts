import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WalletTransaction, WalletTransactionStatus, WalletTransactionType } from '@/features/wallet/domain/types';
import { api } from '@/lib/api';

type WalletTransactionResponse = {
  tx_id?: string;
  TxID?: string;
  type?: string;
  Type?: string;
  status?: string;
  Status?: string;
  amount?: number;
  Amount?: number;
  currency?: string;
  Currency?: string;
  created_at?: string;
  CreatedAt?: string;
};

const DEFAULT_CURRENCY = 'usd';

function normalizeTransaction(tx: WalletTransactionResponse): WalletTransaction {
  return {
    id: tx.tx_id ?? tx.TxID ?? crypto.randomUUID(),
    type: (tx.type ?? tx.Type ?? 'deposit') as WalletTransactionType,
    status: (tx.status ?? tx.Status ?? 'pending') as WalletTransactionStatus,
    amount: tx.amount ?? tx.Amount ?? 0,
    currency: tx.currency ?? tx.Currency ?? DEFAULT_CURRENCY.toUpperCase(),
    createdAt: tx.created_at ?? tx.CreatedAt ?? new Date().toISOString(),
  };
}

export interface WalletBalanceResponse {
  wallet_id: string;
  currency: string;
  balance: number;
  locked: number;
  available: number;
  status: string;
}

export interface ParsedBalance {
  currency: string;
  qty: number;
  available: number;
  locked: number;
}

function parseBalance(b: WalletBalanceResponse): ParsedBalance {
  let divider = 1;
  const sym = b.currency.toUpperCase();
  if (sym === 'BTC') divider = 100_000_000;
  else if (sym === 'ETH' || sym === 'BNB') divider = 1_000_000_000_000_000_000;
  else if (sym === 'SOL') divider = 1_000_000_000;
  else if (sym === 'USDT') divider = 1_000_000;
  else if (sym === 'USD' || sym === 'IDR' || sym === 'USDC') divider = 100;

  return {
    currency: sym,
    qty: b.balance / divider,
    available: b.available / divider,
    locked: b.locked / divider,
  };
}

export function useWalletData(transactionLimit = 20) {
  const [balances, setBalances] = useState<ParsedBalance[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await api.get<WalletBalanceResponse[]>(`/wallet/balances`);
      setBalances((data ?? []).map(parseBalance));
    } catch {
      setBalances([]);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const txns = await api.get<WalletTransactionResponse[]>(
        `/wallet/transactions?page=1&page_size=${transactionLimit}`
      );
      setTransactions((txns ?? []).map(normalizeTransaction));
    } catch {
      setTransactions([]);
    }
  }, [transactionLimit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBalance();
      void fetchTransactions();
    }, 0);

    const onRefresh = () => {
      void fetchBalance();
      void fetchTransactions();
    };
    window.addEventListener("wallet-refresh", onRefresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wallet-refresh", onRefresh);
    };
  }, [fetchBalance, fetchTransactions]);

  const refresh = useCallback(() => {
    void fetchBalance();
    void fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  return useMemo(() => {
    // Cash is held as USDT (1 USDT = $1); USD only exists at the deposit/withdraw edges.
    const usdBal = balances.find(b => b.currency === 'USDT');
    return {
      balances,
      walletUsd: usdBal ? usdBal.qty : null,
      transactions,
      refresh,
    };
  }, [balances, transactions, refresh]);
}
