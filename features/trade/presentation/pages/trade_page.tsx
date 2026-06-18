"use client";

/* ── Drexa — Trade (Spot) page ── */
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Container, CoinBadge, Delta,
  COINS, COIN, fUSD, fNum, fCompact, rng, type Coin,
} from "@/features/core/presentation/components/drexa_kit";
import { useMarketStream } from "@/features/core/presentation/hooks/use_market_stream";
import { useBinanceKlines, type Candle } from "@/features/core/presentation/hooks/use_binance_klines";

function CandleChart({ data, h = 360 }: { data: Candle[]; h?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(wrapRef.current); return () => ro.disconnect();
  }, []);
  if (data.length === 0) {
    return <div ref={wrapRef} style={{ width: "100%", height: h, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", font: "500 13px var(--font)" }}>Loading chart…</div>;
  }
  const padR = 64, padT = 14, padB = 24, padL = 6;
  const innerW = Math.max(10, w - padL - padR), innerH = h - padT - padB;
  const lo = Math.min(...data.map(d => d.l)), hi = Math.max(...data.map(d => d.h)); const range = hi - lo || 1;
  const y = (v: number) => padT + innerH - ((v - lo) / range) * innerH;
  const step = innerW / data.length; const bw = Math.max(2, step * 0.6);
  const ticks = Array.from({ length: 5 }, (_, i) => lo + (range * i) / 4);
  const last = data[data.length - 1].c;
  return (
    <div ref={wrapRef} style={{ width: "100%", position: "relative" }}
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => { const r = wrapRef.current!.getBoundingClientRect(); const idx = Math.floor((e.clientX - r.left - padL) / step); setHover(idx >= 0 && idx < data.length ? idx : null); }}>
      <svg width={w} height={h} style={{ display: "block" }}>
        {ticks.map((t, i) => { const yy = y(t); return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={padL + innerW} y2={yy} stroke="var(--border-soft)" strokeWidth="1" strokeDasharray="2 5" />
            <text x={w - padR + 8} y={yy + 3.5} fill="var(--text-4)" style={{ font: "500 10.5px var(--mono)" }}>{fNum(t, t < 10 ? 3 : 0)}</text>
          </g>
        ); })}
        <line x1={padL} y1={y(last)} x2={padL + innerW} y2={y(last)} stroke="var(--blue-hover)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        <rect x={w - padR + 2} y={y(last) - 9} width={padR - 4} height={18} rx="3" fill="var(--blue)" />
        <text x={w - padR / 2} y={y(last) + 3.5} textAnchor="middle" fill="#fff" style={{ font: "600 10.5px var(--mono)" }}>{fNum(last, last < 10 ? 3 : 0)}</text>
        {data.map((d, i) => {
          const up = d.c >= d.o; const col = up ? "var(--up)" : "var(--down)";
          const cx = padL + i * step + step / 2;
          return (
            <g key={i} opacity={hover == null || hover === i ? 1 : 0.55}>
              <line x1={cx} y1={y(d.h)} x2={cx} y2={y(d.l)} stroke={col} strokeWidth="1" />
              <rect x={cx - bw / 2} y={Math.min(y(d.o), y(d.c))} width={bw} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="0.5" />
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "7px 12px", font: "500 11.5px var(--mono)", pointerEvents: "none" }}>
          {([["O", data[hover].o], ["H", data[hover].h], ["L", data[hover].l], ["C", data[hover].c]] as [string, number][]).map(([k, v]) => (
            <span key={k} style={{ color: "var(--text-3)" }}>{k} <span style={{ color: "var(--text-hi)" }}>{fNum(v, v < 10 ? 3 : 1)}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderBook({ price }: { price: number }) {
  const rows = useMemo(() => {
    const r = rng(Math.round(price * 100) + 5);
    const mk = (sign: number) => Array.from({ length: 7 }, (_, i) => {
      const p = price * (1 + sign * (i + 1) * 0.0007 * (1 + r() * 0.5));
      const amt = +(r() * 2.4 + 0.05).toFixed(4);
      return { p, amt, total: p * amt };
    });
    return { asks: mk(1).sort((a, b) => b.p - a.p), bids: mk(-1).sort((a, b) => b.p - a.p) };
  }, [price]);
  const maxTot = Math.max(...[...rows.asks, ...rows.bids].map(r => r.total));
  const Row = ({ r, side }: { r: { p: number; amt: number; total: number }; side: "ask" | "bid" }) => (
    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "4px 14px", font: "500 12px var(--mono)", fontVariantNumeric: "tabular-nums" }}>
      <span style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: (r.total / maxTot * 100) + "%", background: side === "ask" ? "var(--down-soft)" : "var(--up-soft)" }} />
      <span style={{ position: "relative", color: side === "ask" ? "var(--down)" : "var(--up)" }}>{fNum(r.p, r.p < 10 ? 4 : 2)}</span>
      <span style={{ position: "relative", color: "var(--text-2)" }}>{fNum(r.amt, 4)}</span>
    </div>
  );
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
      <div style={{ padding: "16px 18px 12px", font: "700 15px var(--font)", color: "var(--text-hi)" }}>Order book</div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 14px 8px", font: "600 10.5px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
        <span>Price (USDC)</span><span>Amount</span>
      </div>
      <div>{rows.asks.map((r, i) => <Row key={i} r={r} side="ask" />)}</div>
      <div style={{ padding: "9px 14px", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ font: "600 16px var(--mono)", color: "var(--up)", fontVariantNumeric: "tabular-nums" }}>{fNum(price, price < 10 ? 4 : 2)}</span>
        <Icon name="arrowUp" size={14} color="var(--up)" stroke={2.4} />
        <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>≈ {fUSD(price, price < 10 ? 4 : 2)}</span>
      </div>
      <div>{rows.bids.map((r, i) => <Row key={i} r={r} side="bid" />)}</div>
    </div>
  );
}

const ORDER_TYPES = ["Market", "Limit", "Stop-Limit", "OCO"];
function TicketField({ label, value, onChange, suffix, readOnly }: { label: string; value: string; onChange?: (v: string) => void; suffix: string; readOnly?: boolean }) {
  return (
    <div>
      <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 46, padding: "0 14px", background: readOnly ? "var(--inset)" : "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
        <input value={value} onChange={e => onChange && onChange(e.target.value)} readOnly={readOnly} inputMode="decimal"
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: readOnly ? "var(--text-2)" : "var(--text-hi)", font: "600 15px var(--mono)", width: "100%" }} />
        <span style={{ font: "600 13px var(--font)", color: "var(--text-3)" }}>{suffix}</span>
      </div>
    </div>
  );
}
function OrderTicket({ coin }: { coin: Coin }) {
  const [side, setSide] = useState("buy");
  const [type, setType] = useState("Limit");
  const [price, setPrice] = useState(coin.price.toFixed(coin.price < 10 ? 4 : 2));
  const [stop, setStop] = useState((coin.price * 0.98).toFixed(coin.price < 10 ? 4 : 2));
  const [limit, setLimit] = useState((coin.price * 1.02).toFixed(coin.price < 10 ? 4 : 2));
  const [amount, setAmount] = useState("");
  const [pct, setPct] = useState(0);

  const isBuy = side === "buy";
  const balQuote = 12480.00, balBase = 0.1312;
  const px = type === "Market" ? coin.price : (parseFloat(price) || coin.price);
  const amt = parseFloat(amount) || 0;
  const total = amt * px;
  const fee = total * 0.001;
  const accent = isBuy ? "var(--up)" : "var(--down)";
  const setByPct = (p: number) => {
    setPct(p);
    if (isBuy) setAmount(((balQuote * p / 100) / px).toFixed(6));
    else setAmount((balBase * p / 100).toFixed(6));
  };
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 20, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", gap: 0, background: "var(--inset)", borderRadius: "var(--r-sm)", padding: 4, marginBottom: 18 }}>
        {([["buy", "Buy"], ["sell", "Sell"]] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => { setSide(id); setPct(0); }} style={{
            flex: 1, height: 40, borderRadius: "var(--r-xs)", border: "none", cursor: "pointer", font: "700 14px var(--font)",
            background: side === id ? (id === "buy" ? "var(--up)" : "var(--down)") : "transparent",
            color: side === id ? "#fff" : "var(--text-2)",
          }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 18, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {ORDER_TYPES.map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", font: `${type === t ? 600 : 500} 13px var(--font)`,
            color: type === t ? "var(--text-hi)" : "var(--text-3)", borderBottom: type === t ? "2px solid var(--blue)" : "2px solid transparent", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {type === "Stop-Limit" && <TicketField label="Stop price" value={stop} onChange={setStop} suffix="USDC" />}
        {type === "OCO" && <TicketField label="Take-profit price" value={limit} onChange={setLimit} suffix="USDC" />}
        {type === "OCO" && <TicketField label="Stop price" value={stop} onChange={setStop} suffix="USDC" />}
        {type === "Market"
          ? <TicketField label="Price" value="Market price" readOnly suffix="USDC" />
          : (type !== "OCO" && <TicketField label={type === "Stop-Limit" ? "Limit price" : "Price"} value={price} onChange={setPrice} suffix="USDC" />)}
        <TicketField label="Amount" value={amount} onChange={(v) => { setAmount(v); setPct(0); }} suffix={coin.sym} />
        <div style={{ display: "flex", gap: 8 }}>
          {[25, 50, 75, 100].map(p => (
            <button key={p} onClick={() => setByPct(p)} style={{
              flex: 1, height: 32, borderRadius: "var(--r-xs)", cursor: "pointer", font: "600 12px var(--mono)",
              border: "1px solid " + (pct === p ? "var(--blue)" : "var(--border)"), background: pct === p ? "var(--blue-soft)" : "transparent",
              color: pct === p ? "var(--blue-hover)" : "var(--text-3)",
            }}>{p}%</button>
          ))}
        </div>
        <TicketField label="Total" value={amt ? fNum(total) : ""} readOnly suffix="USDC" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
          {([["Available", isBuy ? fUSD(balQuote) + " USDC" : fNum(balBase, 4) + " " + coin.sym],
            ["Est. fee (0.10%)", fUSD(fee)],
            [isBuy ? "You receive" : "You get", isBuy ? fNum(amt, 6) + " " + coin.sym : fUSD(total - fee)]] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", font: "500 13px var(--font)" }}>
              <span style={{ color: "var(--text-3)" }}>{k}</span>
              <span style={{ color: "var(--text-2)", fontFamily: "var(--mono)" }}>{v}</span>
            </div>
          ))}
        </div>
        <button style={{ height: 50, borderRadius: "var(--r-md)", border: "none", cursor: "pointer", background: accent, color: "#fff", font: "700 15px var(--font)" }}>
          {isBuy ? "Buy" : "Sell"} {coin.sym}
        </button>
      </div>
    </div>
  );
}

const OPEN_ORDERS = [
  { pair: "BTC/USDC", side: "Buy", type: "Limit", price: 62500, amt: 0.05, filled: "0%", time: "10:24" },
  { pair: "SOL/USDC", side: "Sell", type: "Stop-Limit", price: 152.00, amt: 8, filled: "0%", time: "09:48" },
];
const ORDER_HISTORY = [
  { pair: "ETH/USDC", side: "Buy", type: "Market", price: 3090.12, amt: 0.4, status: "Filled", time: "Jun 10" },
  { pair: "BTC/USDC", side: "Buy", type: "Limit", price: 61800, amt: 0.05, status: "Filled", time: "Jun 9" },
  { pair: "DOGE/USDC", side: "Sell", type: "Limit", price: 0.162, amt: 4200, status: "Cancelled", time: "Jun 8" },
];
const TRADE_HISTORY = [
  { pair: "SOL/USDC", side: "Buy", price: 146.20, amt: 12.5, fee: 1.83, time: "Today 10:24" },
  { pair: "ETH/USDC", side: "Sell", price: 3108.74, amt: 0.4, fee: 1.24, time: "Yesterday" },
  { pair: "BTC/USDC", side: "Buy", price: 61800, amt: 0.05, fee: 3.09, time: "Jun 9" },
];
function OrdersPanel() {
  const [tab, setTab] = useState("open");
  const tabs: [string, string][] = [["open", "Open Orders"], ["history", "Order History"], ["trades", "Trade History"]];
  const th: CSSProperties = { textAlign: "left", padding: "12px 20px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" };
  const td: CSSProperties = { padding: "13px 20px", font: "500 13px var(--font)", color: "var(--text-2)" };
  const tdM: CSSProperties = { ...td, fontFamily: "var(--mono)", fontVariantNumeric: "tabular-nums" };
  const SideTag = ({ s }: { s: string }) => <span style={{ font: "600 12.5px var(--font)", color: s === "Buy" ? "var(--up)" : "var(--down)" }}>{s}</span>;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", gap: 26, padding: "0 20px", borderBottom: "1px solid var(--border)" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "16px 0", font: `${tab === id ? 600 : 500} 13.5px var(--font)`,
            color: tab === id ? "var(--text-hi)" : "var(--text-3)", borderBottom: tab === id ? "2px solid var(--blue)" : "2px solid transparent", marginBottom: -1,
          }}>{label}{id === "open" ? ` (${OPEN_ORDERS.length})` : ""}</button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {tab === "open" && <>
          <thead><tr>{["Pair", "Side", "Type", "Price", "Amount", "Filled", "Time", ""].map((h, i) => <th key={i} style={{ ...th, textAlign: i > 2 && i < 7 ? "right" : "left" }}>{h}</th>)}</tr></thead>
          <tbody>{OPEN_ORDERS.map((o, i) => (
            <tr key={i} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
              <td style={{ ...td, color: "var(--text-hi)", fontWeight: 600 }}>{o.pair}</td><td style={td}><SideTag s={o.side} /></td><td style={td}>{o.type}</td>
              <td style={{ ...tdM, textAlign: "right" }}>{fNum(o.price, o.price < 10 ? 4 : 2)}</td><td style={{ ...tdM, textAlign: "right" }}>{o.amt}</td>
              <td style={{ ...tdM, textAlign: "right" }}>{o.filled}</td><td style={{ ...tdM, textAlign: "right", color: "var(--text-3)" }}>{o.time}</td>
              <td style={{ ...td, textAlign: "right" }}><button style={{ font: "600 12.5px var(--font)", color: "var(--down)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button></td>
            </tr>
          ))}</tbody>
        </>}
        {tab === "history" && <>
          <thead><tr>{["Pair", "Side", "Type", "Price", "Amount", "Status", "Time"].map((h, i) => <th key={i} style={{ ...th, textAlign: i > 2 && i < 6 ? "right" : "left" }}>{h}</th>)}</tr></thead>
          <tbody>{ORDER_HISTORY.map((o, i) => (
            <tr key={i} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
              <td style={{ ...td, color: "var(--text-hi)", fontWeight: 600 }}>{o.pair}</td><td style={td}><SideTag s={o.side} /></td><td style={td}>{o.type}</td>
              <td style={{ ...tdM, textAlign: "right" }}>{fNum(o.price, o.price < 10 ? 4 : 2)}</td><td style={{ ...tdM, textAlign: "right" }}>{o.amt}</td>
              <td style={{ ...td, textAlign: "right" }}><span style={{ font: "600 12px var(--font)", color: o.status === "Filled" ? "var(--up)" : "var(--text-3)" }}>{o.status}</span></td>
              <td style={{ ...tdM, textAlign: "right", color: "var(--text-3)" }}>{o.time}</td>
            </tr>
          ))}</tbody>
        </>}
        {tab === "trades" && <>
          <thead><tr>{["Pair", "Side", "Price", "Amount", "Fee", "Time"].map((h, i) => <th key={i} style={{ ...th, textAlign: i > 1 && i < 5 ? "right" : "left" }}>{h}</th>)}</tr></thead>
          <tbody>{TRADE_HISTORY.map((o, i) => (
            <tr key={i} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
              <td style={{ ...td, color: "var(--text-hi)", fontWeight: 600 }}>{o.pair}</td><td style={td}><SideTag s={o.side} /></td>
              <td style={{ ...tdM, textAlign: "right" }}>{fNum(o.price, o.price < 10 ? 4 : 2)}</td><td style={{ ...tdM, textAlign: "right" }}>{o.amt}</td>
              <td style={{ ...tdM, textAlign: "right" }}>{fUSD(o.fee)}</td><td style={{ ...tdM, textAlign: "right", color: "var(--text-3)" }}>{o.time}</td>
            </tr>
          ))}</tbody>
        </>}
      </table>
    </div>
  );
}

