"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TradingLayout } from '@/features/core/presentation/components/trading_layout';
import {
  TIcon, CoinBadge, Panel, Delta, Pill, AreaChart,
  btnBrand, btnGhost, linkBtn,
} from '@/features/core/presentation/components/primitives';
import { ABOUT, coinOf, holdingRows } from '@/features/core/domain/data/mock_data';
import { fmtUSD, fmtNum, fmtCompact } from '@/features/core/domain/data/trading_utils';
import { useMarketStream } from '@/features/core/presentation/hooks/use_market_stream';
import type { CoinData } from '@/features/core/domain/model';

function Field({ label, suffix, value, placeholder, readOnly }: { label: string; suffix: string; value: string; placeholder: string; readOnly?: boolean }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ font: 'var(--nano)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', height: 46, marginTop: 6, padding: '0 12px', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)' }}>
        <input value={value} placeholder={placeholder} readOnly={readOnly}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', font: '600 14px var(--font-num)', fontVariantNumeric: 'tabular-nums', minWidth: 0 }} />
        <span style={{ font: 'var(--micro)', color: 'var(--fg-4)' }}>{suffix}</span>
      </div>
    </label>
  );
}

function AssetStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--surface-input)', borderRadius: 'var(--r-sm)' }}>
      <div style={{ font: 'var(--nano)', color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ font: '700 16px var(--font-num)', color: 'var(--fg)', marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ font: 'var(--nano)', color: 'var(--fg-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function QuickTicket({ coin }: { coin: CoinData }) {
  const router = useRouter();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [pct, setPct] = useState(0);
  const buy = side === 'buy';
  const total  = (buy ? 6420 : 1200) * pct / 100;
  const amount = total / coin.price;

  return (
    <Panel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'var(--surface-input)', padding: 4, borderRadius: 'var(--r-sm)', marginBottom: 14 }}>
        {(['buy', 'sell'] as const).map(s => (
          <button key={s} onClick={() => { setSide(s); setPct(0); }} style={{
            padding: '9px 0', borderRadius: 'var(--r-xs)', border: 'none', cursor: 'pointer', textTransform: 'capitalize',
            font: 'var(--body-strong)',
            background: side === s ? (s === 'buy' ? 'var(--up)' : 'var(--down)') : 'transparent',
            color: side === s ? '#0b1020' : 'var(--fg-3)',
          }}>{s}</button>
        ))}
      </div>
      <Field label="Amount" suffix={coin.sym} value={amount ? amount.toFixed(coin.price < 1 ? 0 : 5) : ''} placeholder="0.00" readOnly />
      <div style={{ margin: '14px 0' }}>
        <input type="range" min="0" max="100" value={pct} onChange={e => setPct(+e.target.value)}
          style={{ width: '100%', accentColor: buy ? 'var(--up)' : 'var(--down)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {[0, 25, 50, 75, 100].map(p => (
            <button key={p} onClick={() => setPct(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', font: 'var(--nano)', color: pct === p ? (buy ? 'var(--up)' : 'var(--down)') : 'var(--fg-4)' }}>{p}%</button>
          ))}
        </div>
      </div>
      <Field label="Total" suffix="USDT" value={total ? total.toFixed(2) : ''} placeholder="0.00" readOnly />
      <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--micro)', color: 'var(--fg-3)', marginTop: 12 }}>
        <span>Available</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{buy ? '6,420.00 USDT' : '0.1312 ' + coin.sym}</span>
      </div>
      <button style={{ ...btnBrand, width: '100%', height: 48, marginTop: 14, background: buy ? 'var(--up)' : 'var(--down)' }}>
        {buy ? 'Buy' : 'Sell'} {coin.sym}
      </button>
      <button onClick={() => router.push('/trade?sym=' + coin.sym)} style={{ ...btnGhost, width: '100%', marginTop: 8 }}>
        <TIcon name="chart" size={15} color="var(--fg)" />Advanced trade
      </button>
    </Panel>
  );
}

