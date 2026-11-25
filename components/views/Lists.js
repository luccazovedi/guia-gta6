"use client";
import { useEffect, useState } from "react";
import {
  Trophy, Target, Flag, Sparkles, Crown, Lightbulb, Map as MapIcon, Check, Heart, Users, Fish, Building2, Mic, Landmark,
  Anchor, Crosshair, Package, Gem, Disc3, ShieldCheck, Waves, Wrench,
} from "lucide-react";
import { MISSIONS, TROPHIES, COMPLETION, RADIOS, CHARACTERS, TIPS, REGIONS } from "../../lib/data";
import { MARKERS, POINTS } from "../../lib/mapdata";
import { COUNTER_MAP } from "../../lib/links";
import { supabase } from "../../lib/supabase";
import { Portrait } from "../Art";
import { FavBtn, ResultList, LockCard, Bar } from "../ui";

/* ---------- Guias ---------- */
export function Guides({ Link, premium, openPro }) {
  const icons = { Dinheiro: "💵", "Polícia e roubos": "🚔", Progresso: "📈", Personagens: "🔁" };
  const [tips, setTips] = useState(null);
  useEffect(() => {
    if (!premium) return;
    supabase.from("premium_tips").select("category, body").order("sort").then(({ data }) => setTips(data || []));
  }, [premium]);
  const grouped = (tips || []).reduce((a, t) => ((a[t.category] ||= []).push(t.body), a), {});
  return (
    <>
      <div className="tiles">
        <Link to="trofeus" className="tile peach"><Trophy size={26} /><span>Troféus</span></Link>
        <Link to="cem" className="tile lav"><Target size={26} /><span>Checklist 100%</span></Link>
      </div>

      <h2 className="section"><Sparkles size={20} /> Dicas exclusivas</h2>
      {premium ? (
        tips === null ? <p className="pad">Carregando…</p> :
        Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="glass premium-card">
            <h3 className="h4"><Crown size={16} /> {cat}</h3>
            <ul className="tips">{list.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        ))
      ) : <LockCard openPro={openPro} title="Dicas exclusivas" text="Perdíveis, rota de 100%, cheats escondidos e troféus fáceis." />}

      <h2 className="section"><Lightbulb size={20} /> Dicas essenciais</h2>
      {TIPS.map((t) => (
        <div key={t.cat} className="glass">
          <h3 className="h4">{icons[t.cat]} {t.cat}</h3>
          <ul className="tips">{t.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      ))}
      <h2 className="section"><MapIcon size={20} /> Regiões de Leonida</h2>
      {REGIONS.map((r) => (
        <div key={r.id} className="glass"><h3 className="h4">{r.name}</h3><p className="muted">{r.text}</p></div>
      ))}
    </>
  );
}

