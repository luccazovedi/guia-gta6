"use client";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Bird, Spade, BookOpen, Watch, Flower2, Waves, ScanLine, Flag, Target, Drone, CircleDot, Circle, FlagTriangleRight, Zap, Landmark, Vault, ShoppingBag, Gem, Skull, Star, House, Store, Activity, Trophy, Radio } from "lucide-react";
const Icons = { Bird, Spade, BookOpen, Watch, Flower2, Waves, ScanLine, Flag, Target, Drone, CircleDot, Circle, FlagTriangleRight, Zap, Landmark, Vault, ShoppingBag, Gem, Skull, Star, House, Store, Activity, Trophy, Radio };
import { Plus, Minus, Maximize2, Search, Check, X, MapPin, Layers, Heart, Eye, EyeOff, StickyNote, Camera, Trash2, Pencil, Navigation, ChevronDown, ChevronRight } from "lucide-react";
import { GROUPS, CAT, COAST, LAKE, SWAMP, FOREST, CITY, ISLANDS, ROADS, REGIONS_MAP, DISTRICTS, MARKERS } from "../lib/mapdata";

const MIN = 1, MAX = 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fit = (v) => {
  const k = clamp(v.k, MIN, MAX);
  const lim = 1000 - 1000 * k;
  return { k, x: clamp(v.x, lim - 80, 80), y: clamp(v.y, lim - 80, 80) };
};
const regionOf = (m) => {
  let best = null, d = Infinity;
  for (const r of REGIONS_MAP) { const dd = (r.x - m.x) ** 2 + (r.y - m.y) ** 2; if (dd < d) { d = dd; best = r; } }
  return best?.name;
};
const CatIcon = ({ k, size = 16 }) => { const I = Icons[CAT[k]?.icon] || MapPin; return <I size={size} />; };

