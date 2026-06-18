"use client";

/* ── Drexa — Wallet ── */
import React, { CSSProperties, useState } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Container, CoinBadge, COIN, fUSD, fNum, rng,
} from "@/features/core/presentation/components/drexa_kit";
import { useCryptoAddress, isCryptoSupported } from "@/features/wallet/presentation/hooks/useCryptoWallet";

const WAL_HOLD = [
  { sym: "BTC",  qty: 0.1312 },
  { sym: "ETH",  qty: 1.84 },
  { sym: "SOL",  qty: 22.5 },
  { sym: "LINK", qty: 140 },
  { sym: "USDC", qty: 1240 },
  { sym: "USDT", qty: 860 },
];
const NETWORKS: Record<string, string[]> = { BTC: ["Bitcoin"], ETH: ["Ethereum (ERC-20)", "Arbitrum"], SOL: ["Solana"], LINK: ["Ethereum (ERC-20)"], USDC: ["Ethereum (ERC-20)", "Solana", "Base"], USDT: ["Ethereum (ERC-20)", "Tron (TRC-20)"] };
const NET_FEE: Record<string, number> = { BTC: 0.00012, ETH: 0.0008, SOL: 0.00001, LINK: 0.12, USDC: 1.2, USDT: 1.0 };
const ADDR: Record<string, string> = { BTC: "bc1q9x4drexah8s2k7m3qz5vptl0n6yfae2cwr8u3d", ETH: "0x7A3f9Dce21B4f0cE5aD9b6E2c1F8a4D0e3B7c9F2", SOL: "8kQz4DrexaP3nVjT7mWqLf2sYbR9cH6uXa1eK5dN0gM", LINK: "0x7A3f9Dce21B4f0cE5aD9b6E2c1F8a4D0e3B7c9F2", USDC: "0x7A3f9Dce21B4f0cE5aD9b6E2c1F8a4D0e3B7c9F2", USDT: "0x7A3f9Dce21B4f0cE5aD9b6E2c1F8a4D0e3B7c9F2" };

interface WalRow { sym: string; qty: number; price: number; value: number; inOrders: number; available: number; name: string; }
function walCompute(): WalRow[] {
  return WAL_HOLD.map(h => {
    const c = COIN(h.sym); const price = c ? c.price : 1;
    const value = h.qty * price; const inOrders = h.sym === "USDC" ? value * 0.12 : 0;
    return { ...h, price, value, inOrders, available: value - inOrders, name: c ? c.name : (h.sym === "USDT" ? "Tether" : h.sym) };
  }).sort((a, b) => b.value - a.value);
}

const TXNS = [
  { type: "Deposit", sym: "USDC", amt: 1000, status: "Completed", net: "Ethereum", time: "Jun 10, 10:24", hash: "0x8f…2c1a" },
  { type: "Withdraw", sym: "ETH", amt: 0.5, status: "Completed", net: "Ethereum", time: "Jun 9, 16:02", hash: "0x3a…9f7b" },
  { type: "Deposit", sym: "BTC", amt: 0.05, status: "Completed", net: "Bitcoin", time: "Jun 8, 09:41", hash: "bc1…4e2d" },
  { type: "Transfer", sym: "SOL", amt: 10, status: "Completed", net: "Internal", time: "Jun 7, 13:20", hash: "int…0091" },
  { type: "Withdraw", sym: "USDT", amt: 300, status: "Pending", net: "Tron", time: "Jun 7, 11:08", hash: "TRX…7a3c" },
];

