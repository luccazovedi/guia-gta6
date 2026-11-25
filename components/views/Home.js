"use client";
import { useEffect, useState } from "react";
import {
  User, Info, Flag, PlayCircle, ArrowRight, Check, Megaphone, Compass, Library, Users, Map as MapIcon,
  Heart, Radio, Trophy, ChevronRight, Crown, Newspaper, PieChart, StickyNote, AlertTriangle,
} from "lucide-react";
import { MISSIONS, NEWS } from "../../lib/data";
import { MISSION_WARN } from "../../lib/links";
import { supabase } from "../../lib/supabase";
import { fmtDate, LockCard, Bar } from "../ui";

const TILES = [
  ["guias", "Guias", Library, "lav"], ["personagens", "Personagens", Users, "pink"],
  ["mapa", "Mapa", MapIcon, "peach"], ["missoes", "Missões", Flag, "lav"],
  ["favoritos", "Favoritos", Heart, "pink"], ["radio", "Rádio", Radio, "pink"],
  ["cem", "Tracker 100%", PieChart, "peach"], ["notas", "Minhas notas", StickyNote, "sand"],
  ["trofeus", "Troféus", Trophy, "lav"], ["novidades", "Novidades", Megaphone, "pink"],
];

export function HomeView({ state, s, go, Link, toggleMission, openMission, user, premium, unseen, openPro }) {
  const next = MISSIONS.find((m) => !state.missions[m.id]);
  const latest = NEWS[0];
  const warn = next && MISSION_WARN[next.id];
  return (
    <>
      <div className="homebar">
        <Link to="psn" className="round avatar" aria-label="Perfil">
          <User size={20} />{user && <span className="online" />}{premium && <span className="crown"><Crown size={11} /></span>}
        </Link>
        <h1 className="hometitle">Leonida Log</h1>
        <button className="round" onClick={openPro} aria-label="Sobre o Premium"><Info size={20} /></button>
      </div>

      <p className="eyebrow"><Flag size={15} /> Continue sua história</p>
      {next ? (
        <div className="nextcard">
          <p className="tag"><PlayCircle size={15} /> A seguir</p>
          <h2>{next.name}</h2>
          <p className="meta">Capítulo {next.chapter} · Missão {next.id} · História{next.who ? " · " + next.who : ""}</p>
          {warn && <p className="warnline"><AlertTriangle size={15} /> Perdível antes desta missão</p>}
          <div className="row">
            <button className="pill" onClick={() => openMission(next)}><ArrowRight size={17} /> Abrir</button>
            <button className="pill" onClick={() => toggleMission(next.id, true)}><Check size={17} /> Concluir</button>
          </div>
        </div>
      ) : (
        <div className="nextcard"><p className="tag">História concluída</p><h2>Leonida é sua 🌴</h2><p className="meta">Agora é caçar os 100%.</p></div>
      )}
      <div className="progress">
        <Bar v={s.missionsDone / MISSIONS.length} thin={false} />
        <span>{s.missionsDone} de {MISSIONS.length} missões</span>
      </div>

      <Link to="novidades" className="glass newsrow">
        <span className="newsicon"><Megaphone size={22} />{unseen > 0 && <span className="badge">{unseen}</span>}</span>
        <span className="grow">
          <b>Novidades</b>
          {unseen > 0 && <em>{unseen} {unseen === 1 ? "novidade" : "novidades"}</em>}
          <small>{latest.title}</small>
        </span>
        <ChevronRight size={20} />
      </Link>

      <h2 className="section"><Compass size={20} /> Explorar</h2>
      <div className="tiles">
        {TILES.map(([id, label, Icon, tone]) => (
          <Link key={id} to={id} className={"tile " + tone}>
            <Icon size={26} strokeWidth={2.4} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <h2 className="section"><Newspaper size={20} /> Notícias oficiais</h2>
      <HomeNews premium={premium} go={go} openPro={openPro} />
    </>
  );
}

function HomeNews({ premium, go, openPro }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    if (!premium) return;
    supabase.from("news").select("title, body, published_at").order("published_at", { ascending: false }).limit(3).then(({ data }) => setItems(data || []));
  }, [premium]);
  if (!premium) return <LockCard openPro={openPro} title="Notícias do jogo" text="Atualizações, trilha sonora e lançamentos de GTA VI no Premium." />;
  return (items || []).map((x, i) => (
    <button key={i} className="glass newscard" onClick={() => go("novidades")}>
      <small className="date2">{fmtDate(x.published_at)}</small>
      <b>{x.title}</b>
      <small>{x.body}</small>
    </button>
  ));
}
