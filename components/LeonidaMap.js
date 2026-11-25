"use client";
import { useState } from "react";
import { REGIONS, POIS } from "../lib/data";

const COLORS = { safe: "#2de2c9", place: "#f5f1e8", trophy: "#ffb547", radio: "#ff4f9a", pin: "#9b8cff" };

// Mapa estilizado original de Leonida (não é o mapa oficial do jogo)
export default function LeonidaMap({ pins, onAddPin, onRemovePin }) {
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState({ safe: true, place: true, trophy: true, radio: true, pin: true });

  function handleClick(e) {
    if (!adding) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const name = prompt("Nome do marcador (ex.: Flamingo #12, carta, cofre):");
    if (name) onAddPin({ name, x: +p.x.toFixed(1), y: +p.y.toFixed(1), type: "pin", text: "Seu marcador" });
    setAdding(false);
  }

  const points = [...POIS, ...pins.map((p, i) => ({ ...p, idx: i }))].filter((p) => filter[p.type]);

  return (
    <div className="map-wrap">
      <div className="map-toolbar">
        {Object.entries({ safe: "Casas", place: "Locais", trophy: "Troféus", radio: "Rádio", pin: "Meus pins" }).map(([k, label]) => (
          <button key={k} className={"chip" + (filter[k] ? " on" : "")} onClick={() => setFilter({ ...filter, [k]: !filter[k] })}>
            <span className="dot" style={{ background: COLORS[k] }} /> {label}
          </button>
        ))}
        <button className={"btn small" + (adding ? " hot" : "")} onClick={() => setAdding(!adding)}>
          {adding ? "Toque no mapa…" : "+ Adicionar pin"}
        </button>
      </div>

      <svg viewBox="0 0 100 100" className={"map" + (adding ? " adding" : "")} onClick={handleClick} role="img" aria-label="Mapa estilizado de Leonida">
        <defs>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b2a3c" /><stop offset="1" stopColor="#081a2a" />
          </linearGradient>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1d3b2f" /><stop offset="1" stopColor="#23443a" />
          </linearGradient>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0H0V5" fill="none" stroke="#ffffff08" strokeWidth=".2" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#sea)" />
        {/* massa de terra peninsular */}
        <path d="M22 2 L84 2 L86 18 L82 34 L86 50 L88 64 L84 76 L72 82 L60 84 L48 80 L36 78 L26 70 L22 58 L12 46 L10 34 L14 22 Z" fill="url(#land)" stroke="#4a7a66" strokeWidth=".4" />
        {/* pântano */}
        <path d="M26 58 L48 54 L56 66 L52 78 L36 76 L27 69 Z" fill="#2e5b45" opacity=".8" />
        {/* lago */}
        <ellipse cx="55" cy="36" rx="8" ry="6" fill="#0f3a52" stroke="#3a7fa0" strokeWidth=".3" />
        {/* área urbana */}
        <path d="M68 56 L86 52 L88 66 L80 76 L68 72 Z" fill="#3b2f4a" opacity=".85" />
        {/* montanha */}
        <path d="M42 14 L50 6 L58 14 L54 13 L50 9 L46 13 Z" fill="#5c6f63" />
        {/* keys */}
        {[[40, 88, 3], [46, 91, 2.6], [52, 92, 2.2], [58, 93, 2.4], [64, 95, 2], [69, 96, 1.6], [34, 85, 2]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} fill="url(#land)" stroke="#4a7a66" strokeWidth=".3" />
        ))}
        <path d="M36 84 Q52 94 70 96" stroke="#c9b98a" strokeWidth=".35" fill="none" strokeDasharray="1 .6" />
        <rect width="100" height="100" fill="url(#grid)" />

        {REGIONS.map((r) => (
          <g key={r.id} onClick={(e) => { e.stopPropagation(); setSel(r); }} className="region-label">
            <text x={r.x} y={r.y} textAnchor="middle">{r.name.replace(" National Park", "")}</text>
          </g>
        ))}

        {points.map((p, i) => (
          <g key={i} onClick={(e) => { if (adding) return; e.stopPropagation(); setSel(p); }} className="poi">
            <circle cx={p.x} cy={p.y} r="1.9" fill={COLORS[p.type]} opacity=".25" />
            <circle cx={p.x} cy={p.y} r="1" fill={COLORS[p.type]} stroke="#0008" strokeWidth=".2" />
          </g>
        ))}
      </svg>

      <div className="map-info card">
        {sel ? (
          <>
            <h3>{sel.name}</h3>
            <p>{sel.text}</p>
            {sel.type === "pin" && (
              <button className="btn small ghost" onClick={() => { onRemovePin(sel.idx); setSel(null); }}>Remover pin</button>
            )}
          </>
        ) : (
          <p className="muted">Toque numa região ou marcador. Use “Adicionar pin” para marcar flamingos, cartas, cofres ou o que quiser — fica salvo no seu aparelho.</p>
        )}
        <p className="fine">Mapa ilustrativo com posições aproximadas; não é o mapa oficial do jogo.</p>
      </div>
    </div>
  );
}
