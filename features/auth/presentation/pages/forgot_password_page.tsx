"use client";

/* ── Drexa — Forgot / Reset password (new design, multi-step, wired to Go gateway) ── */
import React, { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/features/core/presentation/components/drexa_kit";
import { api } from "@/lib/api";

function Field({ label, type = "text", value, onChange, placeholder, icon, right, autoFocus }: {
  label?: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; right?: ReactNode; autoFocus?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      {label && <div style={{ font: "500 12.5px var(--font)", color: "var(--text-2)", marginBottom: 7 }}>{label}</div>}
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

function PwBar({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];
  const cols = ["var(--down)", "var(--down)", "var(--warn)", "var(--up)", "var(--up)"];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2, 3].map(i => <span key={i} style={{ flex: 1, height: 4, borderRadius: "var(--r-pill)", background: i < score ? cols[score] : "var(--border)" }} />)}
      </div>
      {score > 0 && <div style={{ font: "500 11.5px var(--font)", color: cols[score], marginTop: 6 }}>{labels[score]}</div>}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Email", "Verify", "Reset"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 30 }}>
      {steps.map((s, i) => {
        const done = i < step, active = i === step;
        return (
          <span key={s} style={{ display: "contents" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                font: "600 12px var(--mono)", border: "1px solid " + (done || active ? "var(--blue)" : "var(--border-strong)"),
                background: done ? "var(--blue)" : active ? "var(--blue-soft)" : "transparent", color: done ? "#fff" : active ? "var(--blue-hover)" : "var(--text-4)" }}>
                {done ? <Icon name="check" size={14} color="#fff" stroke={3} /> : i + 1}
              </span>
              <span style={{ font: `${active ? 600 : 500} 12.5px var(--font)`, color: done || active ? "var(--text-2)" : "var(--text-4)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <span style={{ flex: 1, height: 1, background: i < step ? "var(--blue)" : "var(--border)", minWidth: 16 }} />}
          </span>
        );
      })}
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const arr = value.split(""); arr[i] = d; const next = arr.join("").slice(0, 6); onChange(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus(); };
  const onPaste = (e: React.ClipboardEvent) => { const t = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); if (t) { onChange(t); refs.current[Math.min(t.length, 5)]?.focus(); e.preventDefault(); } };
  return (
    <div style={{ display: "flex", gap: 10 }} onPaste={onPaste}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input key={i} ref={el => { refs.current[i] = el; }} value={value[i] || ""} onChange={e => set(i, e.target.value)} onKeyDown={e => onKey(i, e)} inputMode="numeric" maxLength={1}
          style={{ width: 52, height: 60, textAlign: "center", borderRadius: "var(--r-md)", background: "var(--surface)",
            border: "1px solid " + (value[i] ? "var(--blue)" : "var(--border)"), color: "var(--text-hi)", font: "600 24px var(--mono)", outline: "none" }} />
      ))}
    </div>
  );
}

