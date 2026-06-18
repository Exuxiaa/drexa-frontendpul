"use client";

/* ── Drexa — Login / Sign in (new design, wired to Firebase + Go gateway) ── */
import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, Logo, CoinBadge, Delta, Sparkline, COIN, fUSD } from "@/features/core/presentation/components/drexa_kit";
import { useEmailAuth } from "@/features/auth/presentation/hooks/useEmailAuth";
import { useGoogleAuth } from "@/features/auth/presentation/hooks/useGoogleAuth";

function GoogleG({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block" }}>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.3 6.6v5.5h7C42.6 36.8 45.1 31.1 45.1 24.5z" />
      <path fill="#34A853" d="M24 46c5.8 0 10.6-1.9 14.2-5.2l-7-5.5c-1.9 1.3-4.4 2.1-7.2 2.1-5.5 0-10.2-3.7-11.9-8.7H4.9v5.7C8.5 41.6 15.7 46 24 46z" />
      <path fill="#FBBC05" d="M12.1 28.7c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.9C3.4 17.5 2.5 20.6 2.5 24s.9 6.5 2.4 9.3l7.2-4.6z" />
      <path fill="#EA4335" d="M24 11.1c3.1 0 5.9 1.1 8.1 3.2l6.1-6.1C34.6 4.7 29.8 2.7 24 2.7 15.7 2.7 8.5 7.1 4.9 14.7l7.2 5.7c1.7-5 6.4-8.7 11.9-8.7z" />
    </svg>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, icon, right, autoFocus, labelRight }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; right?: ReactNode; autoFocus?: boolean; labelRight?: ReactNode;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ font: "500 12.5px var(--font)", color: "var(--text-2)" }}>{label}</span>
        {labelRight}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 14px",
        background: "var(--surface)", border: "1px solid " + (focus ? "var(--blue)" : "var(--border)"),
        borderRadius: "var(--r-md)", transition: "border-color .14s", boxShadow: focus ? "0 0 0 3px var(--blue-soft)" : "none" }}>
        {icon && <Icon name={icon} size={18} color={focus ? "var(--blue-hover)" : "var(--text-3)"} />}
        <input type={type} value={value} autoFocus={autoFocus} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder={placeholder}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-hi)", font: "500 14.5px var(--font)", width: "100%" }} />
        {right}
      </div>
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const emailAuth = useEmailAuth();
  const googleAuth = useGoogleAuth(() => router.push("/portfolio"));
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const valid = email.includes("@") && pw.length >= 1;
  const busy = emailAuth.isLoading || googleAuth.isLoading;

  const onSignIn = async () => {
    if (!valid || busy) return;
    const session = await emailAuth.login(email, pw);
    if (session) router.push("/portfolio");
  };
  const err = emailAuth.error || googleAuth.error;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ padding: "26px 40px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}><Logo /></Link>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 40px 40px" }}>
          <div style={{ width: "100%", maxWidth: 408 }}>
            <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Welcome back</h1>
            <p style={{ font: "500 14.5px var(--font)", color: "var(--text-3)", marginTop: 8 }}>
              New to Drexa? <Link href="/register" className="txt-link" style={{ color: "var(--blue-hover)", textDecoration: "none", fontWeight: 600 }}>Create an account</Link>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 28 }}>
              <button className="oauth-btn" onClick={() => googleAuth.login()} disabled={busy}><GoogleG /> {googleAuth.isLoading ? "Connecting…" : "Continue with Google"}</button>
              <button className="oauth-btn" disabled={busy}><Icon name="apple" size={19} color="var(--text-hi)" stroke={1.7} /> Continue with Apple</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>or sign in with email</span>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="mail" autoFocus />
              <Field label="Password" type={show ? "text" : "password"} value={pw} onChange={setPw} placeholder="Enter your password" icon="lock"
                labelRight={<Link href="/forgot_password" className="txt-link" style={{ font: "500 12.5px var(--font)", color: "var(--blue-hover)", textDecoration: "none" }}>Forgot password?</Link>}
                right={<button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><Icon name={show ? "eyeoff" : "eye"} size={18} color="var(--text-3)" /></button>} />

              <label style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer", marginTop: 2 }}>
                <span onClick={() => setRemember(a => !a)} style={{ width: 20, height: 20, borderRadius: 6, flex: "none",
                  border: "1px solid " + (remember ? "var(--blue)" : "var(--border-strong)"), background: remember ? "var(--blue)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "background .14s, border-color .14s" }}>
                  {remember && <Icon name="check" size={14} color="#fff" stroke={3} />}
                </span>
                <span style={{ font: "500 13.5px var(--font)", color: "var(--text-2)" }}>Keep me signed in for 30 days</span>
              </label>

              {err && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, font: "600 13px var(--font)", color: "var(--down)" }}>
                  <Icon name="shield" size={15} color="var(--down)" />{err}
                </div>
              )}

              <button disabled={!valid || busy} onClick={onSignIn} className="submit-btn" style={{
                height: 52, borderRadius: "var(--r-md)", border: "none", marginTop: 4,
                cursor: (valid && !busy) ? "pointer" : "not-allowed", font: "700 15px var(--font)",
                background: (valid && !busy) ? "var(--blue)" : "var(--card-2)", color: (valid && !busy) ? "#fff" : "var(--text-4)", transition: "background .14s",
              }}>{emailAuth.isLoading ? "Signing in…" : "Sign in"}</button>
            </div>

            <p style={{ font: "500 12px var(--font)", color: "var(--text-4)", marginTop: 22, display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
              <Icon name="lock" size={13} color="var(--text-3)" /> Protected by 2-factor authentication
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden", borderLeft: "1px solid var(--border)", background: "var(--navbar)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ position: "absolute", width: 620, height: 620, right: "-160px", top: "-160px", background: "rgba(26,111,212,0.16)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 460, height: 460, left: "-120px", bottom: "-140px", background: "rgba(13,148,136,0.10)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 440 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 13px", borderRadius: "var(--r-pill)", background: "var(--card)", border: "1px solid var(--border)", font: "600 12.5px var(--font)", color: "var(--text-2)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--up)" }} /> Markets are open
          </span>
          <h2 style={{ font: "700 38px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", lineHeight: 1.15, marginTop: 18 }}>
            Pick up right where you left off
          </h2>
          <p style={{ font: "500 16px var(--font)", color: "var(--text-2)", lineHeight: 1.6, marginTop: 16 }}>
            Your portfolio, watchlist, and open orders are waiting. Sign in to keep building.
          </p>
          <div style={{ marginTop: 32, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 8, boxShadow: "var(--shadow-pop)" }}>
            {["BTC", "ETH", "SOL"].map((s, i) => {
              const c = COIN(s)!;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                  <CoinBadge sym={s} size={34} />
                  <div style={{ flex: 1 }}><div style={{ font: "600 14px var(--font)", color: "var(--text-hi)" }}>{c.name}</div><div style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{s}</div></div>
                  <Sparkline data={c.spark} up={c.ch >= 0} w={64} h={28} />
                  <div style={{ textAlign: "right", minWidth: 92 }}>
                    <div style={{ font: "600 14px var(--mono)", color: "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{fUSD(c.price, c.price < 1 ? 4 : 2)}</div>
                    <Delta v={c.ch} size={12} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 36, marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
            {([["$180B+", "Traded on Drexa"], ["5M+", "Verified users"], ["99.9%", "Uptime"]] as [string, string][]).map(([v, l]) => (
              <div key={l}><div style={{ font: "700 24px var(--mono)", color: "var(--text-hi)", letterSpacing: "-.01em" }}>{v}</div><div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
