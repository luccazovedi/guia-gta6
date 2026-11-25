// Gera a arte base do mapa de Leonida (SVG original, estilo atlas escuro de jogo).
// Uso: node scripts/genmap.mjs  → public/leonida.svg
import { writeFileSync } from "node:fs";
const M = await import("../lib/mapdata.js");

// ---------- utilidades ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = (a, b) => a + rnd() * (b - a);
const f = (n) => n.toFixed(1);
const parsePath = (d) => d.replace(/[MLZ]/g, " ").trim().split(/\s+/).map(Number).reduce((a, v, i, arr) => (i % 2 ? a : [...a, [v, arr[i + 1]]]), []);

// subdivisão fractal (litoral orgânico)
function fractal(pts, depth, amp, closed = true) {
  let p = pts;
  for (let d = 0; d < depth; d++) {
    const out = [];
    const n = closed ? p.length : p.length - 1;
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const off = r(-1, 1) * amp * len * Math.pow(0.55, d) / 40;
      out.push(a, [mx - (dy / len) * off, my + (dx / len) * off]);
    }
    if (!closed) out.push(p[p.length - 1]);
    p = out;
  }
  return p;
}
const poly = (pts, closed = true) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join(" L") + (closed ? " Z" : "");
const smooth = (pts) => {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${f(l[0])} ${f(l[1])}`;
};
function blob(cx, cy, rx, ry, n = 14, j = 0.25) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + r(-j, j);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return fractal(pts, 2, 3);
}
function pointIn(pt, vs) {
  let x = pt[0], y = pt[1], inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1], xj = vs[j][0], yj = vs[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ---------- geometria ----------
const coastBase = parsePath(M.COAST);
const coast = fractal(coastBase, 5, 9);
const cityPoly = parsePath(M.CITY);

const keys = [];
const keyCenters = [];
let kx = 770, ky = 880;
for (let i = 0; i < 16; i++) {
  const w = r(10, 26), h = r(4, 8);
  keys.push(blob(kx, ky, w, h, 12, 0.3));
  keyCenters.push([kx, ky]);
  kx -= w * 1.35 + r(2, 8); ky += r(3, 7) * (i < 8 ? 1 : 0.6);
}
const barrier = [
  fractal([[952, 548], [964, 560], [968, 650], [962, 726], [950, 732], [946, 650]], 3, 2),
  blob(914, 612, 13, 5), blob(908, 690, 14, 6), blob(930, 640, 7, 4), blob(896, 728, 9, 4),
];
const lake = blob(628, 422, 70, 55, 18, 0.18);
const smallLakes = [blob(380, 520, 14, 9), blob(700, 300, 10, 7), blob(300, 250, 9, 6), blob(520, 600, 12, 8), blob(760, 420, 8, 6)];

// pântano: manchas + canais sinuosos
const swampPatches = Array.from({ length: 26 }, () => blob(r(480, 760), r(620, 830), r(14, 40), r(8, 22), 10, 0.4));
const channels = Array.from({ length: 22 }, () => {
  let x = r(480, 760), y = r(610, 700); const pts = [[x, y]];
  for (let i = 0; i < 9; i++) { x += r(-14, 14); y += r(10, 22); pts.push([x, y]); }
  return pts;
});

// relevo de Mount Kalaga (anéis)
const hills = [];
for (const [hx, hy, s] of [[466, 98, 1], [510, 120, 0.8], [420, 128, 0.7], [560, 150, 0.6], [380, 170, 0.5]])
  for (let i = 5; i > 0; i--) hills.push({ d: poly(blob(hx, hy, 18 * i * s, 11 * i * s, 16, 0.12)), o: 0.05 + (5 - i) * 0.035 });

// florestas e campos
const forest = Array.from({ length: 34 }, () => blob(r(300, 660), r(70, 250), r(14, 42), r(10, 28), 10, 0.35));
const fields = Array.from({ length: 70 }, () => {
  const x = r(150, 880), y = r(260, 640), w = r(10, 30), h = r(8, 22);
  return pointIn([x, y], coast) ? `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" transform="rotate(${f(r(-20, 20))} ${f(x)} ${f(y)})"/>` : "";
}).join("");

