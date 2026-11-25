"use client";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Plus, Minus, Maximize2, Search, Check, X, MapPin, SlidersHorizontal, Heart, List, Map as MapIcon, Pencil, Trash2, Navigation } from "lucide-react";
import { CATEGORIES, PIN_KINDS, COAST, LAKE, SWAMP, FOREST, CITY, ISLANDS, ROADS, REGIONS_MAP, DISTRICTS, MARKERS } from "../lib/mapdata";

const MIN = 1, MAX = 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fit = (v) => {
  const k = clamp(v.k, MIN, MAX);
  const lim = 1000 - 1000 * k;
  return { k, x: clamp(v.x, lim - 60, 60), y: clamp(v.y, lim - 60, 60) };
};
const styleOf = (m) => (m.cat === "pin" ? PIN_KINDS[m.kind] || PIN_KINDS.outro : CATEGORIES[m.cat]);
const regionOf = (m) => {
  let best = null, d = Infinity;
  for (const r of REGIONS_MAP) { const dd = (r.x - m.x) ** 2 + (r.y - m.y) ** 2; if (dd < d) { d = dd; best = r; } }
  return best?.name;
};

export default function LeonidaMap({ pins, visited = {}, favs = {}, onAddPin, onUpdatePin, onRemovePin, onToggleVisited, onToggleFav }) {
  const svgRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null); // pin sendo criado/editado
  const [mode, setMode] = useState("mapa");
  const [off, setOff] = useState({});
  const [hideVisited, setHideVisited] = useState(false);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const moved = useRef(false);

  const markers = useMemo(() => [
    ...MARKERS,
    ...pins.map((p, i) => ({ ...p, id: p.id || "pin" + i, cat: "pin", idx: i, kind: p.kind || "outro" })),
  ], [pins]);

  const toSvg = useCallback((cx, cy) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * 1000, y: ((cy - r.top) / r.height) * 1000 };
  }, []);
  const zoomAt = useCallback((px, py, factor) =>
    setView((v) => {
      const k = clamp(v.k * factor, MIN, MAX);
      const f = k / v.k;
      return fit({ k, x: px - (px - v.x) * f, y: py - (py - v.y) * f });
    }), []);
  const flyTo = (m, k = 4) => setView(fit({ k, x: 500 - m.x * k, y: 450 - m.y * k }));

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); zoomAt(p.x, p.y, e.deltaY < 0 ? 1.2 : 1 / 1.2); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toSvg, zoomAt, mode]);

  const onDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) moved.current = false;
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: toSvg((a.x + b.x) / 2, (a.y + b.y) / 2), start: view };
    } else gesture.current = { last: { x: e.clientX, y: e.clientY } };
  };
  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length === 2 && g?.dist) {
      const [a, b] = pts;
      const k = clamp(g.start.k * (Math.hypot(a.x - b.x, a.y - b.y) / g.dist), MIN, MAX);
      const f = k / g.start.k;
      setView(fit({ k, x: g.mid.x - (g.mid.x - g.start.x) * f, y: g.mid.y - (g.mid.y - g.start.y) * f }));
      moved.current = true;
    } else if (pts.length === 1 && g?.last) {
      const s = 1000 / svgRef.current.getBoundingClientRect().width;
      const dx = (e.clientX - g.last.x) * s, dy = (e.clientY - g.last.y) * s;
      if (!moved.current && Math.hypot(dx, dy) < 4) return;
      moved.current = true;
      if (!svgRef.current.hasPointerCapture(e.pointerId)) svgRef.current.setPointerCapture(e.pointerId);
      g.last = { x: e.clientX, y: e.clientY };
      setView((v) => fit({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  };
  const onUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 1) gesture.current = { last: [...pointers.current.values()][0] };
    if (pointers.current.size === 0 && adding && !moved.current) {
      const p = toSvg(e.clientX, e.clientY);
      setDraft({ id: "pin-" + Date.now(), name: "", kind: "flamingo", note: "", x: +((p.x - view.x) / view.k).toFixed(1), y: +((p.y - view.y) / view.k).toFixed(1), isNew: true });
      setAdding(false);
    }
  };
  const tap = (fn) => () => { if (!moved.current && !adding) fn(); };

  const k = view.k;
  const passes = (m) => !off[m.cat === "pin" ? "pin:" + m.kind : m.cat] && !(hideVisited && visited[m.id]) && !(onlyFavs && !favs["p:" + m.id]);
  const visible = markers.filter(passes);
  const ql = q.trim().toLowerCase();
  const results = ql.length > 1
    ? [...REGIONS_MAP.map((r) => ({ ...r, region: true })), ...DISTRICTS.map((d) => ({ ...d, region: true, county: "Distrito de Vice City", text: "Bairro de Vice City." })), ...markers]
        .filter((m) => (m.name + " " + (m.note || "")).toLowerCase().includes(ql)).slice(0, 6)
    : [];
  const groups = [
    ...Object.entries(CATEGORIES).filter(([c]) => c !== "pin").map(([c, cfg]) => ({ key: c, ...cfg, list: markers.filter((m) => m.cat === c) })),
    ...Object.entries(PIN_KINDS).map(([kd, cfg]) => ({ key: "pin:" + kd, ...cfg, label: "Pin · " + cfg.label, list: markers.filter((m) => m.cat === "pin" && m.kind === kd) })),
  ];
  const activeFilters = Object.values(off).filter(Boolean).length + (hideVisited ? 1 : 0) + (onlyFavs ? 1 : 0);
  const openItem = (m) => { setSel(m); setMode("mapa"); flyTo(m, Math.max(k, 4)); };

  return (
    <div className="mapx">
      <div className="mapx-top">
        <div className="mapx-search glass">
          <Search size={17} />
          <input placeholder="Buscar lugar, pin ou nota…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button onClick={() => setQ("")} aria-label="Limpar"><X size={16} /></button>}
        </div>
        <button className={"round" + (showFilters ? " active" : "")} onClick={() => setShowFilters(!showFilters)} aria-label="Filtros">
          <SlidersHorizontal size={19} />{activeFilters > 0 && <span className="badge">{activeFilters}</span>}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="mapx-results glass">
          {results.map((m, i) => (
            <li key={i} onClick={() => { setMode("mapa"); flyTo(m, m.region && !m.county?.startsWith("Distrito") ? 2.5 : 5); setSel(m); setQ(""); }}>
              <MapPin size={15} /> <span>{m.name}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="segs modes">
        <button className={mode === "mapa" ? "on" : ""} onClick={() => setMode("mapa")}><MapIcon size={15} /> Mapa</button>
        <button className={mode === "lista" ? "on" : ""} onClick={() => setMode("lista")}><List size={15} /> Lista</button>
        <button className={onlyFavs ? "on" : ""} onClick={() => setOnlyFavs(!onlyFavs)}><Heart size={15} fill={onlyFavs ? "currentColor" : "none"} /> Favoritos</button>
      </div>

      {showFilters && (
        <div className="mapx-filters glass">
          <div className="ftoggles">
            <label><input type="checkbox" checked={hideVisited} onChange={(e) => setHideVisited(e.target.checked)} /> Esconder visitados</label>
            <label><input type="checkbox" checked={onlyFavs} onChange={(e) => setOnlyFavs(e.target.checked)} /> Só favoritos</label>
          </div>
          <div className="fchips">
            {groups.filter((g) => g.list.length || !g.key.startsWith("pin:")).map((g) => (
              <button key={g.key} className={"fchip" + (off[g.key] ? "" : " on")} onClick={() => setOff({ ...off, [g.key]: !off[g.key] })}>
                <span className="g" style={{ background: g.color }}>{g.glyph}</span>{g.label}
                <small>{g.list.filter((m) => visited[m.id]).length}/{g.list.length}</small>
              </button>
            ))}
          </div>
          <div className="row">
            <button className="pill sm" onClick={() => setOff({})}>Mostrar tudo</button>
            <button className="pill sm" onClick={() => setOff(Object.fromEntries(groups.map((g) => [g.key, true])))}>Esconder tudo</button>
          </div>
        </div>
      )}

      {mode === "lista" ? (
        <div className="maplist">
          {groups.map((g) => {
            const list = g.list.filter(passes);
            if (!list.length) return null;
            return (
              <div key={g.key} className="glass">
                <h4 className="row between"><span className="row"><span className="g" style={{ background: g.color }}>{g.glyph}</span> {g.label}</span>
                  <small className="cnt">{g.list.filter((m) => visited[m.id]).length}/{g.list.length}</small></h4>
                <ul className="list">
                  {list.map((m) => (
                    <li key={m.id} className={visited[m.id] ? "done" : ""}>
                      <button className={"tick" + (visited[m.id] ? " on" : "")} onClick={() => onToggleVisited(m.id)} aria-label="Visitado"><Check size={14} /></button>
                      <button className="grow item" onClick={() => openItem(m)}>
                        <span className="lname"><b>{m.name}</b><small>{m.note || regionOf(m)}</small></span>
                      </button>
                      <button className={"favbtn" + (favs["p:" + m.id] ? " on" : "")} onClick={() => onToggleFav("p:" + m.id)} aria-label="Favoritar">
                        <Heart size={17} fill={favs["p:" + m.id] ? "currentColor" : "none"} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {!groups.some((g) => g.list.filter(passes).length) && <p className="pad">Nada com esses filtros.</p>}
        </div>
      ) : (
      <div className="mapx-stage">
        <svg ref={svgRef} viewBox="0 0 1000 1000" className={"mapx-svg" + (adding ? " adding" : "")}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          onDoubleClick={(e) => { const p = toSvg(e.clientX, e.clientY); zoomAt(p.x, p.y, 1.8); }}>
          <defs>
            <radialGradient id="ocean" cx="70%" cy="60%" r="80%">
              <stop offset="0" stopColor="#c4ebf8" /><stop offset="1" stopColor="#8fc9e6" />
            </radialGradient>
            <linearGradient id="landg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dbeac6" /><stop offset=".55" stopColor="#eaf0d0" /><stop offset="1" stopColor="#f4edd2" />
            </linearGradient>
            <pattern id="swamp" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#bddba9" />
              <path d="M2 10 q2 -4 4 0 M8 5 q2 -4 4 0" stroke="#8fbf7c" strokeWidth="1.2" fill="none" />
            </pattern>
            <pattern id="trees" width="18" height="18" patternUnits="userSpaceOnUse">
              <rect width="18" height="18" fill="#c6deae" />
              <circle cx="5" cy="6" r="3.2" fill="#a6c98d" /><circle cx="13" cy="13" r="3.6" fill="#9cc283" />
            </pattern>
            <pattern id="blocks" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#f8dcec" />
              <rect x="1.2" y="1.2" width="7.6" height="7.6" rx="1.2" fill="#f2c6df" />
            </pattern>
            <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#4b2a7a" floodOpacity=".22" /></filter>
          </defs>

          <rect width="1000" height="1000" fill="url(#ocean)" />
          <g transform={`translate(${view.x} ${view.y}) scale(${k})`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <path key={i} d={`M${40 + (i % 5) * 70} ${560 + i * 38} q 10 -7 20 0 t 20 0`} stroke="#ffffffaa" strokeWidth={1.6 / Math.sqrt(k)} fill="none" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={"e" + i} d={`M${965} ${140 + i * 90} q 8 -6 16 0 t 16 0`} stroke="#ffffffaa" strokeWidth={1.6 / Math.sqrt(k)} fill="none" />
            ))}
            <text x="160" y="760" className="mx-sea" style={{ fontSize: 20 / Math.sqrt(k) }}>Golfo</text>
            <text x="962" y="300" className="mx-sea" transform="rotate(90 962 300)" style={{ fontSize: 20 / Math.sqrt(k) }}>Oceano Atlântico</text>

            <rect x="80" y="0" width="820" height="50" fill="#e8e2d1" />
            <text x="490" y="33" textAnchor="middle" className="mx-state" style={{ fontSize: 16 / Math.sqrt(k) }}>GLORIANA</text>

            <path d={COAST} fill="url(#landg)" stroke="#a5c893" strokeWidth={2.5 / k} filter="url(#soft)" />
            {ISLANDS.map((d, i) => <path key={i} d={d} fill="#f4edd2" stroke="#a5c893" strokeWidth={1.6 / k} />)}
            <path d={FOREST} fill="url(#trees)" />
            <path d="M440 112 l26 -36 l26 36 z M480 122 l22 -30 l22 30 z M410 132 l20 -26 l20 26 z M520 132 l18 -24 l18 24 z" fill="#8e9b80" />
            <path d="M440 112 l26 -36 l8 11 z M480 122 l22 -30 l6 9 z" fill="#fff" opacity=".6" />
            <path d={SWAMP} fill="url(#swamp)" />
            <path d={CITY} fill="url(#blocks)" stroke="#e9a8cc" strokeWidth={1.5 / k} />
            <path d={LAKE} fill="#a3d6ee" stroke="#76b9da" strokeWidth={2 / k} />
            <text x="628" y="426" textAnchor="middle" className="mx-water" style={{ fontSize: 12 / Math.sqrt(k) }}>Lake Leonida</text>

            <path d="M120 300 L440 300 L440 60 M440 300 L660 300 L880 280 M660 300 L700 520 M420 570 L700 520 L790 560"
              stroke="#b59fd3" strokeWidth={1.4 / k} strokeDasharray={`${6 / k} ${5 / k}`} fill="none" />

            {ROADS.map((r, i) => (
              <g key={i}>
                <path d={r.d} stroke="#fff" strokeWidth={(r.major ? 7 : 4.5) / Math.sqrt(k)} fill="none" strokeLinecap="round" />
                <path d={r.d} stroke={r.major ? "#f59e0b" : "#fbbf77"} strokeWidth={(r.major ? 3.4 : 2.1) / Math.sqrt(k)} fill="none" strokeLinecap="round" />
              </g>
            ))}

            {REGIONS_MAP.map((r) => (
              <text key={r.id} x={r.x} y={r.y} textAnchor="middle" className="mx-region"
                style={{ fontSize: 22 / Math.sqrt(k), opacity: k > 4.5 ? 0.3 : 1 }}
                onPointerUp={tap(() => setSel({ ...r, region: true }))}>{r.name}</text>
            ))}
            {k >= 2.2 && DISTRICTS.map((d) => (
              <text key={d.name} x={d.x} y={d.y} textAnchor="middle" className="mx-district" style={{ fontSize: 13 / k }}>{d.name}</text>
            ))}

            {visible.map((m) => {
              const c = styleOf(m);
              const done = visited[m.id];
              const active = sel?.id === m.id;
              return (
                <g key={m.id} transform={`translate(${m.x} ${m.y}) scale(${(active ? 1.25 : 1) / k})`} className="mx-pin"
                  onPointerUp={tap(() => setSel(m))}>
                  <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#0003" />
                  <path d="M0 0 C -5 -9 -15 -15 -15 -27 A 15 15 0 1 1 15 -27 C 15 -15 5 -9 0 0 Z" fill={done ? "#94a3b8" : c.color} stroke="#fff" strokeWidth="2.5" />
                  <text x="0" y="-21.5" textAnchor="middle" className="mx-glyph">{done ? "✓" : c.glyph}</text>
                  {favs["p:" + m.id] && <circle cx="12" cy="-38" r="6" fill="#ec4899" stroke="#fff" strokeWidth="2" />}
                </g>
              );
            })}
          </g>
        </svg>
        <div className="mapx-zoom">
          <button onClick={() => zoomAt(500, 500, 1.6)} aria-label="Aproximar"><Plus size={18} /></button>
          <button onClick={() => zoomAt(500, 500, 1 / 1.6)} aria-label="Afastar"><Minus size={18} /></button>
          <button onClick={() => setView({ x: 0, y: 0, k: 1 })} aria-label="Ver tudo"><Maximize2 size={16} /></button>
        </div>
        <button className={"mapx-add" + (adding ? " on" : "")} onClick={() => setAdding(!adding)}>
          {adding ? "Toque no mapa…" : "+ Pin"}
        </button>
        <div className="mapx-quick">
          <button onClick={() => flyTo({ x: 870, y: 650 }, 3.2)}>Vice City</button>
          <button onClick={() => flyTo({ x: 620, y: 920 }, 2.6)}>Keys</button>
        </div>
      </div>
      )}

      {mode === "mapa" && (
      <div className="mapx-info glass">
        {sel ? (
          <>
            <div className="row between">
              <span className="mx-cat" style={{ color: sel.region ? "#6d28d9" : styleOf(sel)?.color }}>
                {sel.region ? (sel.county || "Região") : sel.cat === "pin" ? "Meu pin · " + styleOf(sel).label : CATEGORIES[sel.cat].label}
              </span>
              <button className="round small" onClick={() => setSel(null)} aria-label="Fechar"><X size={16} /></button>
            </div>
            <h3>{sel.name}</h3>
            <p>{sel.cat === "pin" ? (sel.note || "Sem nota.") : sel.text}</p>
            {!sel.region && <p className="fine" style={{ marginTop: -4 }}><Navigation size={12} /> {regionOf(sel)}</p>}
            {!sel.region && (
              <div className="row">
                <button className={"cta" + (visited[sel.id] ? " ghost" : "")} onClick={() => onToggleVisited(sel.id)}>
                  <Check size={17} /> {visited[sel.id] ? "Visitado" : "Marcar visitado"}
                </button>
                <button className={"round" + (favs["p:" + sel.id] ? " faved" : "")} onClick={() => onToggleFav("p:" + sel.id)} aria-label="Favoritar">
                  <Heart size={19} fill={favs["p:" + sel.id] ? "currentColor" : "none"} />
                </button>
                {sel.cat === "pin" && <button className="round" onClick={() => setDraft({ ...sel })} aria-label="Editar"><Pencil size={18} /></button>}
              </div>
            )}
          </>
        ) : (
          <p className="muted">Arraste, faça pinça ou dois toques para zoom. Use <b>Lista</b> para ver tudo por categoria, <b>filtros</b> para esconder o que já visitou e <b>+ Pin</b> para marcar flamingos, cartas, cofres e o que mais achar.</p>
        )}
        <p className="fine">Mapa ilustrativo original, com posições aproximadas a partir de informações públicas. Não é o mapa oficial do jogo.</p>
      </div>
      )}

      {draft && (
        <div className="scrim" onClick={() => setDraft(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <h2>{draft.isNew ? "Novo pin" : "Editar pin"}</h2>
            <div className="kinds">
              {Object.entries(PIN_KINDS).map(([kd, cfg]) => (
                <button key={kd} className={"kind" + (draft.kind === kd ? " on" : "")} onClick={() => setDraft({ ...draft, kind: kd })}>
                  <span className="g" style={{ background: cfg.color }}>{cfg.glyph}</span>{cfg.label}
                </button>
              ))}
            </div>
            <input className="field" placeholder={`Nome (ex.: ${PIN_KINDS[draft.kind].label} #1)`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <textarea className="field area sm" placeholder="Nota (como chegar, o que tem lá…)" value={draft.note || ""} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
            <div className="row">
              <button className="cta" onClick={() => {
                const { isNew, idx, cat, ...pin } = draft;
                const final = { ...pin, name: pin.name.trim() || `${PIN_KINDS[pin.kind].label} ${pins.length + 1}` };
                if (isNew) onAddPin(final); else onUpdatePin(idx, final);
                setSel(isNew ? null : { ...final, cat: "pin", idx });
                setDraft(null);
              }}><Check size={17} /> Salvar</button>
              {!draft.isNew && <button className="round" onClick={() => { onRemovePin(draft.idx); setDraft(null); setSel(null); }} aria-label="Apagar"><Trash2 size={18} /></button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
