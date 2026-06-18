"use client";

/* ============================================================================
   Drexa — application shell: Coinbase-style top nav (hover dropdowns) + footer.
   Ported from the design bundle (shell.jsx) and wired to the Next.js router.
   ========================================================================= */
import React, { CSSProperties, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Logo } from "./drexa_kit";
import { api } from "@/lib/api";

interface MenuItem { icon: string; title: string; sub: string; href?: string; }
interface Menu { id: string; label: string; href: string; items: MenuItem[]; }

const MENUS: Menu[] = [
  { id: "markets", label: "Markets", href: "/markets", items: [
    { icon: "markets", title: "All Markets", sub: "Browse every listed asset", href: "/markets" },
    { icon: "gain", title: "Top Gainers", sub: "Biggest 24h moves up", href: "/markets?f=gainers" },
    { icon: "loss", title: "Top Losers", sub: "Biggest 24h moves down", href: "/markets?f=losers" },
    { icon: "star", title: "Watchlist", sub: "Assets you follow", href: "/markets?f=watchlist" },
    { icon: "screener", title: "Market Screener", sub: "Filter by your criteria", href: "/markets" },
  ] },
  { id: "trade", label: "Trade", href: "/trade", items: [
    { icon: "spot", title: "Spot Trading", sub: "Buy & sell at market", href: "/trade" },
    { icon: "convert", title: "Convert", sub: "Swap one asset for another" },
    { icon: "orders", title: "Open Orders", sub: "Track active orders", href: "/trade" },
    { icon: "history", title: "Order History", sub: "Past order activity", href: "/trade" },
    { icon: "trades", title: "Trade History", sub: "Your filled trades", href: "/trade" },
  ] },
  { id: "p2p", label: "P2P", href: "/p2p", items: [
    { icon: "buy", title: "Buy Crypto", sub: "From verified merchants", href: "/p2p" },
    { icon: "sell", title: "Sell Crypto", sub: "Cash out peer-to-peer", href: "/p2p" },
    { icon: "offer", title: "Create Offer", sub: "Set your own terms", href: "/p2p" },
    { icon: "myorders", title: "My Orders", sub: "Manage your P2P trades", href: "/p2p" },
  ] },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", items: [
    { icon: "overview", title: "Overview", sub: "Your holdings at a glance", href: "/portfolio" },
    { icon: "performance", title: "Performance", sub: "Returns over time", href: "/portfolio" },
    { icon: "pie", title: "Asset Allocation", sub: "How your capital is split", href: "/portfolio" },
    { icon: "alerts", title: "Price Alerts", sub: "Get notified on moves" },
  ] },
  { id: "wallet", label: "Wallet", href: "/wallet", items: [
    { icon: "assets", title: "Assets", sub: "All balances in one place", href: "/wallet" },
    { icon: "deposit", title: "Deposit", sub: "Fund your account", href: "/wallet" },
    { icon: "withdraw", title: "Withdraw", sub: "Move funds out", href: "/wallet" },
    { icon: "history", title: "Transaction History", sub: "Every deposit & withdrawal", href: "/wallet" },
  ] },
];

function Dropdown({ items, style }: { items: MenuItem[], style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: 10, zIndex: 60, ...style }}>
      <div className="dd-panel" style={{
        width: 332, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-pop)", padding: 8,
      }}>
        {items.map((it, i) => {
          const inner = (
            <>
              <span style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--blue-soft)" }}>
                <Icon name={it.icon} size={19} color="var(--blue-hover)" />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", font: "600 14px var(--font)", color: "var(--text-hi)" }}>{it.title}</span>
                <span style={{ display: "block", font: "500 12px var(--font)", color: "var(--text-3)", marginTop: 1 }}>{it.sub}</span>
              </span>
            </>
          );
          const cls = "dd-item";
          const style: CSSProperties = { display: "flex", alignItems: "center", gap: 13, padding: "11px 12px", borderRadius: "var(--r-md)", textDecoration: "none" };
          return it.href
            ? <Link key={i} href={it.href} className={cls} style={style}>{inner}</Link>
            : <a key={i} href="#" onClick={e => e.preventDefault()} className={cls} style={style}>{inner}</a>;
        })}
      </div>
    </div>
  );
}

