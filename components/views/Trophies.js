"use client";
import { useState } from "react";
import { Check, X, RefreshCw, AlertTriangle, Map as MapIcon, Flag, Users, PieChart, ChevronRight, Route, Eye, Lightbulb } from "lucide-react";
import { TROPHIES, MISSIONS, CHARACTERS } from "../../lib/data";
import { CAT } from "../../lib/mapdata";
import { TROPHY_LINKS, MISSABLE_TROPHIES, COUNTER_LABEL } from "../../lib/links";
import { applyPsn } from "../../lib/store";
import { syncPsn } from "../../lib/psn";
import { TrophyIcon } from "../Art";
import { Sheet, FavBtn, Bar } from "../ui";

const GRADES = ["platina", "ouro", "prata", "bronze"];
const HIDDEN_TOTAL = TROPHIES.filter((t) => t.hidden).length;
const fmt = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

// Progresso de um troféu ligado a uma linha do Tracker
function trophyProgress(t, state, s) {
  const l = TROPHY_LINKS[t.id];
  if (l.counter) return { v: state.counters[l.counter] || 0, need: l.need, label: COUNTER_LABEL[l.counter] };
  if (l.view === "cem") return { v: s.completion, need: 100, label: "Conclusão (%)" };
  return null;
}

function Roadmap({ state, s, Link }) {
  const counterTrophies = TROPHIES.filter((t) => TROPHY_LINKS[t.id].counter);
  const counterDone = counterTrophies.filter((t) => state.trophies[t.id] || (state.counters[TROPHY_LINKS[t.id].counter] || 0) >= TROPHY_LINKS[t.id].need).length;
  const missDone = MISSABLE_TROPHIES.filter((t) => state.trophies[t.id]).length;
  const hiddenDone = TROPHIES.filter((t) => t.hidden && state.trophies[t.id]).length;
  const steps = [
    [AlertTriangle, "Perdíveis primeiro", `${missDone}/${MISSABLE_TROPHIES.length}`, MISSABLE_TROPHIES.length ? missDone / MISSABLE_TROPHIES.length : 1, MISSABLE_TROPHIES[0] && { to: "trofeus", id: MISSABLE_TROPHIES[0].id }],
    [Flag, "Termine a história", `${s.missionsDone}/${MISSIONS.length}`, s.missionsDone / MISSIONS.length, { to: "missoes" }],
    [MapIcon, "Troféus de contagem (mapa)", `${counterDone}/${counterTrophies.length}`, counterDone / counterTrophies.length, { to: "mapa" }],
    [PieChart, "100% (A Long Road)", `${s.completion.toFixed(1)}%`, s.completion / 100, { to: "cem" }],
    [Eye, "Ocultos e situacionais", `${hiddenDone}/${HIDDEN_TOTAL}`, hiddenDone / HIDDEN_TOTAL, null],
  ];
  return (
    <div className="glass roadmap">
      <h2 className="h4 row"><Route size={18} /> Roteiro da platina</h2>
      <ol>
        {steps.map(([Icon, label, val, v, link], i) => {
          const inner = (
            <>
              <span className={"rstep" + (v >= 1 ? " ok" : "")}>{v >= 1 ? <Check size={13} /> : i + 1}</span>
              <span className="grow"><span className="row between"><b>{label}</b><small>{val}</small></span><Bar v={v} /></span>
              {link && <ChevronRight size={16} />}
            </>
          );
          return <li key={label}>{link ? <Link to={link.to} id={link.id} className="rlink">{inner}</Link> : <div className="rlink">{inner}</div>}</li>;
        })}
      </ol>
    </div>
  );
}

