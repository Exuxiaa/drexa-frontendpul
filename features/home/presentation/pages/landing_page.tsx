"use client";

/* ── Drexa — landing homepage (logged-out marketing) ── */
import { CSSProperties, ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav, Footer } from "@/features/core/presentation/components/app_shell";
import {
  Icon, Card, Container, CoinBadge, Delta, DeltaPill, Sparkline, AreaChart,
  COINS, COIN, fUSD, fCompact, series,
} from "@/features/core/presentation/components/drexa_kit";
import { useScrollReveal } from "@/features/core/presentation/hooks/use_scroll_reveal";

const thL: CSSProperties = { textAlign: "left", padding: "16px 24px", fontWeight: 600 };
const thR: CSSProperties = { textAlign: "right", padding: "16px 24px", fontWeight: 600 };
const tdL: CSSProperties = { textAlign: "left", padding: "16px 24px" };
const tdR: CSSProperties = { textAlign: "right", padding: "16px 24px", fontVariantNumeric: "tabular-nums" };

function SectionHead({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
      <div>
        {eyebrow && <div style={{ font: "700 12.5px var(--font)", color: "var(--blue-hover)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div>}
        <h2 style={{ font: "700 34px var(--font)", color: "var(--text-hi)", letterSpacing: "-.02em", lineHeight: 1.1 }}>{title}</h2>
        {sub && <p style={{ font: "500 16px var(--font)", color: "var(--text-2)", marginTop: 10, maxWidth: 520, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function TextLink({ children }: { children: ReactNode }) {
  return <Link href="/markets" className="txt-link" style={{ font: "600 14.5px var(--font)", color: "var(--blue-hover)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>{children} <Icon name="arrowRight" size={16} color="var(--blue-hover)" stroke={2.2} /></Link>;
}

function Hero() {
  const router = useRouter();
  const pf = 21154.13;
  const chart = series(131, 40, 0.07, pf).map((v, _i, a) => v * (pf / a[a.length - 1]));
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 720, height: 520, left: "-180px", top: "-220px", background: "rgba(26,111,212,0.18)", borderRadius: "50%", filter: "blur(110px)", animation: "pulseGlow 7s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 520, height: 420, right: "-140px", top: "60px", background: "rgba(13,148,136,0.10)", borderRadius: "50%", filter: "blur(120px)", animation: "pulseGlow 7s ease-in-out infinite 3.5s" }} />
      </div>
      <Container style={{ position: "relative", padding: "88px 32px 80px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }}>
        <div style={{ animation: "fadeUpIn 0.8s ease 0.1s both" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 13px 6px 8px", borderRadius: "var(--r-pill)", background: "var(--card)", border: "1px solid var(--border)", font: "600 12.5px var(--font)", color: "var(--text-2)" }}>
            <span style={{ padding: "2px 8px", borderRadius: "var(--r-pill)", background: "var(--up-soft)", color: "var(--up)", font: "700 11px var(--font)" }}>NEW</span>
            Earn up to 5.2% APY on your stablecoins
          </span>
          <h1 style={{ font: "700 56px var(--font)", color: "var(--text-hi)", letterSpacing: "-.03em", lineHeight: 1.05, margin: "22px 0 0" }}>
            The simplest way to<br />buy and sell crypto
          </h1>
          <p style={{ font: "500 18px var(--font)", color: "var(--text-2)", lineHeight: 1.55, margin: "20px 0 0", maxWidth: 460 }}>
            Invest in Bitcoin, Ethereum, and 200+ assets with the security, simplicity, and trust you deserve.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 30, maxWidth: 460 }}>
            <input placeholder="Enter your email address" style={{ flex: 1, height: 54, padding: "0 18px", borderRadius: "var(--r-md)", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", font: "500 15px var(--font)", outline: "none" }} />
            <button onClick={() => router.push("/register")} className="btn-primary" style={{ height: 54, padding: "0 24px", borderRadius: "var(--r-md)", border: "none", background: "var(--blue)", color: "#fff", font: "600 15px var(--font)", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Get started <Icon name="arrowRight" size={18} color="#fff" stroke={2.2} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 26 }}>
            {([["Regulated & licensed", "shield"], ["Funds held 1:1", "lock"], ["5M+ users", "badge"]] as [string, string][]).map(([t, ic]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "500 13px var(--font)", color: "var(--text-3)" }}>
                <Icon name={ic} size={15} color="var(--up)" /> {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", height: 420 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "floatY 5s ease-in-out infinite 1.2s" }}>
            <Card pad={26} style={{ width: 400, boxShadow: "var(--shadow-pop)", animation: "fadeUpScaleIn 0.7s ease 0.2s both" }}>
              <div style={{ font: "500 13px var(--font)", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 7 }}>Portfolio balance <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--up)", display: "inline-block", animation: "livePulse 2s ease-in-out infinite" }} /></div>
              <div style={{ font: "600 38px var(--mono)", color: "var(--text-hi)", letterSpacing: "-.02em", margin: "6px 0 8px", fontVariantNumeric: "tabular-nums" }}>{fUSD(pf)}</div>
              <DeltaPill v={10.62} />
              <div style={{ margin: "18px -4px 0" }}><AreaChart data={chart} h={150} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 14 }}>
                {["BTC", "ETH", "SOL"].map((s, i) => {
                  const c = COIN(s)!;
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                      <CoinBadge sym={s} size={32} />
                      <div style={{ flex: 1 }}><div style={{ font: "600 13.5px var(--font)", color: "var(--text-hi)" }}>{c.name}</div><div style={{ font: "500 11.5px var(--font)", color: "var(--text-3)" }}>{s}</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ font: "600 13px var(--mono)", color: "var(--text-hi)" }}>{fUSD(c.price)}</div><Delta v={c.ch} size={11.5} /></div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          <div style={{ position: "absolute", top: 18, right: -6, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 15px", boxShadow: "var(--shadow-pop)", display: "flex", alignItems: "center", gap: 11, animation: "fadeUpIn 0.7s ease 0.55s both, floatChip 3.5s ease-in-out infinite 1.4s" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--up-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={18} color="var(--up)" stroke={2.6} /></span>
            <div><div style={{ font: "600 13px var(--font)", color: "var(--text-hi)" }}>Bought 0.05 BTC</div><div style={{ font: "500 11px var(--font)", color: "var(--text-3)" }}>Instantly settled</div></div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeaturedAssets() {
  const baseFeat = ["BTC", "ETH", "SOL", "LINK", "USDC", "ADA", "XRP", "DOT"].map(s => COIN(s)).filter(Boolean) as any[];
  const feat = [...baseFeat, ...baseFeat, ...baseFeat];

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const dragAmount = useRef(0);
  const lastTime = useRef(0);
  const exactScrollLeft = useRef(0);
  const speed = 0.05;

  useEffect(() => {
    let animationId: number;
    lastTime.current = performance.now();
    
    if (scrollRef.current) {
      exactScrollLeft.current = baseFeat.length * 300;
      scrollRef.current.scrollLeft = exactScrollLeft.current;
    }

    const scroll = (time: number) => {
      const delta = time - lastTime.current;
      lastTime.current = time;

      const el = scrollRef.current;
      if (el && !isDragging.current) {
        exactScrollLeft.current += speed * delta;
        const setWidth = baseFeat.length * 300;
        
        if (exactScrollLeft.current >= setWidth * 2) {
           exactScrollLeft.current -= setWidth;
        } else if (exactScrollLeft.current <= 0) {
           exactScrollLeft.current += setWidth;
        }
        
        el.scrollLeft = exactScrollLeft.current;
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [baseFeat.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current!.offsetLeft;
    startScrollLeft.current = exactScrollLeft.current;
    dragAmount.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    dragAmount.current += Math.abs(e.movementX);
    
    const el = scrollRef.current!;
    exactScrollLeft.current = startScrollLeft.current - walk;
    
    const setWidth = baseFeat.length * 300;
    if (exactScrollLeft.current >= setWidth * 2) {
      exactScrollLeft.current -= setWidth;
      startScrollLeft.current -= setWidth;
    } else if (exactScrollLeft.current <= 0) {
      exactScrollLeft.current += setWidth;
      startScrollLeft.current += setWidth;
    }
    
    el.scrollLeft = exactScrollLeft.current;
  };

  return (
    <section style={{ padding: "60px 0" }}>
      <Container>
        <SectionHead eyebrow="Featured" title="Popular assets to watch" action={<TextLink>View all markets</TextLink>} />
        <div style={{ 
          overflow: "hidden", 
          margin: "0 -16px", 
          padding: "16px",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
        }}>
          <div 
            ref={scrollRef}
            className="hide-scroll"
            style={{ display: "flex", gap: 20, width: "100%", overflowX: "auto", cursor: "grab" }}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => isDragging.current = false}
            onMouseUp={() => isDragging.current = false}
            onMouseMove={handleMouseMove}
          >
            {feat.map((c, i) => (
              <Link 
                key={c.sym + "-" + i} 
                href={`/markets`} 
                className="lift" 
                style={{ textDecoration: "none", width: 280, flexShrink: 0 }}
                onClick={(e) => { if (dragAmount.current > 5) e.preventDefault(); }}
                onDragStart={(e) => e.preventDefault()}
              >
                <Card pad={22} style={{ cursor: "inherit", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <CoinBadge sym={c.sym} size={44} />
                    <div><div style={{ font: "600 16px var(--font)", color: "var(--text-hi)" }}>{c.name}</div><div style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>{c.sym}</div></div>
                  </div>
                  <div style={{ font: "600 24px var(--mono)", color: "var(--text-hi)", letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums" }}>{fUSD(c.price, c.price < 1 ? 4 : 2)}</div>
                  <div style={{ marginTop: 6 }}><Delta v={c.ch} icon size={13.5} /></div>
                  <div style={{ margin: "16px -4px -2px" }}><Sparkline data={c.spark} up={c.ch >= 0} w={244} h={52} fill /></div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function MarketOverview() {
  const router = useRouter();
  const stats = [
    { label: "Total market cap", val: "$2.07T", d: -2.03 },
    { label: "24h volume", val: "$159.8B", d: 3.41 },
    { label: "BTC dominance", val: "59.85%", d: -0.10 },
    { label: "Active assets", val: "17,458", d: 1.12 },
  ];
  const rows = [...COINS].sort((a, b) => b.mcap - a.mcap).slice(0, 6);
  return (
    <section data-reveal="1" style={{ padding: "60px 0" }}>
      <Container>
        <SectionHead eyebrow="Markets" title="Market overview" sub="A real-time look at the assets moving the market today." action={<TextLink>Open market screener</TextLink>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <Card key={s.label} pad={20}>
              <div style={{ font: "500 13px var(--font)", color: "var(--text-3)" }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                <span style={{ font: "600 22px var(--mono)", color: "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{s.val}</span>
                <Delta v={s.d} size={12.5} />
              </div>
            </Card>
          ))}
        </div>
        <Card pad={0} style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ font: "600 11.5px var(--font)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
              <th style={thL}>Name</th><th style={thR}>Price</th><th style={thR}>24h</th><th style={thR}>Market cap</th><th style={thR}>Last 7 days</th><th style={{ width: 110 }}></th>
            </tr></thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.sym} className="mkt-row" style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={tdL}>
                    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <span style={{ font: "500 13px var(--mono)", color: "var(--text-3)", width: 16 }}>{i + 1}</span>
                      <CoinBadge sym={c.sym} size={36} />
                      <div><div style={{ font: "600 14.5px var(--font)", color: "var(--text-hi)" }}>{c.name}</div><div style={{ font: "500 12px var(--font)", color: "var(--text-3)" }}>{c.sym}</div></div>
                    </div>
                  </td>
                  <td style={{ ...tdR, font: "600 14.5px var(--mono)", color: "var(--text-hi)" }}>{fUSD(c.price, c.price < 1 ? 4 : 2)}</td>
                  <td style={tdR}><Delta v={c.ch} size={13.5} /></td>
                  <td style={{ ...tdR, font: "500 14px var(--mono)", color: "var(--text-2)" }}>{fCompact(c.mcap)}</td>
                  <td style={tdR}><div style={{ display: "flex", justifyContent: "flex-end" }}><Sparkline data={c.spark} up={c.ch >= 0} w={104} h={34} /></div></td>
                  <td style={{ ...tdR, paddingRight: 24 }}><button onClick={() => router.push("/trade?sym=" + c.sym)} className="trade-btn">Trade</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Container>
    </section>
  );
}

function TopMovers() {
  const router = useRouter();
  const [tab, setTab] = useState("gainers");
  const list = [...COINS].sort((a, b) => tab === "gainers" ? b.ch - a.ch : a.ch - b.ch).slice(0, 6);
  return (
    <section data-reveal="1" style={{ padding: "60px 0" }}>
      <Container>
        <SectionHead eyebrow="24h Movers" title="Today's top movers"
          action={
            <div style={{ display: "flex", gap: 4, background: "var(--card)", padding: 4, borderRadius: "var(--r-pill)", border: "1px solid var(--border)" }}>
              {([["gainers", "Top Gainers"], ["losers", "Top Losers"]] as [string, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  padding: "8px 18px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer",
                  background: tab === id ? "var(--blue)" : "transparent", color: tab === id ? "#fff" : "var(--text-2)", font: "600 13.5px var(--font)",
                }}>{label}</button>
              ))}
            </div>
          } />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {list.map(c => (
            <div key={c.sym} className="lift" onClick={() => router.push("/trade?sym=" + c.sym)}>
              <Card pad={20} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                <CoinBadge sym={c.sym} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 15px var(--font)", color: "var(--text-hi)" }}>{c.name}</div>
                  <div style={{ font: "600 14px var(--mono)", color: "var(--text-2)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{fUSD(c.price, c.price < 1 ? 4 : 2)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Sparkline data={c.spark} up={c.ch >= 0} w={72} h={32} />
                  <div style={{ marginTop: 6 }}><Delta v={c.ch} size={13} /></div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PortfolioPreview() {
  const alloc = [
    { sym: "BTC", pct: 39.8, color: "#F7931A" }, { sym: "ETH", pct: 27.0, color: "#627EEA" },
    { sym: "SOL", pct: 15.8, color: "#9945FF" }, { sym: "LINK", pct: 11.5, color: "#2A5ADA" },
    { sym: "USDC", pct: 5.9, color: "#2775CA" },
  ];
  const feats: [string, string][] = [
    ["Track everything in one view", "See balances, returns, and allocation across every asset at a glance."],
    ["Understand your performance", "Clear profit & loss and growth charts — no spreadsheets required."],
    ["Stay ahead with price alerts", "Get notified the moment an asset hits the price you care about."],
  ];
  return (
    <section style={{ padding: "60px 0" }}>
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 56, alignItems: "center" }}>
          <div data-reveal="slide-left">
            <SectionHead eyebrow="Portfolio" title="Your whole portfolio, beautifully clear" sub="Drexa brings every holding together so you always know exactly where you stand." />
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 4 }}>
              {feats.map(([t, d]) => (
                <div key={t} style={{ display: "flex", gap: 14 }}>
                  <span style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--blue-soft)" }}><Icon name="check" size={18} color="var(--blue-hover)" stroke={2.4} /></span>
                  <div><div style={{ font: "600 15.5px var(--font)", color: "var(--text-hi)" }}>{t}</div><div style={{ font: "500 14px var(--font)", color: "var(--text-2)", marginTop: 3, lineHeight: 1.5 }}>{d}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div data-reveal="slide-right">
          <Card pad={28} style={{ boxShadow: "var(--shadow-pop)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div><div style={{ font: "500 13px var(--font)", color: "var(--text-3)" }}>Total balance</div><div style={{ font: "600 32px var(--mono)", color: "var(--text-hi)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>$21,154.13</div></div>
              <DeltaPill v={10.62} />
            </div>
            <div style={{ font: "600 13px var(--font)", color: "var(--text-2)", marginBottom: 12 }}>Asset allocation</div>
            <div style={{ display: "flex", height: 12, borderRadius: "var(--r-pill)", overflow: "hidden", gap: 2, marginBottom: 20 }}>
              {alloc.map(a => <div key={a.sym} style={{ width: a.pct + "%", background: a.color }} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              {alloc.map(a => (
                <div key={a.sym} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: a.color, flex: "none" }} />
                  <span style={{ font: "600 13px var(--font)", color: "var(--text-hi)", flex: 1 }}>{a.sym}</span>
                  <span style={{ font: "500 13px var(--mono)", color: "var(--text-3)" }}>{a.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Security() {
  const items: [string, string, string][] = [
    ["vault", "98% in cold storage", "The vast majority of assets are kept offline in geographically distributed cold storage."],
    ["lock", "Two-factor everything", "Secure every sensitive action with 2FA, biometrics, and anti-phishing codes."],
    ["shield", "Regulated & insured", "Licensed across major markets with funds held 1:1 and crime insurance coverage."],
    ["badge", "Withdrawal whitelist", "Lock withdrawals to addresses you trust so your funds only go where you allow."],
  ];
  return (
    <section style={{ padding: "60px 0" }}>
      <Container>
        <SectionHead eyebrow="Security" title="Built to protect your assets" sub="Security isn't a feature — it's the foundation. Here's how we keep your crypto safe." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {items.map(([ic, t, d], i) => (
            <div key={t} data-reveal="1" data-reveal-delay={i + 1}>
              <Card pad={24}>
                <span style={{ width: 52, height: 52, borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--up-soft)", marginBottom: 18 }}><Icon name={ic} size={25} color="var(--up)" /></span>
                <div style={{ font: "600 17px var(--font)", color: "var(--text-hi)", letterSpacing: "-.01em" }}>{t}</div>
                <p style={{ font: "500 13.5px var(--font)", color: "var(--text-2)", lineHeight: 1.55, marginTop: 8 }}>{d}</p>
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTA() {
  const router = useRouter();
  return (
    <section style={{ padding: "60px 0 20px" }}>
      <Container>
        <div data-reveal="scale" style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", border: "1px solid var(--border-strong)", background: "linear-gradient(135deg, rgba(26,111,212,0.16), rgba(13,148,136,0.06))", padding: "64px 48px", textAlign: "center" }}>
          <div style={{ position: "absolute", width: 520, height: 360, left: "50%", top: "-180px", transform: "translateX(-50%)", background: "rgba(26,111,212,0.18)", borderRadius: "50%", filter: "blur(110px)", pointerEvents: "none", animation: "ctaGlow 4.5s ease-in-out infinite" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ font: "700 40px var(--font)", color: "var(--text-hi)", letterSpacing: "-.02em", lineHeight: 1.1 }}>Start your crypto journey today</h2>
            <p style={{ font: "500 17px var(--font)", color: "var(--text-2)", marginTop: 14, maxWidth: 480, marginInline: "auto", lineHeight: 1.5 }}>Create your free account in minutes and make your first trade with zero fees.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 30 }}>
              <button onClick={() => router.push("/register")} className="btn-primary" style={{ height: 52, padding: "0 28px", borderRadius: "var(--r-md)", border: "none", background: "var(--blue)", color: "#fff", font: "600 15.5px var(--font)", cursor: "pointer" }}>Get started</button>
              <button onClick={() => router.push("/markets")} className="btn-ghost" style={{ height: 52, padding: "0 28px", borderRadius: "var(--r-md)", border: "1px solid var(--border-strong)", background: "var(--card)", color: "var(--text-hi)", font: "600 15.5px var(--font)", cursor: "pointer" }}>Explore markets</button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function LandingPage() {
  useScrollReveal();
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />
      <main>
        <Hero />
        <FeaturedAssets />
        <MarketOverview />
        <TopMovers />
        <PortfolioPreview />
        <Security />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
