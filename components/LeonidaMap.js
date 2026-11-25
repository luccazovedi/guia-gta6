"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search, X, Check, Heart, Eye, EyeOff, Camera, Pencil, Trash2, StickyNote, MapPin, ChevronLeft, ChevronDown,
  ChevronRight, Layers, Navigation, Plus, Minus, Locate,
  Bird, Spade, BookOpen, Watch, Flower2, Waves, ScanLine, Flag, Target, Drone, CircleDot, Circle, FlagTriangleRight,
  Zap, Landmark, Vault, ShoppingBag, Gem, Skull, Star, House, Store, Activity, Trophy, Radio, HandCoins, Banknote, Wrench, Swords,
} from "lucide-react";
import { GROUPS, CAT, REGIONS_MAP, DISTRICTS, MARKERS, POINTS, TOWNS } from "../lib/mapdata";

// CRS com y para baixo (coordenadas 0–1000 do mapa)
const CRS = L.extend({}, L.CRS.Simple, { transformation: new L.Transformation(1, 0, 1, 0) });

const ICONS = { Bird, Spade, BookOpen, Watch, Flower2, Waves, ScanLine, Flag, Target, Drone, CircleDot, Circle, FlagTriangleRight, Zap, Landmark, Vault, ShoppingBag, Gem, Skull, Star, House, Store, Activity, Trophy, Radio, HandCoins, Banknote, Wrench, Swords };
const CatIcon = ({ k, size = 16 }) => { const I = ICONS[CAT[k]?.icon] || MapPin; return <I size={size} />; };
const svgCache = {};
const iconSvg = (k) => (svgCache[k] ||= renderToStaticMarkup(<CatIcon k={k} size={15} />));
const toLL = (m) => [m.y, m.x];
const regionOf = (m) => {
  if (m.area) return m.area;
  let best = null, d = Infinity;
  for (const r of REGIONS_MAP) { const dd = (r.x - m.x) ** 2 + (r.y - m.y) ** 2; if (dd < d) { d = dd; best = r; } }
  return best?.name;
};
const JUMPS = [["Vice City", 870, 640, 2], ["Leonida Keys", 600, 910, 1], ["Grassrivers", 610, 715, 1], ["Port Gellhorn", 250, 370, 1], ["Ambrosia", 560, 440, 1], ["Mount Kalaga", 470, 150, 1]];

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