/* ---------- 100% ---------- */
export function Completion({ state, update, s, Link }) {
  const set = (id, v) => update((st) => ({ counters: { ...st.counters, [id]: Math.max(0, v) } }));
  return (
    <>
      <div className="nextcard compact">
        <p className="tag">Conclusão estimada</p>
        <p className="huge h2">{s.completion.toFixed(1)}%</p>
        <p className="meta">{s.linesDone} de {s.linesTotal} linhas completas · valores em $ estão em milhares</p>
      </div>
      <p className="fine pad2">Marcar um ponto como encontrado no mapa também soma na linha correspondente.</p>
      {COMPLETION.map((g) => (
        <div key={g.group} className="glass">
          <h2 className="h4">{g.group}</h2>
          <ul className="counters">
            {g.items.map((it) => {
              const v = it.id === "story" ? s.missionsDone : state.counters[it.id] || 0;
              const ok = v >= it.need;
              const map = COUNTER_MAP[it.id];
              return (
                <li key={it.id} className={ok ? "done" : ""}>
                  <div className="row between">
                    <span>{ok && <Check size={14} />} {it.label}</span>
                    <small>{v}/{it.need}{it.total ? ` · ${it.total} no jogo` : ""}</small>
                  </div>
                  <div className="row">
                    <Bar v={v / it.need} className="grow" />
                    {map && <Link to="mapa" id={map} className="step map" aria-label={`Ver ${it.label} no mapa`}><MapIcon size={15} /></Link>}
                    {it.id === "story" ? <Link to="missoes" className="step map" aria-label="Abrir missões"><Flag size={15} /></Link> : (
                      <>
                        <button className="step" onClick={() => set(it.id, v - 1)} aria-label={`Diminuir ${it.label}`}>−</button>
                        <input className="val" type="number" inputMode="numeric" min="0" value={v} aria-label={it.label} onChange={(e) => set(it.id, +e.target.value || 0)} />
                        <button className="step" onClick={() => set(it.id, v + 1)} aria-label={`Aumentar ${it.label}`}>+</button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

/* ---------- Personagens ---------- */
const CHAR_STYLE = {
  "Lucia Caminos": [Crown, 330, "Protagonista"], "Jason Duval": [Crown, 210, "Protagonista"],
  "Cal Hampton": [Fish, 180], "Brian Heder": [Anchor, 30], "Lori Heder": [Heart, 350],
  "Boobie Ike": [Building2, 280], "Dre'Quan Priest": [Mic, 260], "Real Dimez": [Disc3, 300],
  "Raul Bautista": [Landmark, 10], "Kenton Rees": [Waves, 195], "Bret": [Crosshair, 100],
  "Tyrone": [Wrench, 40], "Randy": [Package, 60], "Andy": [ShieldCheck, 150], "Billy": [Gem, 240],
};
export const charAnchor = (name) => "p-" + name.toLowerCase().replace(/[^a-z]+/g, "-");

export function Characters({ state, fav }) {
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <ul className="cards">
      {CHARACTERS.map((c) => {
        const [, h, badge] = CHAR_STYLE[c.name] || [Users, 270];
        return (
          <li key={c.name} id={charAnchor(c.name)} className={"glass char" + (badge ? " protag" : "")}>
            <Portrait name={c.name} hue={h} size={64} />
            <div className="grow">
              <b>{c.name} {badge && <span className="leadtag">{badge}</span>}</b>
              <small className="genre">{c.role}</small>
              <small>{c.text}</small>
            </div>
            <FavBtn on={state.favs["c:" + c.name]} onClick={() => fav("c:" + c.name)} />
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Favoritos ---------- */
export function Favorites({ state, go }) {
  const keys = Object.keys(state.favs).filter((k) => state.favs[k]);
  const items = keys.map((k) => {
    const [t, id] = [k.slice(0, 1), k.slice(2)];
    if (t === "m") { const m = MISSIONS.find((x) => x.id === +id); return m && { k, kind: "Missão", name: m.name, sub: `Capítulo ${m.chapter}`, act: () => go("missoes", m.id) }; }
    if (t === "t") { const x = TROPHIES.find((y) => y.id === id); return x && { k, kind: "Troféu", name: x.name, sub: x.desc, act: () => go("trofeus", x.id) }; }
    if (t === "r") { const x = RADIOS.find((y) => y.id === id); return x && { k, kind: "Rádio", name: x.name, sub: x.genre, act: () => go("radio", x.id) }; }
    if (t === "p") { const x = MARKERS.find((y) => y.id === id) || POINTS.find((y) => y.id === id) || (state.pins || []).find((y) => y.id === id); return x && { k, kind: "Lugar no mapa", name: x.name, sub: x.text || x.note, act: () => go("mapa", null, { p: x.id }) }; }
    if (t === "c") { const x = CHARACTERS.find((y) => y.name === id); return x && { k, kind: "Personagem", name: x.name, sub: x.role, act: () => { go("personagens"); setTimeout(() => document.getElementById(charAnchor(x.name))?.scrollIntoView({ block: "center" }), 50); } }; }
    return null;
  }).filter(Boolean);
  if (!items.length) return <div className="empty"><Heart size={40} /><p>Toque no coração em missões, troféus, rádios, personagens e lugares do mapa para guardá-los aqui.</p></div>;
  return <ResultList items={items} />;
}
