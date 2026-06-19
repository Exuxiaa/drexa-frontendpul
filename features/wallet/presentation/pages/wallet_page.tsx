"use client";

/* ── Drexa — Wallet (ported from the Claude Design handoff) ── */
import { CSSProperties, Dispatch, ReactNode, SetStateAction, useState, useEffect, useMemo } from "react";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Container, CoinBadge, Avatar, COIN, fUSD, fNum,
} from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";
import { api } from "@/lib/api";
import { useWalletData } from "@/features/wallet/presentation/hooks/useWalletData";
import { useCryptoAddress, isCryptoSupported } from "@/features/wallet/presentation/hooks/useCryptoWallet";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).catch(() => null) : null;

const DEFAULT_ASSETS = ["USD", "BTC", "ETH", "SOL", "USDT", "BNB"];

interface WalRow { sym: string; qty: number; price: number; value: number; inOrders: number; available: number; name: string; }


/* ---- Stripe payment form ---------------------------------------- */
function StripeCheckoutForm({ clientSecret, amount, onComplete }: { clientSecret: string; amount: string; onComplete: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
    } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      try {
        await api.post('/payments/deposit/verify', { provider_ref: paymentIntent.id });
      } catch (e) {
        console.error('Verify error', e);
      }
      onComplete();
    } else {
      onComplete();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <PaymentElement onLoadError={(e) => {
        console.error("Stripe PaymentElement load error:", e);
        setError(e.error?.message || "Failed to load payment form. Please check your Stripe configuration or try again.");
      }} />
      {error && <div style={{ color: "var(--warn)", font: "500 13px var(--font)", textAlign: "center" }}>{error}</div>}
      <button disabled={loading || !stripe} style={{ height: 48, borderRadius: "var(--r-md)", border: "none", cursor: (loading || !stripe) ? "default" : "pointer", background: (loading || !stripe) ? "var(--card-2)" : "var(--blue)", color: (loading || !stripe) ? "var(--text-3)" : "#fff", font: "700 14.5px var(--font)", transition: "background .15s, color .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
        <Icon name="lock" size={15} color={(loading || !stripe) ? "var(--text-4)" : "#fff"} />{loading ? "Processing..." : `Pay $${amount}`}
      </button>
    </form>
  );
}

/* ---- Modals ----------------------------------------------------- */
function DepositModalContent({ closeModal }: { closeModal: () => void }) {
  const [buyAmt, setBuyAmt] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!buyAmt || isNaN(parseFloat(buyAmt))) return;
    const amountVal = parseFloat(buyAmt);
    if (amountVal > 1000000) {
      setError("Maximum deposit amount is $1,000,000.");
      return;
    }
    if (amountVal < 0.50) {
      setError("Minimum deposit amount is $0.50.");
      return;
    }
    
    setLoadingIntent(true);
    setError("");
    try {
      const data = await api.post<{ client_secret: string }>("/payments/deposit/intent", {
        amount: Math.round(parseFloat(buyAmt) * 100), // USD to cents
        currency: "USD"
      });
      console.log("Deposit intent response:", data);
      setClientSecret(data.client_secret);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoadingIntent(false);
  };

  return (
    <>
      {!clientSecret ? (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Amount to deposit (USD)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <span style={{ font: "600 15px var(--mono)", color: "var(--text-3)" }}>$</span>
              <input value={buyAmt} onChange={e => setBuyAmt(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="100.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", marginBottom: 16, borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
            <SummaryRow k="Rate" v="1 USD = 1 USDT" />
            <SummaryRow k="You receive" v={buyAmt ? fNum(parseFloat(buyAmt) || 0, 2) + " USDT" : "\u2014"} />
          </div>
          {error && <div style={{ color: "var(--warn)", font: "500 13px var(--font)", marginBottom: 10 }}>{error}</div>}
          <button onClick={handleContinue} disabled={!buyAmt || loadingIntent} style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none", cursor: (!buyAmt || loadingIntent) ? "default" : "pointer", background: (!buyAmt || loadingIntent) ? "var(--card-2)" : "var(--blue)", color: (!buyAmt || loadingIntent) ? "var(--text-3)" : "#fff", font: "700 14.5px var(--font)" }}>
            {loadingIntent ? "Loading..." : `Deposit $${buyAmt || "0.00"}`}
          </button>
        </>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <StripeCheckoutForm clientSecret={clientSecret} amount={buyAmt} onComplete={closeModal} />
        </Elements>
      )}
    </>
  );
}

function CryptoDepositModalContent({ asset }: { asset: string }) {
  const { data, loading, error } = useCryptoAddress(asset);

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)' }}>Generating address...</div>;
  if (error) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--warn)' }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ font: "500 13px var(--font)", color: "var(--text-3)", marginBottom: 8 }}>Send only {asset} ({data.network}) to this address</div>
      <div style={{ background: "#fff", padding: 12, display: "inline-block", borderRadius: 8, marginBottom: 16 }}>
        <div style={{ width: 160, height: 160, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", font: "600 12px var(--font)" }}>QR CODE</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "10px 14px", gap: 8 }}>
        <div style={{ flex: 1, font: "500 13px var(--mono)", color: "var(--text-hi)", wordBreak: "break-all", textAlign: "left" }}>{data.address}</div>
        <button onClick={() => navigator.clipboard.writeText(data.address)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Icon name="copy" size={16} color="var(--text-3)" />
        </button>
      </div>
      <div style={{ font: "500 13px var(--font)", color: "var(--text-4)", marginTop: 12 }}>Network: {data.chain}</div>
    </div>
  );
}

function WithdrawModalContent({ rows, closeModal }: { rows: WalRow[], closeModal: () => void }) {
  const [payoutAmt, setPayoutAmt] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Balances are held in USDT (1 USDT = $1). Fiat withdrawal sells that USDT back
  // to USD via PayPal, so the available amount comes from the USDT wallet.
  const usdtRow = rows.find((r: WalRow) => r.sym === 'USDT') || { qty: 0 };
  const maxUsd = usdtRow.qty;

  const handleWithdraw = async () => {
    if (!payoutAmt || isNaN(parseFloat(payoutAmt)) || !paypalEmail) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/wallet/withdraw", {
        amount: Math.round(parseFloat(payoutAmt) * 100),
        currency: "USD",
        paypal_email: paypalEmail
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <Icon name="checkCircle" size={48} color="var(--up)" />
        <h3 style={{ font: "700 20px var(--font)", color: "var(--text-hi)", margin: "16px 0 8px" }}>Withdrawal Successful</h3>
        <p style={{ font: "500 14px var(--font)", color: "var(--text-3)", marginBottom: 24 }}>Your funds have been instantly sent to your PayPal account.</p>
        <button onClick={closeModal} style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none", cursor: "pointer", background: "var(--blue)", color: "#fff", font: "700 14.5px var(--font)" }}>Done</button>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
          <span>Amount (USD)</span>
          <span style={{ color: "var(--text-4)" }}>Balance: {fNum(maxUsd, 2)} USDT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
          <span style={{ font: "600 15px var(--mono)", color: "var(--text-3)" }}>$</span>
          <input value={payoutAmt} onChange={e => setPayoutAmt(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
          <button onClick={() => setPayoutAmt(maxUsd.toString())} style={{ font: "600 12px var(--font)", color: "var(--blue-hover)", background: "none", border: "none", cursor: "pointer" }}>MAX</button>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>PayPal Email</div>
        <input value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} placeholder="your@email.com" type="email" style={{ width: "100%", height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", outline: "none", color: "var(--text-hi)", font: "500 14px var(--font)", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", marginBottom: 16, borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
        <SummaryRow k="Processing fee" v="Free" />
        <SummaryRow k="You receive" v={payoutAmt ? `$${fNum(parseFloat(payoutAmt) || 0, 2)}` : "—"} />
      </div>
      {parseFloat(payoutAmt) > maxUsd && <div style={{ color: "var(--warn)", font: "500 13px var(--font)", marginBottom: 10 }}>Amount exceeds your available USDT balance.</div>}
      {error && <div style={{ color: "var(--warn)", font: "500 13px var(--font)", marginBottom: 10 }}>{error}</div>}
      <button onClick={handleWithdraw} disabled={!payoutAmt || !paypalEmail || loading || parseFloat(payoutAmt) > maxUsd} style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none", cursor: (!payoutAmt || !paypalEmail || loading || parseFloat(payoutAmt) > maxUsd) ? "default" : "pointer", background: (!payoutAmt || !paypalEmail || loading || parseFloat(payoutAmt) > maxUsd) ? "var(--card-2)" : "var(--blue)", color: (!payoutAmt || !paypalEmail || loading || parseFloat(payoutAmt) > maxUsd) ? "var(--text-3)" : "#fff", font: "700 14.5px var(--font)" }}>
        {loading ? "Processing..." : "Withdraw via PayPal"}
      </button>
    </>
  );
}

function TransferModalContent({ rows, coinRow, asset, assetOpen, setAssetOpen, setAsset, setNet, closeModal }: { rows: WalRow[], coinRow: WalRow, asset: string, assetOpen: boolean, setAssetOpen: Dispatch<SetStateAction<boolean>>, setAsset: Dispatch<SetStateAction<string>>, setNet: Dispatch<SetStateAction<number>>, closeModal: () => void }) {
  const [toAddress, setToAddress] = useState("");
  const [txAmt, setTxAmt] = useState("");
  const [txNote, setTxNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTransfer = async () => {
    if (!toAddress || !txAmt || isNaN(parseFloat(txAmt))) return;
    setLoading(true);
    setError("");
    try {
      // Scale to the currency's smallest unit — must match parseBalance() in
      // useWalletData.ts. The old code scaled everything non-fiat by 1e8, which
      // made USDT transfers 100x too large (USDT is micro, 1e6).
      const sym = asset.toUpperCase();
      let multiplier = 100; // USD / IDR / USDC — cents
      if (sym === "BTC") multiplier = 100_000_000;
      else if (sym === "ETH" || sym === "BNB") multiplier = 1_000_000_000_000_000_000;
      else if (sym === "SOL") multiplier = 1_000_000_000;
      else if (sym === "USDT") multiplier = 1_000_000;
      await api.post("/wallet/transfer", {
        to_address: toAddress,
        amount: Math.round(parseFloat(txAmt) * multiplier),
        currency: asset
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <Icon name="checkCircle" size={48} color="var(--up)" />
        <h3 style={{ font: "700 20px var(--font)", color: "var(--text-hi)", margin: "16px 0 8px" }}>Transfer Successful</h3>
        <p style={{ font: "500 14px var(--font)", color: "var(--text-3)", marginBottom: 24 }}>Funds have been sent to {toAddress}.</p>
        <button onClick={closeModal} style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none", cursor: "pointer", background: "var(--blue)", color: "#fff", font: "700 14.5px var(--font)" }}>Done</button>
      </div>
    );
  }

  return (
    <>
      <AssetSelect rows={rows} asset={asset} coinRow={coinRow} open={assetOpen} setOpen={setAssetOpen} setAsset={setAsset} setNet={setNet} />
      {/* from */}
      <div style={{ marginBottom: 2 }}>
        <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>From</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--inset)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)" }}>
          <Avatar size={26} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "600 13px var(--font)", color: "var(--text-hi)" }}>My Drexa Wallet</div>
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
          <span>To Crypto Wallet Address</span>
          <button onClick={() => navigator.clipboard?.readText().then(t => setToAddress(t)).catch(() => {})} style={{ font: "600 11.5px var(--font)", color: "var(--blue-hover)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Paste</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid " + (toAddress.length > 10 ? "var(--blue)" : "var(--border)"), borderRadius: "var(--r-sm)", transition: "border-color .15s" }}>
          <input value={toAddress} onChange={e => setToAddress(e.target.value)} placeholder={`Enter Recipient Crypto Address`} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "500 12.5px var(--mono)" }} />
          {toAddress.length > 0 && <button onClick={() => setToAddress("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", font: "600 18px var(--font)", lineHeight: 1 }}>×</button>}
        </div>
      </div>
      {/* amount */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ font: "500 12px var(--font)", color: "var(--text-3)", marginBottom: 7 }}>Amount</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
          <input value={txAmt} onChange={e => setTxAmt(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" inputMode="decimal" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "600 15px var(--mono)" }} />
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
        <SummaryRow k="Network" v="Internal Transfer" />
        <SummaryRow k="Fee" v="0.00 (Free)" />
        <SummaryRow k="You send" v={txAmt ? txAmt + " " + asset : "—"} />
      </div>
      {error && <div style={{ color: "var(--warn)", font: "500 13px var(--font)", marginBottom: 10 }}>{error}</div>}
      <button onClick={handleTransfer} disabled={!toAddress || !txAmt || loading} style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none", cursor: (!toAddress || !txAmt || loading) ? "default" : "pointer", background: (!toAddress || !txAmt || loading) ? "var(--card-2)" : "var(--blue)", color: (!toAddress || !txAmt || loading) ? "var(--text-3)" : "#fff", font: "700 14.5px var(--font)", transition: "background .15s, color .15s" }}>
        {loading ? "Processing..." : "Confirm Transfer"}
      </button>
    </>
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

function CryptoAddressCell({ sym }: { sym: string }) {
  const { data, loading, error } = useCryptoAddress(sym);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <span style={{ font: "500 12px var(--font)", color: "var(--text-4)" }}>Loading...</span>;
  }
  if (error || !data) {
    return <span style={{ font: "500 12px var(--font)", color: "var(--text-4)" }}>—</span>;
  }

  const addr = data.address;
  const truncated = addr.length > 18 ? addr.slice(0, 8) + "…" + addr.slice(-6) : addr;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px 12px", maxWidth: 220 }}>
      <span style={{ font: "500 12px var(--mono)", color: "var(--text-2)", letterSpacing: "0.01em" }}>{truncated}</span>
      <button onClick={copyAddress} title={addr} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flex: "none" }}>
        <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--up)" : "var(--text-3)"} />
      </button>
    </div>
  );
}

