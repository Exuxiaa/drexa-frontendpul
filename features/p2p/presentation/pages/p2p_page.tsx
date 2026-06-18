"use client";

/* ── Drexa — P2P Trading ── */
import { useMemo, useState } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Container, CoinBadge, COIN, fUSD, fNum, rng,
} from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";

const PAY_METHODS = ["Bank Transfer", "Wise", "Revolut", "PayPal", "SEPA", "Cash App", "Zelle"];
const MERCHANTS = [
  { name: "CryptoKing88", orders: 4821, rate: 99.2, rating: 4.9, online: true },
  { name: "SwiftTrader", orders: 2104, rate: 98.5, rating: 4.8, online: true },
  { name: "CoinMaster_ID", orders: 9320, rate: 99.8, rating: 5.0, online: true },
  { name: "LunaExchange", orders: 651, rate: 97.1, rating: 4.6, online: false },
  { name: "BlockDealer", orders: 3380, rate: 98.9, rating: 4.9, online: true },
  { name: "SatoshiPlug", orders: 1245, rate: 96.4, rating: 4.5, online: true },
  { name: "VertexP2P", orders: 7790, rate: 99.5, rating: 4.9, online: false },
];

interface Offer { name: string; orders: number; rate: number; rating: number; online: boolean; price: number; avail: number; minL: number; maxL: number; pays: string[]; }
function buildOffers(side: string, asset: string): Offer[] {
  const base = COIN(asset)?.price || 1;
  const r = rng(asset.charCodeAt(0) + (side === "buy" ? 1 : 2));
  return MERCHANTS.map((m) => {
    const premium = (side === "buy" ? 1 : -1) * (0.001 + r() * 0.012);
    const price = base * (1 + premium);
    const avail = +(r() * (asset === "BTC" ? 3 : asset === "ETH" ? 40 : 60000) + 5).toFixed(asset === "BTC" ? 4 : 2);
    const minL = Math.round(50 + r() * 200), maxL = Math.round(2000 + r() * 18000);
    const pays = [...PAY_METHODS].sort(() => r() - 0.5).slice(0, 2 + Math.floor(r() * 2));
    return { ...m, price, avail, minL, maxL, pays };
  });
}

export function P2PPage() {
  useScrollReveal();
  const [side, setSide] = useState("buy");
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [pay, setPay] = useState("All");
  const assets = ["USDT", "USDC", "BTC", "ETH"];
  const offers = useMemo(() => buildOffers(side, asset), [side, asset]);
  const filtered = offers.filter(o => pay === "All" || o.pays.includes(pay));

  const Stars = ({ v }: { v: number }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <Icon name="star" size={13} color="var(--warn)" style={{ fill: "var(--warn)" }} />
      <span style={{ font: "600 12.5px var(--mono)", color: "var(--text-2)" }}>{v.toFixed(1)}</span>
    </span>
  );

  return (
    <AppShell>
      <Container max={1200} style={{ padding: "36px 32px 64px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 26 }}>
          <div>
            <h1 style={{ font: "700 32px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", marginBottom: 6 }}>P2P Trading</h1>
            <p style={{ font: "500 15px var(--font)", color: "var(--text-3)" }}>Buy and sell crypto directly with verified merchants — your terms, zero trading fees.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", font: "600 14px var(--font)", cursor: "pointer" }}>
              <Icon name="myorders" size={16} color="var(--text-2)" /> My Orders
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", borderRadius: "var(--r-md)", border: "none", background: "var(--blue)", color: "#fff", font: "600 14px var(--font)", cursor: "pointer" }}>
              <Icon name="offer" size={16} color="#fff" stroke={2.3} /> Create Offer
            </button>
          </div>
        </div>

        <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 18, boxShadow: "var(--shadow-card)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--inset)", borderRadius: "var(--r-sm)", padding: 4 }}>
            {([["buy", "Buy"], ["sell", "Sell"]] as [string, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setSide(id)} style={{ width: 92, height: 38, borderRadius: "var(--r-xs)", border: "none", cursor: "pointer", font: "700 14px var(--font)",
                background: side === id ? (id === "buy" ? "var(--up)" : "var(--down)") : "transparent", color: side === id ? "#fff" : "var(--text-2)" }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {assets.map(a => (
              <button key={a} onClick={() => setAsset(a)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: "var(--r-pill)", cursor: "pointer", font: "600 13px var(--font)",
                border: "1px solid " + (asset === a ? "var(--blue)" : "var(--border)"), background: asset === a ? "var(--blue-soft)" : "transparent", color: asset === a ? "var(--blue-hover)" : "var(--text-2)" }}>
                <CoinBadge sym={a} size={20} />{a}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", width: 200 }}>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "500 13.5px var(--font)", width: "100%" }} />
            <span style={{ font: "600 12.5px var(--font)", color: "var(--text-3)" }}>USD</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 8px 0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
            <Icon name="bank" size={15} color="var(--text-3)" />
            <select value={pay} onChange={e => setPay(e.target.value)} style={{ background: "none", border: "none", outline: "none", color: "var(--text)", font: "500 13px var(--font)", cursor: "pointer", paddingRight: 6 }}>
              {["All", ...PAY_METHODS].map(p => <option key={p} value={p} style={{ background: "#0D1221" }}>{p === "All" ? "All payments" : p}</option>)}
            </select>
          </div>
        </div>

        <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Advertiser", "Price", "Available / Limits", "Payment", ""].map((h, i) => (
              <th key={i} style={{ textAlign: i === 4 ? "right" : "left", padding: "15px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={i} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue-grad)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 15px var(--font)", color: "#fff" }}>{o.name[0]}</span>
                        {o.online && <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "var(--up)", border: "2px solid var(--card)" }} />}
                      </span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ font: "600 14px var(--font)", color: "var(--text-hi)" }}>{o.name}</span>
                          <Icon name="verified" size={14} color="var(--blue-hover)" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                          <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{fNum(o.orders, 0)} orders</span>
                          <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{o.rate}%</span>
                          <Stars v={o.rating} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ font: "700 18px var(--mono)", color: "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{fNum(o.price, o.price < 10 ? 4 : 2)}</span>
                      <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>USD</span>
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ font: "500 13px var(--font)", color: "var(--text-2)" }}><span style={{ color: "var(--text-3)" }}>Available</span> {fNum(o.avail, asset === "BTC" ? 4 : 2)} {asset}</div>
                    <div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 3 }}>Limit {fUSD(o.minL, 0)} – {fUSD(o.maxL, 0)}</div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 220 }}>
                      {o.pays.map(p => (
                        <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: "var(--r-xs)", background: "var(--surface)", border: "1px solid var(--border)", font: "500 11.5px var(--font)", color: "var(--text-2)" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--blue-hover)" }} />{p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <button style={{ height: 40, padding: "0 24px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", font: "700 14px var(--font)", color: "#fff",
                      background: side === "buy" ? "var(--up)" : "var(--down)" }}>{side === "buy" ? "Buy" : "Sell"} {asset}</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", font: "500 14px var(--font)", color: "var(--text-3)" }}>No offers match this payment method.</td></tr>}
            </tbody>
          </table>
        </div>
        <p style={{ font: "500 12.5px var(--font)", color: "var(--text-4)", marginTop: 16, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="shield" size={14} color="var(--text-3)" /> All P2P trades are protected by escrow. Funds are released only after payment is confirmed.
        </p>
      </Container>
    </AppShell>
  );
}