export function AssetPage({ sym }: { sym: string }) {
  const router = useRouter();
  const mockCoin = coinOf(sym);

  const [coin, setCoin] = useState<CoinData>(mockCoin);
  
  // Backend doesn't support klines/history yet, so we just flatline the current price
  const [chartData, setChartData] = useState<number[]>([]);
  const chartLoading = false;
  const [range, setRange] = useState('1W');
  const ranges = ['1H', '1D', '1W', '1M', '1Y'];

  const curveUp = true;
  const hold = holdingRows().find(h => h.sym === sym);

  const { tickers } = useMarketStream();

  // Update with WebSocket live ticker data
  useEffect(() => {
    if (tickers[sym]) {
      setCoin(c => ({ 
        ...c, 
        price: tickers[sym].price || c.price,
        ch: tickers[sym].ch || c.ch,
        vol: tickers[sym].vol || c.vol,
      }));
      setChartData([tickers[sym].price || mockCoin.price]);
    } else {
      setChartData([mockCoin.price]);
    }
  }, [tickers, sym, mockCoin.price]);

  return (
    <TradingLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 56px' }}>
        <button onClick={() => router.push('/markets')} style={{ ...linkBtn, color: 'var(--fg-3)', marginBottom: 16 }}>
          <TIcon name="arrowLeft" size={15} />Markets
        </button>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
          <CoinBadge sym={coin.sym} size={52} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ font: 'var(--h1)', color: 'var(--fg)' }}>{coin.name}</h1>
              <Pill>{coin.sym}/USDT</Pill>
            </div>
            <div style={{ font: 'var(--small)', color: 'var(--fg-3)', marginTop: 2 }}>
              {coin.rank ? `Rank #${coin.rank}` : `#${mockCoin.sym}`} · {fmtCompact(coin.mcap)} market cap
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: '800 30px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.01em' }}>{fmtUSD(coin.price, coin.price < 1 ? 4 : 2)}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
              <Delta v={coin.ch} icon /><span style={{ font: 'var(--small)', color: 'var(--fg-4)' }}>24h</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 332px', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* chart */}
            <Panel>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 3, marginBottom: 10 }}>
                {ranges.map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{
                    padding: '5px 12px', borderRadius: 'var(--r-xs)', border: 'none', cursor: 'pointer', font: 'var(--micro)',
                    background: range === r ? 'var(--surface-raised)' : 'transparent',
                    color: range === r ? 'var(--fg)' : 'var(--fg-3)',
                  }}>{r}</button>
                ))}
              </div>
              <div style={{ opacity: chartLoading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                <AreaChart data={chartData} up={curveUp} height={300} fillId="assetCurve" />
              </div>
            </Panel>

            {/* stats */}
            <Panel>
              <div style={{ font: 'var(--h3)', color: 'var(--fg)', marginBottom: 14 }}>Market stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <AssetStat label="24h high" value={fmtUSD(coin.price * 1.04, coin.price < 1 ? 4 : 2)} />
                <AssetStat label="24h low"  value={fmtUSD(coin.price * 0.96, coin.price < 1 ? 4 : 2)} />
                <AssetStat label="24h volume" value={fmtCompact(coin.vol)} />
                <AssetStat label="Market cap" value={fmtCompact(coin.mcap)} />
                <AssetStat label="Circulating supply"
                  value={fmtNum(coin.supply / (coin.supply > 1e9 ? 1e9 : 1e6), 1) + (coin.supply > 1e9 ? 'B' : 'M')}
                  sub={coin.sym} />
                <AssetStat label="All-time high" value={fmtUSD(coin.price * 1.62, coin.price < 1 ? 4 : 2)} sub="-38% from ATH" />
              </div>
            </Panel>

            {/* about */}
            <Panel>
              <div style={{ font: 'var(--h3)', color: 'var(--fg)', marginBottom: 10 }}>About {coin.name}</div>
              <p style={{ font: 'var(--body)', color: 'var(--fg-2)', lineHeight: 1.6 }}>{ABOUT[coin.sym] ?? 'A digital asset available for spot trading on Drexa.'}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {['Website', 'Whitepaper', 'Explorer'].map(l => (
                  <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 'var(--r-pill)', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', font: 'var(--micro)', color: 'var(--fg-2)', cursor: 'pointer' }}>
                    {l}<TIcon name="externalLink" size={12} color="var(--fg-4)" />
                  </span>
                ))}
              </div>
            </Panel>
          </div>

          {/* right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
            <Panel style={{ background: 'var(--surface-card)' }}>
              <div style={{ font: 'var(--small)', color: 'var(--fg-3)', marginBottom: 12 }}>Your position</div>
              {hold ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ font: '800 24px var(--font-num)', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(hold.value)}</span>
                    <Delta v={hold.pnlPct} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {([
                      ['Holdings', `${fmtNum(hold.qty, hold.qty < 1 ? 4 : 2)} ${hold.sym}`],
                      ['Avg cost', fmtUSD(hold.avg, hold.avg < 1 ? 4 : 2)],
                      ['Unrealized P&L', (hold.pnl >= 0 ? '+' : '') + fmtUSD(hold.pnl)],
                    ] as [string, string][]).map(([k, v], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--small)' }}>
                        <span style={{ color: 'var(--fg-3)' }}>{k}</span>
                        <span style={{ color: i === 2 ? (hold.pnl >= 0 ? 'var(--up)' : 'var(--down)') : 'var(--fg-2)', fontVariantNumeric: 'tabular-nums', font: '700 13px var(--font-num)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ font: 'var(--small)', color: 'var(--fg-3)', lineHeight: 1.5 }}>You don&apos;t hold any {coin.sym} yet. Buy below to open a position.</div>
              )}
            </Panel>
            <QuickTicket coin={coin} />
          </div>
        </div>
      </div>
    </TradingLayout>
  );
}