export default function LeonidaMap({ state, update, fav, onBack }) {
  const pins = state.pins || [];
  const found = state.visited || {};
  const favs = state.favs || {};
  const notes = state.mapNotes || {};
  const photos = state.photos || {};
  const hidden = state.mapHidden || {};
  const hideFound = !!state.mapHideFound;
  const onlyFavs = !!state.mapOnlyFavs;
  const setPref = (o) => update(() => o);

  const el = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const addingRef = useRef(false);
  const fileRef = useRef(null);
  const [adding, setAdding] = useState(false);
  const [sel, setSel] = useState(null);
  const [draft, setDraft] = useState(null);
  const [drawer, setDrawer] = useState("peek"); // peek | full
  const [openCat, setOpenCat] = useState(null);
  const [q, setQ] = useState("");
  const [noteText, setNoteText] = useState("");

  const markers = useMemo(() => [
    ...MARKERS,
    ...POINTS,
    ...pins.map((p, i) => ({ ...p, id: p.id || "pin" + i, cat: CAT[p.kind] ? p.kind : "outro", idx: i, mine: true })),
  ], [pins]);
  const passes = (m) => !hidden[m.cat] && !(hideFound && found[m.id]) && !(onlyFavs && !favs["p:" + m.id]);
  const select = (m) => { setSel(m); setNoteText(notes[m.id] || ""); };
  const toggleFound = (id) => update((st) => ({ visited: { ...(st.visited || {}), [id]: !(st.visited || {})[id] } }));
  const flyTo = (m, z = 1.8) => mapRef.current?.flyTo(toLL(m), z, { duration: 0.6 });

  // cria o mapa
  useEffect(() => {
    const bounds = [[0, 0], [1000, 1000]];
    const map = L.map(el.current, {
      crs: CRS, minZoom: -2, maxZoom: 3, zoomSnap: 1, zoomDelta: 1, wheelPxPerZoomLevel: 90,
      zoomControl: false, attributionControl: false, maxBounds: [[-150, -150], [1150, 1150]], maxBoundsViscosity: 0.8,
    });
    L.tileLayer("/tiles/{z}/{x}/{y}.webp", { tileSize: 256, minZoom: -2, maxZoom: 3, minNativeZoom: -2, maxNativeZoom: 2, noWrap: true, bounds, keepBuffer: 3, updateWhenZooming: false }).addTo(map);
    // enquadra pela altura útil (celular em pé corta as laterais, como nos mapas de jogo)
    const h = el.current.clientHeight - (window.innerWidth < 900 ? 250 : 40);
    const w = el.current.clientWidth - (window.innerWidth < 900 ? 0 : 380);
    const z = Math.log2(Math.max(h, 300) / 1000);
    map.setView([560, window.innerWidth < 900 ? 640 : 560], Math.round(Math.max(z, Math.log2(Math.max(w, 300) / 1000))), { animate: false });
    if (window.innerWidth >= 900) map.panBy([-190, 0], { animate: false });

    // rótulos com tamanho fixo na tela
    const lbl = (x, y, t, cls) => L.marker([y, x], { interactive: false, keyboard: false, icon: L.divIcon({ className: "lm-lbl " + cls, html: `<span>${t}</span>`, iconSize: [0, 0] }) });
    const regions = L.layerGroup(REGIONS_MAP.map((r) => lbl(r.x, r.y, r.name.replace(" National Park", ""), r.id === "vice" ? "big" : "reg"))).addTo(map);
    const water = L.layerGroup([lbl(150, 760, "Golfo", "water"), lbl(975, 330, "Oceano Atlântico", "water vert"), lbl(628, 426, "Lake Leonida", "water sm"), lbl(490, 30, "Gloriana", "water")]).addTo(map);
    const districts = L.layerGroup(DISTRICTS.map((d) => lbl(d.x, d.y, d.name, "dist")));
    const towns = L.layerGroup(TOWNS.map((t) => lbl(t.x, t.y - 9, t.name, "town")));
    const onZoom = () => { const zz = map.getZoom(); if (zz >= 0.75) districts.addTo(map); else districts.remove(); if (zz >= 0) towns.addTo(map); else towns.remove(); el.current?.classList.toggle("far", zz < -0.5); el.current?.classList.toggle("mid", zz >= -0.5 && zz < 0.75); };
    map.on("zoomend", onZoom); onZoom();
    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e) => {
      if (!addingRef.current) return;
      const x = +e.latlng.lng.toFixed(1), y = +e.latlng.lat.toFixed(1);
      setDraft({ id: "pin-" + Date.now(), name: "", kind: "flamingo", note: "", x, y, isNew: true });
      addingRef.current = false; setAdding(false);
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);
  useEffect(() => { addingRef.current = adding; el.current?.classList.toggle("adding", adding); }, [adding]);

  // desenha os marcadores
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const m of markers) {
      if (!passes(m)) continue;
      const c = CAT[m.cat] || CAT.outro;
      const cls = ["lm-badge", found[m.id] && "found", sel?.id === m.id && "active"].filter(Boolean).join(" ");
      const html = `<div class="${cls}" style="--c:${c.color}">${iconSvg(m.cat)}${found[m.id] ? '<i class="lm-ok">✓</i>' : ""}${favs["p:" + m.id] ? '<i class="lm-fav"></i>' : ""}${notes[m.id] || photos[m.id] ? '<i class="lm-note"></i>' : ""}</div>`;
      L.marker(toLL(m), { icon: L.divIcon({ className: "lm-pin", html, iconSize: [32, 32], iconAnchor: [16, 16] }), title: m.name, riseOnHover: true })
        .on("click", () => { if (!addingRef.current) { select(m); setDrawer("peek"); } })
        .addTo(layer);
    }
  }, [markers, hidden, hideFound, onlyFavs, found, favs, notes, photos, sel]);

  const total = markers.length;
  const foundCount = markers.filter((m) => found[m.id]).length;
  const ql = q.trim().toLowerCase();
  const results = ql.length > 1
    ? [...REGIONS_MAP.map((r) => ({ ...r, region: true })), ...DISTRICTS.map((d) => ({ ...d, region: true, county: "Bairro de Vice City", text: "Bairro de Vice City." })), ...TOWNS.map((t) => ({ ...t, region: true, county: "Localidade", text: "" })), ...markers]
        .filter((m) => (m.name + " " + (m.note || "") + " " + (notes[m.id] || "")).toLowerCase().includes(ql)).slice(0, 8)
    : [];

  async function addPhoto(e) {
    const f = e.target.files?.[0];
    if (!f || !sel) return;
    try { const url = await compress(f); update((st) => ({ photos: { ...(st.photos || {}), [sel.id]: url } })); }
    catch { alert("Não foi possível ler a foto."); }
    e.target.value = "";
  }

  const Panel = (
    <>
      <div className="lm-head">
        <div><b>Mapa de Leonida</b><small>{foundCount} de {total} encontrados</small></div>
        <span className="lm-pct">{total ? Math.round((foundCount / total) * 100) : 0}%</span>
      </div>
      <div className="lm-bar"><span style={{ width: (total ? (foundCount / total) * 100 : 0) + "%" }} /></div>
      <div className="lm-search">
        <Search size={17} />
        <input placeholder="Buscar lugares, pins e notas" value={q} onFocus={() => setDrawer("full")} onChange={(e) => setQ(e.target.value)} />
        {q && <button onClick={() => setQ("")} aria-label="Limpar"><X size={16} /></button>}
      </div>
      {results.length > 0 && (
        <ul className="lm-results">
          {results.map((m, i) => (
            <li key={i} onClick={() => { flyTo(m, m.region && !m.county?.startsWith("Bairro") ? 1 : 2); if (!m.region) select(m); setQ(""); setDrawer("peek"); }}>
              <span className="cdot" style={{ background: m.region ? "#6d28d9" : CAT[m.cat]?.color }}>{m.region ? <Navigation size={12} /> : <CatIcon k={m.cat} size={12} />}</span>
              <span className="grow">{m.name}<small>{m.region ? m.county || "Região" : CAT[m.cat]?.label}</small></span>
            </li>
          ))}
        </ul>
      )}
      <div className="lm-chips">
        <button className={hideFound ? "on" : ""} onClick={() => setPref({ mapHideFound: !hideFound })}><EyeOff size={14} /> Esconder encontrados</button>
        <button className={onlyFavs ? "on" : ""} onClick={() => setPref({ mapOnlyFavs: !onlyFavs })}><Heart size={14} /> Favoritos</button>
        <button onClick={() => setPref({ mapHidden: {} })}><Eye size={14} /> Mostrar tudo</button>
        <button onClick={() => setPref({ mapHidden: Object.fromEntries(Object.keys(CAT).map((c) => [c, true])) })}><EyeOff size={14} /> Ocultar tudo</button>
      </div>
      <div className="lm-jumps">
        {JUMPS.map(([n, x, y, z]) => <button key={n} onClick={() => { flyTo({ x, y }, z); setDrawer("peek"); }}><Locate size={13} /> {n}</button>)}
      </div>
      {GROUPS.map((g) => (
        <div key={g.id} className="lm-group">
          <h4>{g.label}</h4>
          {g.items.map((c) => {
            const list = markers.filter((m) => m.cat === c.key);
            const n = list.filter((m) => found[m.id]).length;
            const isOpen = openCat === c.key;
            const counter = c.counter ? state.counters?.[c.counter] || 0 : null;
            return (
              <div key={c.key} className={"lm-row" + (hidden[c.key] ? " off" : "")}>
                <div className="lm-main">
                  <span className="cdot lg" style={{ background: c.color }}><CatIcon k={c.key} size={16} /></span>
                  <button className="grow lm-name" onClick={() => setOpenCat(isOpen ? null : c.key)}>
                    <b>{c.label}</b>
                    <small>{n}/{list.length} no mapa{c.total ? ` · ${c.total} no jogo` : ""}{counter != null ? ` · Tracker ${counter}` : ""}</small>
                  </button>
                  {list.length > 0 && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  <button className="lm-eye" onClick={() => setPref({ mapHidden: { ...hidden, [c.key]: !hidden[c.key] } })} aria-label="Mostrar ou esconder">
                    {hidden[c.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {isOpen && list.length > 0 && (
                  <ul className="lm-list">
                    {list.map((m) => (
                      <li key={m.id}>
                        <button className={"tick" + (found[m.id] ? " on" : "")} onClick={() => toggleFound(m.id)} aria-label="Encontrado"><Check size={13} /></button>
                        <button className="grow left" onClick={() => { flyTo(m, 2); select(m); setDrawer("peek"); }}>{m.name}<small>{regionOf(m)}</small></button>
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
      <p className="lm-fine">Mapa ilustrativo original. Os pontos vêm de guias públicos (PowerPyx, Bloxodes) e ficam na área indicada, com posição aproximada. Não é o mapa oficial do jogo.</p>
    </>
  );

  return (
    <div className="lm">
      <div ref={el} className="lm-map" />

      <div className="lm-top">
        <button className="lm-fab" onClick={onBack} aria-label="Voltar"><ChevronLeft size={20} /></button>
        <button className="lm-fab wide" onClick={() => setDrawer(drawer === "full" ? "peek" : "full")}><Layers size={18} /> Camadas</button>
      </div>
      <div className="lm-zoom">
        <button onClick={() => mapRef.current?.zoomIn()} aria-label="Aproximar"><Plus size={18} /></button>
        <button onClick={() => mapRef.current?.zoomOut()} aria-label="Afastar"><Minus size={18} /></button>
        <button onClick={() => mapRef.current?.fitBounds([[0, 0], [1000, 1000]])} aria-label="Ver tudo"><Locate size={17} /></button>
      </div>
      <button className={"lm-add" + (adding ? " on" : "")} onClick={() => setAdding(!adding)}>
        {adding ? <><X size={17} /> Toque no mapa</> : <><MapPin size={17} /> Marcar</>}
      </button>

      <aside className={"lm-panel " + drawer}>
        <button className="lm-handle" onClick={() => setDrawer(drawer === "full" ? "peek" : "full")} aria-label="Expandir painel"><span /></button>
        <div className="lm-scroll">{Panel}</div>
      </aside>

      {sel && (
        <div className="lm-card">
          <div className="row between">
            {sel.region ? <span className="mk-cat" style={{ color: "#a78bfa" }}><Navigation size={14} /> {sel.county || "Região"}</span>
              : <span className="mk-cat" style={{ color: CAT[sel.cat]?.color }}><CatIcon k={sel.cat} size={14} /> {CAT[sel.cat]?.label}{sel.mine ? " · meu pin" : ""}</span>}
            <button className="round small" onClick={() => setSel(null)} aria-label="Fechar"><X size={16} /></button>
          </div>
          <h2>{sel.name}</h2>
          <p className="mk-region"><Navigation size={13} /> {regionOf(sel)}{sel.approx ? " · posição aproximada" : ""}</p>
          <p className="mk-text">{sel.mine ? sel.note || "Marcador pessoal." : sel.text}</p>
          <div className="mk-actions">
            <button className={found[sel.id] ? "on found" : ""} onClick={() => toggleFound(sel.id)}><Check size={18} />{found[sel.id] ? "Encontrado" : "Encontrei"}</button>
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
        </div>
      )}

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
                setSel(isNew ? null : { ...final, cat: final.kind, idx, mine: true });
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
