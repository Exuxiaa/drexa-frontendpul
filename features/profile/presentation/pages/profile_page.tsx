"use client";

/* ── Drexa — Profile / Account (ported from the Claude Design handoff) ── */
import { CSSProperties, ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/features/core/presentation/components/app_shell";
import { Icon, Container, Avatar, USER } from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";
import { api } from "@/lib/api";

/* ---- local primitives -------------------------------------------- */
function Card({ children, style, pad = 26 }: { children: ReactNode; style?: CSSProperties; pad?: number }) {
  return <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: pad, boxShadow: "var(--shadow-card)", ...style }}>{children}</div>;
}
function CardHead({ icon, title, sub, action }: { icon?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 22 }}>
      {icon && <span style={{ width: 42, height: 42, borderRadius: "var(--r-md)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--blue-soft)" }}><Icon name={icon} size={20} color="var(--blue-hover)" /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "700 17px var(--font)", color: "var(--text-hi)", letterSpacing: "-.01em" }}>{title}</div>
        {sub && <div style={{ font: "500 13px var(--font)", color: "var(--text-3)", marginTop: 3, lineHeight: 1.5 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 46, height: 27, borderRadius: 999, border: "none", cursor: "pointer", background: on ? "var(--up)" : "var(--card-2)", position: "relative", transition: "background .18s", flex: "none" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .2s cubic-bezier(.3,1.4,.5,1)", boxShadow: "0 1px 3px rgba(0,0,0,.35)" }} />
    </button>
  );
}
function GhostBtn({ children, icon, onClick, danger, primary }: { children: ReactNode; icon?: string; onClick?: () => void; danger?: boolean; primary?: boolean }) {
  const base: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: "var(--r-pill)", font: "600 13px var(--font)", cursor: "pointer", whiteSpace: "nowrap", transition: "background .14s, border-color .14s, color .14s" };
  const cls = primary ? "pf-prim" : danger ? "pf-danger" : "pf-ghost";
  const st: CSSProperties = primary
    ? { ...base, border: "none", background: "var(--blue)", color: "#fff" }
    : danger
      ? { ...base, border: "1px solid var(--border)", background: "transparent", color: "var(--down)" }
      : { ...base, border: "1px solid var(--border)", background: "transparent", color: "var(--text)" };
  return <button className={cls} onClick={onClick} style={st}>{icon && <Icon name={icon} size={15} color="currentColor" />}{children}</button>;
}