function QR({ seed, size = 132 }: { seed: number; size?: number }) {
  const r = rng(seed); const n = 21; const cell = size / n;
  const blocks: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    if (finder) continue;
    if (r() > 0.55) blocks.push(<rect key={x + "-" + y} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0A0F1C" />);
  }
  const renderFinder = (fx: number, fy: number) => (
    <g key={`finder-${fx}-${fy}`}>
      <rect x={fx * cell} y={fy * cell} width={cell * 7} height={cell * 7} fill="#0A0F1C" />
      <rect x={(fx + 1) * cell} y={(fy + 1) * cell} width={cell * 5} height={cell * 5} fill="#fff" />
      <rect x={(fx + 2) * cell} y={(fy + 2) * cell} width={cell * 3} height={cell * 3} fill="#0A0F1C" />
    </g>
  );
  return (
    <div style={{ background: "#fff", borderRadius: "var(--r-md)", padding: 10 }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        {blocks}{renderFinder(0, 0)}{renderFinder(n - 7, 0)}{renderFinder(0, n - 7)}
      </svg>
    </div>
  );
}

const tdWm: CSSProperties = { textAlign: "right", padding: "14px 24px", font: "500 13.5px var(--mono)", color: "var(--text-2)", fontVariantNumeric: "tabular-nums" };

export function WalletPage() {
  const rows = walCompute();
  const total = rows.reduce((a, r) => a + r.value, 0);
  const available = rows.reduce((a, r) => a + r.available, 0);
  const inOrders = rows.reduce((a, r) => a + r.inOrders, 0);
  const [tab, setTab] = useState("deposit");
  const [asset, setAsset] = useState("USDC");
  const [net, setNet] = useState(0);
  const [copied, setCopied] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const coinRow = rows.find(r => r.sym === asset) || rows[0];

  // Real on-chain deposit address + live balance from the Tatum-backed gateway
  // (BTC/ETH testnet). Unsupported assets fall back to the static placeholder.
  const { data: cryptoAddr, loading: addrLoading } = useCryptoAddress(asset);
  const depositAddress = cryptoAddr?.address ?? ADDR[asset];
  const qrSeed = depositAddress.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  const doCopy = () => { navigator.clipboard?.writeText(depositAddress); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  return (
    <AppShell>
      <Container max={1200} style={{ padding: "36px 32px 64px" }}>
        <h1 style={{ font: "700 32px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", marginBottom: 6 }}>Wallet</h1>
        <p style={{ font: "500 15px var(--font)", color: "var(--text-3)", marginBottom: 28 }}>Manage your balances, deposits, withdrawals, and transfers.</p>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28, boxShadow: "var(--shadow-card)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ font: "500 13.5px var(--font)", color: "var(--text-3)" }}>Estimated balance</div>
              <div style={{ font: "600 38px var(--mono)", color: "var(--text-hi)", letterSpacing: "-.02em", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{fUSD(total)}</div>
            </div>
            <div style={{ display: "flex", gap: 40, alignItems: "flex-end", paddingBottom: 6 }}>
              <div><div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>Available</div><div style={{ font: "600 17px var(--mono)", color: "var(--text-2)", marginTop: 4 }}>{fUSD(available)}</div></div>
              <div><div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>In orders</div><div style={{ font: "600 17px var(--mono)", color: "var(--text-2)", marginTop: 4 }}>{fUSD(inOrders)}</div></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {([["deposit", "Deposit", "deposit"], ["withdraw", "Withdraw", "withdraw"], ["transfer", "Transfer", "transfer"]] as [string, string, string][]).map(([id, label, ic]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: "var(--r-md)", cursor: "pointer", font: "600 14px var(--font)",
                border: id === "deposit" ? "none" : "1px solid var(--border)", background: id === "deposit" ? "var(--blue)" : "var(--surface)", color: id === "deposit" ? "#fff" : "var(--text)",
              }}>
                <Icon name={ic} size={17} color={id === "deposit" ? "#fff" : "var(--text-2)"} />{label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 392px", gap: 20, alignItems: "start" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ padding: "20px 24px", font: "700 16px var(--font)", color: "var(--text-hi)", borderBottom: "1px solid var(--border)" }}>Your balances</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Asset", "Total", "Available", "Value", ""].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "12px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.sym} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <CoinBadge sym={r.sym} size={36} />
                        <div><div style={{ font: "600 14px var(--font)", color: "var(--text-hi)" }}>{r.name}</div><div style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{r.sym}</div></div>
                      </div>
                    </td>
                    <td style={tdWm}>{fNum(r.qty, r.qty < 1 ? 5 : 2)}</td>
                    <td style={tdWm}>{fNum(r.available / r.price, r.qty < 1 ? 5 : 2)}</td>
                    <td style={{ ...tdWm, color: "var(--text-hi)", fontWeight: 600 }}>{fUSD(r.value)}</td>
                    <td style={{ textAlign: "right", padding: "14px 24px" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button onClick={() => { setTab("deposit"); setAsset(r.sym); setNet(0); }} className="wal-act">Deposit</button>
                        <button onClick={() => { setTab("withdraw"); setAsset(r.sym); setNet(0); }} className="wal-act">Withdraw</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 22, boxShadow: "var(--shadow-card)" }}>
            <div style={{ display: "flex", gap: 0, background: "var(--inset)", borderRadius: "var(--r-sm)", padding: 4, marginBottom: 20 }}>
              {([["deposit", "Deposit"], ["withdraw", "Withdraw"]] as [string, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ flex: 1, height: 38, borderRadius: "var(--r-xs)", border: "none", cursor: "pointer", font: "600 13.5px var(--font)",
                  background: tab === id || (tab === "transfer" && id === "deposit") ? "var(--card-2)" : "transparent", color: tab === id ? "var(--text-hi)" : "var(--text-3)" }}>{label}</button>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Select asset</div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setAssetOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer" }}>
                  <CoinBadge sym={asset} size={28} />
                  <span style={{ flex: 1, textAlign: "left", font: "600 14px var(--font)", color: "var(--text-hi)" }}>{coinRow.name} <span style={{ color: "var(--text-3)", fontWeight: 500 }}>{asset}</span></span>
                  <Icon name="chevDown" size={16} color="var(--text-3)" style={{ transform: assetOpen ? "rotate(180deg)" : "none" }} />
                </button>
                {assetOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", padding: 6, zIndex: 30, maxHeight: 240, overflowY: "auto" }}>
                    {rows.map(r => (
                      <button key={r.sym} onClick={() => { setAsset(r.sym); setNet(0); setAssetOpen(false); }} className="dd-item" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: "var(--r-sm)", border: "none", background: "none", cursor: "pointer" }}>
                        <CoinBadge sym={r.sym} size={26} /><span style={{ flex: 1, textAlign: "left", font: "600 13.5px var(--font)", color: "var(--text-hi)" }}>{r.sym}</span>
                        <span style={{ font: "500 12.5px var(--mono)", color: "var(--text-3)" }}>{fNum(r.qty, r.qty < 1 ? 4 : 2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Network</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {NETWORKS[asset].map((n, i) => (
                  <button key={n} onClick={() => setNet(i)} style={{ padding: "8px 13px", borderRadius: "var(--r-sm)", cursor: "pointer", font: "600 12.5px var(--font)",
                    border: "1px solid " + (net === i ? "var(--blue)" : "var(--border)"), background: net === i ? "var(--blue-soft)" : "transparent", color: net === i ? "var(--blue-hover)" : "var(--text-2)" }}>{n}</button>
                ))}
              </div>
            </div>

            {tab === "withdraw" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Recipient address</div>
                  <div style={{ display: "flex", alignItems: "center", height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                    <input placeholder={`Enter ${asset} address`} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "500 13.5px var(--mono)" }} />
                  </div>
                </div>
                <div>
                  <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Amount</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                    <input placeholder="0.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
                    <button style={{ font: "600 12px var(--font)", color: "var(--blue-hover)", background: "none", border: "none", cursor: "pointer" }}>MAX</button>
                    <span style={{ font: "600 13px var(--font)", color: "var(--text-3)" }}>{asset}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
                  {([["Available", `${fNum(coinRow.qty, coinRow.qty < 1 ? 5 : 2)} ${asset}`], ["Network fee", `${NET_FEE[asset]} ${asset} ≈ ${fUSD(NET_FEE[asset] * coinRow.price)}`], ["Min. withdrawal", `${(NET_FEE[asset] * 2).toFixed(asset === "USDC" || asset === "USDT" ? 2 : 5)} ${asset}`]] as [string, string][]).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", font: "500 13px var(--font)" }}><span style={{ color: "var(--text-3)" }}>{k}</span><span style={{ color: "var(--text-2)", fontFamily: "var(--mono)" }}>{v}</span></div>
                  ))}
                </div>
                <button style={{ height: 48, borderRadius: "var(--r-md)", border: "none", cursor: "pointer", background: "var(--blue)", color: "#fff", font: "700 14.5px var(--font)" }}>Withdraw {asset}</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <QR seed={qrSeed} />
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>Your {asset} deposit address</span>
                    {isCryptoSupported(asset) && (
                      <span style={{ font: "600 10.5px var(--font)", color: "var(--up)", background: "var(--up-soft)", padding: "2px 7px", borderRadius: "var(--r-pill)" }}>● Live · Testnet</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                    <span style={{ flex: 1, font: "500 12.5px var(--mono)", color: "var(--text-hi)", wordBreak: "break-all", lineHeight: 1.4 }}>{addrLoading ? "Generating address…" : depositAddress}</span>
                    <button onClick={doCopy} disabled={addrLoading} style={{ flex: "none", width: 36, height: 36, borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--card)", cursor: addrLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={copied ? "check" : "copy"} size={16} color={copied ? "var(--up)" : "var(--text-2)"} />
                    </button>
                  </div>
                </div>
                {isCryptoSupported(asset) && cryptoAddr && (
                  <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                    <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>On-chain balance</span>
                    <span style={{ font: "600 13px var(--mono)", color: "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{cryptoAddr.balance} {asset}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, width: "100%", padding: "11px 13px", borderRadius: "var(--r-sm)", background: "var(--warn-soft)", border: "1px solid rgba(217,119,6,0.25)" }}>
                  <Icon name="shield" size={16} color="var(--warn)" style={{ flex: "none", marginTop: 1 }} />
                  <span style={{ font: "500 12px var(--font)", color: "var(--text-2)", lineHeight: 1.5 }}>Send only <b style={{ color: "var(--text-hi)" }}>{asset}</b> over <b style={{ color: "var(--text-hi)" }}>{cryptoAddr?.network ?? NETWORKS[asset][net]}</b>. Sending other assets may result in permanent loss.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)", marginTop: 20 }}>
          <div style={{ padding: "20px 24px", font: "700 16px var(--font)", color: "var(--text-hi)", borderBottom: "1px solid var(--border)" }}>Transaction history</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Type", "Asset", "Amount", "Network", "Status", "Time", "Tx"].map((h, i) => (
              <th key={i} style={{ textAlign: i === 2 ? "right" : "left", padding: "12px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {TXNS.map((t, i) => {
                const isDep = t.type === "Deposit", isWd = t.type === "Withdraw";
                const col = isDep ? "var(--up)" : isWd ? "var(--down)" : "var(--blue-hover)";
                return (
                  <tr key={i} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDep ? "var(--up-soft)" : isWd ? "var(--down-soft)" : "var(--blue-soft)" }}>
                          <Icon name={isDep ? "deposit" : isWd ? "withdraw" : "transfer"} size={15} color={col} />
                        </span>
                        <span style={{ font: "600 13.5px var(--font)", color: "var(--text-hi)" }}>{t.type}</span>
                      </span>
                    </td>
                    <td style={{ padding: "14px 24px", font: "600 13.5px var(--font)", color: "var(--text-2)" }}>{t.sym}</td>
                    <td style={{ textAlign: "right", padding: "14px 24px", font: "600 13.5px var(--mono)", color: isDep ? "var(--up)" : "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{isDep ? "+" : isWd ? "−" : ""}{fNum(t.amt, t.amt < 1 ? 5 : 2)}</td>
                    <td style={{ padding: "14px 24px", font: "500 13px var(--font)", color: "var(--text-3)" }}>{t.net}</td>
                    <td style={{ padding: "14px 24px" }}><span style={{ font: "600 12px var(--font)", color: t.status === "Completed" ? "var(--up)" : "var(--warn)" }}>{t.status}</span></td>
                    <td style={{ padding: "14px 24px", font: "500 13px var(--mono)", color: "var(--text-3)" }}>{t.time}</td>
                    <td style={{ padding: "14px 24px", font: "500 13px var(--mono)", color: "var(--text-3)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{t.hash}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </AppShell>
  );
}