// cidades: quarteirões
function cityBlocks(cx, cy, w, h, step, rot, clip) {
  let s = "";
  for (let x = cx - w / 2; x < cx + w / 2; x += step)
    for (let y = cy - h / 2; y < cy + h / 2; y += step) {
      if (rnd() < 0.07) continue;
      const pt = [x + step / 2, y + step / 2];
      if (clip && !pointIn(pt, clip)) continue;
      if (!pointIn(pt, coast) && !barrier.some((b) => pointIn(pt, b))) continue;
      const big = rnd() < 0.12;
      s += `<rect x="${f(x + 0.6)}" y="${f(y + 0.6)}" width="${f(step * (big ? 1.9 : 1) - 1.2)}" height="${f(step - 1.2)}" rx=".6"/>`;
    }
  return `<g transform="rotate(${rot} ${cx} ${cy})">${s}</g>`;
}
const parks = [blob(850, 640, 8, 5), blob(822, 600, 6, 5), blob(880, 610, 5, 4), blob(958, 690, 3, 9)];

// estradas
const highways = [
  [[872, 55], [884, 160], [896, 260], [906, 380], [900, 470], [880, 560], [858, 640], [836, 720], [812, 760]],
  [[180, 330], [240, 370], [330, 388], [440, 415], [548, 420], [640, 470], [730, 535], [820, 600]],
  [[812, 760], [795, 820], [778, 868], ...keyCenters],
  [[548, 420], [552, 330], [530, 240], [500, 160], [470, 70]],
];
const mainRoads = [
  [[560, 780], [640, 762], [720, 744], [810, 722]],
  [[300, 450], [360, 530], [430, 610], [500, 690]],
  [[240, 370], [210, 300], [170, 230], [140, 150]],
  [[640, 470], [700, 380], [760, 300], [800, 240], [880, 200]],
  [[440, 415], [420, 520], [450, 620]],
  [[720, 300], [640, 240], [560, 200]],
  [[880, 560], [930, 590], [952, 600]],
  [[860, 700], [905, 700], [950, 700]],
];
const minorRoads = Array.from({ length: 60 }, () => {
  let x = r(160, 880), y = r(240, 760); if (!pointIn([x, y], coast)) return null;
  const pts = [[x, y]]; const ang = r(0, Math.PI * 2);
  for (let i = 0; i < 4; i++) { x += Math.cos(ang + r(-0.5, 0.5)) * r(12, 30); y += Math.sin(ang + r(-0.5, 0.5)) * r(12, 30); pts.push([x, y]); }
  return pts;
}).filter(Boolean);

