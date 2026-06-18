"use client"

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TradingLayout } from '@/features/core/presentation/components/trading_layout';
import {
  TIcon, CoinBadge, Panel, SectionTitle, Delta, Sparkline, AreaChart,
  linkBtn, tdL, tdR,
} from '@/features/core/presentation/components/primitives';
import {
  COINS, DONUT_COLORS, ACTIVITY, portfolioTotals, coinOf,
} from '@/features/core/domain/data/mock_data';
import { series, fmtUSD, fmtNum } from '@/features/core/domain/data/trading_utils';
import { useMarketStream } from '@/features/core/presentation/hooks/use_market_stream';
import { useWalletData } from '@/features/wallet/presentation/hooks/useWalletData';

const ranges = ['1D', '1W', '1M', '1Y', 'All'];
const rangeConfig: Record<string, { seed: number; length: number }> = {
  '1D': { seed: 3, length: 30 },
  '1W': { seed: 7, length: 48 },
  '1M': { seed: 11, length: 60 },
  '1Y': { seed: 23, length: 80 },
  All: { seed: 41, length: 90 },
};

function QuickAction({
  icon, label, onClick, brand,
}: {
  icon: Parameters<typeof TIcon>[0]['name'];
  label: string;
  onClick: () => void;
  brand?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
        padding: '16px 8px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
        border: brand ? 'none' : '1px solid var(--border-subtle)',
        background: brand ? 'var(--brand-gradient)' : 'var(--surface-input)',
        color: brand ? '#0b1020' : 'var(--fg)',
      }}
      onMouseEnter={e => { if (!brand) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-raised)'; }}
      onMouseLeave={e => { if (!brand) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-input)'; }}
    >
      <TIcon name={icon} size={20} color={brand ? '#0b1020' : 'var(--brand-mint)'} />
      <span style={{ font: 'var(--small)' }}>{label}</span>
    </button>
  );
}

