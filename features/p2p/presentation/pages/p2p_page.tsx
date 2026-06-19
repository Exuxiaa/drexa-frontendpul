"use client";

/* ── Drexa — P2P Trading ── */
import { useMemo, useState, FormEvent } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Container, CoinBadge, fUSD, fNum
} from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";
import { useUser } from "@/features/auth/presentation/hooks/useUser";
import { 
  useP2PAds, useMyAds, useMyOrders, 
  useCreateAd, useCreateP2POrder, 
  useMarkP2POrderPaid, useReleaseP2POrder, 
  useCancelP2POrder, useOpenP2PDispute, useSetAdStatus 
} from "../hooks/useP2P";
import { P2PAdvertisement, P2POrder } from "../../model/p2p";

const PAY_METHODS = ["Bank Transfer", "BCA", "Mandiri", "BRI", "OVO", "GoPay", "Dana", "LinkAja"];
const ASSETS = ["USDT", "USDC", "BTC", "ETH"];

function fIDR(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

export function P2PPage() {
  useScrollReveal();
  const { user } = useUser();
  const uid = user?.user_id || "";

  // Views
  const [view, setView] = useState<"marketplace" | "my_orders" | "my_ads">("marketplace");

  // Modals
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [orderModalAd, setOrderModalAd] = useState<P2PAdvertisement | null>(null);
  const [detailModalOrder, setDetailModalOrder] = useState<P2POrder | null>(null);

  // Marketplace Filters
  const [side, setSide] = useState("buy");
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [pay, setPay] = useState("All");

  const pair_id = `${asset}_IDR`;

  // Hooks
  const { ads, mutate: refreshAds } = useP2PAds({
    pair_id: pair_id,
    payment_method: pay === "All" ? undefined : pay,
    status: "active"
  });
  const { orders, mutate: refreshOrders } = useMyOrders();
  const { ads: myAdsList, mutate: refreshMyAds } = useMyAds();

  const createAd = useCreateAd();
  const createOrder = useCreateP2POrder();
  const markPaid = useMarkP2POrderPaid();
  const releaseOrder = useReleaseP2POrder();
  const cancelOrder = useCancelP2POrder();
  const openDispute = useOpenP2PDispute();
  const setAdStatus = useSetAdStatus();

  // Filter ads by amount locally
  const filteredAds = useMemo(() => {
    let result = ads;
    // In our backend, P2PAdvertisement is a seller's offer to sell crypto.
    // If the user selects "sell", they are looking for "buy" ads, which don't exist yet in the backend.
    if (side === "sell") return [];
    
    if (amount) {
      const val = parseFloat(amount);
      if (!isNaN(val)) {
        result = result.filter(a => val >= a.min_amount && val <= a.max_amount);
      }
    }
    return result;
  }, [ads, amount, side]);

  const refreshAll = () => {
    refreshAds();
    refreshOrders();
    refreshMyAds();
  };

  const Stars = ({ v }: { v: number }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <Icon name="star" size={13} color="var(--warn)" style={{ fill: "var(--warn)" }} />
      <span style={{ font: "600 12.5px var(--mono)", color: "var(--text-2)" }}>{v.toFixed(1)}</span>
    </span>
  );

  return (
    <AppShell>
      <Container max={1200} style={{ padding: "36px 32px 64px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 26 }}>
          <div>
            <h1 style={{ font: "700 32px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", marginBottom: 6 }}>P2P Trading</h1>
            <p style={{ font: "500 15px var(--font)", color: "var(--text-3)" }}>Buy and sell crypto directly with verified merchants — your terms, zero trading fees.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView(view === "marketplace" ? "my_orders" : "marketplace")} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: view === "my_orders" ? "var(--surface)" : "var(--card)", color: view === "my_orders" ? "var(--text-hi)" : "var(--text)", font: "600 14px var(--font)", cursor: "pointer" }}>
              <Icon name="myorders" size={16} color="var(--text-2)" /> {view === "my_orders" ? "Marketplace" : "My Orders"}
            </button>
            <button onClick={() => setView("my_ads")} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: view === "my_ads" ? "var(--surface)" : "var(--card)", color: view === "my_ads" ? "var(--text-hi)" : "var(--text)", font: "600 14px var(--font)", cursor: "pointer" }}>
               My Ads
            </button>
            <button onClick={() => setAdModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", borderRadius: "var(--r-md)", border: "none", background: "var(--blue)", color: "#fff", font: "600 14px var(--font)", cursor: "pointer" }}>
              <Icon name="offer" size={16} color="#fff" stroke={2.3} /> Create Offer
            </button>
          </div>
        </div>

        {/* View content */}
        {view === "marketplace" && (
          <>
            {/* Filter Bar */}
            <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 18, boxShadow: "var(--shadow-card)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: "var(--inset)", borderRadius: "var(--r-sm)", padding: 4 }}>
                {([["buy", "Buy"], ["sell", "Sell"]] as [string, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setSide(id)} style={{ width: 92, height: 38, borderRadius: "var(--r-xs)", border: "none", cursor: "pointer", font: "700 14px var(--font)",
                    background: side === id ? (id === "buy" ? "var(--up)" : "var(--down)") : "transparent", color: side === id ? "#fff" : "var(--text-2)" }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {ASSETS.map(a => (
                  <button key={a} onClick={() => setAsset(a)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: "var(--r-pill)", cursor: "pointer", font: "600 13px var(--font)",
                    border: "1px solid " + (asset === a ? "var(--blue)" : "var(--border)"), background: asset === a ? "var(--blue-soft)" : "transparent", color: asset === a ? "var(--blue-hover)" : "var(--text-2)" }}>
                    <CoinBadge sym={a} size={20} />{a}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", width: 200 }}>
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount limits" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "500 13.5px var(--font)", width: "100%" }} />
                <span style={{ font: "600 12.5px var(--font)", color: "var(--text-3)" }}>IDR</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 8px 0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                <Icon name="bank" size={15} color="var(--text-3)" />
                <select value={pay} onChange={e => setPay(e.target.value)} style={{ background: "none", border: "none", outline: "none", color: "var(--text)", font: "500 13px var(--font)", cursor: "pointer", paddingRight: 6 }}>
                  {["All", ...PAY_METHODS].map(p => <option key={p} value={p} style={{ background: "#0D1221" }}>{p === "All" ? "All payments" : p}</option>)}
                </select>
              </div>
            </div>

            {/* Ad List */}
            <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Advertiser", "Price", "Limits", "Payment", ""].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 4 ? "right" : "left", padding: "15px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {filteredAds.map((o, i) => (
                    <tr key={o.advertisement_id} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ position: "relative", flex: "none" }}>
                            <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue-grad)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 15px var(--font)", color: "#fff" }}>{o.seller_id.slice(0, 1).toUpperCase()}</span>
                          </span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ font: "600 14px var(--font)", color: "var(--text-hi)" }}>Merchant {o.seller_id.slice(0, 5)}</span>
                              <Icon name="verified" size={14} color="var(--blue-hover)" />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                              <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{o.payment_window}m window</span>
                              <Stars v={5.0} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ font: "700 18px var(--mono)", color: "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{fIDR(o.price)}</span>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 3 }}>Limit {fIDR(o.min_amount)} – {fIDR(o.max_amount)}</div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 220 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: "var(--r-xs)", background: "var(--surface)", border: "1px solid var(--border)", font: "500 11.5px var(--font)", color: "var(--text-2)" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--blue-hover)" }} />{o.payment_method}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px", textAlign: "right" }}>
                        <button disabled={uid === o.seller_id} onClick={() => setOrderModalAd(o)} style={{ height: 40, padding: "0 24px", borderRadius: "var(--r-md)", border: "none", cursor: uid === o.seller_id ? "not-allowed" : "pointer", font: "700 14px var(--font)", color: "#fff",
                          background: uid === o.seller_id ? "var(--surface)" : (side === "buy" ? "var(--up)" : "var(--down)") }}>
                            {uid === o.seller_id ? "Your Ad" : (side === "buy" ? "Buy" : "Sell")} {asset}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAds.length === 0 && side === "sell" && <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", font: "500 14px var(--font)", color: "var(--text-3)" }}>Sell ads are not supported currently. Please create an offer instead.</td></tr>}
                  {filteredAds.length === 0 && side === "buy" && <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", font: "500 14px var(--font)", color: "var(--text-3)" }}>No offers match this filter.</td></tr>}
                </tbody>
              </table>
            </div>
            
            <p style={{ font: "500 12.5px var(--font)", color: "var(--text-4)", marginTop: 16, display: "flex", alignItems: "center", gap: 7 }}>
              <Icon name="shield" size={14} color="var(--text-3)" /> All P2P trades are protected by smart contract escrow. Funds are released only after payment is confirmed.
            </p>
          </>
        )}

        {view === "my_orders" && (
          <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <h2 style={{ padding: "20px 24px", margin: 0, font: "600 16px var(--font)", borderBottom: "1px solid var(--border)" }}>My Orders</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Order ID", "Role", "Amount", "Total IDR", "Status", "Date"].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "15px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {orders.map((o) => {
                  const isBuyer = o.buyer_id === uid;
                  return (
                    <tr key={o.p2p_order_id} onClick={() => setDetailModalOrder(o)} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)", cursor: "pointer" }}>
                      <td style={{ padding: "18px 24px", font: "500 13px var(--mono)", color: "var(--text-hi)" }}>{o.p2p_order_id.split("-")[0]}...</td>
                      <td style={{ padding: "18px 24px", font: "600 13px var(--font)", color: isBuyer ? "var(--up)" : "var(--down)" }}>{isBuyer ? "Buyer" : "Seller"}</td>
                      <td style={{ padding: "18px 24px", font: "500 14px var(--mono)", color: "var(--text-hi)" }}>{o.amount} Crypto</td>
                      <td style={{ padding: "18px 24px", font: "500 14px var(--mono)", color: "var(--text-hi)" }}>{fIDR(o.total_idr)}</td>
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: "var(--r-sm)", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
                          background: o.status === "created" ? "var(--blue-soft)" : o.status === "paid" ? "var(--warn-soft)" : o.status === "released" ? "var(--up-soft)" : o.status === "cancelled" ? "var(--surface)" : "var(--down-soft)",
                          color: o.status === "created" ? "var(--blue)" : o.status === "paid" ? "var(--warn)" : o.status === "released" ? "var(--up)" : o.status === "cancelled" ? "var(--text-3)" : "var(--down)"
                        }}>{o.status}</span>
                      </td>
                      <td style={{ padding: "18px 24px", font: "500 13px var(--font)", color: "var(--text-3)" }}>{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  )
                })}
                {orders.length === 0 && <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", font: "500 14px var(--font)", color: "var(--text-3)" }}>You have no orders.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {view === "my_ads" && (
          <div data-reveal="1" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <h2 style={{ padding: "20px 24px", margin: 0, font: "600 16px var(--font)", borderBottom: "1px solid var(--border)" }}>My Advertisements</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Pair", "Price", "Limits", "Payment", "Status", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "15px 24px", font: "600 11px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {myAdsList.map((a) => (
                  <tr key={a.advertisement_id} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                    <td style={{ padding: "18px 24px", font: "600 14px var(--font)", color: "var(--text-hi)" }}>{a.pair_id}</td>
                    <td style={{ padding: "18px 24px", font: "500 14px var(--mono)", color: "var(--text-hi)" }}>{fIDR(a.price)}</td>
                    <td style={{ padding: "18px 24px", font: "500 13px var(--mono)", color: "var(--text-hi)" }}>{fIDR(a.min_amount)} - {fIDR(a.max_amount)}</td>
                    <td style={{ padding: "18px 24px", font: "500 13px var(--font)", color: "var(--text-2)" }}>{a.payment_method}</td>
                    <td style={{ padding: "18px 24px" }}>
                       <span style={{ padding: "4px 8px", borderRadius: "var(--r-sm)", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
                          background: a.status === "active" ? "var(--up-soft)" : "var(--surface)",
                          color: a.status === "active" ? "var(--up)" : "var(--text-3)"
                        }}>{a.status}</span>
                    </td>
                    <td style={{ padding: "18px 24px", textAlign: "right" }}>
                      {a.status === "active" && (
                        <button onClick={async () => { await setAdStatus.mutate(a.advertisement_id, "paused"); refreshMyAds(); }} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-2)", cursor: "pointer" }}>Pause</button>
                      )}
                      {a.status === "paused" && (
                        <button onClick={async () => { await setAdStatus.mutate(a.advertisement_id, "active"); refreshMyAds(); }} style={{ padding: "6px 12px", background: "var(--blue-soft)", border: "1px solid var(--blue)", borderRadius: "var(--r-sm)", color: "var(--blue)", cursor: "pointer" }}>Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
                {myAdsList.length === 0 && <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", font: "500 14px var(--font)", color: "var(--text-3)" }}>You have not created any advertisements.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </Container>

      {/* --- Modals --- */}
      {adModalOpen && (
        <CreateAdModal 
          onClose={() => setAdModalOpen(false)} 
          onSuccess={() => { setAdModalOpen(false); setView("my_ads"); refreshAll(); }} 
          createAd={createAd} 
        />
      )}

      {orderModalAd && (
        <CreateOrderModal 
          ad={orderModalAd} 
          onClose={() => setOrderModalAd(null)} 
          onSuccess={(newOrder) => { setOrderModalAd(null); setDetailModalOrder(newOrder); refreshAll(); }} 
          createOrder={createOrder} 
        />
      )}

      {detailModalOrder && (
        <OrderDetailModal 
          order={detailModalOrder} 
          uid={uid}
          onClose={() => setDetailModalOrder(null)} 
          onRefresh={() => { refreshAll(); }}
          mutations={{ markPaid, releaseOrder, cancelOrder, openDispute }}
        />
      )}
    </AppShell>
  );
}

// ─── Sub Components for Modals ───────────────────────────────────────────

function ModalBackdrop({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}

function CreateAdModal({ onClose, onSuccess, createAd }: any) {
  const [asset, setAsset] = useState("USDT");
  const [price, setPrice] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [payMeth, setPayMeth] = useState(PAY_METHODS[0]);
  const [window, setWindow] = useState("15");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createAd.mutate({
        pair_id: `${asset}_IDR`,
        price: parseFloat(price),
        min_amount: parseFloat(minAmt),
        max_amount: parseFloat(maxAmt),
        payment_method: payMeth,
        payment_window: parseInt(window),
        seller_address: address
      });
      onSuccess();
    } catch (err) {}
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ width: 450, background: "var(--card)", borderRadius: "var(--r-lg)", padding: 24, border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <h3 style={{ marginTop: 0, marginBottom: 20, font: "600 20px var(--font)" }}>Create Sell Offer</h3>
        {createAd.error && <div style={{ padding: 12, background: "var(--down-soft)", color: "var(--down)", borderRadius: "var(--r-sm)", marginBottom: 16, fontSize: 13 }}>{createAd.error.message}</div>}
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
            Asset
            <select value={asset} onChange={e => setAsset(e.target.value)} style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }}>
              {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
            Price (IDR)
            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 15500" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
            Min Amount (Crypto)
            <input required type="number" step="any" value={minAmt} onChange={e => setMinAmt(e.target.value)} placeholder="0.0" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
            Max Amount (Crypto)
            <input required type="number" step="any" value={maxAmt} onChange={e => setMaxAmt(e.target.value)} placeholder="0.0" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
            Payment Method
            <select value={payMeth} onChange={e => setPayMeth(e.target.value)} style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }}>
              {PAY_METHODS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
            Payment Window (min)
            <input required type="number" value={window} onChange={e => setWindow(e.target.value)} placeholder="15" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)", marginBottom: 24 }}>
          Your EVM Address (for Escrow Refund)
          <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
        </label>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={createAd.loading} style={{ padding: "10px 20px", borderRadius: "var(--r-md)", border: "none", background: "var(--blue)", color: "#fff", cursor: "pointer", opacity: createAd.loading ? 0.7 : 1 }}>{createAd.loading ? "Creating..." : "Create Offer"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

function CreateOrderModal({ ad, onClose, onSuccess, createOrder }: any) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  
  const totalIDR = (parseFloat(amount) || 0) * ad.price;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const order = await createOrder.mutate({
        advertisement_id: ad.advertisement_id,
        amount: parseFloat(amount),
        buyer_address: address
      });
      onSuccess(order);
    } catch (err) {}
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ width: 400, background: "var(--card)", borderRadius: "var(--r-lg)", padding: 24, border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <h3 style={{ marginTop: 0, marginBottom: 8, font: "600 20px var(--font)" }}>Buy {ad.pair_id.split("_")[0]}</h3>
        <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--text-3)" }}>Rate: {fIDR(ad.price)} • Limits: {ad.min_amount} - {ad.max_amount} Crypto</p>
        
        {createOrder.error && <div style={{ padding: 12, background: "var(--down-soft)", color: "var(--down)", borderRadius: "var(--r-sm)", marginBottom: 16, fontSize: 13 }}>{createOrder.error.message}</div>}

        <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
          I want to buy (Crypto amount)
          <input required type="number" step="any" min={ad.min_amount} max={ad.max_amount} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.0" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
        </label>

        <div style={{ padding: 14, background: "var(--inset)", borderRadius: "var(--r-sm)", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>I will pay</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-hi)", fontFamily: "var(--mono)" }}>{fIDR(totalIDR)}</span>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)", marginBottom: 24 }}>
          My EVM Address (to receive Crypto)
          <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)" }} />
        </label>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={createOrder.loading} style={{ padding: "10px 20px", borderRadius: "var(--r-md)", border: "none", background: "var(--up)", color: "#fff", cursor: "pointer", opacity: createOrder.loading ? 0.7 : 1 }}>{createOrder.loading ? "Processing..." : "Place Order"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

function OrderDetailModal({ order, uid, onClose, onRefresh, mutations }: any) {
  const isBuyer = order.buyer_id === uid;
  const isSeller = order.seller_id === uid;
  const { markPaid, releaseOrder, cancelOrder, openDispute } = mutations;

  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  const handleAction = async (action: any, ...args: any[]) => {
    try {
      await action.mutate(order.p2p_order_id, ...args);
      onRefresh();
      onClose();
    } catch (err) {}
  };

  const err = markPaid.error || releaseOrder.error || cancelOrder.error || openDispute.error;

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ width: 500, background: "var(--card)", borderRadius: "var(--r-lg)", padding: 24, border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 6, font: "600 20px var(--font)" }}>Order Details</h3>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)" }}>ID: {order.p2p_order_id}</span>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: "var(--r-sm)", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase",
            background: order.status === "created" ? "var(--blue-soft)" : order.status === "paid" ? "var(--warn-soft)" : order.status === "released" ? "var(--up-soft)" : order.status === "cancelled" ? "var(--surface)" : "var(--down-soft)",
            color: order.status === "created" ? "var(--blue)" : order.status === "paid" ? "var(--warn)" : order.status === "released" ? "var(--up)" : order.status === "cancelled" ? "var(--text-3)" : "var(--down)"
          }}>{order.status}</span>
        </div>

        {err && <div style={{ padding: 12, background: "var(--down-soft)", color: "var(--down)", borderRadius: "var(--r-sm)", marginBottom: 16, fontSize: 13 }}>{err.message}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16, background: "var(--inset)", borderRadius: "var(--r-md)", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Role</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isBuyer ? "var(--up)" : "var(--down)" }}>{isBuyer ? "Buyer" : "Seller"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Total Fiat</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-hi)", fontFamily: "var(--mono)" }}>{fIDR(order.total_idr)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Crypto Amount</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--mono)" }}>{order.amount}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Created At</div>
            <div style={{ fontSize: 13, color: "var(--text)" }}>{new Date(order.created_at).toLocaleString()}</div>
          </div>
        </div>

        {showDispute ? (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>
              Reason for Dispute
              <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={3} style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-hi)", fontFamily: "var(--font)", resize: "none" }} />
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDispute(false)} style={{ flex: 1, padding: "8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
              <button disabled={openDispute.loading} onClick={() => handleAction(openDispute, { reason: disputeReason })} style={{ flex: 1, padding: "8px", borderRadius: "var(--r-sm)", border: "none", background: "var(--down)", color: "#fff", cursor: "pointer", opacity: openDispute.loading ? 0.7 : 1 }}>Submit Dispute</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isBuyer && order.status === "created" && (
              <button onClick={() => handleAction(markPaid)} disabled={markPaid.loading} style={{ width: "100%", padding: "12px", borderRadius: "var(--r-md)", border: "none", background: "var(--blue)", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: markPaid.loading ? 0.7 : 1 }}>
                I have transferred the funds
              </button>
            )}
            
            {isSeller && order.status === "paid" && (
              <button onClick={() => handleAction(releaseOrder)} disabled={releaseOrder.loading} style={{ width: "100%", padding: "12px", borderRadius: "var(--r-md)", border: "none", background: "var(--up)", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: releaseOrder.loading ? 0.7 : 1 }}>
                Payment Received — Release Crypto
              </button>
            )}

            {(order.status === "created" || order.status === "paid") && (
              <button onClick={() => setShowDispute(true)} style={{ width: "100%", padding: "12px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--warn)", fontWeight: 600, cursor: "pointer" }}>
                Open Dispute
              </button>
            )}

            {order.status === "created" && (
              <button onClick={() => handleAction(cancelOrder)} disabled={cancelOrder.loading} style={{ width: "100%", padding: "12px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontWeight: 600, cursor: "pointer", opacity: cancelOrder.loading ? 0.7 : 1 }}>
                Cancel Order
              </button>
            )}
            
            <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 600, cursor: "pointer", marginTop: (order.status !== "released" && order.status !== "cancelled" && order.status !== "disputed") ? 10 : 0 }}>
              Close
            </button>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
}