/* ---- Personal info ----------------------------------------------- */
interface FieldDef { k: string; label: string; icon: string; val: string; verified?: boolean }
const FIELDS: FieldDef[] = [
  { k: "name", label: "Full name", icon: "user", val: USER.name },
  { k: "email", label: "Email address", icon: "mail", val: USER.email, verified: true },
  { k: "phone", label: "Phone number", icon: "phone", val: "+1 (415) 832 ••• 47", verified: true },
  { k: "country", label: "Country / Region", icon: "globe", val: "United States" },
  { k: "lang", label: "Language", icon: "globe", val: "English (US)" },
  { k: "tz", label: "Timezone", icon: "clock2", val: "GMT−08:00 · Pacific Time" },
];
function PersonalInfo() {
  const [editing, setEditing] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(FIELDS.map(f => [f.k, f.val])));
  const [draft, setDraft] = useState<Record<string, string>>(vals);
  const start = () => { setDraft(vals); setEditing(true); };
  const save = () => { setVals(draft); setEditing(false); };
  return (
    <Card>
      <CardHead icon="user" title="Personal information" sub="This information is private and used to secure your account."
        action={editing
          ? <div style={{ display: "flex", gap: 8 }}><GhostBtn onClick={() => setEditing(false)}>Cancel</GhostBtn><GhostBtn primary icon="check" onClick={save}>Save changes</GhostBtn></div>
          : <GhostBtn icon="edit" onClick={start}>Edit</GhostBtn>} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "4px 0 22px", marginBottom: 22, borderBottom: "1px solid var(--border)" }}>
        <Avatar size={68} badge />
        <div style={{ flex: 1 }}>
          <div style={{ font: "700 16px var(--font)", color: "var(--text-hi)" }}>{vals.name}</div>
          <div style={{ font: "500 13px var(--font)", color: "var(--text-3)", marginTop: 2 }}>Profile photo · PNG or JPG, max 4MB</div>
        </div>
        <GhostBtn icon="camera">Change photo</GhostBtn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>
        {FIELDS.map(f => (
          <div key={f.k} style={f.k === "tz" ? { gridColumn: "1 / -1" } : undefined}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, font: "600 12px var(--font)", color: "var(--text-3)", marginBottom: 8, letterSpacing: ".02em", textTransform: "uppercase" }}>{f.label}{f.verified && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--up)", textTransform: "none", letterSpacing: 0, font: "600 11px var(--font)" }}><Icon name="verified" size={12} color="var(--up)" />Verified</span>}</label>
            {editing
              ? <input value={draft[f.k]} onChange={e => setDraft({ ...draft, [f.k]: e.target.value })} className="pf-input" style={{ width: "100%", height: 46, padding: "0 14px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--inset)", color: "var(--text-hi)", font: "500 14.5px var(--font)", outline: "none" }} />
              : <div style={{ display: "flex", alignItems: "center", gap: 11, height: 46, padding: "0 14px", borderRadius: "var(--r-md)", background: "var(--inset)", border: "1px solid var(--border-soft)" }}>
                  <Icon name={f.icon} size={17} color="var(--text-3)" />
                  <span style={{ font: "600 14.5px var(--font)", color: "var(--text-hi)" }}>{vals[f.k]}</span>
                </div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---- Security ---------------------------------------------------- */
function SecRow({ icon, title, sub, right, last }: { icon: string; title: string; sub: string; right?: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 15, padding: "18px 0", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <span style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--card-2)" }}><Icon name={icon} size={19} color="var(--text-2)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "600 14.5px var(--font)", color: "var(--text-hi)" }}>{title}</div>
        <div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 2 }}>{sub}</div>
      </div>
      {right}
    </div>
  );
}
const DEVICES = [
  { dev: "MacBook Pro · Chrome", loc: "San Francisco, US", time: "Active now", current: true },
  { dev: "iPhone 15 Pro · Drexa App", loc: "San Francisco, US", time: "2 hours ago", current: false },
  { dev: "Windows · Firefox", loc: "New York, US", time: "Jun 12, 2026", current: false },
];
function Security() {
  const [twoFA, setTwoFA] = useState({ app: true, sms: false, email: true });
  const StatusPill = ({ on }: { on: boolean }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: "var(--r-pill)", font: "600 11.5px var(--font)", background: on ? "var(--up-soft)" : "var(--card-2)", color: on ? "var(--up)" : "var(--text-3)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "var(--up)" : "var(--text-4)" }} />{on ? "Enabled" : "Off"}
    </span>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <CardHead icon="shield" title="Two-factor authentication" sub="Add a second layer of protection when you sign in or withdraw." />
        <SecRow icon="lock" title="Authenticator app" sub="Google Authenticator · Authy · 1Password"
          right={<div style={{ display: "flex", alignItems: "center", gap: 14 }}><StatusPill on={twoFA.app} /><Toggle on={twoFA.app} onClick={() => setTwoFA({ ...twoFA, app: !twoFA.app })} /></div>} />
        <SecRow icon="phone" title="SMS authentication" sub="Receive a one-time code by text message"
          right={<div style={{ display: "flex", alignItems: "center", gap: 14 }}><StatusPill on={twoFA.sms} /><Toggle on={twoFA.sms} onClick={() => setTwoFA({ ...twoFA, sms: !twoFA.sms })} /></div>} />
        <SecRow icon="mail" title="Email authentication" sub="Receive a one-time code at your inbox" last
          right={<div style={{ display: "flex", alignItems: "center", gap: 14 }}><StatusPill on={twoFA.email} /><Toggle on={twoFA.email} onClick={() => setTwoFA({ ...twoFA, email: !twoFA.email })} /></div>} />
      </Card>
      <Card>
        <CardHead icon="key" title="Password & sign-in" sub="Manage how you access your Drexa account." />
        <SecRow icon="lock" title="Password" sub="Last changed 3 months ago" right={<GhostBtn>Change password</GhostBtn>} />
        <SecRow icon="key" title="Passkeys" sub="Sign in with Face ID or Touch ID — no password" right={<GhostBtn icon="offer">Add passkey</GhostBtn>} />
        <SecRow icon="badge" title="Anti-phishing code" sub="A code shown in every genuine Drexa email" last right={<span style={{ font: "600 14px var(--mono)", color: "var(--text-hi)", letterSpacing: ".06em" }}>DRX-9X4K</span>} />
      </Card>
      <Card pad={0}>
        <div style={{ padding: "26px 26px 6px" }}>
          <CardHead icon="device" title="Active sessions" sub="Devices currently signed in to your account."
            action={<GhostBtn danger icon="logout">Sign out all</GhostBtn>} />
        </div>
        <div style={{ padding: "0 26px 12px" }}>
          {DEVICES.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 15, padding: "15px 0", borderBottom: i === DEVICES.length - 1 ? "none" : "1px solid var(--border)" }}>
              <span style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--card-2)" }}><Icon name="device" size={19} color="var(--text-2)" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ font: "600 14px var(--font)", color: "var(--text-hi)" }}>{d.dev}</span>
                  {d.current && <span style={{ font: "600 10.5px var(--font)", color: "var(--up)", background: "var(--up-soft)", padding: "2px 8px", borderRadius: "var(--r-pill)", letterSpacing: ".02em" }}>THIS DEVICE</span>}
                </div>
                <div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 2 }}>{d.loc} · {d.time}</div>
              </div>
              {!d.current && <button className="pf-danger" style={{ height: 34, padding: "0 14px", borderRadius: "var(--r-pill)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", font: "600 12.5px var(--font)", cursor: "pointer" }}>Revoke</button>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---- Verification / KYC ------------------------------------------ */
const KYC_LEVELS = [
  { lvl: 1, title: "Email & phone", sub: "Verify your contact details", state: "done", limit: "Browse & deposit" },
  { lvl: 2, title: "Identity verification", sub: "Government ID + selfie check", state: "done", limit: "Up to $100,000 / day" },
  { lvl: 3, title: "Proof of address", sub: "Utility bill or bank statement", state: "pending", limit: "Unlimited withdrawals" },
];
function Verification() {
  const done = KYC_LEVELS.filter(l => l.state === "done").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <span style={{ width: 56, height: 56, borderRadius: "var(--r-md)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--up-soft)" }}><Icon name="verified" size={28} color="var(--up)" /></span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ font: "700 19px var(--font)", color: "var(--text-hi)", letterSpacing: "-.01em" }}>Identity verified</span>
              <span style={{ font: "600 11.5px var(--font)", color: "var(--up)", background: "var(--up-soft)", padding: "3px 10px", borderRadius: "var(--r-pill)" }}>LEVEL 2</span>
            </div>
            <div style={{ font: "500 13.5px var(--font)", color: "var(--text-3)", marginTop: 3 }}>Complete proof of address to unlock unlimited withdrawals.</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ font: "700 22px var(--mono)", color: "var(--text-hi)" }}>{done}/3</div>
            <div style={{ font: "600 11px var(--font)", color: "var(--text-3)", letterSpacing: ".04em" }}>STEPS DONE</div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--inset)", overflow: "hidden", marginBottom: 26 }}>
          <div style={{ width: `${(done / 3) * 100}%`, height: "100%", background: "var(--blue-grad)", borderRadius: 999, transition: "width .4s" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {KYC_LEVELS.map(l => {
            const isDone = l.state === "done";
            return (
              <div key={l.lvl} style={{ display: "flex", alignItems: "center", gap: 15, padding: 16, borderRadius: "var(--r-md)", background: "var(--inset)", border: "1px solid var(--border-soft)" }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "var(--up)" : "var(--card-2)", border: isDone ? "none" : "1.5px solid var(--border-strong)" }}>
                  {isDone ? <Icon name="check" size={18} color="#fff" stroke={3} /> : <span style={{ font: "700 14px var(--mono)", color: "var(--text-3)" }}>{l.lvl}</span>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 14.5px var(--font)", color: "var(--text-hi)" }}>{l.title}</div>
                  <div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)", marginTop: 2 }}>{l.sub} · <span style={{ color: "var(--text-2)" }}>{l.limit}</span></div>
                </div>
                {isDone
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "600 12.5px var(--font)", color: "var(--up)" }}><Icon name="verified" size={14} color="var(--up)" />Verified</span>
                  : <GhostBtn primary icon="arrowRight">Continue</GhostBtn>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ---- Page shell -------------------------------------------------- */
const TABS = [
  { id: "personal", label: "Personal info", icon: "user" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "verification", label: "Verification", icon: "verified" },
];
export function ProfilePage() {
  useScrollReveal();
  const router = useRouter();
  const [tab, setTab] = useState("personal");

  const onLogout = async () => { await api.post("/auth/logout").catch(() => {}); router.replace("/login"); };

  return (
    <AppShell>
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--navbar)", position: "relative", overflow: "hidden", animation: "fadeUpIn 0.6s ease both" }}>
        <div style={{ position: "absolute", width: 560, height: 320, left: "8%", top: "-180px", background: "rgba(26,111,212,0.16)", borderRadius: "50%", filter: "blur(110px)", pointerEvents: "none" }} />
        <Container style={{ padding: "40px 32px 36px", position: "relative" }}>
          <div style={{ font: "600 12.5px var(--font)", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
            <Link href="/" className="txt-link" style={{ color: "var(--text-3)", textDecoration: "none" }}>Home</Link>
            <Icon name="chevRight" size={13} color="var(--text-4)" />
            <span style={{ color: "var(--text-2)" }}>Account</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Avatar size={84} badge />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h1 style={{ font: "700 30px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>{USER.name}</h1>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "600 12px var(--font)", color: "var(--up)", background: "var(--up-soft)", padding: "5px 12px", borderRadius: "var(--r-pill)" }}><Icon name="verified" size={14} color="var(--up)" />Verified · Level 2</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 9, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "500 13.5px var(--font)", color: "var(--text-3)" }}><Icon name="mail" size={15} color="var(--text-3)" />{USER.email}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "500 13.5px var(--font)", color: "var(--text-3)" }}><Icon name="clock2" size={15} color="var(--text-3)" />Member since {USER.since}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ padding: "34px 32px 70px", display: "grid", gridTemplateColumns: "244px 1fr", gap: 34, alignItems: "start" }}>
        <nav data-reveal="slide-left" style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} className="pf-tab" onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", textAlign: "left",
                background: on ? "var(--blue-soft)" : "transparent", color: on ? "var(--text-hi)" : "var(--text-2)", font: "600 14px var(--font)", transition: "background .14s, color .14s",
              }}>
                <Icon name={t.icon} size={18} color={on ? "var(--blue-hover)" : "var(--text-3)"} />{t.label}
              </button>
            );
          })}
          <div style={{ height: 1, background: "var(--border)", margin: "10px 6px" }} />
          <button onClick={onLogout} className="pf-tab" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--r-md)", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", color: "var(--down)", font: "600 14px var(--font)" }}>
            <Icon name="logout" size={18} color="var(--down)" />Sign out
          </button>
        </nav>
        <div data-reveal="slide-right" style={{ minWidth: 0 }}>
          {tab === "personal" && <PersonalInfo />}
          {tab === "security" && <Security />}
          {tab === "verification" && <Verification />}
        </div>
      </Container>
    </AppShell>
  );
}
