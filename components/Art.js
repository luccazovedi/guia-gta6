// Artes originais do app (capas de rádio e ícones de troféu). Não usam logos oficiais.

const MOTIFS = {
  sun: (c) => (<><circle cx="70" cy="58" r="26" fill={c} opacity=".9" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x="30" y={62 + i * 7} width="80" height="3" fill="var(--bg)" />)}</>),
  waves: (c) => [0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${70 + i * 12} q 17.5 -10 35 0 t 35 0 t 35 0 t 35 0`} stroke={c} strokeWidth="4" fill="none" opacity={1 - i * 0.2} />),
  bars: (c) => [12, 30, 20, 40, 26, 46, 18, 34, 24].map((h, i) => <rect key={i} x={10 + i * 14} y={110 - h - 20} width="8" height={h} rx="4" fill={c} opacity=".85" />),
  rings: (c) => [36, 26, 16, 6].map((r, i) => <circle key={i} cx="70" cy="62" r={r} fill="none" stroke={c} strokeWidth="3" opacity={0.4 + i * 0.15} />),
  grid: (c) => (<>{[0, 1, 2, 3, 4, 5].map((i) => <line key={"h" + i} x1="0" x2="140" y1={60 + i * 9} y2={60 + i * 9} stroke={c} strokeWidth="1.5" opacity=".6" />)}{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={"v" + i} x1={70} x2={-40 + i * 32} y1={60} y2={110} stroke={c} strokeWidth="1.5" opacity=".6" />)}</>),
  bolt: (c) => <path d="M78 20 L52 66 L70 66 L60 104 L92 52 L74 52 L84 20 Z" fill={c} />,
  palm: (c) => (<><path d="M70 110 Q 66 80 72 48" stroke={c} strokeWidth="5" fill="none" />{[-60, -25, 15, 50, 85].map((a, i) => <path key={i} d="M72 48 q 18 -12 36 -2" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${a} 72 48)`} />)}</>),
  mic: (c) => (<><rect x="58" y="24" width="24" height="44" rx="12" fill={c} /><path d="M48 58 q 22 30 44 0" stroke={c} strokeWidth="4" fill="none" /><rect x="68" y="80" width="4" height="16" fill={c} /></>),
  note: (c) => (<><path d="M60 92 V40 L96 32 V82" stroke={c} strokeWidth="6" fill="none" /><circle cx="52" cy="92" r="10" fill={c} /><circle cx="88" cy="84" r="10" fill={c} /></>),
};
const MOTIF_BY = {
  vcrr: "bars", dsc: "grid", honey: "rings", cocoteo: "palm", laola: "waves", afrobank: "sun", onu: "rings",
  backcountry: "sun", gloriana: "note", worldwide: "rings", flash: "bolt", emotion: "waves", vcfm: "sun",
  vrock: "bolt", chamber: "bolt", stockyard: "grid", circoloco: "bars", kaleido: "rings", ljr: "note",
  symphony: "note", vault: "grid", wktt: "mic", wipe: "mic",
};

export function StationCover({ r, size = 120 }) {
  const h = r.hue ?? 280;
  const bg = r.dark ? `hsl(${h} 35% 14%)` : `hsl(${h} 80% 62%)`;
  const bg2 = r.dark ? `hsl(${h + 30} 45% 24%)` : `hsl(${h + 40} 85% 70%)`;
  const ink = r.dark ? `hsl(${h} 90% 65%)` : "#fff";
  const motif = MOTIFS[MOTIF_BY[r.id] || "rings"];
  const words = r.name.replace(/ FM$| Radio$| Records Radio$/, "").replace(/ \d+\.\d$/, "");
  const fs = words.length > 11 ? 15 : words.length > 8 ? 17 : 20;
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} className="cover" style={{ "--bg": bg }} role="img" aria-label={`Capa ${r.name}`}>
      <defs>
        <linearGradient id={"cg" + r.id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg} /><stop offset="1" stopColor={bg2} />
        </linearGradient>
      </defs>
      <rect width="140" height="140" rx="22" fill={`url(#cg${r.id})`} />
      <g opacity=".95">{motif(r.dark ? ink : "rgba(255,255,255,.85)")}</g>
      <rect x="0" y="100" width="140" height="40" fill="rgba(0,0,0,.22)" />
      <text x="12" y="124" fill="#fff" {...(words.length > 11 ? { textLength: 116, lengthAdjust: "spacingAndGlyphs" } : {})} style={{ font: `800 ${fs}px var(--f-display)`, letterSpacing: "-.02em" }}>{words.toUpperCase()}</text>
      <text x="128" y="22" textAnchor="end" fill={r.dark ? ink : "rgba(255,255,255,.9)"} style={{ font: "700 11px var(--f-mono)" }}>{r.freq || (r.talk ? "TALK" : "FM")}</text>
    </svg>
  );
}

