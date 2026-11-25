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
  platina: ["#eef4ff", "#9db4e0", "#5b78b8"],
  ouro: ["#fff1b8", "#f5b922", "#a86d06"],
  prata: ["#ffffff", "#c7ced8", "#7b8594"],
  bronze: ["#ffd6b8", "#d9894e", "#8a4a1d"],
};
export function TrophyIcon({ grade, size = 40, dim = false }) {
  const [a, b, c] = GRADES[grade] || GRADES.bronze;
  const id = "tg-" + grade;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={"trophy-ico" + (dim ? " dim" : "")} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} /><stop offset=".55" stopColor={b} /><stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill={`url(#${id})`} opacity=".18" />
      {/* alças */}
      <path d="M14 13 H8 q0 9 8 10 M34 13 h6 q0 9 -8 10" stroke={c} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* taça */}
      <path d="M13 10 H35 V17 Q35 29 24 30 Q13 29 13 17 Z" fill={`url(#${id})`} stroke={c} strokeWidth="1.4" />
      <path d="M17 13 Q17 22 21 25" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
      {/* haste e base */}
      <rect x="21.5" y="29.5" width="5" height="6" fill={`url(#${id})`} stroke={c} strokeWidth="1" />
      <rect x="15" y="35.5" width="18" height="5" rx="1.5" fill={`url(#${id})`} stroke={c} strokeWidth="1.2" />
      {grade === "platina" && <path d="M24 13.5 l1.8 3.7 4 .5 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.5 Z" fill="#fff" />}
    </svg>
  );
}