export function HomePage() {
  const router = useRouter();
  const { tickers } = useMarketStream();
  const tot = useMemo(() => portfolioTotals(tickers), [tickers]);
  const [range, setRange] = useState('1W');
  const curve = useMemo(() => {
    const cfg = rangeConfig[range];
    return series(cfg.seed, cfg.length, 0.05, tot.value * 0.86);
  }, [range, tot.value]);
  const curveUp = curve[curve.length - 1] >= curve[0];

  const { walletBalanceCents, transactions } = useWalletData(5);

  const movers = useMemo(() => {
    return [...COINS].map(c => ({ ...c, ...tickers[c.sym] })).sort((a, b) => b.ch - a.ch).slice(0, 5);
  }, [tickers]);

  const watch = useMemo(() => {
    return ['BTC', 'SOL', 'ETH', 'LINK'].map(sym => {
      const c = coinOf(sym);
      return { ...c, ...tickers[sym] };
    });
  }, [tickers]);

  return (
    <TradingLayout>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 56px' }}>

        {/* greeting */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ font: 'var(--small)', color: 'var(--fg-3)' }}>Good morning, Maya</p>
            <h1 style={{ font: 'var(--h1)', color: 'var(--fg)', letterSpacing: '-.01em', marginTop: 2 }}>Welcome back to Drexa</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--r-sm)', background: 'rgba(0,255,163,.08)', border: '1px solid rgba(0,255,163,.18)' }}>
            <TIcon name="shield" size={16} color="var(--brand-mint)" />
            <span style={{ font: 'var(--micro)', color: 'var(--fg-2)' }}>Identity verified · Spot account</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* balance + chart */}
          <Panel pad={0} style={{ background: 'var(--surface-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ font: 'var(--small)', color: 'var(--fg-3)' }}>Total portfolio value</div>
                  <div style={{ font: '800 40px var(--font-num)', color: 'var(--fg)', letterSpacing: '-.02em', margin: '6px 0 8px', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(tot.value)}</div>
                  <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ font: 'var(--small)', color: 'var(--fg-3)', display: 'inline-flex', gap: 6 }}>Today <Delta v={(tot.today / tot.value) * 100} icon /></span>
                    <span style={{ font: 'var(--small)', color: 'var(--fg-3)', display: 'inline-flex', gap: 6 }}>All-time <Delta v={tot.pnlPct} /></span>
                    {walletBalanceCents !== null && (
                      <span style={{ font: 'var(--small)', color: 'var(--fg-3)', display: 'inline-flex', gap: 6 }}>
                        Cash <span style={{ font: '700 13px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(walletBalanceCents / 100)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {ranges.map(r => (
                    <button key={r} onClick={() => setRange(r)} style={{
                      padding: '5px 11px', borderRadius: 'var(--r-xs)', border: 'none', cursor: 'pointer', font: 'var(--micro)',
                      background: range === r ? 'var(--surface-raised)' : 'transparent',
                      color: range === r ? 'var(--fg)' : 'var(--fg-3)',
                    }}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <AreaChart data={curve} up={curveUp} height={188} fillId="homeCurve" />
            </div>
          </Panel>

          {/* quick actions + allocation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Panel>
              <div style={{ font: 'var(--small)', color: 'var(--fg-3)', marginBottom: 12 }}>Quick actions</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <QuickAction icon="download" label="Deposit" brand onClick={() => router.push('/wallet')} />
                <QuickAction icon="chart"    label="Trade"   onClick={() => router.push('/trade')} />
                <QuickAction icon="upload"   label="Withdraw" onClick={() => router.push('/wallet')} />
              </div>
            </Panel>
            <Panel style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ font: 'var(--small)', color: 'var(--fg-3)' }}>Allocation</span>
                <button onClick={() => router.push('/portfolio')} style={linkBtn}>View portfolio<TIcon name="chevRight" size={13} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {tot.rows.slice(0, 4).map(r => {
                  const pct = (r.value / tot.value) * 100;
                  return (
                    <div key={r.sym} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CoinBadge sym={r.sym} size={26} />
                      <span style={{ font: 'var(--small)', color: 'var(--fg-2)', width: 42 }}>{r.sym}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-input)', overflow: 'hidden' }}>
                        <div style={{ width: pct + '%', height: '100%', background: DONUT_COLORS[r.sym] ?? 'var(--brand-blue)' }} />
                      </div>
                      <span style={{ font: '600 12px var(--font-num)', color: 'var(--fg-3)', width: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        {/* top movers */}
        <div style={{ marginBottom: 16 }}>
          <SectionTitle action={<button onClick={() => router.push('/markets')} style={linkBtn}>All markets<TIcon name="chevRight" size={13} /></button>}>Top movers</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {movers.map(c => {
              const up = c.ch >= 0;
              return (
                <button key={c.sym} onClick={() => router.push('/markets/' + c.sym)} style={{
                  textAlign: 'left', cursor: 'pointer', background: 'var(--surface)',
                  border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-md)',
                  padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hairline)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CoinBadge sym={c.sym} size={26} />
                    <span style={{ font: '700 13px var(--font-sans)', color: 'var(--fg)' }}>{c.sym}</span>
                    <div style={{ flex: 1 }} />
                    <Sparkline data={c.spark} up={up} w={48} h={20} />
                  </div>
                  <div>
                    <div style={{ font: '700 16px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(c.price, c.price < 1 ? 4 : 2)}</div>
                    <Delta v={c.ch} size={12} icon />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* watchlist + activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
          <Panel pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
              <span style={{ font: 'var(--h3)', color: 'var(--fg)' }}>Watchlist</span>
              <button onClick={() => router.push('/markets')} style={linkBtn}>Manage<TIcon name="chevRight" size={13} /></button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {watch.map(c => {
                  const up = c.ch >= 0;
                  return (
                    <tr key={c.sym} style={{ borderTop: '1px solid var(--border-hairline)', cursor: 'pointer' }}
                      onClick={() => router.push('/markets/' + c.sym)}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-raised)'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                      <td style={{ ...tdL, padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <CoinBadge sym={c.sym} size={30} />
                          <div>
                            <div style={{ font: '700 14px var(--font-sans)', color: 'var(--fg)' }}>{c.name}</div>
                            <div style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>{c.sym}/USDT</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 0' }}><Sparkline data={c.spark} up={up} w={80} h={26} /></td>
                      <td style={{ ...tdR, padding: '12px 18px' }}>
                        <div style={{ font: '700 14px var(--font-num)', color: 'var(--fg)' }}>{fmtUSD(c.price, c.price < 1 ? 4 : 2)}</div>
                        <Delta v={c.ch} size={12} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          <Panel pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
              <span style={{ font: 'var(--h3)', color: 'var(--fg)' }}>Recent activity</span>
              <button onClick={() => router.push('/orders')} style={linkBtn}>All<TIcon name="chevRight" size={13} /></button>
            </div>
            <div>
              {transactions.length > 0
                ? transactions.map(tx => {
                    const inflow = tx.type === 'deposit';
                    const usd = tx.amount / 100;
                    const date = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderTop: '1px solid var(--border-hairline)' }}>
                        <span style={{ width: 32, height: 32, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: inflow ? 'var(--up-soft)' : 'var(--down-soft)' }}>
                          <TIcon name={inflow ? 'arrowDown' : 'arrowUp'} size={15} color={inflow ? 'var(--up)' : 'var(--down)'} />
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ font: '700 13px var(--font-sans)', color: 'var(--fg)', textTransform: 'capitalize' }}>{tx.type}d USD</div>
                          <div style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>{date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ font: '700 13px var(--font-num)', color: inflow ? 'var(--up)' : 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{inflow ? '+' : '-'}{fmtUSD(usd)}</div>
                          <div style={{ font: '500 11px var(--font-num)', color: 'var(--fg-3)', textTransform: 'capitalize' }}>{tx.status}</div>
                        </div>
                      </div>
                    );
                  })
                : ACTIVITY.map((x, i) => {
                    const inflow = x.dir === 'in';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderTop: '1px solid var(--border-hairline)' }}>
                        <span style={{ width: 32, height: 32, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: inflow ? 'var(--up-soft)' : 'var(--down-soft)' }}>
                          <TIcon name={inflow ? 'arrowDown' : 'arrowUp'} size={15} color={inflow ? 'var(--up)' : 'var(--down)'} />
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ font: '700 13px var(--font-sans)', color: 'var(--fg)' }}>{x.t} {x.sym}</div>
                          <div style={{ font: 'var(--nano)', color: 'var(--fg-3)' }}>{x.time}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ font: '700 13px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(x.val)}</div>
                          <div style={{ font: '500 11px var(--font-num)', color: 'var(--fg-3)' }}>{fmtNum(x.amt, x.amt < 1 ? 4 : 2)} {x.sym}</div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </Panel>
        </div>
      </div>
    </TradingLayout>
  );
}