const GRADES = {
  platina: ["#f4f8ff", "#b9c9e6", "#6f86b3", "#3d5280"],
  ouro: ["#fff4c2", "#f2c13a", "#c48a10", "#7a5205"],
  prata: ["#ffffff", "#d9dee6", "#9aa3b1", "#5d6674"],
  bronze: ["#ffe0c4", "#e0965c", "#a65d27", "#6b3510"],
};

// Taça no estilo dos troféus de console (desenho próprio, não é o ícone oficial).
export function TrophyIcon({ grade, size = 40, dim = false }) {
  const [hi, mid, lo, edge] = GRADES[grade] || GRADES.bronze;
  const id = "tg-" + grade;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={"trophy-ico" + (dim ? " dim" : "")} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lo} /><stop offset=".28" stopColor={hi} /><stop offset=".6" stopColor={mid} /><stop offset="1" stopColor={lo} />
        </linearGradient>
        <linearGradient id={id + "v"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mid} /><stop offset="1" stopColor={edge} />
        </linearGradient>
      </defs>
      <path d="M15 11 C 9 11, 8 14, 9.5 18 C 11 22, 14 23.5, 16.5 24" stroke={`url(#${id}v)`} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M33 11 C 39 11, 40 14, 38.5 18 C 37 22, 34 23.5, 31.5 24" stroke={`url(#${id}v)`} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M13 8 H35 C 35 21, 31 27.5, 24 28.5 C 17 27.5, 13 21, 13 8 Z" fill={`url(#${id})`} />
      <ellipse cx="24" cy="8" rx="11" ry="1.8" fill={hi} opacity=".9" />
      <path d="M21.6 28.2 H26.4 L25.6 33 H22.4 Z" fill={`url(#${id})`} />
      <path d="M18.5 33 H29.5 L31 37 H17 Z" fill={`url(#${id})`} />
      <rect x="15" y="37" width="18" height="4" rx="1" fill={`url(#${id}v)`} />
      <path d="M16.5 11 C 16.8 18, 18.6 22.5, 21.2 25" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".55" />
      {grade === "platina" && <path d="M24 12 l1.7 3.5 3.8 .5 -2.8 2.6 .7 3.8 -3.4 -1.8 -3.4 1.8 .7 -3.8 -2.8 -2.6 3.8 -.5 Z" fill="#fff" opacity=".95" />}
    </svg>
  );
}

