"use client";

/* ── Drexa — Portfolio & Analytics ── */
import { CSSProperties, useState } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Container, CoinBadge, Delta, DeltaPill, Donut, AreaChart,
  COIN, fUSD, fNum, fCompact, rng,
} from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";

const PF_HOLD = [
  { sym: "BTC",  qty: 0.1312, avg: 52200 },
  { sym: "ETH",  qty: 1.84,   avg: 2620 },
  { sym: "SOL",  qty: 22.5,   avg: 96.4 },
  { sym: "LINK", qty: 140,    avg: 12.1 },
  { sym: "USDC", qty: 1240,   avg: 1 },
];
const PF_COLOR: Record<string, string> = { BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", LINK: "#2A5ADA", USDC: "#2775CA" };

interface PfRow { sym: string; qty: number; avg: number; price: number; ch: number; value: number; cost: number; pnl: number; pnlPct: number; name: string; }
function pfCompute() {
  const rows: PfRow[] = PF_HOLD.map(h => {
    const c = COIN(h.sym); const price = c ? c.price : 1; const ch = c ? c.ch : 0;
    const value = h.qty * price, cost = h.qty * h.avg, pnl = value - cost;
    return { ...h, price, ch, value, cost, pnl, pnlPct: cost ? (pnl / cost) * 100 : 0, name: c ? c.name : "USD Coin" };
  }).sort((a, b) => b.value - a.value);
  const value = rows.reduce((a, r) => a + r.value, 0);
  const cost = rows.reduce((a, r) => a + r.cost, 0);
  return { rows, value, cost, pnl: value - cost, pnlPct: cost ? ((value - cost) / cost) * 100 : 0 };
}
function pfCurve(seed: number, n: number, vol: number, end: number) {
  const r = rng(seed); const raw = [1];
  for (let i = 1; i < n; i++) raw.push(Math.max(0.2, raw[i - 1] * (1 + (r() - 0.45) * vol)));
  const f = end / raw[raw.length - 1]; return raw.map(v => v * f);
}

const PTF: [string, number, number][] = [["1W", 113, 0.05], ["1M", 131, 0.07], ["3M", 141, 0.09], ["1Y", 151, 0.12], ["All", 173, 0.16]];
const tdRm: CSSProperties = { textAlign: "right", padding: "14px 24px", font: "500 13.5px var(--mono)", color: "var(--text-2)", fontVariantNumeric: "tabular-nums" };

export function PortfolioPage() {
  useScrollReveal();
  const [tf, setTf] = useState("1M");
  const pf = pfCompute();
  const conf = PTF.find(t => t[0] === tf)!;
  const curve = pfCurve(conf[1], 60, conf[2], pf.value);
  const periodReturn = pf.value - curve[0];
  const periodPct = (periodReturn / curve[0]) * 100;
  const slices = pf.rows.map(r => ({ ...r, color: PF_COLOR[r.sym] || "#1E2B44", pct: (r.value / pf.value) * 100 }));
  const best = [...pf.rows].sort((a, b) => b.pnlPct - a.pnlPct)[0];

  const stats: { label: string; val: string; pct?: number; up?: boolean }[] = [
    { label: "Total invested", val: fUSD(pf.cost) },
    { label: "Current value", val: fUSD(pf.value) },
    { label: "Total return", val: (pf.pnl >= 0 ? "+" : "") + fUSD(pf.pnl), pct: pf.pnlPct, up: pf.pnl >= 0 },
    { label: "Best performer", val: best.sym, pct: best.pnlPct, up: best.pnlPct >= 0 },
  ];

  return (
    <AppShell>
      <Container max={1200} style={{ padding: "36px 32px 64px" }}>
        <h1 style={{ font: "700 32px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", marginBottom: 6 }}>Portfolio</h1>
        <p style={{ font: "500 15px var(--font)", color: "var(--text-3)", marginBottom: 28 }}>Track your performance, allocation, and profit & loss over time.</p>

        <div data-reveal="scale" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28, boxShadow: "var(--shadow-card)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ font: "500 13.5px var(--font)", color: "var(--text-3)" }}>Portfolio value</div>
              <div style={{ font: "600 42px var(--mono)", color: "var(--text-hi)", letterSpacing: "-.02em", margin: "6px 0 10px", fontVariantNumeric: "tabular-nums" }}>{fUSD(pf.value)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <DeltaPill v={periodPct} />
                <span style={{ font: "500 14px var(--mono)", color: periodReturn >= 0 ? "var(--up)" : "var(--down)" }}>{periodReturn >= 0 ? "+" : "−"}{fUSD(Math.abs(periodReturn))}</span>
                <span style={{ font: "500 13.5px var(--font)", color: "var(--text-3)" }}>past {tf === "All" ? "all time" : tf}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, background: "var(--inset)", padding: 4, borderRadius: "var(--r-pill)", border: "1px solid var(--border)" }}>
              {PTF.map(([id]) => (
                <button key={id} onClick={() => setTf(id)} style={{ padding: "7px 15px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer",
                  background: tf === id ? "var(--blue)" : "transparent", color: tf === id ? "#fff" : "var(--text-3)", font: "600 13px var(--font)" }}>{id}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}><AreaChart data={curve} h={220} showAxis /></div>
        </div>

        <div data-reveal="1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 20 }}>
              <div style={{ font: "500 13px var(--font)", color: "var(--text-3)" }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 8 }}>
                <span style={{ font: "600 22px var(--mono)", color: s.up === undefined ? "var(--text-hi)" : (s.up ? "var(--up)" : "var(--down)"), fontVariantNumeric: "tabular-nums" }}>{s.val}</span>
                {s.pct !== undefined && <Delta v={s.pct} size={12.5} />}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: 20, alignItems: "start" }}>
          <div data-reveal="slide-left" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, boxShadow: "var(--shadow-card)" }}>
            <div style={{ font: "700 16px var(--font)", color: "var(--text-hi)", marginBottom: 20 }}>Asset allocation</div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <Donut slices={slices} size={188} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ font: "500 11.5px var(--font)", color: "var(--text-3)" }}>Total</span>
                <span style={{ font: "600 19px var(--mono)", color: "var(--text-hi)" }}>{fCompact(pf.value)}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
              {slices.map(s => (
                <div key={s.sym} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flex: "none" }} />
                  <span style={{ font: "600 13.5px var(--font)", color: "var(--text-hi)", flex: 1 }}>{s.sym}</span>
                  <span style={{ font: "500 13px var(--mono)", color: "var(--text-2)" }}>{fUSD(s.value)}</span>
                  <span style={{ font: "500 13px var(--mono)", color: "var(--text-3)", width: 50, textAlign: "right" }}>{s.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal="slide-right" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ padding: "20px 24px", font: "700 16px var(--font)", color: "var(--text-hi)", borderBottom: "1px solid var(--border)" }}>Asset breakdown</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Asset", "Holdings", "Avg cost", "Price", "Value", "Profit / Loss"].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "13px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {pf.rows.map(r => (
                  <tr key={r.sym} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <CoinBadge sym={r.sym} size={36} />
                        <div><div style={{ font: "600 14px var(--font)", color: "var(--text-hi)" }}>{r.name}</div><div style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{r.sym}</div></div>
                      </div>
                    </td>
                    <td style={tdRm}>{fNum(r.qty, r.qty < 1 ? 4 : 2)}</td>
                    <td style={tdRm}>{fUSD(r.avg, r.avg < 10 ? 4 : 2)}</td>
                    <td style={tdRm}>{fUSD(r.price, r.price < 10 ? 4 : 2)}</td>
                    <td style={{ ...tdRm, color: "var(--text-hi)", fontWeight: 600 }}>{fUSD(r.value)}</td>
                    <td style={{ textAlign: "right", padding: "14px 24px" }}>
                      <div style={{ font: "600 13.5px var(--mono)", color: r.pnl >= 0 ? "var(--up)" : "var(--down)", fontVariantNumeric: "tabular-nums" }}>{r.pnl >= 0 ? "+" : "−"}{fUSD(Math.abs(r.pnl))}</div>
                      <div style={{ marginTop: 2 }}><Delta v={r.pnlPct} size={11.5} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