// ---------- SVG ----------
const label = (x, y, t, size, cls) => `<text x="${x}" y="${y}" class="${cls}" font-size="${size}">${t}</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="2000" height="2000">
<defs>
  <radialGradient id="sea" cx="62%" cy="58%" r="85%"><stop offset="0" stop-color="#1d3854"/><stop offset=".6" stop-color="#162c44"/><stop offset="1" stop-color="#0f2134"/></radialGradient>
  <linearGradient id="land" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#2d3628"/><stop offset=".5" stop-color="#323a2c"/><stop offset="1" stop-color="#3a3d30"/></linearGradient>
  <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
  <pattern id="trees" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#253222"/><circle cx="2" cy="2" r="1.6" fill="#2d3c28"/><circle cx="6" cy="6" r="1.8" fill="#2a3826"/></pattern>
  <pattern id="marsh" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#2a3a2e"/><path d="M1 5 q1.5 -3 3 0" stroke="#355040" stroke-width=".7" fill="none"/></pattern>
  <clipPath id="landclip"><path d="${poly(coast)}"/></clipPath>
  <style>
    .rg{font-family:'Bricolage Grotesque Variable',Arial,sans-serif;font-weight:800;fill:#f1ebfa;letter-spacing:3px;text-anchor:middle;paint-order:stroke;stroke:#10151d;stroke-width:3px;stroke-linejoin:round;text-transform:uppercase;opacity:.92}
    .ds{font-family:'Bricolage Grotesque Variable',Arial,sans-serif;font-weight:700;fill:#d6cde6;letter-spacing:1px;text-anchor:middle;paint-order:stroke;stroke:#14161c;stroke-width:1.6px;stroke-linejoin:round}
    .wt{font-family:'Bricolage Grotesque Variable',Arial,sans-serif;font-style:italic;font-weight:600;fill:#5d86ad;letter-spacing:4px;text-anchor:middle}
  </style>
</defs>
<rect width="1000" height="1000" fill="url(#sea)"/>
<!-- águas rasas -->
<path d="${poly(coast)}" fill="none" stroke="#2b5b7c" stroke-width="26" stroke-opacity=".55" filter="url(#glow)"/>
${keys.concat(barrier).map((k) => `<path d="${poly(k)}" fill="none" stroke="#2b5b7c" stroke-width="12" stroke-opacity=".5" filter="url(#glow)"/>`).join("")}
<!-- Gloriana -->
<rect x="60" y="0" width="880" height="50" fill="#262b26"/><path d="M60 50 L940 50" stroke="#5a5f55" stroke-width="1.2" stroke-dasharray="6 4"/>
<!-- terra -->
<path d="${poly(coast)}" fill="url(#land)" stroke="#a89a6c" stroke-width="1.4" stroke-opacity=".55"/>
${keys.concat(barrier).map((k) => `<path d="${poly(k)}" fill="#3a3d30" stroke="#b3a571" stroke-width=".9" stroke-opacity=".7"/>`).join("")}
<g clip-path="url(#landclip)">
  <g fill="#38412f" opacity=".7">${fields}</g>
  ${forest.map((b) => `<path d="${poly(b)}" fill="url(#trees)" opacity=".9"/>`).join("")}
  ${hills.map((h) => `<path d="${h.d}" fill="#5b5f50" opacity="${h.o.toFixed(2)}"/>`).join("")}
  ${swampPatches.map((b) => `<path d="${poly(b)}" fill="url(#marsh)" opacity=".95"/>`).join("")}
  ${channels.map((c) => `<path d="${smooth(c)}" stroke="#1f3a55" stroke-width="${f(r(1, 2.6))}" fill="none" stroke-linecap="round"/>`).join("")}
  <path d="${poly(lake)}" fill="#1b3550" stroke="#3a6c8f" stroke-width="1"/>
  ${smallLakes.map((l) => `<path d="${poly(l)}" fill="#1b3550" stroke="#3a6c8f" stroke-width=".6"/>`).join("")}
  <!-- áreas urbanas -->
  <path d="${M.CITY}" fill="#33343c" opacity=".9"/>
  <g fill="#454652">${cityBlocks(860, 640, 170, 220, 7, -4, cityPoly)}</g>
  <g fill="#3b3c46">${cityBlocks(250, 375, 60, 46, 6, 8)}${cityBlocks(535, 440, 56, 46, 6, -3)}${cityBlocks(790, 250, 44, 40, 6, 5)}</g>
  ${parks.map((p) => `<path d="${poly(p)}" fill="#2f4a2b"/>`).join("")}
  <!-- estradas -->
  ${minorRoads.map((p) => `<path d="${smooth(p)}" stroke="#575a50" stroke-width=".9" fill="none" stroke-linecap="round"/>`).join("")}
  ${mainRoads.map((p) => `<path d="${smooth(p)}" stroke="#1d2025" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="${smooth(p)}" stroke="#8e909a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join("")}
</g>
<g fill="#454652">${barrier.slice(0, 1).map(() => cityBlocks(957, 640, 14, 170, 5, 1, barrier[0])).join("")}</g>
${highways.map((p) => `<path d="${smooth(p)}" stroke="#1a1c20" stroke-width="5.2" fill="none" stroke-linecap="round"/><path d="${smooth(p)}" stroke="#d1a43c" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join("")}
<!-- pontes para as ilhas-barreira -->
<path d="M930 600 L952 598 M905 702 L948 702 M920 640 L948 640" stroke="#8e909a" stroke-width="1.6"/>
</svg>`;
writeFileSync(new URL("../public/leonida.svg", import.meta.url), svg);
console.log("ok", (svg.length / 1024).toFixed(0) + " KB", JSON.stringify(keyCenters.map(p=>p.map(Math.round))));