export function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [secs, setSecs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (secs <= 0) return; const t = setTimeout(() => setSecs(s => s - 1), 1000); return () => clearTimeout(t); }, [secs]);
  const score = (() => { let s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++; return s; })();

  const sendCode = async () => {
    if (!email.includes("@") || busy) return;
    setBusy(true); setErr(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(1); setSecs(30);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send reset code");
    } finally { setBusy(false); }
  };

  const resetPassword = async () => {
    if (!(pw.length >= 8 && pw === pw2) || busy) return;
    setBusy(true); setErr(null);
    try {
      await api.post("/auth/reset-password", { token: otp, newPassword: pw });
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not reset password");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", animation: "fadeUpIn 0.65s ease 0.05s both" }}>
        <div style={{ padding: "26px 40px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}><Logo /></Link>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 40px 40px" }}>
          <div style={{ width: "100%", maxWidth: 408 }}>
            {step < 3 && <Stepper step={step} />}

            {step === 0 && (
              <div>
                <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Reset your password</h1>
                <p style={{ font: "500 14.5px var(--font)", color: "var(--text-3)", marginTop: 8, lineHeight: 1.55 }}>Enter the email linked to your account and we&apos;ll send you a verification code.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
                  <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="mail" autoFocus />
                  {err && <div style={{ font: "600 13px var(--font)", color: "var(--down)" }}>{err}</div>}
                  <button disabled={!email.includes("@") || busy} onClick={sendCode} className="submit-btn" style={{ height: 52, borderRadius: "var(--r-md)", border: "none", cursor: (email.includes("@") && !busy) ? "pointer" : "not-allowed", font: "700 15px var(--font)", background: (email.includes("@") && !busy) ? "var(--blue)" : "var(--card-2)", color: (email.includes("@") && !busy) ? "#fff" : "var(--text-4)", transition: "background .14s" }}>{busy ? "Sending…" : "Send reset code"}</button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Enter verification code</h1>
                <p style={{ font: "500 14.5px var(--font)", color: "var(--text-3)", marginTop: 8, lineHeight: 1.55 }}>We sent a 6-digit code to <span style={{ color: "var(--text-hi)", fontWeight: 600 }}>{email || "your email"}</span>. Enter it below.</p>
                <div style={{ marginTop: 28 }}><OtpInput value={otp} onChange={setOtp} /></div>
                <div style={{ font: "500 13px var(--font)", color: "var(--text-3)", marginTop: 18 }}>
                  Didn&apos;t get it? {secs > 0 ? <span style={{ color: "var(--text-4)" }}>Resend in {secs}s</span> : <button onClick={() => { setSecs(30); void sendCode(); }} className="txt-link" style={{ background: "none", border: "none", cursor: "pointer", font: "600 13px var(--font)", color: "var(--blue-hover)", padding: 0 }}>Resend code</button>}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                  <button onClick={() => setStep(0)} style={{ height: 52, padding: "0 22px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", font: "600 14.5px var(--font)", cursor: "pointer" }}>Back</button>
                  <button disabled={otp.length < 6} onClick={() => setStep(2)} className="submit-btn" style={{ flex: 1, height: 52, borderRadius: "var(--r-md)", border: "none", cursor: otp.length === 6 ? "pointer" : "not-allowed", font: "700 15px var(--font)", background: otp.length === 6 ? "var(--blue)" : "var(--card-2)", color: otp.length === 6 ? "#fff" : "var(--text-4)", transition: "background .14s" }}>Verify code</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Create new password</h1>
                <p style={{ font: "500 14.5px var(--font)", color: "var(--text-3)", marginTop: 8, lineHeight: 1.55 }}>Choose a strong password you haven&apos;t used before.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
                  <div>
                    <Field label="New password" type={show ? "text" : "password"} value={pw} onChange={setPw} placeholder="Enter new password" icon="lock"
                      right={<button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><Icon name={show ? "eyeoff" : "eye"} size={18} color="var(--text-3)" /></button>} />
                    <PwBar score={score} />
                  </div>
                  <div>
                    <Field label="Confirm password" type={show ? "text" : "password"} value={pw2} onChange={setPw2} placeholder="Re-enter new password" icon="lock" />
                    {pw2 && pw !== pw2 && <div style={{ font: "500 11.5px var(--font)", color: "var(--down)", marginTop: 7 }}>Passwords don&apos;t match</div>}
                  </div>
                  {err && <div style={{ font: "600 13px var(--font)", color: "var(--down)" }}>{err}</div>}
                  <button disabled={!(pw.length >= 8 && pw === pw2) || busy} onClick={resetPassword} className="submit-btn" style={{ height: 52, borderRadius: "var(--r-md)", border: "none", marginTop: 4, cursor: (pw.length >= 8 && pw === pw2 && !busy) ? "pointer" : "not-allowed", font: "700 15px var(--font)", background: (pw.length >= 8 && pw === pw2 && !busy) ? "var(--blue)" : "var(--card-2)", color: (pw.length >= 8 && pw === pw2 && !busy) ? "#fff" : "var(--text-4)", transition: "background .14s" }}>{busy ? "Resetting…" : "Reset password"}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ textAlign: "center" }}>
                <span style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--up-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                  <Icon name="check" size={36} color="var(--up)" stroke={2.6} />
                </span>
                <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Password reset</h1>
                <p style={{ font: "500 14.5px var(--font)", color: "var(--text-3)", marginTop: 10, lineHeight: 1.6, maxWidth: 320, marginInline: "auto" }}>Your password has been updated. You can now sign in with your new password.</p>
                <button onClick={() => router.push("/login")} style={{ width: "100%", height: 52, borderRadius: "var(--r-md)", border: "none", marginTop: 28, cursor: "pointer", font: "700 15px var(--font)", background: "var(--blue)", color: "#fff" }}>Back to sign in</button>
              </div>
            )}

            {step < 3 && (
              <p style={{ font: "500 13px var(--font)", color: "var(--text-3)", marginTop: 28, textAlign: "center" }}>
                Remembered it? <Link href="/login" className="txt-link" style={{ color: "var(--blue-hover)", textDecoration: "none", fontWeight: 600 }}>Back to sign in</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden", borderLeft: "1px solid var(--border)", background: "var(--navbar)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ position: "absolute", width: 620, height: 620, left: "-160px", bottom: "-160px", background: "rgba(26,111,212,0.16)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 440, height: 440, right: "-120px", top: "-120px", background: "rgba(13,148,136,0.10)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 420, textAlign: "center" }}>
          <span style={{ width: 96, height: 96, borderRadius: "var(--r-xl)", background: "var(--card)", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-pop)" }}>
            <Icon name="shield" size={46} color="var(--blue-hover)" stroke={1.5} />
          </span>
          <h2 style={{ font: "700 32px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", lineHeight: 1.2, marginTop: 28 }}>Your security is our priority</h2>
          <p style={{ font: "500 15.5px var(--font)", color: "var(--text-2)", lineHeight: 1.6, marginTop: 14 }}>
            We never store passwords in plain text and verify every reset request. If you didn&apos;t request this, your account stays safe.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32, textAlign: "left" }}>
            {["Reset codes expire after 10 minutes", "Every reset triggers a security alert", "24/7 fraud monitoring on all accounts"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "13px 16px" }}>
                <Icon name="check" size={17} color="var(--up)" stroke={2.4} style={{ flex: "none" }} />
                <span style={{ font: "500 13.5px var(--font)", color: "var(--text)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
