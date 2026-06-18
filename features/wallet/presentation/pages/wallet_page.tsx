"use client";

/* ── Drexa — Wallet (ported from the Claude Design handoff) ── */
import { CSSProperties, Dispatch, ReactNode, SetStateAction, useState } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Container, CoinBadge, Avatar, COIN, fUSD, fNum,
} from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";

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

const RECENT_ADDRS = [
  { name: "John W.", addr: "0x4F2a…B3e9c3B", sym: "ETH" },
  { name: "Alice M.", addr: "bc1q8kx3…m2xpf7", sym: "BTC" },
  { name: "Self — Cold", addr: "0x7A3f9Dce…c9F2", sym: "ETH" },
];

const TXNS = [
  { type: "Deposit", sym: "USDC", amt: 1000, status: "Completed", net: "Ethereum", time: "Jun 10, 10:24", hash: "0x8f…2c1a" },
  { type: "Withdraw", sym: "ETH", amt: 0.5, status: "Completed", net: "Ethereum", time: "Jun 9, 16:02", hash: "0x3a…9f7b" },
  { type: "Deposit", sym: "BTC", amt: 0.05, status: "Completed", net: "Bitcoin", time: "Jun 8, 09:41", hash: "bc1…4e2d" },
  { type: "Transfer", sym: "SOL", amt: 10, status: "Completed", net: "Internal", time: "Jun 7, 13:20", hash: "int…0091" },
  { type: "Withdraw", sym: "USDT", amt: 300, status: "Pending", net: "Tron", time: "Jun 7, 11:08", hash: "TRX…7a3c" },
];

interface WalRow { sym: string; qty: number; price: number; value: number; inOrders: number; available: number; name: string; }
function walCompute(): WalRow[] {
  return WAL_HOLD.map(h => {
    const c = COIN(h.sym); const price = c ? c.price : 1;
    const value = h.qty * price; const inOrders = h.sym === "USDC" ? value * 0.12 : 0;
    return { ...h, price, value, inOrders, available: value - inOrders, name: c ? c.name : (h.sym === "USDT" ? "Tether" : h.sym) };
  }).sort((a, b) => b.value - a.value);
}

/* ---- Stripe card form ------------------------------------------- */
function StripeCardForm({ label = "Pay" }: { label?: string }) {
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [focus, setFocus] = useState<string | null>(null);
  const fmt4 = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; };
  const cardType = cardNum.startsWith("4") ? "visa" : (cardNum.startsWith("5") || cardNum.startsWith("2")) ? "mc" : cardNum.startsWith("3") ? "amex" : null;
  const ready = cardNum.replace(/\s/g, "").length >= 15 && expiry.length === 5 && cvc.length >= 3 && name.length > 1;
  const inp = (f: string): CSSProperties => ({ width: "100%", height: 46, padding: "0 13px", borderRadius: "var(--r-sm)", border: "1px solid " + (focus === f ? "var(--blue)" : "var(--border)"), background: "var(--surface)", color: "var(--text-hi)", font: "500 14px var(--mono)", outline: "none", boxSizing: "border-box", transition: "border-color .15s" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ font: "500 12px var(--font)", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="lock" size={13} color="var(--text-4)" />Secured by <b style={{ color: "var(--text-2)" }}>Stripe</b>
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
      <div>
        <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Card number</span>
          <span style={{ display: "flex", gap: 5 }}>
            {([["visa", "#1A1F71", "VISA"], ["mc", "#EB001B", "MC"], ["amex", "#007BC1", "AMEX"]] as [string, string, string][]).map(([t, c, l]) => (
              <span key={t} style={{ padding: "2px 7px", borderRadius: 3, background: cardType === t ? c : "var(--card-2)", color: cardType === t ? "#fff" : "var(--text-4)", font: "700 9px var(--font)", opacity: cardType && cardType !== t ? 0.3 : 1, transition: "all .15s" }}>{l}</span>
            ))}
          </span>
        </div>
        <input value={cardNum} onChange={e => setCardNum(fmt4(e.target.value))} onFocus={() => setFocus("card")} onBlur={() => setFocus(null)} placeholder="1234 5678 9012 3456" style={inp("card")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 6 }}>Expiry</div>
          <input value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} onFocus={() => setFocus("exp")} onBlur={() => setFocus(null)} placeholder="MM/YY" style={inp("exp")} />
        </div>
        <div>
          <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 6 }}>CVC</div>
          <input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} onFocus={() => setFocus("cvc")} onBlur={() => setFocus(null)} placeholder="•••" style={inp("cvc")} />
        </div>
      </div>
      <div>
        <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 6 }}>Cardholder name</div>
        <input value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocus("name")} onBlur={() => setFocus(null)} placeholder="Name on card" style={inp("name")} />
      </div>
      <button style={{ height: 48, borderRadius: "var(--r-md)", border: "none", cursor: ready ? "pointer" : "default", background: ready ? "var(--blue)" : "var(--card-2)", color: ready ? "#fff" : "var(--text-3)", font: "700 14.5px var(--font)", transition: "background .15s, color .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="lock" size={15} color={ready ? "#fff" : "var(--text-4)"} />{label}
      </button>
    </div>
  );
}