// Reduz a foto para caber no armazenamento do aparelho
function compress(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 640 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export default function LeonidaMap({ state, update, fav }) {
  const pins = state.pins || [];
  const found = state.visited || {};
  const favs = state.favs || {};
  const notes = state.mapNotes || {};
  const photos = state.photos || {};
  const hidden = state.mapHidden || {};
  const hideFound = !!state.mapHideFound;
  const onlyFavs = !!state.mapOnlyFavs;
  const setPref = (o) => update(() => o);

  const svgRef = useRef(null);
  const fileRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);
  const [panel, setPanel] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [q, setQ] = useState("");
  const [noteText, setNoteText] = useState("");
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const moved = useRef(false);

  const markers = useMemo(() => [
    ...MARKERS,
    ...pins.map((p, i) => ({ ...p, id: p.id || "pin" + i, cat: CAT[p.kind] ? p.kind : "outro", idx: i, mine: true })),
  ], [pins]);

  const toggleFound = (id) => update((st) => ({ visited: { ...(st.visited || {}), [id]: !(st.visited || {})[id] } }));

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
  const flyTo = (m, k = 4) => setView(fit({ k, x: 500 - m.x * k, y: 420 - m.y * k }));

  useEffect(() => {
    const el = svgRef.current;
    const onWheel = (e) => { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); zoomAt(p.x, p.y, e.deltaY < 0 ? 1.2 : 1 / 1.2); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toSvg, zoomAt]);

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
      setDraft({ id: "pin-" + Date.now(), name: "", kind: adding === true ? "flamingo" : adding, note: "", x: +((p.x - view.x) / view.k).toFixed(1), y: +((p.y - view.y) / view.k).toFixed(1), isNew: true });
      setAdding(false);
    }
  };
  const tap = (fn) => () => { if (!moved.current && !adding) fn(); };
  const select = (m) => { setSel(m); setNoteText(notes[m.id] || ""); };

  const k = view.k;
  const passes = (m) => !hidden[m.cat] && !(hideFound && found[m.id]) && !(onlyFavs && !favs["p:" + m.id]);
  const visible = markers.filter(passes);
  const ql = q.trim().toLowerCase();
  const results = ql.length > 1
    ? [...REGIONS_MAP.map((r) => ({ ...r, region: true })), ...DISTRICTS.map((d) => ({ ...d, region: true, county: "Bairro de Vice City", text: "Bairro de Vice City." })), ...markers]
        .filter((m) => (m.name + " " + (m.note || "") + " " + (notes[m.id] || "")).toLowerCase().includes(ql)).slice(0, 7)
    : [];
  const byCat = (key) => markers.filter((m) => m.cat === key);
  const foundCount = markers.filter((m) => found[m.id]).length;

  async function addPhoto(e) {
    const f = e.target.files?.[0];
    if (!f || !sel) return;
    try {
      const url = await compress(f);
      update((st) => ({ photos: { ...(st.photos || {}), [sel.id]: url } }));
    } catch { alert("Não foi possível ler a foto."); }
    e.target.value = "";
  }

  return (
    <div className="mapv">
      <div className="mapv-stage">
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
              const c = CAT[m.cat] || CAT.outro;
              const done = found[m.id];
              const active = sel?.id === m.id;
              return (
                <g key={m.id} transform={`translate(${m.x} ${m.y}) scale(${(active ? 1.25 : 1) / k})`} className="mx-pin"
                  onPointerUp={tap(() => select(m))}>
                  <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#0003" />
                  <path d="M0 0 C -5 -9 -15 -15 -15 -27 A 15 15 0 1 1 15 -27 C 15 -15 5 -9 0 0 Z" fill={done ? "#94a3b8" : c.color} stroke="#fff" strokeWidth="2.5" />
                  <text x="0" y="-21.5" textAnchor="middle" className="mx-glyph">{done ? "✓" : c.glyph}</text>
                  {favs["p:" + m.id] && <circle cx="12" cy="-38" r="6" fill="#ec4899" stroke="#fff" strokeWidth="2" />}
                  {(notes[m.id] || photos[m.id]) && <circle cx="-12" cy="-38" r="5" fill="#facc15" stroke="#fff" strokeWidth="2" />}
                </g>
              );
            })}
          </g>
        </svg>
        {/* busca flutuante */}
        <div className="mapv-top">
          <div className="mapv-search">
            <Search size={17} />
            <input placeholder="Buscar em Leonida…" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button onClick={() => setQ("")} aria-label="Limpar"><X size={16} /></button>}
          </div>
          <button className="mapv-btn" onClick={() => setPanel(true)} aria-label="Camadas"><Layers size={19} /></button>
        </div>
        {results.length > 0 && (
          <ul className="mapv-results">
            {results.map((m, i) => (
              <li key={i} onClick={() => { flyTo(m, m.region && !m.county?.startsWith("Bairro") ? 2.5 : 5); if (m.region) setSel(m); else select(m); setQ(""); }}>
                <span className="cdot" style={{ background: m.region ? "#6d28d9" : CAT[m.cat]?.color }}>{m.region ? <Navigation size={12} /> : <CatIcon k={m.cat} size={12} />}</span>
                <span className="grow">{m.name}<small>{m.region ? m.county || "Região" : CAT[m.cat]?.label}</small></span>
              </li>
            ))}
          </ul>
        )}

        <div className="mapv-zoom">
          <button onClick={() => zoomAt(500, 500, 1.6)} aria-label="Aproximar"><Plus size={18} /></button>
          <button onClick={() => zoomAt(500, 500, 1 / 1.6)} aria-label="Afastar"><Minus size={18} /></button>
          <button onClick={() => setView({ x: 0, y: 0, k: 1 })} aria-label="Ver tudo"><Maximize2 size={16} /></button>
        </div>

        <div className="mapv-bottom">
          <button className={"mapv-fab" + (adding ? " on" : "")} onClick={() => setAdding(adding ? false : true)}>
            {adding ? <><X size={17} /> Toque no mapa</> : <><MapPin size={17} /> Marcar</>}
          </button>
          <button className="mapv-chip" onClick={() => setPanel(true)}>
            <Check size={15} /> {foundCount} encontrados {hideFound && <EyeOff size={14} />}
          </button>
        </div>
      </div>

      <p className="fine pad2">Mapa ilustrativo original com posições aproximadas; não é o mapa oficial do jogo. Use <b>Marcar</b> para adicionar o que encontrar.</p>

      {/* Painel de camadas */}
      {panel && (
        <div className="scrim" onClick={() => setPanel(false)}>
          <div className="sheet layers" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="row between"><h2>Camadas</h2><button className="round small" onClick={() => setPanel(false)} aria-label="Fechar"><X size={16} /></button></div>
            <div className="lay-toggles">
              <button className={hideFound ? "on" : ""} onClick={() => setPref({ mapHideFound: !hideFound })}><EyeOff size={15} /> Esconder encontrados</button>
              <button className={onlyFavs ? "on" : ""} onClick={() => setPref({ mapOnlyFavs: !onlyFavs })}><Heart size={15} /> Só favoritos</button>
              <button onClick={() => setPref({ mapHidden: {} })}><Eye size={15} /> Mostrar tudo</button>
              <button onClick={() => setPref({ mapHidden: Object.fromEntries(Object.keys(CAT).map((c) => [c, true])) })}><EyeOff size={15} /> Ocultar tudo</button>
            </div>
            <div className="lay-jump">
              {[["Vice City", 870, 650, 3.2], ["Leonida Keys", 620, 920, 2.6], ["Grassrivers", 610, 715, 2.4], ["Port Gellhorn", 250, 370, 2.6], ["Ambrosia", 560, 440, 2.6], ["Mount Kalaga", 470, 150, 2.4]].map(([n, x, y, z]) => (
                <button key={n} onClick={() => { flyTo({ x, y }, z); setPanel(false); }}>{n}</button>
              ))}
            </div>
            {GROUPS.map((g) => (
              <div key={g.id} className="lay-group">
                <h4>{g.label}</h4>
                {g.items.map((c) => {
                  const list = byCat(c.key);
                  const n = list.filter((m) => found[m.id]).length;
                  const counter = c.counter ? state.counters?.[c.counter] || 0 : null;
                  const isOpen = openCat === c.key;
                  return (
                    <div key={c.key} className={"lay-row" + (hidden[c.key] ? " off" : "")}>
                      <div className="lay-main">
                        <span className="cdot lg" style={{ background: c.color }}><CatIcon k={c.key} size={16} /></span>
                        <button className="grow lay-name" onClick={() => setOpenCat(isOpen ? null : c.key)}>
                          <b>{c.label}</b>
                          <small>{list.length ? `${n}/${list.length} marcados` : "Nenhum marcado"}{c.total ? ` · ${c.total} no jogo` : ""}{counter != null ? ` · Tracker ${counter}` : ""}</small>
                        </button>
                        {list.length > 0 && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                        <button className="eye" onClick={() => setPref({ mapHidden: { ...hidden, [c.key]: !hidden[c.key] } })} aria-label="Mostrar ou esconder">
                          {hidden[c.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {isOpen && list.length > 0 && (
                        <ul className="lay-list">
                          {list.map((m) => (
                            <li key={m.id}>
                              <button className={"tick" + (found[m.id] ? " on" : "")} onClick={() => toggleFound(m.id)} aria-label="Encontrado"><Check size={13} /></button>
                              <button className="grow left" onClick={() => { setPanel(false); flyTo(m, Math.max(k, 4.5)); select(m); }}>
                                {m.name}<small>{regionOf(m)}</small>
                              </button>
                              {favs["p:" + m.id] && <Heart size={14} fill="currentColor" className="favmark" />}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ficha do marcador */}
      {sel && (
        <div className="scrim light" onClick={() => setSel(null)}>
          <div className="sheet marker" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="row between">
              {sel.region ? <span className="mk-cat" style={{ color: "#6d28d9" }}><Navigation size={14} /> {sel.county || "Região"}</span>
                : <span className="mk-cat" style={{ color: CAT[sel.cat]?.color }}><CatIcon k={sel.cat} size={14} /> {CAT[sel.cat]?.label}{sel.mine ? " · meu pin" : ""}</span>}
              <button className="round small" onClick={() => setSel(null)} aria-label="Fechar"><X size={16} /></button>
            </div>
            <h2>{sel.name}</h2>
            {!sel.region && <p className="mk-region"><Navigation size={13} /> {regionOf(sel)}</p>}
            <p className="mk-text">{sel.mine ? sel.note || "Marcador pessoal." : sel.text}</p>
            {!sel.region && (
              <>
                <div className="mk-actions">
                  <button className={found[sel.id] ? "on found" : ""} onClick={() => toggleFound(sel.id)}><Check size={18} />{found[sel.id] ? "Encontrado" : "Marcar encontrado"}</button>
                  <button className={favs["p:" + sel.id] ? "on fav" : ""} onClick={() => fav("p:" + sel.id)}><Heart size={18} fill={favs["p:" + sel.id] ? "currentColor" : "none"} />Favorito</button>
                  <button onClick={() => fileRef.current?.click()}><Camera size={18} />Foto</button>
                  {sel.mine && <button onClick={() => setDraft({ ...sel })}><Pencil size={18} />Editar</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={addPhoto} />
                {photos[sel.id] && (
                  <div className="mk-photo">
                    <img src={photos[sel.id]} alt="Sua foto deste local" />
                    <button className="round small" onClick={() => update((st) => { const p = { ...(st.photos || {}) }; delete p[sel.id]; return { photos: p }; })} aria-label="Remover foto"><Trash2 size={15} /></button>
                  </div>
                )}
                <label className="mk-note">
                  <span><StickyNote size={15} /> Minha nota</span>
                  <textarea className="field" placeholder="Como chegar, o que tem lá, lembretes…" value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={() => update((st) => ({ mapNotes: { ...(st.mapNotes || {}), [sel.id]: noteText } }))} />
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {/* Criar / editar pin */}
      {draft && (
        <div className="scrim" onClick={() => setDraft(null)}>
          <div className="sheet layers" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <h2>{draft.isNew ? "Marcar no mapa" : "Editar marcador"}</h2>
            {GROUPS.map((g) => (
              <div key={g.id} className="kgroup">
                <small>{g.label}</small>
                <div className="kinds">
                  {g.items.filter((c) => !["poi", "casa", "negocio", "atividade", "trofeu", "radio"].includes(c.key)).map((c) => (
                    <button key={c.key} className={"kind" + (draft.kind === c.key ? " on" : "")} onClick={() => setDraft({ ...draft, kind: c.key })}>
                      <span className="cdot" style={{ background: c.color }}><CatIcon k={c.key} size={12} /></span>{c.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <input className="field" placeholder={`Nome (ex.: ${CAT[draft.kind]?.one} #1)`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <textarea className="field area sm" placeholder="Nota (como chegar, o que tem lá…)" value={draft.note || ""} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
            <div className="row">
              <button className="cta" onClick={() => {
                const { isNew, idx, cat, mine, ...pin } = draft;
                const n = pins.filter((p) => p.kind === pin.kind).length + (isNew ? 1 : 0);
                const final = { ...pin, name: pin.name.trim() || `${CAT[pin.kind].one} #${n}` };
                update((st) => ({ pins: isNew ? [...(st.pins || []), final] : st.pins.map((x, j) => (j === idx ? final : x)) }));
                if (!isNew) setSel({ ...final, cat: final.kind, idx, mine: true });
                setDraft(null);
              }}><Check size={17} /> Salvar</button>
              {!draft.isNew && (
                <button className="round" onClick={() => { update((st) => ({ pins: st.pins.filter((_, j) => j !== draft.idx) })); setDraft(null); setSel(null); }} aria-label="Apagar"><Trash2 size={18} /></button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
