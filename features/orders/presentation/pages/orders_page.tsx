"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TradingLayout } from '@/features/core/presentation/components/trading_layout';
import {
  TIcon, CoinBadge, Panel, Pill,
  btnBrand, btnGhost, thL, thR, tdL, tdR,
} from '@/features/core/presentation/components/primitives';
import { COINS } from '@/features/core/domain/data/mock_data';
import { fmtUSD, fmtNum } from '@/features/core/domain/data/trading_utils';
import { useOrders, useTrades, useCancelOrder } from '@/features/trade/presentation/hooks/useOrders';
import type { Order, OrderSide, TradeView } from '@/features/trade/model/order';

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', partially_filled: 'Partial', filled: 'Filled',
  cancelled: 'Cancelled', pending: 'Pending', untriggered: 'Untriggered',
};
const baseOf = (pairId: string) => pairId.split('_')[0] ?? pairId;
const quoteOf = (pairId: string) => pairId.split('_')[1] ?? 'USDC';
const titleCase = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const fillPct = (o: Order) => (o.quantity > 0 ? Math.min(100, Math.round((o.filled_quantity / o.quantity) * 100)) : 0);
const shortId = (id: string) => id.slice(0, 8);

function fmtTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'Filled' ? 'up' : (status === 'Cancelled' || status === 'Expired') ? 'neutral' : 'warn';
  return <Pill tone={tone}>{status}</Pill>;
}