// Retratos ilustrados originais (não usam arte oficial).
const SKIN = { a: "#f1c7a5", b: "#d9a27a", c: "#b97a52", d: "#8a5636", e: "#5e3a24" };
const LOOKS = {
  "Lucia Caminos": { skin: "c", hair: "long", hc: "#1d1412", shirt: "#e2557d", ear: true },
  "Jason Duval": { skin: "a", hair: "short", hc: "#4a3222", shirt: "#3b6ea8", beard: "#5a3d28" },
  "Cal Hampton": { skin: "a", hair: "cap", hc: "#7a5a3a", shirt: "#4f7a4a", cap: "#c0392b", beard: "#8a6a48" },
  "Brian Heder": { skin: "a", hair: "bald", hc: "#bdb6aa", shirt: "#e9e2cf", beard: "#d6d0c4", glasses: true },
  "Lori Heder": { skin: "a", hair: "long", hc: "#e7c46a", shirt: "#ef8fb5", ear: true },
  "Boobie Ike": { skin: "d", hair: "bald", hc: "#1b1b1b", shirt: "#7b4bd1", beard: "#1b1b1b", chain: true },
  "Dre'Quan Priest": { skin: "e", hair: "short", hc: "#141414", shirt: "#1f1f2b", beard: "#141414", chain: true },
  "Real Dimez": { skin: "d", hair: "bun", hc: "#2a1a14", shirt: "#f2a63b", ear: true, glasses: true },
  "Raul Bautista": { skin: "b", hair: "slick", hc: "#2b2b2b", shirt: "#2d2d33", beard: "#3a3a3a" },
  "Kenton Rees": { skin: "a", hair: "curly", hc: "#a8743c", shirt: "#2aa6a0" },
  "Bret": { skin: "a", hair: "cap", hc: "#6b4a2e", shirt: "#6b7a3a", cap: "#4a5a2a", beard: "#6b4a2e" },
  "Tyrone": { skin: "e", hair: "short", hc: "#151515", shirt: "#d17a2a", beard: "#151515" },
  "Randy": { skin: "b", hair: "cap", hc: "#3a2a1e", shirt: "#8a8f99", cap: "#1f4f8a" },
  "Andy": { skin: "a", hair: "short", hc: "#b88a4a", shirt: "#4a8ad1", glasses: true },
  "Billy": { skin: "b", hair: "long", hc: "#5a3a22", shirt: "#2b2b2b", beard: "#5a3a22" },
};
export function Portrait({ name, hue = 270, size = 60 }) {
  const L = LOOKS[name] || { skin: "b", hair: "short", hc: "#222", shirt: "#666" };
  const sk = SKIN[L.skin];
  const id = "pt-" + name.replace(/\W/g, "");
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="portrait" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 85% 68%)`} /><stop offset="1" stopColor={`hsl(${(hue + 40) % 360} 80% 52%)`} />
        </linearGradient>
        <clipPath id={id + "c"}><rect width="64" height="64" rx="18" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="64" height="64" fill={`url(#${id})`} />
        <circle cx="50" cy="12" r="7" fill="#fff" opacity=".25" />
        {L.hair === "long" && <path d="M16 30 C 14 14, 50 12, 48 30 L 50 52 L 14 52 Z" fill={L.hc} />}
        <path d="M8 66 C 8 50, 18 44, 32 44 C 46 44, 56 50, 56 66 Z" fill={L.shirt} />
        <path d="M27 40 H37 V47 C 35 49, 29 49, 27 47 Z" fill={sk} />
        {L.chain && <path d="M24 47 Q32 56 40 47" stroke="#f2c13a" strokeWidth="2" fill="none" />}
        <ellipse cx="32" cy="29" rx="11" ry="13" fill={sk} />
        {L.beard && <path d="M21.5 31 C 22 40, 27 43, 32 43 C 37 43, 42 40, 42.5 31 C 40 36, 36 37, 32 37 C 28 37, 24 36, 21.5 31 Z" fill={L.beard} opacity=".9" />}
        {L.hair === "short" && <path d="M20.5 27 C 19 15, 45 13, 43.5 27 C 41 21, 36 19.5, 32 19.5 C 27 19.5, 23 21, 20.5 27 Z" fill={L.hc} />}
        {L.hair === "slick" && <path d="M20.5 26 C 20 14, 44 13, 43.5 26 C 40 18, 28 17, 20.5 26 Z" fill={L.hc} />}
        {L.hair === "curly" && <g fill={L.hc}>{[[22,22],[26,17],[32,15],[38,17],[42,22],[24,19],[40,19]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" />)}</g>}
        {L.hair === "long" && <path d="M20.5 28 C 19 14, 45 14, 43.5 28 C 40 20, 30 18, 20.5 28 Z" fill={L.hc} />}
        {L.hair === "bun" && <><circle cx="32" cy="12" r="6" fill={L.hc} /><path d="M20.5 27 C 19 15, 45 15, 43.5 27 C 40 20, 25 20, 20.5 27 Z" fill={L.hc} /></>}
        {L.hair === "cap" && <><path d="M20 24 C 20 12, 44 12, 44 24 Z" fill={L.cap} /><path d="M40 23 H52 Q50 26 42 26 Z" fill={L.cap} /></>}
        <circle cx="27.5" cy="29" r="1.4" fill="#1d1d24" /><circle cx="36.5" cy="29" r="1.4" fill="#1d1d24" />
        <path d="M29 35.5 Q32 37.5 35 35.5" stroke="#6b3a2a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {L.glasses && <g fill="#14141c" opacity=".88"><rect x="23" y="26.5" width="8" height="5" rx="2" /><rect x="33" y="26.5" width="8" height="5" rx="2" /><rect x="30.5" y="27.8" width="3" height="1.2" /></g>}
        {L.ear && <><circle cx="21" cy="33" r="1.2" fill="#f2c13a" /><circle cx="43" cy="33" r="1.2" fill="#f2c13a" /></>}
      </g>
    </svg>
  );
}

