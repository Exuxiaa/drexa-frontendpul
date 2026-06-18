"use client";

/* ============================================================================
   Drexa — shared UI kit (Coinbase-inspired premium dark design system).
   Ported from the Claude Design handoff bundle (shell.jsx) to typed TSX.
   ========================================================================= */
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

/* ============================================================ ICONS */
export const ICONS: Record<string, string> = {
  markets:  '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  gain:     '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  loss:     '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',
  star:     '<path d="M11.5 2.8a.6.6 0 0 1 1 0l2.4 5a.6.6 0 0 0 .5.3l5.4.5a.6.6 0 0 1 .3 1l-4 3.6a.6.6 0 0 0-.2.6l1.2 5.3a.6.6 0 0 1-.9.6l-4.6-2.8a.6.6 0 0 0-.6 0l-4.6 2.8a.6.6 0 0 1-.9-.6l1.2-5.3a.6.6 0 0 0-.2-.6l-4-3.6a.6.6 0 0 1 .3-1l5.4-.5a.6.6 0 0 0 .5-.3Z"/>',
  screener: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  spot:     '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
  convert:  '<path d="M3 9 7 5l4 4"/><path d="M7 5v9a2 2 0 0 0 2 2h3"/><path d="m21 15-4 4-4-4"/><path d="M17 19v-9a2 2 0 0 0-2-2h-3"/>',
  orders:   '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  history:  '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  trades:   '<path d="M14 2v6h6"/><path d="M4 22V4a2 2 0 0 1 2-2h8l6 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="m9 14 2 2 4-4"/>',
  buy:      '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  sell:     '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  offer:    '<path d="M5 12h14"/><path d="M12 5v14"/>',
  myorders: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  overview: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  performance:'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  pie:      '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  alerts:   '<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>',
  assets:   '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/><circle cx="17" cy="14" r="1"/>',
  deposit:  '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  withdraw: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
  search:   '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  arrowUp:  '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowDown:'<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  arrowRight:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevRight:'<path d="m9 18 6-6-6-6"/>',
  shield:   '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/>',
  lock:     '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  vault:    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v1"/><path d="M12 15v1"/><path d="m9.5 9.5.7.7"/><path d="m13.8 13.8.7.7"/>',
  badge:    '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  check:    '<path d="M20 6 9 17l-5-5"/>',
  eye:      '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:   '<path d="M10.7 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.4M6.6 6.6A13.3 13.3 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  mail:     '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  apple:    '<path d="M12 20.94c1.5 0 2.75-1.06 4-1.06 1.25 0 2.5 1.06 4 1.06M12 20.94c-1.5 0-2.75-1.06-4-1.06M16 8c1.5 0 3 1 3 3.5 0 2-1 3.5-2 5.5M8 8c-1.5 0-3 1-3 3.5 0 2 1 3.5 2 5.5M12 8c0-2 1.5-4 4-4M12 8c0-2-1.5-4-4-4"/>',
  twitter:  '<path d="M18 2h3l-7.5 8.6L22 22h-6.3l-4.9-6.4L5 22H2l8-9.2L2 2h6.4l4.4 5.9Z"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  discord:  '<path d="M9 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"/><path d="M14 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"/><path d="M7 16.5c3 1.5 7 1.5 10 0"/><path d="M8.5 5.5C6 6 4 8 3.5 11c-.5 3 0 6 1.5 8 1-.3 2-1 2.5-2M15.5 5.5C18 6 20 8 20.5 11c.5 3 0 6-1.5 8-1-.3-2-1-2.5-2"/>',
  copy:     '<rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/>',
  qr:       '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  chat:     '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  bank:     '<path d="m3 10 9-6 9 6"/><path d="M4 10v9"/><path d="M20 10v9"/><path d="M8 10v9"/><path d="M16 10v9"/><path d="M12 10v9"/><path d="M2 21h20"/>',
  transfer: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  clock2:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  verified: '<path d="m9 12 2 2 4-4"/><path d="M12 3 4 6v6c0 4 3 7 8 9 5-2 8-5 8-9V6Z"/>',
  logout:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
};

export function Icon({ name, size = 20, color = "currentColor", stroke = 1.9, style }: {
  name: string; size?: number; color?: string; stroke?: number; style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />
  );
}

/* ============================================================ LOGO */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ flex: "none", display: "block" }}>
      <defs><linearGradient id="dxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3D8EF0" /><stop offset="1" stopColor="#1A6FD4" /></linearGradient></defs>
      <rect x="1.5" y="1.5" width="33" height="33" rx="10.5" fill="url(#dxg)" />
      <rect x="1.5" y="1.5" width="33" height="33" rx="10.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path d="M9 23.5 15 16.5 19 20.5 27 11.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="11.5" r="2.4" fill="#fff" />
    </svg>
  );
}
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <LogoMark size={size} />
      <span style={{ font: "700 20px var(--font)", color: "var(--text-hi)", letterSpacing: "-.025em" }}>Drexa</span>
    </div>
  );
}