const TFS = ["15m", "1H", "4H", "1D", "1W"];
export function TradePage({ sym: symProp }: { sym?: string }) {
  const initial = symProp && COIN(symProp) ? symProp : "BTC";
  const [sym, setSym] = useState(initial);
  const [tf, setTf] = useState("1H");
  const [pairOpen, setPairOpen] = useState(false);
  const base = COIN(sym)!;

  // Live price/stats from the gateway market stream; fall back to seed data until first tick.
  const { tickers, isConnected } = useMarketStream();
  const t = tickers[sym];
  const coin: Coin = {
    ...base,
    price: t?.price ?? base.price,
    ch: t?.ch ?? base.ch,
    vol: t?.vol ?? base.vol,
  };

  // Realtime candlesticks straight from Binance (historical + live last candle).
  const { candles: data, loading: chartLoading } = useBinanceKlines(sym, tf, 120);

  const hi = t?.high ?? coin.price * 1.045;
  const lo = t?.low ?? coin.price * 0.962;
  const stats: [string, string][] = [["24h High", fNum(hi, coin.price < 10 ? 4 : 2)], ["24h Low", fNum(lo, coin.price < 10 ? 4 : 2)], ["24h Volume", fCompact(coin.vol)]];
  return (
    <AppShell>
      <Container max={1320} style={{ padding: "26px 32px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px 22px", marginBottom: 16, boxShadow: "var(--shadow-card)" }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setPairOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <CoinBadge sym={sym} size={40} />
              <span style={{ font: "700 20px var(--font)", color: "var(--text-hi)" }}>{sym}/USDC</span>
              <Icon name="chevDown" size={18} color="var(--text-3)" style={{ transform: pairOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {pairOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, width: 240, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", padding: 6, zIndex: 40, maxHeight: 360, overflowY: "auto" }}>
                {COINS.map(c => (
                  <button key={c.sym} onClick={() => { setSym(c.sym); setPairOpen(false); }} className="dd-item" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "9px 10px", borderRadius: "var(--r-sm)", border: "none", background: "none", cursor: "pointer" }}>
                    <CoinBadge sym={c.sym} size={28} />
                    <span style={{ flex: 1, textAlign: "left", font: "600 13.5px var(--font)", color: "var(--text-hi)" }}>{c.sym}/USDC</span>
                    <Delta v={c.ch} size={12} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ font: "700 24px var(--mono)", color: coin.ch >= 0 ? "var(--up)" : "var(--down)", fontVariantNumeric: "tabular-nums" }}>{fUSD(coin.price, coin.price < 10 ? 4 : 2)}</span>
              <span title={isConnected ? "Live" : "Connecting…"} style={{ width: 7, height: 7, borderRadius: "50%", background: isConnected ? "var(--up)" : "var(--text-4)", boxShadow: isConnected ? "0 0 0 3px var(--up-soft)" : "none" }} />
            </div>
            <div style={{ marginTop: 2 }}><Delta v={coin.ch} size={13} icon /></div>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {stats.map(([k, v]) => (
              <div key={k}><div style={{ font: "500 11.5px var(--font)", color: "var(--text-3)" }}>{k}</div><div style={{ font: "600 14px var(--mono)", color: "var(--text-2)", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{v}</div></div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 332px", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 18, boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {TFS.map(t => (
                  <button key={t} onClick={() => setTf(t)} style={{
                    padding: "6px 12px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
                    background: tf === t ? "var(--card-2)" : "transparent", color: tf === t ? "var(--text-hi)" : "var(--text-3)", font: "600 12.5px var(--mono)",
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ opacity: chartLoading ? 0.45 : 1, transition: "opacity .2s" }}>
                <CandleChart data={data} h={360} />
              </div>
            </div>
            <OrdersPanel />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <OrderTicket key={coin.sym} coin={coin} />
            <OrderBook price={coin.price} />
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
