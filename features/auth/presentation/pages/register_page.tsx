"use client";

/* ── Drexa — Register / Sign up (new design, wired to useRegister) ── */
import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, Logo, DeltaPill, Sparkline, series } from "@/features/core/presentation/components/drexa_kit";
import { useRegister } from "@/features/auth/presentation/hooks/useRegister";
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

function PwBar({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];
  const cols = ["var(--down)", "var(--down)", "var(--warn)", "var(--up)", "var(--up)"];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} style={{ flex: 1, height: 4, borderRadius: "var(--r-pill)", background: i < score ? cols[score] : "var(--border)" }} />
        ))}
      </div>
      {score > 0 && <div style={{ font: "500 11.5px var(--font)", color: cols[score], marginTop: 6 }}>{labels[score]}</div>}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, icon, right, autoFocus }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; right?: ReactNode; autoFocus?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <div style={{ font: "500 12.5px var(--font)", color: "var(--text-2)", marginBottom: 7 }}>{label}</div>
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

export function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error } = useRegister();
  const googleAuth = useGoogleAuth(() => router.push("/portfolio"));
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const score = (() => {
    let s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++; return s;
  })();
  const valid = email.includes("@") && pw.length >= 8 && name.trim().length > 0 && agree;

  const onCreate = async () => {
    if (!valid || isLoading) return;
    const ok = await registerUser(email, pw, name.trim());
    if (ok) router.push("/login");
  };

  const stats: [string, string][] = [["$180B+", "Traded on Drexa"], ["5M+", "Verified users"], ["180+", "Countries served"]];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", animation: "fadeUpIn 0.65s ease 0.05s both" }}>
        <div style={{ padding: "26px 40px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}><Logo /></Link>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 40px 40px" }}>
          <div style={{ width: "100%", maxWidth: 408 }}>
            <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Create your account</h1>
            <p style={{ font: "500 14.5px var(--font)", color: "var(--text-3)", marginTop: 8 }}>
              Already have an account? <Link href="/login" className="txt-link" style={{ color: "var(--blue-hover)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 28 }}>
              <button className="oauth-btn" onClick={() => googleAuth.login()} disabled={googleAuth.isLoading}><GoogleG /> {googleAuth.isLoading ? "Connecting…" : "Continue with Google"}</button>
              <button className="oauth-btn"><Icon name="apple" size={19} color="var(--text-hi)" stroke={1.7} /> Continue with Apple</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>or sign up with email</span>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Full name" value={name} onChange={setName} placeholder="Maya Rahman" autoFocus />
              <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="mail" />
              <div>
                <Field label="Password" type={show ? "text" : "password"} value={pw} onChange={setPw} placeholder="Create a strong password" icon="lock"
                  right={<button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><Icon name={show ? "eyeoff" : "eye"} size={18} color="var(--text-3)" /></button>} />
                <PwBar score={score} />
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 11, cursor: "pointer", marginTop: 4 }}>
                <span onClick={() => setAgree(a => !a)} style={{ width: 20, height: 20, borderRadius: 6, flex: "none", marginTop: 1,
                  border: "1px solid " + (agree ? "var(--blue)" : "var(--border-strong)"), background: agree ? "var(--blue)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "background .14s, border-color .14s" }}>
                  {agree && <Icon name="check" size={14} color="#fff" stroke={3} />}
                </span>
                <span style={{ font: "500 13px var(--font)", color: "var(--text-2)", lineHeight: 1.5 }}>
                  I agree to Drexa&apos;s <a href="#" onClick={e => e.preventDefault()} style={{ color: "var(--blue-hover)", textDecoration: "none" }}>Terms of Service</a> and <a href="#" onClick={e => e.preventDefault()} style={{ color: "var(--blue-hover)", textDecoration: "none" }}>Privacy Policy</a>.
                </span>
              </label>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, font: "600 13px var(--font)", color: "var(--down)" }}>
                  <Icon name="shield" size={15} color="var(--down)" />{error}
                </div>
              )}

              <button disabled={!valid || isLoading} onClick={onCreate} className="submit-btn" style={{
                height: 52, borderRadius: "var(--r-md)", border: "none", marginTop: 4,
                cursor: (valid && !isLoading) ? "pointer" : "not-allowed", font: "700 15px var(--font)",
                background: (valid && !isLoading) ? "var(--blue)" : "var(--card-2)", color: (valid && !isLoading) ? "#fff" : "var(--text-4)",
                transition: "background .14s",
              }}>{isLoading ? "Creating account…" : "Create account"}</button>
            </div>

            <p style={{ font: "500 12px var(--font)", color: "var(--text-4)", marginTop: 22, display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
              <Icon name="lock" size={13} color="var(--text-3)" /> Secured with 256-bit encryption
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden", borderLeft: "1px solid var(--border)", background: "var(--navbar)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ position: "absolute", width: 620, height: 620, left: "-160px", top: "-160px", background: "rgba(26,111,212,0.16)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 460, height: 460, right: "-120px", bottom: "-140px", background: "rgba(13,148,136,0.10)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 440 }}>
          <h2 style={{ font: "700 38px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em", lineHeight: 1.15 }}>
            Start building your crypto portfolio today
          </h2>
          <p style={{ font: "500 16px var(--font)", color: "var(--text-2)", lineHeight: 1.6, marginTop: 16 }}>
            Join millions who trust Drexa to buy, sell, and grow their assets — with bank-grade security and zero hidden fees.
          </p>

          <div style={{ marginTop: 32, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 22, boxShadow: "var(--shadow-pop)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>Portfolio balance</div><div style={{ font: "600 28px var(--mono)", color: "var(--text-hi)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>$21,154.13</div></div>
              <DeltaPill v={10.62} />
            </div>
            <div style={{ margin: "16px -4px 0" }}>
              <Sparkline data={series(131, 36, 0.06, 21154)} up w={380} h={56} fill />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
            {([["shield", "Regulated & licensed in 180+ countries"], ["vault", "98% of assets held in cold storage"], ["lock", "Two-factor authentication on every account"]] as [string, string][]).map(([ic, t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--up-soft)" }}><Icon name={ic} size={18} color="var(--up)" /></span>
                <span style={{ font: "500 14px var(--font)", color: "var(--text)" }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 36, marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
            {stats.map(([v, l]) => (
              <div key={l}><div style={{ font: "700 24px var(--mono)", color: "var(--text-hi)", letterSpacing: "-.01em" }}>{v}</div><div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