/* ---- Modal shell ------------------------------------------------- */
function Modal({ title, icon, onClose, children }: { title: string; icon?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 28, width: 480, maxWidth: "calc(100vw - 32px)", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-pop)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          {icon && <span style={{ width: 38, height: 38, borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--blue-soft)", flex: "none" }}><Icon name={icon} size={19} color="var(--blue-hover)" /></span>}
          <div style={{ font: "700 18px var(--font)", color: "var(--text-hi)", flex: 1 }}>{title}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "var(--card-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", font: "500 20px var(--font)", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", font: "500 13px var(--font)" }}>
      <span style={{ color: "var(--text-3)" }}>{k}</span>
      <span style={{ color: "var(--text-2)", fontFamily: "var(--mono)" }}>{v}</span>
    </div>
  );
}

function AssetSelect({ rows, asset, coinRow, open, setOpen, setAsset, setNet }: {
  rows: WalRow[]; asset: string; coinRow: WalRow; open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>; setAsset: Dispatch<SetStateAction<string>>; setNet: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Asset</div>
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer" }}>
          <CoinBadge sym={asset} size={28} />
          <span style={{ flex: 1, textAlign: "left", font: "600 14px var(--font)", color: "var(--text-hi)" }}>{coinRow.name} <span style={{ color: "var(--text-3)", fontWeight: 500 }}>{asset}</span></span>
          <Icon name="chevDown" size={16} color="var(--text-3)" style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", padding: 6, zIndex: 30, maxHeight: 240, overflowY: "auto" }}>
            {rows.map(r => (
              <button key={r.sym} onClick={() => { setAsset(r.sym); setNet(0); setOpen(false); }} className="dd-item" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: "var(--r-sm)", border: "none", background: "none", cursor: "pointer" }}>
                <CoinBadge sym={r.sym} size={26} />
                <span style={{ flex: 1, textAlign: "left", font: "600 13.5px var(--font)", color: "var(--text-hi)" }}>{r.sym}</span>
                <span style={{ font: "500 12.5px var(--mono)", color: "var(--text-3)" }}>{fNum(r.qty, r.qty < 1 ? 4 : 2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const tdWm: CSSProperties = { textAlign: "right", padding: "16px 24px", font: "500 13.5px var(--mono)", color: "var(--text-2)", fontVariantNumeric: "tabular-nums" };

export function WalletPage() {
  useScrollReveal();
  const rows = walCompute();
  const total = rows.reduce((a, r) => a + r.value, 0);
  const available = rows.reduce((a, r) => a + r.available, 0);
  const inOrders = rows.reduce((a, r) => a + r.inOrders, 0);

  const [modal, setModal] = useState<string | null>(null);
  const [asset, setAsset] = useState("USDC");
  const [net, setNet] = useState(0);
  const [assetOpen, setAssetOpen] = useState(false);
  const [toAddr, setToAddr] = useState("");
  const [txAmt, setTxAmt] = useState("");
  const [txNote, setTxNote] = useState("");
  const [buyAmt, setBuyAmt] = useState("");
  const [payoutAmt, setPayoutAmt] = useState("");

  const coinRow = rows.find(r => r.sym === asset) || rows[0];
  const openModal = (type: string, sym?: string) => { setModal(type); if (sym) { setAsset(sym); setNet(0); } };
  const closeModal = () => setModal(null);
  const assetSelectProps = { rows, asset, coinRow, open: assetOpen, setOpen: setAssetOpen, setAsset, setNet };

  return (
    <AppShell>
      <Container max={1200} style={{ padding: "36px 32px 64px" }}>
        <h1 style={{ font: "700 32px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", marginBottom: 6 }}>Wallet</h1>
        <p style={{ font: "500 15px var(--font)", color: "var(--text-3)", marginBottom: 28 }}>Manage your balances, deposits, withdrawals, and transfers.</p>

        {/* balance hero */}
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
              <button key={id} onClick={() => openModal(id)} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: "var(--r-md)", cursor: "pointer", font: "600 14px var(--font)", border: id === "deposit" ? "none" : "1px solid var(--border)", background: id === "deposit" ? "var(--blue)" : "var(--surface)", color: id === "deposit" ? "#fff" : "var(--text)" }}>
                <Icon name={ic} size={17} color={id === "deposit" ? "#fff" : "var(--text-2)"} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* balances — full width */}
        <div data-reveal="scale" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)", marginBottom: 20 }}>
          <div style={{ padding: "20px 24px", font: "700 16px var(--font)", color: "var(--text-hi)", borderBottom: "1px solid var(--border)" }}>Your balances</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Asset", "Total", "Available", "Value", ""].map((h, i) => (
              <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "12px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.sym} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <CoinBadge sym={r.sym} size={42} />
                      <div>
                        <div style={{ font: "600 15px var(--font)", color: "var(--text-hi)" }}>{r.name}</div>
                        <div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>{r.sym}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdWm}>{fNum(r.qty, r.qty < 1 ? 5 : 2)}</td>
                  <td style={tdWm}>{fNum(r.available / r.price, r.qty < 1 ? 5 : 2)}</td>
                  <td style={{ ...tdWm, color: "var(--text-hi)", fontWeight: 600 }}>{fUSD(r.value)}</td>
                  <td style={{ textAlign: "right", padding: "16px 24px" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button onClick={() => openModal("deposit", r.sym)} className="wal-act">Deposit</button>
                      <button onClick={() => openModal("withdraw", r.sym)} className="wal-act">Withdraw</button>
                      <button onClick={() => openModal("transfer", r.sym)} className="wal-act">Transfer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* transaction history */}
        <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
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
                    <td style={{ padding: "14px 24px", font: "500 13px var(--mono)", color: "var(--text-3)" }}>{t.hash}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>

      {/* ── DEPOSIT MODAL ─────────────────────────────────────────── */}
      {modal === "deposit" && (
        <Modal title="Deposit crypto" icon="deposit" onClose={closeModal}>
          <AssetSelect {...assetSelectProps} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Amount to spend (USD)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <span style={{ font: "600 15px var(--mono)", color: "var(--text-3)" }}>$</span>
              <input value={buyAmt} onChange={e => setBuyAmt(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="100.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
            </div>
            {buyAmt && <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginTop: 5 }}>≈ {fNum((parseFloat(buyAmt) || 0) * 0.985 / coinRow.price, coinRow.qty < 1 ? 6 : 4)} {asset} after fees</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", marginBottom: 16, borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
            <SummaryRow k="Rate" v={fUSD(coinRow.price, coinRow.price < 1 ? 4 : 2) + " / " + asset} />
            <SummaryRow k="Processing fee" v="1.5%" />
            <SummaryRow k="You receive" v={buyAmt ? "≈ " + fNum((parseFloat(buyAmt) || 0) * 0.985 / coinRow.price, coinRow.qty < 1 ? 6 : 4) + " " + asset : "—"} />
          </div>
          <StripeCardForm label={`Buy ${asset}${buyAmt ? " — $" + buyAmt : ""}`} />
        </Modal>
      )}

      {/* ── WITHDRAW MODAL ────────────────────────────────────────── */}
      {modal === "withdraw" && (
        <Modal title="Withdraw to card" icon="withdraw" onClose={closeModal}>
          <AssetSelect {...assetSelectProps} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
              <span>Amount ({asset})</span>
              <span style={{ color: "var(--text-4)" }}>Balance: {fNum(coinRow.qty, coinRow.qty < 1 ? 4 : 2)} {asset}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <input value={payoutAmt} onChange={e => setPayoutAmt(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
              <button onClick={() => setPayoutAmt(fNum(coinRow.qty, coinRow.qty < 1 ? 6 : 4))} style={{ font: "600 12px var(--font)", color: "var(--blue-hover)", background: "none", border: "none", cursor: "pointer" }}>MAX</button>
              <span style={{ font: "600 13px var(--font)", color: "var(--text-3)" }}>{asset}</span>
            </div>
            {payoutAmt && <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginTop: 5 }}>≈ {fUSD((parseFloat(payoutAmt) || 0) * coinRow.price * 0.99)} USD after fees</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", marginBottom: 16, borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
            <SummaryRow k="Rate" v={fUSD(coinRow.price, coinRow.price < 1 ? 4 : 2) + " / " + asset} />
            <SummaryRow k="Processing fee" v="1.0%" />
            <SummaryRow k="You receive" v={payoutAmt ? "≈ " + fUSD((parseFloat(payoutAmt) || 0) * coinRow.price * 0.99) : "—"} />
          </div>
          <StripeCardForm label={`Withdraw ${payoutAmt ? payoutAmt + " " + asset : ""} to Card`} />
        </Modal>
      )}

      {/* ── TRANSFER MODAL ────────────────────────────────────────── */}
      {modal === "transfer" && (
        <Modal title="Transfer" icon="transfer" onClose={closeModal}>
          <AssetSelect {...assetSelectProps} />
          <div style={{ marginBottom: 16 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Network</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {NETWORKS[asset].map((n, i) => (
                <button key={n} onClick={() => setNet(i)} style={{ padding: "8px 13px", borderRadius: "var(--r-sm)", cursor: "pointer", font: "600 12.5px var(--font)", border: "1px solid " + (net === i ? "var(--blue)" : "var(--border)"), background: net === i ? "var(--blue-soft)" : "transparent", color: net === i ? "var(--blue-hover)" : "var(--text-2)" }}>{n}</button>
              ))}
            </div>
          </div>
          {/* from */}
          <div style={{ marginBottom: 2 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>From</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--inset)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)" }}>
              <Avatar size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 13px var(--font)", color: "var(--text-hi)" }}>My Drexa Wallet</div>
                <div style={{ font: "500 11px var(--mono)", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ADDR[asset]}</div>
              </div>
              <span style={{ font: "600 12px var(--mono)", color: "var(--up)", flex: "none" }}>{fNum(coinRow.qty, coinRow.qty < 1 ? 4 : 2)} {asset}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--card-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrowDown" size={14} color="var(--text-3)" />
            </span>
          </div>
          {/* to */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>To address</span>
              <button onClick={() => navigator.clipboard?.readText().then(t => setToAddr(t)).catch(() => {})} style={{ font: "600 11.5px var(--font)", color: "var(--blue-hover)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Paste</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid " + (toAddr.length > 10 ? "var(--blue)" : "var(--border)"), borderRadius: "var(--r-sm)", transition: "border-color .15s" }}>
              <input value={toAddr} onChange={e => setToAddr(e.target.value)} placeholder={`Enter ${asset} address`} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "500 12.5px var(--mono)" }} />
              {toAddr.length > 0 && <button onClick={() => setToAddr("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", font: "600 18px var(--font)", lineHeight: 1 }}>×</button>}
            </div>
          </div>
          {/* recent recipients */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "600 11px var(--font)", color: "var(--text-4)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 7 }}>Recent recipients</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {RECENT_ADDRS.map(r => (
                <button key={r.addr} onClick={() => setToAddr(r.addr)} className="dd-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r-sm)", border: "none", background: "none", cursor: "pointer", width: "100%" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--blue-grad)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px var(--font)", color: "#fff", flex: "none" }}>{r.name[0]}</span>
                  <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <span style={{ display: "block", font: "600 13px var(--font)", color: "var(--text-hi)" }}>{r.name}</span>
                    <span style={{ display: "block", font: "500 11px var(--mono)", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.addr}</span>
                  </span>
                  <CoinBadge sym={r.sym} size={20} />
                </button>
              ))}
            </div>
          </div>
          {/* amount */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Amount</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <input value={txAmt} onChange={e => setTxAmt(e.target.value)} placeholder="0.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
              <button onClick={() => setTxAmt(fNum(coinRow.qty, coinRow.qty < 1 ? 6 : 4))} style={{ font: "600 12px var(--font)", color: "var(--blue-hover)", background: "none", border: "none", cursor: "pointer" }}>MAX</button>
              <span style={{ font: "600 13px var(--font)", color: "var(--text-3)" }}>{asset}</span>
            </div>
          </div>
          {/* note */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Note <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(optional)</span></div>
            <input value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="Add a memo…" style={{ width: "100%", height: 42, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", outline: "none", color: "var(--text-hi)", font: "500 13px var(--font)", boxSizing: "border-box" }} />
          </div>
          {/* summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", borderTop: "1px solid var(--border-soft)", marginBottom: 16 }}>
            <SummaryRow k="Network" v={NETWORKS[asset][net]} />
            <SummaryRow k="Fee" v={NET_FEE[asset] + " " + asset + " ≈ " + fUSD(NET_FEE[asset] * coinRow.price)} />
            <SummaryRow k="You send" v={txAmt ? txAmt + " " + asset : "—"} />
          </div>
          <button style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none", cursor: toAddr && txAmt ? "pointer" : "default", background: toAddr && txAmt ? "var(--blue)" : "var(--card-2)", color: toAddr && txAmt ? "#fff" : "var(--text-3)", font: "700 14.5px var(--font)", transition: "background .15s, color .15s" }}>Confirm Transfer</button>
        </Modal>
      )}
    </AppShell>
  );
}
