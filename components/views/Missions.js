"use client";
import { useState } from "react";
import { Check, Heart, ChevronRight, ChevronLeft, X, Trophy, AlertTriangle, User } from "lucide-react";
import { CHAPTERS, MISSIONS } from "../../lib/data";
import { MISSION_TROPHY, MISSION_WARN } from "../../lib/links";
import { Sheet, Bar } from "../ui";
import { TrophyIcon } from "../Art";

export function MissionSheet({ m, state, toggleMission, fav, close, go, Link }) {
  const ch = CHAPTERS.find((c) => c.id === m.chapter);
  const done = !!state.missions[m.id];
  const key = "m:" + m.id;
  const trophy = MISSION_TROPHY[m.id];
  const warn = MISSION_WARN[m.id];
  const prev = MISSIONS.find((x) => x.id === m.id - 1);
  const next = MISSIONS.find((x) => x.id === m.id + 1);
  const spoiler = state.spoilerFree && !done && MISSIONS.some((x) => x.id < m.id - 1 && !state.missions[x.id]);
  return (
    <Sheet close={close} label={m.name} className="mission">
      <div className="row between">
        <p className="eyebrow">Capítulo {ch.id} · {ch.name}</p>
        <button className="round small" onClick={close} aria-label="Fechar"><X size={18} /></button>
      </div>
      <h2>{m.name}</h2>
      <p className="meta dark">Missão {m.id} de {MISSIONS.length}{m.who ? <> · <User size={13} /> {m.who}</> : ""}</p>
      {warn && (
        <div className="warnbox">
          <AlertTriangle size={18} />
          <span className="grow">{warn.text}{warn.point && <> <Link to="mapa" p={warn.point}>Ver no mapa</Link></>}</span>
        </div>
      )}
      <p className={spoiler ? "blur" : ""}>{m.note || "Missão principal da história. Faça um save manual antes de começar: não há replay de missões."}</p>
      {trophy && (
        <Link to="trofeus" id={trophy.id} className="glass linkcard">
          <TrophyIcon grade={trophy.grade} size={30} dim={!state.trophies[trophy.id]} />
          <span className="grow"><small>Troféu desta missão</small><b>{spoiler ? "Troféu oculto" : trophy.name}</b></span>
          <ChevronRight size={18} />
        </Link>
      )}
      <div className="row">
        <button className={"cta" + (done ? " ghost" : "")} onClick={() => toggleMission(m.id)}>
          <Check size={18} /> {done ? "Marcar como pendente" : "Concluir missão"}
        </button>
        <button className={"round" + (state.favs[key] ? " faved" : "")} onClick={() => fav(key)} aria-label="Favoritar" aria-pressed={!!state.favs[key]}><Heart size={20} fill={state.favs[key] ? "currentColor" : "none"} /></button>
      </div>
      <div className="row between sheetnav">
        {prev ? <button className="pill sm" onClick={() => go("missoes", prev.id, { replace: true })}><ChevronLeft size={15} /> Missão {prev.id}</button> : <span />}
        {next ? <button className="pill sm" onClick={() => go("missoes", next.id, { replace: true })}>Missão {next.id} <ChevronRight size={15} /></button> : <span />}
      </div>
    </Sheet>
  );
}

const WHO_FILTERS = [["todos", "Todas"], ["Lucia", "Lucia"], ["Jason", "Jason"]];

export function Missions({ state, update, toggleMission, Link }) {
  const firstOpen = MISSIONS.find((m) => !state.missions[m.id])?.chapter || 1;
  const [open, setOpen] = useState(firstOpen);
  const [who, setWho] = useState("todos");
  const lastDone = Math.max(0, ...MISSIONS.filter((m) => state.missions[m.id]).map((m) => m.id));
  return (
    <>
      <label className="glass switchrow">
        <span><b>Modo sem spoiler</b><small>Esconde missões e capítulos à frente</small></span>
        <input type="checkbox" checked={state.spoilerFree} onChange={(e) => update(() => ({ spoilerFree: e.target.checked }))} />
      </label>
      <div className="segs" role="group" aria-label="Filtrar por protagonista">
        {WHO_FILTERS.map(([k, l]) => <button key={k} className={who === k ? "on" : ""} aria-pressed={who === k} onClick={() => setWho(k)}>{l}</button>)}
      </div>
      {who !== "todos" && <p className="fine pad2">Mostrando só as missões em que o protagonista já foi confirmado pelos guias.</p>}
      {CHAPTERS.map((c) => {
        const all = MISSIONS.filter((m) => m.chapter === c.id);
        const list = all.filter((m) => who === "todos" || m.who === who);
        if (!list.length) return null;
        const done = all.filter((m) => state.missions[m.id]).length;
        const hideName = state.spoilerFree && c.id > firstOpen;
        const isOpen = open === c.id || who !== "todos";
        return (
          <div key={c.id} className="glass chapter">
            <button className="chapter-head" onClick={() => setOpen(open === c.id ? 0 : c.id)} aria-expanded={isOpen}>
              <span className={"chip-n tone" + c.id}>{c.id}</span>
              <span className="grow"><b className={hideName ? "blur" : ""}>{c.name}</b><small>{done} de {all.length}</small></span>
              <ChevronRight size={18} className={isOpen ? "rot" : ""} />
            </button>
            <Bar v={done / all.length} />
            {isOpen && (
              <ul className="list">
                {list.map((m) => {
                  const hide = state.spoilerFree && !state.missions[m.id] && m.id > lastDone + 1;
                  return (
                    <li key={m.id} className={state.missions[m.id] ? "done" : ""}>
                      <button className={"tick" + (state.missions[m.id] ? " on" : "")} onClick={() => toggleMission(m.id)}
                        aria-label={(state.missions[m.id] ? "Desmarcar " : "Concluir ") + (hide ? "missão " + m.id : m.name)} aria-pressed={!!state.missions[m.id]}><Check size={14} /></button>
                      {hide ? (
                        <span className="grow item"><span className="num">{m.id}</span><span className="blur">{m.name}</span></span>
                      ) : (
                        <Link to="missoes" id={m.id} className="grow item">
                          <span className="num">{m.id}</span>
                          <span>{m.name}</span>
                          {MISSION_WARN[m.id] && <AlertTriangle size={13} className="warnmark" aria-label="Tem perdível" />}
                          {m.who && <small className="whotag">{m.who}</small>}
                          {state.favs["m:" + m.id] && <Heart size={13} fill="currentColor" className="favmark" />}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}