/* ============================================================ COIN BADGE */
export const COIN_STYLE: Record<string, { bg: string; glyph: string; fg: string }> = {
  BTC: { bg: "#F7931A", glyph: "₿", fg: "#fff" }, ETH: { bg: "#627EEA", glyph: "Ξ", fg: "#fff" },
  SOL: { bg: "linear-gradient(135deg,#9945FF,#14F195)", glyph: "S", fg: "#fff" },
  USDC: { bg: "#2775CA", glyph: "$", fg: "#fff" }, USDT: { bg: "#26A17B", glyph: "₮", fg: "#fff" }, BNB: { bg: "#F3BA2F", glyph: "B", fg: "#0b1020" },
  XRP: { bg: "#23292F", glyph: "X", fg: "#fff" }, ADA: { bg: "#0033AD", glyph: "₳", fg: "#fff" },
  DOGE: { bg: "#C2A633", glyph: "Ð", fg: "#0b1020" }, AVAX: { bg: "#E84142", glyph: "A", fg: "#fff" },
  LINK: { bg: "#2A5ADA", glyph: "L", fg: "#fff" }, DOT: { bg: "#E6007A", glyph: "●", fg: "#fff" },
  MATIC: { bg: "#8247E5", glyph: "M", fg: "#fff" }, LTC: { bg: "#345D9D", glyph: "Ł", fg: "#fff" },
  UNI: { bg: "#FF007A", glyph: "U", fg: "#fff" }, ATOM: { bg: "#2E3148", glyph: "⚛", fg: "#fff" },
  XLM: { bg: "#0E1A2B", glyph: "✦", fg: "#fff" }, NEAR: { bg: "#111827", glyph: "N", fg: "#fff" },
  APT: { bg: "#06A77D", glyph: "A", fg: "#fff" },
};
export function CoinBadge({ sym, size = 40 }: { sym: string; size?: number }) {
  const s = COIN_STYLE[sym] || { bg: "#1E2B44", glyph: sym[0], fg: "#fff" };
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: s.bg, color: s.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", font: `700 ${size * 0.45}px var(--font)` }}>{s.glyph}</span>
  );
}

/* ============================================================ FORMAT + DATA */
export const fUSD = (n: number, dp = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const fNum = (n: number, dp = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const fPct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
export const fCompact = (n: number) => {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(0);
};
export function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function series(seed: number, n: number, vol: number, base: number) {
  const r = rng(seed); const out = [base];
  for (let i = 1; i < n; i++) out.push(Math.max(0.01, out[i - 1] * (1 + (r() - 0.48) * vol)));
  return out;
}

export interface Coin {
  sym: string; name: string; price: number; ch: number; vol: number; mcap: number; seed: number; spark: number[];
}
const RAW: Omit<Coin, "spark">[] = [
  { sym: "BTC", name: "Bitcoin",   price: 64182.50, ch: 2.41,  vol: 1284.3e6, mcap: 1264e9, seed: 7 },
  { sym: "ETH", name: "Ethereum",  price: 3108.74,  ch: -1.08, vol: 842.1e6,  mcap: 373e9,  seed: 13 },
  { sym: "SOL", name: "Solana",    price: 148.20,   ch: 5.62,  vol: 410.7e6,  mcap: 68e9,   seed: 21 },
  { sym: "BNB", name: "BNB",       price: 592.16,   ch: 0.84,  vol: 230.4e6,  mcap: 87e9,   seed: 29 },
  { sym: "XRP", name: "XRP",       price: 0.5284,   ch: -2.31, vol: 188.9e6,  mcap: 29e9,   seed: 37 },
  { sym: "ADA", name: "Cardano",   price: 0.4471,   ch: 3.12,  vol: 95.2e6,   mcap: 16e9,   seed: 45 },
  { sym: "AVAX",name: "Avalanche", price: 36.78,    ch: -0.57, vol: 77.6e6,   mcap: 14e9,   seed: 53 },
  { sym: "LINK",name: "Chainlink", price: 17.42,    ch: 4.08,  vol: 64.1e6,   mcap: 10e9,   seed: 61 },
  { sym: "DOGE",name: "Dogecoin",  price: 0.1583,   ch: 6.94,  vol: 121.5e6,  mcap: 22e9,   seed: 69 },
  { sym: "DOT", name: "Polkadot",  price: 6.42,     ch: 3.71,  vol: 48.9e6,   mcap: 9e9,    seed: 83 },
  { sym: "MATIC",name: "Polygon",  price: 0.7218,   ch: -3.44, vol: 58.3e6,   mcap: 7e9,    seed: 77 },
  { sym: "LTC", name: "Litecoin",  price: 84.10,    ch: -1.92, vol: 41.2e6,   mcap: 6.3e9,  seed: 91 },
  { sym: "UNI", name: "Uniswap",   price: 9.84,     ch: 7.21,  vol: 38.7e6,   mcap: 5.9e9,  seed: 103 },
  { sym: "ATOM",name: "Cosmos",    price: 8.16,     ch: -4.08, vol: 27.4e6,   mcap: 3.2e9,  seed: 111 },
  { sym: "XLM", name: "Stellar",   price: 0.1124,   ch: 2.05,  vol: 22.9e6,   mcap: 3.3e9,  seed: 117 },
  { sym: "NEAR",name: "NEAR",      price: 5.32,     ch: 9.14,  vol: 33.1e6,   mcap: 5.7e9,  seed: 123 },
  { sym: "APT", name: "Aptos",     price: 8.91,     ch: -5.62, vol: 19.8e6,   mcap: 4.1e9,  seed: 131 },
];
export const COINS: Coin[] = RAW.map(c => ({ ...c, spark: series(c.seed, 30, 0.05, c.price) }));
export const COIN = (s: string) => COINS.find(c => c.sym === s);

/* ============================================================ PRIMITIVES */
export function Container({ children, style, max = 1200 }: { children: ReactNode; style?: CSSProperties; max?: number }) {
  return <div style={{ maxWidth: max, margin: "0 auto", padding: "0 32px", ...style }}>{children}</div>;
}

export function Card({ children, style, pad = 24 }: { children: ReactNode; style?: CSSProperties; pad?: number }) {
  return <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: pad, boxShadow: "var(--shadow-card)", ...style }}>{children}</div>;
}