export function TopNav({ authed = false }: { authed?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [lastOpen, setLastOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, opacity: 0 });
  const navRef = React.useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onS); return () => window.removeEventListener("scroll", onS);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setLastOpen(open);
    
    if (!open) {
      setIndicator(p => ({ ...p, opacity: 0 }));
      return;
    }
    
    const nav = navRef.current;
    if (!nav) return;
    const el = nav.querySelector(`[data-id="${open}"]`) as HTMLElement;
    if (el) {
      setIndicator({ left: el.offsetLeft + el.offsetWidth / 2, opacity: 1 });
    }
  }, [open]);

  const onLogout = async () => { await api.post("/auth/logout").catch(() => {}); router.replace("/login"); };

  const activeMenu = MENUS.find(m => m.id === (open || lastOpen)) || MENUS[0];

  return (
    <header style={{
      height: "var(--topbar-h)", position: "sticky", top: 0, zIndex: 50,
      borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
      background: scrolled ? "rgba(10,14,26,.82)" : "rgba(10,14,26,.5)", backdropFilter: "blur(16px)", transition: "border-color .2s, background .2s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href={authed ? "/portfolio" : "/"} style={{ textDecoration: "none", marginRight: 18 }}><Logo /></Link>
        <nav ref={navRef} style={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }} onMouseLeave={() => setOpen(null)}>
          {MENUS.map(m => {
            const active = open === m.id || pathname.startsWith(m.href);
            return (
              <div key={m.id} data-id={m.id} style={{ position: "relative" }} onMouseEnter={() => setOpen(m.id)}>
                <Link href={m.href} className="nav-link" style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: "var(--r-sm)",
                  border: "none", cursor: "pointer", textDecoration: "none", background: active ? "var(--card)" : "transparent",
                  color: active ? "var(--text-hi)" : "var(--text-2)", font: "600 14.5px var(--font)",
                }}>
                  {m.label}<Icon name="chevDown" size={15} color="currentColor" style={{ transform: open === m.id ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
                </Link>
              </div>
            );
          })}
          <Dropdown 
            items={activeMenu.items} 
            style={{ 
              left: indicator.left, 
              opacity: indicator.opacity, 
              visibility: indicator.opacity ? "visible" : "hidden",
              transition: "left 0.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s" 
            }} 
          />
        </nav>
        <div style={{ flex: 1 }} />
        {authed ? (
          <>
            <button onClick={onLogout} className="nav-ghost" style={{ height: 42, padding: "0 16px", borderRadius: "var(--r-pill)", border: "none", background: "transparent", color: "var(--text)", font: "600 14px var(--font)", cursor: "pointer" }}>Sign out</button>
            <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--blue-grad)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 14px var(--font)", color: "#fff" }}>MR</span>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-ghost" style={{ display: "inline-flex", alignItems: "center", height: 42, padding: "0 16px", borderRadius: "var(--r-pill)", border: "none", background: "transparent", color: "var(--text)", font: "600 14px var(--font)", cursor: "pointer", textDecoration: "none" }}>Sign in</Link>
            <Link href="/register" className="nav-cta" style={{ display: "inline-flex", alignItems: "center", height: 42, padding: "0 20px", borderRadius: "var(--r-pill)", border: "none", background: "var(--blue)", color: "#fff", font: "600 14px var(--font)", cursor: "pointer", textDecoration: "none" }}>Get started</Link>
          </>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const cols = [
    { h: "Products", links: ["Markets", "Spot Trading", "Convert", "P2P Trading", "Wallet"] },
    { h: "Company", links: ["About", "Careers", "Blog", "Press", "Security"] },
    { h: "Support", links: ["Help Center", "Contact Us", "System Status", "Fee Schedule", "API Docs"] },
    { h: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclosures"] },
  ];
  const socials = ["twitter", "linkedin", "discord"];
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--navbar)", marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 40 }}>
          <div>
            <Logo />
            <p style={{ font: "500 13.5px var(--font)", color: "var(--text-3)", lineHeight: 1.6, marginTop: 16, maxWidth: 240 }}>
              The simplest, most secure way to buy, sell, and grow your crypto.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {socials.map(s => (
                <a key={s} href="#" onClick={e => e.preventDefault()} className="soc" style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                  <Icon name={s} size={17} color="var(--text-2)" stroke={s === "twitter" ? 0 : 1.8} style={s === "twitter" ? { fill: "var(--text-2)" } : undefined} />
                </a>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ font: "700 13px var(--font)", color: "var(--text-hi)", marginBottom: 16, letterSpacing: ".01em" }}>{c.h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {c.links.map(l => <a key={l} href="#" onClick={e => e.preventDefault()} className="foot-link" style={{ font: "500 13.5px var(--font)", color: "var(--text-2)", textDecoration: "none" }}>{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 48, paddingTop: 26, borderTop: "1px solid var(--border)" }}>
          <span style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>© 2026 Drexa. All rights reserved.</span>
          <span style={{ font: "500 12.5px var(--font)", color: "var(--text-3)" }}>Crypto investments carry risk. Not financial advice.</span>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav authed />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
