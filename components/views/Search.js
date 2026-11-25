"use client";
import { useMemo, useState, useEffect } from "react";
import { Search, BookOpen, ChevronDown, X } from "lucide-react";
import { MISSIONS, TROPHIES, RADIOS, CHARACTERS, TIPS, REGIONS } from "../../lib/data";
import { MARKERS, POINTS, CAT } from "../../lib/mapdata";
import { GLOSSARY, GLOSSARY_CATS } from "../../lib/glossary";
import { ResultList, fold } from "../ui";

// a busca sobrevive ao abrir um resultado e voltar
let lastQuery = "";

export function SearchView({ state, go }) {
  const [q, setQ] = useState(lastQuery);
  const [open, setOpen] = useState(null);
  const [cat, setCat] = useState(null);
  useEffect(() => { lastQuery = q; }, [q]);
  const items = useMemo(() => {
    if (q.trim().length < 2) return [];
    const t = fold(q.trim());
    const hit = (...f) => f.some((x) => x && fold(x).includes(t));
    const places = [...MARKERS, ...POINTS, ...(state.pins || []).map((p) => ({ ...p, cat: p.kind, text: p.note, mine: true }))];
    return [
      ...GLOSSARY.filter((x) => hit(x.term, x.text, x.tags)).map((x) => ({ k: "g" + x.term, kind: "Explicação", name: x.term, sub: x.text, act: () => setOpen(x.term) })),
      ...MISSIONS.filter((m) => hit(m.name, m.note)).map((m) => ({ k: "m" + m.id, kind: "Missão", name: m.name, sub: `Capítulo ${m.chapter} · Missão ${m.id}`, act: () => go("missoes", m.id) })),
      ...TROPHIES.filter((x) => hit(x.name, x.desc)).map((x) => ({ k: x.id, kind: "Troféu", name: x.name, sub: x.desc, act: () => go("trofeus", x.id) })),
      ...places.filter((x) => hit(x.name, x.text, x.area, CAT[x.cat]?.label, (state.mapNotes || {})[x.id])).map((x) => ({ k: "p" + x.id, kind: "Mapa · " + (CAT[x.cat]?.one || "Local") + (x.mine ? " (meu pin)" : ""), name: x.name, sub: x.area ? `${x.area} · ${x.text || ""}` : x.text, act: () => go("mapa", null, { p: x.id }) })),
      ...Object.values(CAT).filter((c) => hit(c.label)).map((c) => ({ k: "c" + c.key, kind: "Camada do mapa", name: c.label, sub: c.total ? `${c.total} no jogo` : "", act: () => go("mapa", c.key) })),
      ...RADIOS.filter((x) => hit(x.name, x.genre, x.hosts, ...(x.songs || []))).map((x) => ({ k: x.id, kind: "Rádio", name: x.name, sub: `${x.genre} · ${x.hosts}`, act: () => go("radio", x.id) })),
      ...CHARACTERS.filter((x) => hit(x.name, x.role, x.text)).map((x) => ({ k: x.name, kind: "Personagem", name: x.name, sub: x.role, act: () => go("personagens") })),
      ...REGIONS.filter((x) => hit(x.name, x.text)).map((x) => ({ k: x.id, kind: "Região", name: x.name, sub: x.text, act: () => go("mapa") })),
      ...TIPS.flatMap((g) => g.items.filter((x) => hit(x)).map((x, i) => ({ k: g.cat + i + x.slice(0, 8), kind: "Dica · " + g.cat, name: x, act: () => go("guias") }))),
    ].slice(0, 80);
  }, [q, go, state.pins, state.mapNotes]);
  const def = q && open && GLOSSARY.find((g) => g.term === open);
  return (
    <>
      <div className="searchbox glass">
        <Search size={18} aria-hidden="true" />
        <input type="search" aria-label="Buscar no guia" placeholder="Missões, lugares, troféus, ícones…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        {q && <button onClick={() => setQ("")} aria-label="Limpar busca"><X size={16} /></button>}
      </div>
      <p className="sr-only" role="status">{q.trim().length >= 2 ? `${items.length} resultados` : ""}</p>
      {def && <div className="glass gdef"><b>{def.term}</b><p>{def.text}</p></div>}
      {q.trim().length >= 2 && !items.length && <p className="muted pad">Nada encontrado para “{q}”.</p>}
      <ResultList items={items} />
      {!q && (
        <>
          <div className="suggest">
            {["procurado", "receptador", "cofre", "flamingo", "Kenton", "Flash FM", "meditação"].map((x) => <button key={x} onClick={() => setQ(x)}>{x}</button>)}
          </div>
          <h2 className="section"><BookOpen size={20} /> Entenda o jogo</h2>
          <div className="gcats">
            {GLOSSARY_CATS.map((c) => (
              <button key={c.id} className={"gcat" + (cat === c.id ? " on" : "")} aria-pressed={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>
                <b>{c.label}</b><small>{GLOSSARY.filter((x) => x.cat === c.id).length} explicações</small>
              </button>
            ))}
          </div>
          {cat && (
            <ul className="gloss">
              {GLOSSARY.filter((x) => x.cat === cat).map((x) => (
                <li key={x.term} className={open === x.term ? "open" : ""}>
                  <button onClick={() => setOpen(open === x.term ? null : x.term)} aria-expanded={open === x.term}><b>{x.term}</b><ChevronDown size={16} /></button>
                  {open === x.term && <p>{x.text}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