export function Delta({ v, size = 14, icon = false }: { v: number; size?: number; icon?: boolean }) {
  const up = v >= 0;
  return (
    <span style={{ color: up ? "var(--up)" : "var(--down)", font: `600 ${size}px var(--mono)`,
      display: "inline-flex", alignItems: "center", gap: 2, fontVariantNumeric: "tabular-nums" }}>
      {icon && <Icon name={up ? "arrowUp" : "arrowDown"} size={size} stroke={2.6} />}{fPct(v)}
    </span>
  );
}
export function DeltaPill({ v, size = 13 }: { v: number; size?: number }) {
  const up = v >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 9px", borderRadius: "var(--r-pill)",
      background: up ? "var(--up-soft)" : "var(--down-soft)", color: up ? "var(--up)" : "var(--down)",
      font: `600 ${size}px var(--mono)`, fontVariantNumeric: "tabular-nums" }}>
      <Icon name={up ? "arrowUp" : "arrowDown"} size={size} stroke={2.8} />{fPct(v)}
    </span>
  );
}

export function Sparkline({ data, up, w = 100, h = 36, fill = false }: { data: number[]; up: boolean; w?: number; h?: number; fill?: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), rg = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / rg) * h}`).join(" ");
  const col = up ? "var(--up)" : "var(--down)";
  const id = "sl" + Math.round(Math.abs(data[0]) * 100) + (up ? "u" : "d");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }} preserveAspectRatio="none">
      {fill && <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={up ? "#0D9488" : "#DC2626"} stopOpacity="0.22" /><stop offset="1" stopColor={up ? "#0D9488" : "#DC2626"} stopOpacity="0" />
      </linearGradient></defs><polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} /></>}
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function AreaChart({ data, h = 180, showAxis = false }: { data: number[]; h?: number; showAxis?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(520);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(wrapRef.current); return () => ro.disconnect();
  }, []);
  if (!data || data.length < 2) return <div ref={wrapRef} style={{ width: "100%", height: h }} />;
  const padR = showAxis ? 48 : 2, padT = 10, padB = 6, padL = 2;
  const innerW = Math.max(10, w - padL - padR), innerH = h - padT - padB;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const x = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - ((v - min) / range) * innerH;
  let d = `M ${x(0)} ${y(data[0])}`;
  for (let i = 1; i < data.length; i++) { const x0 = x(i - 1), y0 = y(data[i - 1]), x1 = x(i), y1 = y(data[i]); const cx = (x0 + x1) / 2; d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`; }
  const area = `${d} L ${x(data.length - 1)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`;
  const lastY = y(data[data.length - 1]);
  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        <defs><linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A6FD4" stopOpacity="0.32" /><stop offset="1" stopColor="#1A6FD4" stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#aFill)" />
        <path d={d} fill="none" stroke="#3D8EF0" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(data.length - 1)} cy={lastY} r="4" fill="#3D8EF0" />
      </svg>
    </div>
  );
}

export function Donut({ slices, size = 188, thickness = 0.58 }: { slices: { value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const R = size / 2, r = R * thickness, cx = R, cy = R;
  let ang = -Math.PI / 2;
  const arc = (frac: number) => {
    // eslint-disable-next-line react-hooks/immutability
    const a0 = ang, a1 = ang + frac * Math.PI * 2; ang = a1;
    const big = frac > 0.5 ? 1 : 0;
    const p = (a: number, rad: number) => `${cx + rad * Math.cos(a)} ${cy + rad * Math.sin(a)}`;
    return `M ${p(a0, R)} A ${R} ${R} 0 ${big} 1 ${p(a1, R)} L ${p(a1, r)} A ${r} ${r} 0 ${big} 0 ${p(a0, r)} Z`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {slices.map((s, i) => <path key={i} d={arc(s.value / total)} fill={s.color} stroke="var(--card)" strokeWidth="2.5" />)}
    </svg>
  );
}