export function WalletPage() {
  useScrollReveal();
  const { balances, transactions: apiTxns, refresh } = useWalletData();

  const rows = useMemo(() => {
    const baseMap = new Map<string, WalRow>();

    // Pre-populate default assets with 0 balance
    DEFAULT_ASSETS.forEach(sym => {
      const c = COIN(sym);
      baseMap.set(sym, {
        sym, qty: 0, price: c ? c.price : 1, value: 0,
        inOrders: 0, available: 0, name: c ? c.name : (sym === "USDT" ? "Tether" : sym)
      });
    });

    // Merge actual backend balances
    balances.forEach(b => {
      const c = COIN(b.currency);
      const price = c ? c.price : 1;
      baseMap.set(b.currency, {
        sym: b.currency,
        qty: b.qty,
        price,
        value: b.qty * price,
        available: b.available,
        inOrders: b.locked,
        name: c ? c.name : (b.currency === "USDT" ? "Tether" : b.currency)
      });
    });

    // Convert map to array and sort by value
    return Array.from(baseMap.values()).sort((a, b) => b.value - a.value);
  }, [balances]);

  const allTxns = useMemo(() => {
    return apiTxns.map(t => ({
      type: t.type === 'deposit' ? 'Deposit' : t.type === 'withdrawal' ? 'Withdraw' : 'Transfer',
      sym: t.currency.toUpperCase(),
      amt: t.amount / (() => {
        switch (t.currency.toUpperCase()) {
          case 'BTC': return 100_000_000;
          case 'ETH': case 'BNB': return 1_000_000_000_000_000_000;
          case 'SOL': return 1_000_000_000;
          case 'USDT': return 1_000_000;
          default: return 100;
        }
      })(),
      status: t.status === 'completed' ? 'Completed' : t.status === 'failed' ? 'Failed' : 'Pending',
      net: 'Drexa',
      time: new Date(t.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      hash: t.id.substring(0, 12) + '...'
    }));
  }, [apiTxns]);

  const total = rows.reduce((a, r) => a + r.value, 0);
  const available = rows.reduce((a, r) => a + r.available, 0);
  const inOrders = rows.reduce((a, r) => a + r.inOrders, 0);

  const [modal, setModal] = useState<string | null>(null);
  const [asset, setAsset] = useState("USDC");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [net, setNet] = useState(0);
  const [assetOpen, setAssetOpen] = useState(false);

  const coinRow = rows.find(r => r.sym === asset) || rows[0];
  const openModal = (type: string, sym?: string) => { setModal(type); if (sym) { setAsset(sym); setNet(0); } };
  const closeModal = () => { setModal(null); refresh(); };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const assetSelectProps = { rows, asset, coinRow, open: assetOpen, setOpen: setAssetOpen, setAsset, setNet };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientSecret = params.get('payment_intent_client_secret');
    const paymentIntentId = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    
    if (clientSecret && paymentIntentId && redirectStatus === 'succeeded') {
      window.history.replaceState({}, '', window.location.pathname);
      api.post('/payments/deposit/verify', { provider_ref: paymentIntentId }).then(() => {
         refresh();
      }).catch(e => console.error(e));
    }
  }, [refresh]);

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
                    {isCryptoSupported(r.sym) ? (
                      <CryptoAddressCell sym={r.sym} />
                    ) : (
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button onClick={() => openModal("deposit", r.sym)} className="wal-act">Deposit</button>
                        <button onClick={() => openModal("withdraw", r.sym)} className="wal-act">Withdraw</button>
                        <button onClick={() => openModal("transfer", r.sym)} className="wal-act">Transfer</button>
                      </div>
                    )}
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
              {allTxns.map((t, i) => {
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
        isCryptoSupported(asset) ? (
          <Modal title={`Deposit ${asset}`} icon="deposit" onClose={closeModal}>
            <CryptoDepositModalContent asset={asset} />
          </Modal>
        ) : (
          <Modal title="Deposit USD" icon="deposit" onClose={closeModal}>
            <DepositModalContent closeModal={closeModal} />
          </Modal>
        )
      )}

      {/* ── WITHDRAW MODAL ────────────────────────────────────────── */}
      {modal === "withdraw" && (
        <Modal title="Withdraw funds" icon="withdraw" onClose={closeModal}>
          <WithdrawModalContent rows={rows} closeModal={closeModal} />
        </Modal>
      )}

      {/* ── TRANSFER MODAL ────────────────────────────────────────── */}
      {modal === "transfer" && (
        <Modal title="Internal Transfer" icon="transfer" onClose={closeModal}>
          <TransferModalContent rows={rows} coinRow={coinRow} asset={asset} assetOpen={assetOpen} setAssetOpen={setAssetOpen} setAsset={setAsset} setNet={setNet} closeModal={closeModal} />
        </Modal>
      )}
    </AppShell>
  );
}