export function Trophies({ state, update, s, fav, premium, go, openPro, Link }) {
  const [f, setF] = useState("todos");
  const [showHidden, setShowHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const psn = state.psn?.trophies ? state.psn : null;
  const list = TROPHIES.filter((t) => f === "todos" || (f === "faltam" ? !state.trophies[t.id] : f === "perdiveis" ? TROPHY_LINKS[t.id].missable : t.grade === f));
  const toggle = (id) => update((st) => ({ trophies: { ...st.trophies, [id]: !st.trophies[id] } }));

  async function resync() {
    setBusy(true); setMsg(null);
    const r = await syncPsn({});
    if (r.ok) update((st) => applyPsn(st, r.data));
    setMsg(r.ok ? "Troféus atualizados." : r.error);
    setBusy(false);
  }

  return (
    <>
      <div className="glass psnbar">
        <span className="psnlogo">PSN</span>
        <div className="grow">
          {psn ? (<><b>{state.psn.onlineId || "Conta PSN"} · {state.psn.progress ?? 0}%</b><small>Sincronizado em {new Date(state.psn.syncedAt).toLocaleString("pt-BR")}</small></>)
            : (<><b>Troféus manuais</b><small>{premium ? "Conecte a PSN no Perfil para marcar sozinho." : "Vincule a PSN (premium) para marcar sozinho."}</small></>)}
        </div>
        {psn ? <button className="round small" onClick={resync} aria-label="Sincronizar"><RefreshCw size={16} className={busy ? "spin" : ""} /></button>
          : <button className="pill sm" onClick={() => (premium ? go("psn") : openPro())}>Conectar</button>}
      </div>
      {msg && <p className="pad" role="status">{msg}</p>}

      <Roadmap state={state} s={s} Link={Link} />

      <div className="segs" role="group" aria-label="Filtrar troféus">
        {["todos", "faltam", "perdiveis", ...GRADES].map((x) => {
          const n = GRADES.includes(x) ? TROPHIES.filter((t) => t.grade === x) : null;
          return (
            <button key={x} className={(f === x ? "on" : "") + (n ? " gchip" : "")} aria-pressed={f === x} onClick={() => setF(x)}>
              {n && <TrophyIcon grade={x} size={20} />}{x === "perdiveis" ? "perdíveis" : x}{n && <em>{n.filter((t) => state.trophies[t.id]).length}/{n.length}</em>}
            </button>
          );
        })}
      </div>
      <label className="glass switchrow">
        <span><b>Mostrar ocultos</b><small>{HIDDEN_TOTAL} troféus ocultos contêm spoilers</small></span>
        <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
      </label>
      <ul className="cards">
        {list.map((t) => {
          const hide = t.hidden && !showHidden && !state.trophies[t.id];
          const done = !!state.trophies[t.id];
          const p = psn?.trophies?.[t.id];
          const prog = !done && trophyProgress(t, state, s);
          return (
            <li key={t.id} className={"glass trophy" + (done ? " done" : "")}>
              <button className="tbtn" onClick={() => toggle(t.id)} aria-label={(done ? "Desmarcar " : "Marcar ") + (hide ? "troféu oculto" : t.name)} aria-pressed={done}>
                <TrophyIcon grade={t.grade} size={44} dim={!done} />
                {done && <span className="tcheck"><Check size={11} /></span>}
              </button>
              {hide ? (
                <button className="grow tinfo" onClick={() => setShowHidden(true)}><b>Troféu oculto</b><small>Toque para mostrar os ocultos.</small></button>
              ) : (
                <Link to="trofeus" id={t.id} className="grow tinfo">
                  <b>{t.name}{TROPHY_LINKS[t.id].missable && <span className="misstag">Perdível</span>}</b>
                  <small>{t.desc}</small>
                  {prog && <span className="tprog"><Bar v={prog.v / prog.need} /><small>{Math.min(prog.v, prog.need)}/{prog.need}</small></span>}
                  {p && (
                    <span className="psnmeta">
                      <span className="psntag">PSN</span>
                      {p.earned && p.earnedAt ? `Conquistado em ${fmt(p.earnedAt)}` : "Ainda não conquistado"}
                      {p.rate != null && ` · ${p.rate}% dos jogadores`}
                    </span>
                  )}
                </Link>
              )}
              {!hide && <FavBtn on={state.favs["t:" + t.id]} onClick={() => fav("t:" + t.id)} />}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function TrophySheet({ id, state, update, s, fav, close, Link }) {
  const t = TROPHIES.find((x) => x.id === id);
  if (!t) return null;
  const l = TROPHY_LINKS[t.id];
  const done = !!state.trophies[t.id];
  const p = state.psn?.trophies?.[t.id];
  const prog = trophyProgress(t, state, s);
  const cat = l.map && CAT[l.map];
  const m = l.mission && MISSIONS.find((x) => x.id === l.mission);
  const ch = l.char && CHARACTERS.find((x) => x.name === l.char);
  const toggle = () => update((st) => ({ trophies: { ...st.trophies, [t.id]: !st.trophies[t.id] } }));
  return (
    <Sheet close={close} label={t.name} className="trophysheet">
      <div className="row between">
        <p className="eyebrow">Troféu de {t.grade}{t.hidden ? " · oculto" : ""}</p>
        <button className="round small" onClick={close} aria-label="Fechar"><X size={18} /></button>
      </div>
      <div className="row tshead">
        <TrophyIcon grade={t.grade} size={64} dim={!done} />
        <h2>{t.name}</h2>
      </div>
      <p>{t.desc}</p>
      {l.missable && <div className="warnbox"><AlertTriangle size={18} /><span className="grow"><b>Perdível.</b> {l.missable}</span></div>}
      {prog && (
        <div className="glass inset">
          <div className="row between"><small>{prog.label}</small><small className="mono">{Math.min(prog.v, prog.need)}/{prog.need}</small></div>
          <Bar v={prog.v / prog.need} />
        </div>
      )}
      {p && <p className="psnmeta"><span className="psntag">PSN</span>{p.earned && p.earnedAt ? `Conquistado em ${fmt(p.earnedAt)}` : "Ainda não conquistado"}{p.rate != null && ` · ${p.rate}% dos jogadores`}</p>}
      <div className="linkgrid">
        {cat && <Link to="mapa" id={l.map} className="pill"><MapIcon size={16} /> {cat.label} no mapa</Link>}
        {l.point && <Link to="mapa" p={l.point} className="pill"><MapIcon size={16} /> Ver o local</Link>}
        {m && <Link to="missoes" id={m.id} className="pill"><Flag size={16} /> Missão {m.id}: {m.name}</Link>}
        {ch && <Link to="personagens" className="pill"><Users size={16} /> {ch.name}</Link>}
        {l.counter && <Link to="cem" className="pill"><PieChart size={16} /> Tracker 100%</Link>}
        {l.view === "cem" && <Link to="cem" className="pill"><PieChart size={16} /> Abrir o Tracker 100%</Link>}
        {l.view === "personagens" && <Link to="personagens" className="pill"><Users size={16} /> Linhas de estranhos</Link>}
        {l.tipCat && <Link to="guias" className="pill"><Lightbulb size={16} /> Dicas: {l.tipCat}</Link>}
      </div>
      <div className="row">
        <button className={"cta" + (done ? " ghost" : "")} onClick={toggle}><Check size={18} /> {done ? "Marcar como pendente" : "Conquistei"}</button>
        <FavBtn on={state.favs["t:" + t.id]} onClick={() => fav("t:" + t.id)} />
      </div>
    </Sheet>
  );
}