const selStyle: React.CSSProperties = { background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', font: 'var(--small)', cursor: 'pointer' };

function FilterBar({ pair, setPair, side, setSide, extra }: {
  pair: string; setPair: (v: string) => void;
  side: string; setSide: (v: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
        <span style={{ font: 'var(--micro)', color: 'var(--fg-4)' }}>Pair</span>
        <select value={pair} onChange={e => setPair(e.target.value)} style={selStyle}>
          <option value="all">All</option>
          {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--surface-input)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
        {([['all', 'All'], ['buy', 'Buy'], ['sell', 'Sell']] as [string, string][]).map(([id, l]) => (
          <button key={id} onClick={() => setSide(id)} style={{
            padding: '6px 13px', borderRadius: 'var(--r-xs)', border: 'none', cursor: 'pointer', font: 'var(--micro)',
            background: side === id ? 'var(--surface-raised)' : 'transparent',
            color: side === id ? (id === 'buy' ? 'var(--up)' : id === 'sell' ? 'var(--down)' : 'var(--fg)') : 'var(--fg-3)',
          }}>{l}</button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {extra}
    </div>
  );
}

function EmptyRow({ span, text }: { span: number; text: string }) {
  return <tr><td colSpan={span} style={{ padding: 44, textAlign: 'center', font: 'var(--small)', color: 'var(--fg-3)' }}>{text}</td></tr>;
}

function PairCell({ pairId }: { pairId: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <CoinBadge sym={baseOf(pairId)} size={26} />
      <span style={{ fontWeight: 700, color: 'var(--fg)', font: 'var(--small)' }}>{baseOf(pairId)}/{quoteOf(pairId)}</span>
    </div>
  );
}

function OpenTable({ rows, onCancel, canceling }: { rows: Order[]; onCancel: (id: string) => void; canceling: boolean }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={thL}>Order ID</th><th style={thL}>Pair</th><th style={thL}>Side · Type</th>
        <th style={thR}>Price</th><th style={thR}>Amount</th><th style={thR}>Filled</th>
        <th style={thR}>Time</th><th style={{ ...thR, width: 100 }}></th>
      </tr></thead>
      <tbody>
        {rows.map((o) => (
          <tr key={o.order_id} style={{ borderTop: '1px solid var(--border-hairline)', font: '500 13px var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            <td style={{ ...tdL, color: 'var(--fg-3)', font: '500 12px var(--font-num)' }}>{shortId(o.order_id)}</td>
            <td style={tdL}><PairCell pairId={o.pair_id} /></td>
            <td style={{ ...tdL, color: o.side === 'buy' ? 'var(--up)' : 'var(--down)', textTransform: 'capitalize', fontWeight: 700 }}>{o.side} · {titleCase(o.type)}</td>
            <td style={{ ...tdR, color: 'var(--fg)' }}>{o.price != null ? fmtNum(o.price, o.price < 1 ? 4 : 2) : 'Market'}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtNum(o.quantity, 4)} {baseOf(o.pair_id)}</td>
            <td style={tdR}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <div style={{ width: 50, height: 5, borderRadius: 3, background: 'var(--surface-input)', overflow: 'hidden' }}>
                  <div style={{ width: fillPct(o) + '%', height: '100%', background: 'var(--brand-mint)' }} />
                </div>
                <span style={{ color: 'var(--fg-3)', width: 34 }}>{fillPct(o)}%</span>
              </div>
            </td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{fmtTime(o.created_at)}</td>
            <td style={tdR}>
              <button onClick={() => onCancel(o.order_id)} disabled={canceling}
                style={{ border: '1px solid var(--border-subtle)', background: 'none', color: 'var(--fg-2)', borderRadius: 'var(--r-xs)', padding: '5px 13px', cursor: canceling ? 'not-allowed' : 'pointer', font: 'var(--nano)', opacity: canceling ? 0.5 : 1 }}>Cancel</button>
            </td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow span={8} text="No open orders match your filters." />}
      </tbody>
    </table>
  );
}

function HistoryTable({ rows }: { rows: Order[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={thL}>Order ID</th><th style={thL}>Pair</th><th style={thL}>Side · Type</th>
        <th style={thR}>Price</th><th style={thR}>Amount</th><th style={thR}>Total</th>
        <th style={thR}>Status</th><th style={thR}>Time</th>
      </tr></thead>
      <tbody>
        {rows.map((o) => (
          <tr key={o.order_id} style={{ borderTop: '1px solid var(--border-hairline)', font: '500 13px var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            <td style={{ ...tdL, color: 'var(--fg-3)', font: '500 12px var(--font-num)' }}>{shortId(o.order_id)}</td>
            <td style={tdL}><PairCell pairId={o.pair_id} /></td>
            <td style={{ ...tdL, color: o.side === 'buy' ? 'var(--up)' : 'var(--down)', textTransform: 'capitalize', fontWeight: 700 }}>{o.side} · {titleCase(o.type)}</td>
            <td style={{ ...tdR, color: 'var(--fg)' }}>{o.price != null ? fmtNum(o.price, o.price < 1 ? 4 : 2) : 'Market'}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtNum(o.quantity, 4)} {baseOf(o.pair_id)}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{o.price != null ? fmtUSD(o.price * o.quantity) : '—'}</td>
            <td style={tdR}><StatusBadge status={STATUS_LABEL[o.status] ?? o.status} /></td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{fmtTime(o.updated_at || o.created_at)}</td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow span={8} text="No orders in this period." />}
      </tbody>
    </table>
  );
}

function TradesTable({ rows }: { rows: TradeView[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={thL}>Pair</th><th style={thL}>Side</th>
        <th style={thR}>Fill price</th><th style={thR}>Amount</th>
        <th style={thR}>Total</th><th style={thR}>Fee</th>
        <th style={thR}>Role</th><th style={thR}>Time</th>
      </tr></thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.trade_id} style={{ borderTop: '1px solid var(--border-hairline)', font: '500 13px var(--font-num)', fontVariantNumeric: 'tabular-nums' }}>
            <td style={tdL}><PairCell pairId={t.pair_id} /></td>
            <td style={{ ...tdL, color: t.side === 'buy' ? 'var(--up)' : 'var(--down)', textTransform: 'capitalize', fontWeight: 700 }}>{t.side}</td>
            <td style={{ ...tdR, color: 'var(--fg)' }}>{fmtNum(t.price, t.price < 1 ? 4 : 2)}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtNum(t.quantity, 4)} {baseOf(t.pair_id)}</td>
            <td style={{ ...tdR, color: 'var(--fg-2)' }}>{fmtUSD(t.price * t.quantity)}</td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{fmtUSD(t.fee)}</td>
            <td style={tdR}><Pill tone={t.role === 'maker' ? 'info' : 'neutral'}>{titleCase(t.role)}</Pill></td>
            <td style={{ ...tdR, color: 'var(--fg-3)' }}>{fmtTime(t.executed_at)}</td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow span={8} text="No fills in this period." />}
      </tbody>
    </table>
  );
}

/* ── OrdersPage ─────────────────────────────────────────────────── */
export function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState('open');
  const [pair, setPair] = useState('all');
  const [side, setSide] = useState('all');

  const openQ = useOrders('open');
  const historyQ = useOrders('closed');
  const tradesQ = useTrades();
  const cancelMut = useCancelOrder();

  const matchesOrder = (o: Order) =>
    (pair === 'all' || baseOf(o.pair_id) === pair) && (side === 'all' || o.side === (side as OrderSide));
  const matchesTrade = (t: TradeView) =>
    (pair === 'all' || baseOf(t.pair_id) === pair) && (side === 'all' || t.side === (side as OrderSide));

  const openRows = (openQ.data ?? []).filter(matchesOrder);
  const historyRows = (historyQ.data ?? []).filter(matchesOrder);
  const tradeRows = (tradesQ.data ?? []).filter(matchesTrade);

  const tabs: [string, string, number][] = [
    ['open', 'Open orders', openRows.length],
    ['history', 'Order history', historyRows.length],
    ['trades', 'Trade history', tradeRows.length],
  ];

  const cancelAll = () => openRows.forEach(o => cancelMut.mutate(o.order_id));

  return (
    <TradingLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ font: 'var(--h1)', color: 'var(--fg)', letterSpacing: '-.01em' }}>Orders</h1>
            <p style={{ font: 'var(--small)', color: 'var(--fg-3)', marginTop: 4 }}>Manage open orders, review history and individual fills</p>
          </div>
          <button onClick={() => router.push('/trade?sym=BTC')} style={btnBrand}>
            <TIcon name="plus" size={16} color="#0b1020" />New order
          </button>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border-hairline)' }}>
          {tabs.map(([id, l, n]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', border: 'none', background: 'none',
              cursor: 'pointer', font: 'var(--small)',
              color: tab === id ? 'var(--fg)' : 'var(--fg-3)',
              borderBottom: tab === id ? '2px solid var(--brand-mint)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {l}
              <span style={{ font: 'var(--nano)', color: tab === id ? 'var(--brand-mint)' : 'var(--fg-4)', background: tab === id ? 'rgba(0,255,163,.12)' : 'rgba(255,255,255,.06)', padding: '2px 7px', borderRadius: 'var(--r-pill)' }}>{n}</span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <FilterBar pair={pair} setPair={setPair} side={side} setSide={setSide}
            extra={tab === 'open' && openRows.length > 0 && (
              <button onClick={cancelAll} disabled={cancelMut.isPending} style={{ ...btnGhost, height: 38, color: 'var(--down)', borderColor: 'rgba(255,77,77,.3)', opacity: cancelMut.isPending ? 0.5 : 1 }}>
                <TIcon name="x" size={14} color="var(--down)" />Cancel all
              </button>
            )} />
        </div>

        <Panel pad={0} style={{ overflow: 'hidden' }}>
          {tab === 'open'    && <OpenTable    rows={openRows} onCancel={(id) => cancelMut.mutate(id)} canceling={cancelMut.isPending} />}
          {tab === 'history' && <HistoryTable rows={historyRows} />}
          {tab === 'trades'  && <TradesTable  rows={tradeRows} />}
        </Panel>
      </div>
    </TradingLayout>
  );
}
