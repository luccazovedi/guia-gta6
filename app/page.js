"use client";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  User, Info, Flag, PlayCircle, ArrowRight, Check, Megaphone, Compass, Library, Users, Map as MapIcon,
  Heart, Radio, Search, Trophy, Target, ChevronRight, ChevronLeft, X, Lightbulb, RefreshCw,
  Lock, Crown, LogOut, Mail, Music, Sparkles, ExternalLink, Fish, Building2, Mic, Landmark, Anchor, Crosshair,
  Package, Gem, Disc3, Cloud, ShieldCheck, Waves, Wrench, Gamepad2, Link2, StickyNote, MapPin, CircleCheck,
  Layers, Newspaper, Moon, Sun, Plus, Trash2, Flag as FlagIcon, PieChart,
} from "lucide-react";
import { CHAPTERS, MISSIONS, TROPHIES, COMPLETION, RADIOS, CHARACTERS, TIPS, NEWS, REGIONS } from "../lib/data";
import { MARKERS } from "../lib/mapdata";
import { useProgress, stats, applyPsn, useCloudSync } from "../lib/store";
import { supabase } from "../lib/supabase";
import { StationCover, TrophyIcon } from "../components/Art";

const LeonidaMap = dynamic(() => import("../components/LeonidaMap"), { ssr: false });

const TITLES = {
  guias: "Guias", mapa: "Mapa", missoes: "Missões", busca: "Buscar", trofeus: "Troféus", cem: "Tracker 100%",
  radio: "Rádio", personagens: "Personagens", favoritos: "Favoritos", psn: "Perfil", novidades: "Novidades", notas: "Minhas notas",
};
const TABBAR = [["inicio", null, "Início"], ["guias", Library, "Guias"], ["mapa", MapIcon, "Mapa"], ["missoes", FlagIcon, "Missões"], ["busca", Search, "Buscar"]];

function useTheme(pref) {
  const [sys, setSys] = useState("light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const f = () => setSys(mq.matches ? "dark" : "light");
    f(); mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return !pref || pref === "auto" ? sys : pref;
}

export default function App() {
  const { state, update, ready } = useProgress();
  const [view, setView] = useState("inicio");
  const [prev, setPrev] = useState("inicio");
  const [sheet, setSheet] = useState(null);
  const [pro, setPro] = useState(false);
  const s = useMemo(() => stats(state), [state]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const theme = useTheme(state.theme);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setUser(sess?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from("profiles").select("is_premium, premium_since").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data || { is_premium: false }));
  }, [user]);
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#17111f" : "#8e6cf0");
  }, [theme]);
  const cloud = useCloudSync(state, update, ready, user);
  const premium = !!profile?.is_premium;
  const unseen = Math.max(0, NEWS.length - state.newsSeen);

  const go = (v) => { setPrev(view); setView(v); window.scrollTo({ top: 0 }); };
  const fav = (key) => update((st) => ({ favs: { ...st.favs, [key]: !st.favs[key] } }));
  const toggleMission = (id, val) => update((st) => ({ missions: { ...st.missions, [id]: val ?? !st.missions[id] } }));
  const ctx = { state, update, s, go, fav, toggleMission, openMission: setSheet, user, profile, premium, cloud, openPro: () => setPro(true), unseen, theme };

  return (
    <div className={"bg " + theme}>
      <div className="phone">
        {view !== "inicio" && (
          <header className="subhead">
            <button className="round" onClick={() => go(TABBAR.some(([t]) => t === view) ? "inicio" : prev === view ? "inicio" : prev)} aria-label="Voltar"><ChevronLeft size={20} /></button>
            <h1>{TITLES[view]}</h1>
            <span style={{ width: 46 }} />
          </header>
        )}

        <main className={ready ? "" : "loading"}>
          {view === "inicio" && <HomeView {...ctx} />}
          {view === "guias" && <Guides {...ctx} />}
          {view === "mapa" && <MapTabs>{(
            <LeonidaMap pins={state.pins} visited={state.visited || {}} favs={state.favs}
              onToggleVisited={(id) => update((st) => ({ visited: { ...(st.visited || {}), [id]: !(st.visited || {})[id] } }))}
              onToggleFav={fav}
              onAddPin={(p) => update((st) => ({ pins: [...st.pins, p] }))}
              onUpdatePin={(i, p) => update((st) => ({ pins: st.pins.map((x, j) => (j === i ? p : x)) }))}
              onRemovePin={(i) => update((st) => ({ pins: st.pins.filter((_, j) => j !== i) }))} />
          )}</MapTabs>}
          {view === "missoes" && <Missions {...ctx} />}
          {view === "busca" && <SearchView {...ctx} />}
          {view === "trofeus" && <Trophies {...ctx} />}
          {view === "cem" && <Completion {...ctx} />}
          {view === "radio" && <Radios {...ctx} />}
          {view === "personagens" && <Characters {...ctx} />}
          {view === "favoritos" && <Favorites {...ctx} />}
          {view === "psn" && <Profile {...ctx} />}
          {view === "novidades" && <News {...ctx} />}
          {view === "notas" && <Notes {...ctx} />}
          <p className="legal">Projeto de fã, sem vínculo com Rockstar Games, Take-Two ou Sony. Dados de guias públicos da semana de lançamento (nov/2026).</p>
        </main>

        <nav className="tabbar">
          {TABBAR.map(([id, Icon, label]) => (
            <button key={id} className={view === id ? "on" : ""} onClick={() => go(id)}>
              {Icon ? <Icon size={22} strokeWidth={view === id ? 2.6 : 2} /> : <span className="ll">LL</span>}
              <span className="tl">{label}</span>
              {id === "inicio" && unseen > 0 && <span className="badge">{unseen}</span>}
            </button>
          ))}
        </nav>

        {sheet && <MissionSheet m={sheet} {...ctx} close={() => setSheet(null)} />}
        {pro && <ProSheet {...ctx} close={() => setPro(false)} />}
      </div>
    </div>
  );
}

/* ---------- Início ---------- */
function HomeView({ state, s, go, toggleMission, openMission, user, premium, unseen, openPro }) {
  const next = MISSIONS.find((m) => !state.missions[m.id]);
  const tiles = [
    ["guias", "Guias", Library, "lav"], ["personagens", "Personagens", Users, "pink"],
    ["mapa", "Mapa", MapIcon, "peach"], ["missoes", "Missões", FlagIcon, "lav"],
    ["favoritos", "Favoritos", Heart, "pink"], ["radio", "Rádio", Radio, "pink"],
    ["cem", "Tracker 100%", PieChart, "peach"], ["notas", "Minhas notas", StickyNote, "sand"],
    ["trofeus", "Troféus", Trophy, "lav"], ["novidades", "Novidades", Megaphone, "pink"],
  ];
  const latest = NEWS[0];
  return (
    <>
      <div className="homebar">
        <button className="round avatar" onClick={() => go("psn")} aria-label="Perfil">
          <User size={20} />{user && <span className="online" />}{premium && <span className="crown"><Crown size={11} /></span>}
        </button>
        <h1 className="hometitle">Leonida Log</h1>
        <button className="round" onClick={openPro} aria-label="Premium"><Info size={20} /></button>
      </div>

      <p className="eyebrow"><FlagIcon size={15} /> Continue sua história</p>
      {next ? (
        <div className="nextcard">
          <p className="tag"><PlayCircle size={15} /> A seguir</p>
          <h2>{next.name}</h2>
          <p className="meta">Capítulo {next.chapter} · Missão {next.id} · História{next.who ? " · " + next.who : ""}</p>
          <div className="row">
            <button className="pill" onClick={() => openMission(next)}><ArrowRight size={17} /> Abrir</button>
            <button className="pill" onClick={() => toggleMission(next.id, true)}><Check size={17} /> Concluir</button>
          </div>
        </div>
      ) : (
        <div className="nextcard"><p className="tag">História concluída</p><h2>Leonida é sua 🌴</h2><p className="meta">Agora é caçar os 100%.</p></div>
      )}
      <div className="progress">
        <div className="bar"><span style={{ width: (s.missionsDone / 91) * 100 + "%" }} /></div>
        <span>{s.missionsDone} de 91 missões</span>
      </div>

      <button className="glass newsrow" onClick={() => go("novidades")}>
        <span className="newsicon"><Megaphone size={22} />{unseen > 0 && <span className="badge">{unseen}</span>}</span>
        <span className="grow">
          <b>Novidades</b>
          {unseen > 0 && <em>{unseen} {unseen === 1 ? "novidade" : "novidades"}</em>}
          <small>{latest.title}</small>
        </span>
        <ChevronRight size={20} />
      </button>

      <h3 className="section"><Compass size={20} /> Explorar</h3>
      <div className="tiles">
        {tiles.map(([id, label, Icon, tone]) => (
          <button key={id} className={"tile " + tone} onClick={() => go(id)}>
            <Icon size={26} strokeWidth={2.4} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <h3 className="section"><Newspaper size={20} /> Notícias oficiais</h3>
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
  if (!premium) return (
    <button className="glass lockcard" onClick={openPro}>
      <span className="lockicon"><Lock size={18} /></span>
      <span className="grow"><b>Notícias do jogo</b><small>Atualizações, trilha sonora e lançamentos de GTA VI no Premium.</small></span>
      <ChevronRight size={18} />
    </button>
  );
  return (items || []).map((x, i) => (
    <button key={i} className="glass newscard" onClick={() => go("novidades")}>
      <small className="date2">{fmtDate(x.published_at)}</small>
      <b>{x.title}</b>
      <small>{x.body}</small>
    </button>
  ));
}
const fmtDate = (d) => new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
const Mini = ({ label, v }) => <div className="mini"><b>{v}</b><small>{label}</small></div>;

/* ---------- Missões ---------- */
function MissionSheet({ m, state, toggleMission, fav, close }) {
  const ch = CHAPTERS.find((c) => c.id === m.chapter);
  const done = !!state.missions[m.id];
  const key = "m:" + m.id;
  return (
    <div className="scrim" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="row between">
          <p className="eyebrow">Capítulo {ch.id} · {ch.name}</p>
          <button className="round small" onClick={close} aria-label="Fechar"><X size={18} /></button>
        </div>
        <h2>{m.name}</h2>
        <p className="meta dark">Missão {m.id} de 91{m.who ? " · Jogando com " + m.who : ""}</p>
        <p>{m.note || "Missão principal da história. Faça um save manual antes de começar: não há replay de missões."}</p>
        <div className="row">
          <button className={"cta" + (done ? " ghost" : "")} onClick={() => { toggleMission(m.id); close(); }}>
            <Check size={18} /> {done ? "Marcar como pendente" : "Concluir missão"}
          </button>
          <button className={"round" + (state.favs[key] ? " faved" : "")} onClick={() => fav(key)} aria-label="Favoritar"><Heart size={20} fill={state.favs[key] ? "currentColor" : "none"} /></button>
        </div>
      </div>
    </div>
  );
}

function Missions({ state, update, toggleMission, openMission }) {
  const firstOpen = MISSIONS.find((m) => !state.missions[m.id])?.chapter || 1;
  const [open, setOpen] = useState(firstOpen);
  const lastDone = Math.max(0, ...MISSIONS.filter((m) => state.missions[m.id]).map((m) => m.id));
  return (
    <>
      <label className="glass switchrow">
        <span><b>Modo sem spoiler</b><small>Esconde missões e capítulos à frente</small></span>
        <input type="checkbox" checked={state.spoilerFree} onChange={(e) => update(() => ({ spoilerFree: e.target.checked }))} />
      </label>
      {CHAPTERS.map((c) => {
        const list = MISSIONS.filter((m) => m.chapter === c.id);
        const done = list.filter((m) => state.missions[m.id]).length;
        const hideName = state.spoilerFree && c.id > firstOpen;
        return (
          <div key={c.id} className="glass chapter">
            <button className="chapter-head" onClick={() => setOpen(open === c.id ? 0 : c.id)}>
              <span className={"chip-n tone" + c.id}>{c.id}</span>
              <span className="grow"><b className={hideName ? "blur" : ""}>{c.name}</b><small>{done} de {list.length}</small></span>
              <ChevronRight size={18} className={open === c.id ? "rot" : ""} />
            </button>
            <div className="bar thin"><span style={{ width: (done / list.length) * 100 + "%" }} /></div>
            {open === c.id && (
              <ul className="list">
                {list.map((m) => {
                  const hide = state.spoilerFree && !state.missions[m.id] && m.id > lastDone + 1;
                  return (
                    <li key={m.id} className={state.missions[m.id] ? "done" : ""}>
                      <button className={"tick" + (state.missions[m.id] ? " on" : "")} onClick={() => toggleMission(m.id)} aria-label="Concluir"><Check size={14} /></button>
                      <button className="grow item" onClick={() => !hide && openMission(m)}>
                        <span className="num">{m.id}</span>
                        <span className={hide ? "blur" : ""}>{m.name}</span>
                        {state.favs["m:" + m.id] && <Heart size={13} fill="currentColor" className="favmark" />}
                      </button>
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

/* ---------- Guias ---------- */
function Guides({ go, premium, user, openPro }) {
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
        <button className="tile peach" onClick={() => go("trofeus")}><Trophy size={26} /><span>Troféus</span></button>
        <button className="tile lav" onClick={() => go("cem")}><Target size={26} /><span>Checklist 100%</span></button>
      </div>

      <h3 className="section"><Sparkles size={20} /> Dicas exclusivas</h3>
      {premium ? (
        tips === null ? <p className="pad">Carregando…</p> :
        Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="glass premium-card">
            <h4><Crown size={16} /> {cat}</h4>
            <ul className="tips">{list.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        ))
      ) : <LockCard openPro={openPro} title="Dicas exclusivas" text="Perdíveis, rota de 100%, cheats escondidos e troféus fáceis." />}

      <h3 className="section"><Lightbulb size={20} /> Dicas essenciais</h3>
      {TIPS.map((t) => (
        <div key={t.cat} className="glass">
          <h4>{icons[t.cat]} {t.cat}</h4>
          <ul className="tips">{t.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      ))}
      <h3 className="section"><MapIcon size={20} /> Regiões de Leonida</h3>
      {REGIONS.map((r) => (
        <div key={r.id} className="glass"><h4>{r.name}</h4><p className="muted">{r.text}</p></div>
      ))}
    </>
  );
}

/* ---------- Troféus ---------- */
function Trophies({ state, update, fav, premium, go, openPro }) {
  const [f, setF] = useState("todos");
  const [showHidden, setShowHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const psn = state.psn?.trophies ? state.psn : null;
  const list = TROPHIES.filter((t) => f === "todos" || (f === "faltam" ? !state.trophies[t.id] : t.grade === f));
  const toggle = (id) => update((st) => ({ trophies: { ...st.trophies, [id]: !st.trophies[id] } }));
  const fmt = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

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
            : (<><b>Troféus manuais</b><small>{premium ? "Conecte a PSN na aba Conta para marcar sozinho." : "Vincule a PSN (premium) para marcar sozinho."}</small></>)}
        </div>
        {psn ? <button className="round small" onClick={resync} aria-label="Sincronizar"><RefreshCw size={16} className={busy ? "spin" : ""} /></button>
          : <button className="pill sm" onClick={() => (premium ? go("psn") : openPro())}>Conectar</button>}
      </div>
      {msg && <p className="pad">{msg}</p>}
      <div className="segs">
        {["todos", "faltam", "platina", "ouro", "prata", "bronze"].map((x) => {
          const n = ["todos", "faltam"].includes(x) ? null : TROPHIES.filter((t) => t.grade === x);
          return (
            <button key={x} className={(f === x ? "on" : "") + (n ? " gchip" : "")} onClick={() => setF(x)}>
              {n && <TrophyIcon grade={x} size={20} />}{x}{n && <em>{n.filter((t) => state.trophies[t.id]).length}/{n.length}</em>}
            </button>
          );
        })}
      </div>
      <label className="glass switchrow">
        <span><b>Mostrar ocultos</b><small>28 troféus ocultos contêm spoilers</small></span>
        <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
      </label>
      <ul className="cards">
        {list.map((t) => {
          const hide = t.hidden && !showHidden && !state.trophies[t.id];
          const done = !!state.trophies[t.id];
          const p = psn?.trophies?.[t.id];
          return (
            <li key={t.id} className={"glass trophy" + (done ? " done" : "")}>
              <button className="tbtn" onClick={() => toggle(t.id)} aria-label="Marcar">
                <TrophyIcon grade={t.grade} size={44} dim={!done} />
                {done && <span className="tcheck"><Check size={11} /></span>}
              </button>
              <div className="grow" onClick={() => toggle(t.id)}>
                <b>{hide ? "Troféu oculto" : t.name}</b>
                <small>{hide ? "Ative “Mostrar ocultos” para ver." : t.desc}</small>
                {p && (
                  <span className="psnmeta">
                    <span className="psntag">PSN</span>
                    {p.earned && p.earnedAt ? `Conquistado em ${fmt(p.earnedAt)}` : "Ainda não conquistado"}
                    {p.rate != null && ` · ${p.rate}% dos jogadores`}
                  </span>
                )}
              </div>
              {!hide && <FavBtn on={state.favs["t:" + t.id]} onClick={() => fav("t:" + t.id)} />}
            </li>
          );
        })}
      </ul>
    </>
  );
}
const FavBtn = ({ on, onClick }) => (
  <button className={"favbtn" + (on ? " on" : "")} onClick={onClick} aria-label="Favoritar"><Heart size={18} fill={on ? "currentColor" : "none"} /></button>
);

// Chama a função segura no servidor (Supabase Edge Function)
async function syncPsn(body) {
  const { data, error } = await supabase.functions.invoke("psn-sync", { body });
  if (error) {
    let m = "Falha ao sincronizar.";
    try { m = (await error.context.json()).error || m; } catch {}
    return { ok: false, error: m };
  }
  if (!data.found) return { ok: false, error: `Conectado${data.onlineId ? " como " + data.onlineId : ""}, mas o GTA VI ainda não aparece nos seus troféus.` };
  return { ok: true, data };
}


/* ---------- 100% ---------- */
function Completion({ state, update, s }) {
  const set = (id, v) => update((st) => ({ counters: { ...st.counters, [id]: Math.max(0, v) } }));
  return (
    <>
      <div className="nextcard compact">
        <p className="tag">Conclusão estimada</p>
        <h2 className="huge">{s.completion.toFixed(1)}%</h2>
        <p className="meta">{s.linesDone} de {s.linesTotal} linhas completas · valores em $ estão em milhares</p>
      </div>
      {COMPLETION.map((g) => (
        <div key={g.group} className="glass">
          <h4>{g.group}</h4>
          <ul className="counters">
            {g.items.map((it) => {
              const v = it.id === "story" ? s.missionsDone : state.counters[it.id] || 0;
              const ok = v >= it.need;
              return (
                <li key={it.id} className={ok ? "done" : ""}>
                  <div className="row between"><span>{ok && <Check size={14} />} {it.label}</span><small>{v}/{it.need}{it.total ? ` · ${it.total} no jogo` : ""}</small></div>
                  <div className="row">
                    <div className="bar thin grow"><span style={{ width: Math.min(100, (v / it.need) * 100) + "%" }} /></div>
                    {it.id !== "story" && (
                      <>
                        <button className="step" onClick={() => set(it.id, v - 1)}>−</button>
                        <input className="val" type="number" inputMode="numeric" value={v} onChange={(e) => set(it.id, +e.target.value || 0)} />
                        <button className="step" onClick={() => set(it.id, v + 1)}>+</button>
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

/* ---------- Rádio ---------- */
const spotifySearch = (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;
const songQuery = (x) => x.replace(" – ", " ").replace(/[()]/g, "");

function Radios({ state, update, fav }) {
  const [open, setOpen] = useState(null);
  const toggle = (id) => update((st) => ({ radios: { ...st.radios, [id]: !st.radios[id] } }));
  const heard = RADIOS.filter((r) => state.radios[r.id]).length;
  return (
    <>
      <div className="glass radio-head">
        <div><b>{RADIOS.length} estações</b><small>{heard} ouvidas · toque numa capa para ver as músicas</small></div>
        <div className="bar thin" style={{ width: 90 }}><span style={{ width: (heard / RADIOS.length) * 100 + "%" }} /></div>
      </div>
      <div className="covers">
        {RADIOS.map((r) => (
          <button key={r.id} className={"covercard" + (state.radios[r.id] ? " heard" : "")} onClick={() => setOpen(r)}>
            <StationCover r={r} size={150} />
            {state.radios[r.id] && <span className="heardtag"><Check size={12} /></span>}
            <b>{r.name}</b>
            <small>{r.genre}</small>
          </button>
        ))}
      </div>
      <div className="glass album">
        <h4><Disc3 size={17} /> Trilha oficial</h4>
        <p className="muted"><b>Grand Theft Auto VI: The Album</b>: 34 faixas originais (57 na Deluxe). <b>Trilha original do Justice</b>: 30 faixas, chega em 11 de dezembro.</p>
        <a className="sp-row" href={spotifySearch("Grand Theft Auto VI The Album")} target="_blank" rel="noreferrer">
          <span className="sp-dot"><Music size={14} /></span> Abrir o álbum no Spotify <ExternalLink size={13} />
        </a>
      </div>
      <p className="pad">Há ainda 2 playlists únicas que contam para os 100% (uma é a do Kodak Black, The Sniper of La Perle).</p>

      {open && (
        <div className="scrim" onClick={() => setOpen(null)}>
          <div className="sheet station" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="station-top">
              <StationCover r={open} size={112} />
              <div className="grow">
                <p className="eyebrow">{open.talk ? "Talk radio" : `${open.tracks} faixas`}</p>
                <h2>{open.name}</h2>
                <p className="meta dark">{open.genre} · {open.hosts}</p>
              </div>
              <button className="round small" onClick={() => setOpen(null)} aria-label="Fechar"><X size={16} /></button>
            </div>
            {open.secret && <p className="secretline">🔒 {open.secret}</p>}
            {open.songs ? (
              <ul className="tracklist">
                {open.songs.map((x, i) => {
                  const [artist, title] = x.split(" – ");
                  return (
                    <li key={x}>
                      <a href={spotifySearch(songQuery(x))} target="_blank" rel="noreferrer">
                        <span className="tn">{i + 1}</span>
                        <span className="grow"><b>{title || x}</b><small>{title ? artist : ""}</small></span>
                        <span className="sp-dot"><Music size={13} /></span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="muted">Estação só de conversa, sem músicas.</p>}
            {open.songs && <p className="fine">Toque numa música para abrir no Spotify. Destaques da lista completa de {open.tracks} faixas.</p>}
            <div className="row">
              <button className={"cta" + (state.radios[open.id] ? " ghost" : "")} onClick={() => toggle(open.id)}>
                <Check size={17} /> {state.radios[open.id] ? "Ouvida" : "Marcar como ouvida"}
              </button>
              <button className={"round" + (state.favs["r:" + open.id] ? " faved" : "")} onClick={() => fav("r:" + open.id)} aria-label="Favoritar">
                <Heart size={20} fill={state.favs["r:" + open.id] ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      )}
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
function Characters({ state, fav }) {
  return (
    <ul className="cards">
      {CHARACTERS.map((c) => {
        const [Icon, h, badge] = CHAR_STYLE[c.name] || [Users, 270];
        return (
          <li key={c.name} className={"glass char" + (badge ? " lead" : "")}>
            <span className="ava2" style={{ "--h": h }}>
              <Icon size={24} strokeWidth={2.2} />
              <i>{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</i>
            </span>
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
function Favorites({ state, openMission, go }) {
  const keys = Object.keys(state.favs).filter((k) => state.favs[k]);
  const items = keys.map((k) => {
    const [t, id] = [k.slice(0, 1), k.slice(2)];
    if (t === "m") { const m = MISSIONS.find((x) => x.id === +id); return m && { k, kind: "Missão", name: m.name, sub: `Capítulo ${m.chapter}`, act: () => openMission(m) }; }
    if (t === "t") { const x = TROPHIES.find((y) => y.id === id); return x && { k, kind: "Troféu", name: x.name, sub: x.desc, act: () => go("trofeus") }; }
    if (t === "r") { const x = RADIOS.find((y) => y.id === id); return x && { k, kind: "Rádio", name: x.name, sub: x.genre, act: () => go("radio") }; }
    if (t === "p") { const x = MARKERS.find((y) => y.id === id) || state.pins.find((y) => y.id === id); return x && { k, kind: "Lugar no mapa", name: x.name, sub: x.text || x.note, act: () => go("mapa") }; }
    if (t === "c") { const x = CHARACTERS.find((y) => y.name === id); return x && { k, kind: "Personagem", name: x.name, sub: x.role, act: () => go("personagens") }; }
  }).filter(Boolean);
  if (!items.length) return <div className="empty"><Heart size={40} /><p>Toque no coração em missões, troféus, rádios e personagens para guardá-los aqui.</p></div>;
  return <ResultList items={items} />;
}

function ResultList({ items }) {
  return (
    <ul className="cards">
      {items.map((x) => (
        <li key={x.k} className="glass result" onClick={x.act}>
          <div className="grow"><small className="genre">{x.kind}</small><b>{x.name}</b>{x.sub && <small>{x.sub}</small>}</div>
          <ChevronRight size={18} />
        </li>
      ))}
    </ul>
  );
}

/* ---------- Busca ---------- */
function SearchView({ state, openMission, go }) {
  const [q, setQ] = useState("");
  const n = (x) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const items = useMemo(() => {
    if (q.trim().length < 2) return [];
    const t = n(q);
    const hit = (...f) => f.some((x) => x && n(x).includes(t));
    return [
      ...MISSIONS.filter((m) => hit(m.name, m.note)).map((m) => ({ k: "m" + m.id, kind: "Missão", name: m.name, sub: `Capítulo ${m.chapter} · Missão ${m.id}`, act: () => openMission(m) })),
      ...TROPHIES.filter((x) => hit(x.name, x.desc)).map((x) => ({ k: x.id, kind: "Troféu", name: x.name, sub: x.desc, act: () => go("trofeus") })),
      ...RADIOS.filter((x) => hit(x.name, x.genre, x.hosts, ...(x.songs || []))).map((x) => ({ k: x.id, kind: "Rádio", name: x.name, sub: `${x.genre} · ${x.hosts}`, act: () => go("radio") })),
      ...CHARACTERS.filter((x) => hit(x.name, x.role, x.text)).map((x) => ({ k: x.name, kind: "Personagem", name: x.name, sub: x.role, act: () => go("personagens") })),
      ...REGIONS.filter((x) => hit(x.name, x.text)).map((x) => ({ k: x.id, kind: "Região", name: x.name, sub: x.text, act: () => go("mapa") })),
      ...TIPS.flatMap((g) => g.items.filter((x) => hit(x)).map((x, i) => ({ k: g.cat + i + x.slice(0, 8), kind: "Dica · " + g.cat, name: x, act: () => go("guias") }))),
    ].slice(0, 60);
  }, [q]);
  return (
    <>
      <div className="searchbox glass"><Search size={18} /><input autoFocus placeholder="Missões, troféus, rádios, personagens…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {q.trim().length >= 2 && !items.length && <p className="muted pad">Nada encontrado para “{q}”.</p>}
      <ResultList items={items} />
      {!q && (
        <div className="suggest">
          {["Kenton", "Flash FM", "cofre", "Vice City", "Lucia", "meditação"].map((x) => <button key={x} onClick={() => setQ(x)}>{x}</button>)}
        </div>
      )}
    </>
  );
}

/* ---------- Mapa: nosso + IGN incorporado ---------- */
const IGN_URL = "https://www.ign.com/maps/gta-6/leonida";
function MapTabs({ children }) {
  const [src, setSrc] = useState("nosso");
  return (
    <>
      <div className="segs">
        <button className={src === "nosso" ? "on" : ""} onClick={() => setSrc("nosso")}>Nosso mapa</button>
        <button className={src === "ign" ? "on" : ""} onClick={() => setSrc("ign")}>Mapa da IGN</button>
      </div>
      {src === "nosso" ? children : (
        <div className="ign">
          <iframe src={IGN_URL} title="Mapa interativo de GTA 6 da IGN" loading="lazy" allow="fullscreen" />
          <div className="glass ign-note">
            <p className="muted">Mapa interativo da IGN, exibido do site deles. Se aparecer em branco, a IGN não permite ser aberta dentro de outros sites:</p>
            <a className="cta full linkbtn" href={IGN_URL} target="_blank" rel="noreferrer">Abrir na IGN ↗</a>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Novidades (linha do tempo) ---------- */
const CAT_ICON = { "Recurso": Sparkles, "Conteúdo": Layers, "Mapa": MapIcon, "Notícia": Newspaper };
function News({ update, premium, go, openPro, state }) {
  const [newCount] = useState(Math.max(0, NEWS.length - state.newsSeen));
  const [official, setOfficial] = useState([]);
  useEffect(() => { update(() => ({ newsSeen: NEWS.length })); }, [update]);
  useEffect(() => {
    if (!premium) return;
    supabase.from("news").select("title, body, published_at").order("published_at", { ascending: false })
      .then(({ data }) => setOfficial((data || []).map((x) => ({ date: x.published_at, cat: "Notícia", title: x.title, text: x.body, official: true }))));
  }, [premium]);
  const items = [...NEWS.map((x, i) => ({ ...x, isNew: i < newCount })), ...official]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <>
      <p className="lead">Atualizações do guia e notícias de Grand Theft Auto VI, das mais recentes para as mais antigas.</p>
      {newCount > 0 && <p className="newline"><Megaphone size={18} /> {newCount} {newCount === 1 ? "novidade" : "novidades"} desde sua última visita</p>}
      {!premium && (
        <button className="glass lockcard" onClick={openPro}>
          <span className="lockicon"><Lock size={18} /></span>
          <span className="grow"><b>Notícias oficiais do jogo</b><small>Disponíveis no Premium.</small></span>
          <ChevronRight size={18} />
        </button>
      )}
      <ol className="timeline">
        {items.map((x, i) => {
          const Icon = CAT_ICON[x.cat] || Sparkles;
          return (
            <li key={i}>
              <span className={"tdot" + (x.isNew ? " new" : "")}><Icon size={16} /></span>
              <div className="glass tcard">
                <div className="row wrap">
                  <span className={"catchip c-" + x.cat.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}><Icon size={13} /> {x.cat}</span>
                  {x.isNew && <span className="newchip">NOVO</span>}
                </div>
                <small className="date2">{fmtDate(x.date)}</small>
                <b>{x.title}</b>
                <p>{x.text}</p>
                {x.go && <button className="pill solid" onClick={() => go(x.go)}><ArrowRight size={16} /> Abrir</button>}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/* ---------- Perfil ---------- */
function Profile({ state, update, s, go, user, premium, cloud, openPro, theme }) {
  const [linkPsn, setLinkPsn] = useState(false);
  const visited = Object.values(state.visited || {}).filter(Boolean).length;
  const heard = Object.values(state.radios).filter(Boolean).length;
  const favs = Object.values(state.favs).filter(Boolean).length;
  const rows = [
    [FlagIcon, "Missões da história", s.missionsDone / 91],
    [Trophy, "Troféus", s.trophiesDone / 55],
    [PieChart, "Lista de 100%", s.completion / 100],
    [Radio, "Rádios ouvidas", heard / RADIOS.length],
    [MapPin, "Lugares do mapa", visited / MARKERS.length],
  ];
  return (
    <>
      <div className="profhead">
        <span className="bigava"><User size={30} />{premium && <span className="crown lg"><Crown size={13} /></span>}</span>
        <div className="grow">
          <b>{user ? user.email : "Visitante"}</b>
          <small>{premium ? "Premium" : user ? "Conta gratuita" : "Progresso salvo só neste aparelho"}</small>
        </div>
      </div>

      <div className="glass progcard">
        <div className="row between"><h4><PieChart size={18} /> Seu progresso</h4><span className="pct big">{Math.floor(s.completion)}%</span></div>
        {rows.map(([Icon, label, v]) => (
          <div key={label} className="prow">
            <div className="row between"><span className="row"><Icon size={18} /> {label}</span><span className="pct">{Math.floor(v * 100)}%</span></div>
            <div className="bar thin"><span style={{ width: Math.min(100, v * 100) + "%" }} /></div>
          </div>
        ))}
        <button className="linkrow" onClick={() => go("cem")}>Abrir o Tracker 100% <ChevronRight size={18} /></button>
      </div>

      <div className="glass">
        <h4 className="row"><Layers size={18} /> Sua Leonida</h4>
        <div className="statgrid">
          <button onClick={() => go("mapa")}><span><CircleCheck size={18} /> {visited}</span><small>Lugares visitados</small></button>
          <button onClick={() => go("mapa")}><span><MapPin size={18} /> {state.pins.length}</span><small>Meus pins</small></button>
          <button onClick={() => go("favoritos")}><span><Heart size={18} /> {favs}</span><small>Favoritos</small></button>
          <button onClick={() => go("notas")}><span><StickyNote size={18} /> {(state.notes || []).length}</span><small>Notas</small></button>
          <button onClick={() => go("radio")}><span><Radio size={18} /> {heard}</span><small>Rádios ouvidas</small></button>
          <button onClick={() => go("trofeus")}><span><Trophy size={18} /> {s.trophiesDone}</span><small>Troféus</small></button>
        </div>
      </div>

      <h3 className="section"><Link2 size={20} /> Contas vinculadas</h3>
      <div className="glass acct ps">
        <span className="acicon ps"><Gamepad2 size={26} /></span>
        <div className="grow"><b>PlayStation</b><small>{state.psn?.trophies ? `${state.psn.onlineId || "Vinculado"} · ${state.psn.progress ?? 0}%` : "Troféus e progresso do GTA VI"}</small></div>
        <button className="pill solid" onClick={() => (premium ? setLinkPsn(true) : openPro())}>
          {premium ? <><Link2 size={15} /> {state.psn?.trophies ? "Gerenciar" : "Vincular"}</> : <><Lock size={14} /> Premium</>}
        </button>
      </div>
      <div className="glass acct xb">
        <span className="acicon xb"><Gamepad2 size={26} /></span>
        <div className="grow"><b>Xbox</b><small>Conquistas do GTA VI</small></div>
        <button className="pill" disabled>Em breve</button>
      </div>
      <p className="fine pad2">Vincular é opcional e usa uma API não oficial da PSN, que pode parar se a Sony mudar algo. O NPSSO não é salvo.</p>

      <h3 className="section"><User size={20} /> Conta</h3>
      <AccountBox user={user} cloud={cloud} premium={premium} openPro={openPro} />

      <div className="glass">
        <h4>Aparência</h4>
        <div className="segs inset">
          {[["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]].map(([k, l]) => (
            <button key={k} className={(state.theme || "auto") === k ? "on" : ""} onClick={() => update(() => ({ theme: k }))}>{l}</button>
          ))}
        </div>
      </div>

      <div className="glass">
        <h4>Zerar progresso</h4>
        <p className="muted">Apaga o progresso deste aparelho e da nuvem.</p>
        <button className="cta ghost" onClick={() => { if (confirm("Apagar todo o progresso?")) update(() => ({ missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], visited: {}, favs: {}, notes: [], psn: null })); }}>Zerar</button>
      </div>

      {linkPsn && <PsnSheet state={state} update={update} close={() => setLinkPsn(false)} />}
    </>
  );
}

function AccountBox({ user, cloud, premium, openPro }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  async function login() {
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) setErr(error.message); else setSent(true);
  }
  if (!user) return (
    <div className="glass">
      <h4 className="row"><Mail size={17} /> Entrar ou criar conta</h4>
      <p className="muted">Guarde o progresso na nuvem e use em qualquer aparelho.</p>
      {sent ? <p className="ok-msg">Enviamos um link de acesso para <b>{email}</b>. Abra o e-mail neste aparelho.</p> : (
        <>
          <input className="field" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="cta full" disabled={busy || !/\S+@\S+\.\S+/.test(email)} onClick={login}>{busy ? "Enviando…" : "Receber link de acesso"}</button>
        </>
      )}
      {err && <p className="err-msg">{err}</p>}
    </div>
  );
  return (
    <div className="glass">
      <p className="row muted"><Cloud size={16} /> Nuvem: {cloud === "saving" ? "salvando…" : cloud === "error" ? "erro ao salvar" : "sincronizado"}</p>
      <div className="row" style={{ marginTop: 10 }}>
        {!premium && <button className="cta" onClick={openPro}><Crown size={16} /> Premium</button>}
        <button className="cta ghost" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Sair</button>
      </div>
    </div>
  );
}

function PsnSheet({ state, update, close }) {
  const [npsso, setNpsso] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  async function connect(body) {
    setBusy(true); setMsg(null);
    const r = await syncPsn(body);
    if (r.ok) {
      update((st) => applyPsn(st, r.data));
      const n = r.data.trophies.filter((t) => t.earned).length;
      setMsg({ ok: true, text: `Pronto: ${n} de ${r.data.trophies.length} troféus (${r.data.progress}% na PSN). A aba Troféus foi atualizada.` });
      setNpsso("");
    } else setMsg({ ok: false, text: r.error });
    setBusy(false);
  }
  async function unlink() {
    await supabase.functions.invoke("psn-sync", { body: { action: "unlink" } });
    update(() => ({ psn: null }));
    close();
  }
  return (
    <div className="scrim" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="row between"><h2 className="row"><span className="psnlogo">PSN</span> PlayStation</h2><button className="round small" onClick={close} aria-label="Fechar"><X size={16} /></button></div>
        {state.psn?.trophies && (
          <>
            <p className="ok-msg">Vinculado como <b>{state.psn.onlineId || "—"}</b> · {new Date(state.psn.syncedAt).toLocaleString("pt-BR")}</p>
            <div className="row">
              <button className="cta" disabled={busy} onClick={() => connect({})}><RefreshCw size={17} className={busy ? "spin" : ""} /> Sincronizar</button>
              <button className="cta ghost" onClick={unlink}>Desvincular</button>
            </div>
          </>
        )}
        <ol className="steps">
          <li>Entre em <a href="https://www.playstation.com" target="_blank" rel="noreferrer">playstation.com</a>.</li>
          <li>Na mesma aba, abra <a href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noreferrer">ca.account.sony.com/api/v1/ssocookie</a>.</li>
          <li>Copie só o valor de <code>npsso</code> e cole aqui.</li>
        </ol>
        <input className="field" type="password" placeholder="Cole seu NPSSO" value={npsso} onChange={(e) => setNpsso(e.target.value)} autoComplete="off" />
        <button className="cta full" disabled={busy || npsso.length < 40} onClick={() => connect({ npsso })}>
          <RefreshCw size={18} className={busy ? "spin" : ""} /> {busy ? "Conectando…" : state.psn?.trophies ? "Reconectar" : "Vincular PSN"}
        </button>
        {msg && <p className={msg.ok ? "ok-msg" : "err-msg"}>{msg.text}</p>}
        <p className="fine">O NPSSO funciona como senha: não compartilhe. Ele não é salvo; o servidor guarda só um token de renovação, apagado ao desvincular.</p>
      </div>
    </div>
  );
}

/* ---------- Minhas notas ---------- */
function Notes({ state, update }) {
  const notes = state.notes || [];
  const [editing, setEditing] = useState(null);
  const save = (n) => {
    update((st) => {
      const list = st.notes || [];
      const exists = list.some((x) => x.id === n.id);
      return { notes: exists ? list.map((x) => (x.id === n.id ? n : x)) : [n, ...list] };
    });
    setEditing(null);
  };
  return (
    <>
      <button className="cta full" onClick={() => setEditing({ id: Date.now(), title: "", text: "", date: new Date().toISOString() })}><Plus size={18} /> Nova nota</button>
      {notes.length === 0 && <div className="empty"><StickyNote size={40} /><p>Anote esconderijos, combinações, lembretes de missões ou onde viu um colecionável.</p></div>}
      <ul className="cards" style={{ marginTop: 12 }}>
        {notes.map((n) => (
          <li key={n.id} className="glass note" onClick={() => setEditing(n)}>
            <span className="noteicon"><StickyNote size={18} /></span>
            <div className="grow"><b>{n.title || "Sem título"}</b><small>{n.text.slice(0, 120)}</small><small className="date2">{fmtDate(n.date)}</small></div>
          </li>
        ))}
      </ul>
      {editing && (
        <div className="scrim" onClick={() => setEditing(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <input className="field title" placeholder="Título" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <textarea className="field area" placeholder="Escreva sua nota…" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
            <div className="row">
              <button className="cta" onClick={() => save({ ...editing, date: new Date().toISOString() })}><Check size={17} /> Salvar</button>
              {notes.some((x) => x.id === editing.id) && (
                <button className="round" onClick={() => { update((st) => ({ notes: st.notes.filter((x) => x.id !== editing.id) })); setEditing(null); }} aria-label="Apagar"><Trash2 size={18} /></button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Premium ---------- */
const PRO_FEATURES = [
  [Sparkles, "Dicas exclusivas", "Perdíveis, rota de 100%, cheats escondidos e troféus fáceis."],
  [Trophy, "Sincronização de troféus", "Seus troféus do GTA VI na PSN, com data e raridade, e as listas do guia marcadas conforme você ganha."],
  [Newspaper, "Notícias do jogo", "Atualizações, trilha sonora e lançamentos de GTA VI direto no app."],
  [Heart, "Apoie o guia", "Os guias continuam grátis. O Premium mantém as atualizações chegando."],
];
function ProSheet({ close, user, premium, go }) {
  return (
    <div className="scrim" onClick={close}>
      <div className="sheet pro" onClick={(e) => e.stopPropagation()}>
        <div className="prohero">
          <svg className="palms" viewBox="0 0 300 160" aria-hidden="true">
            {[[40, 30, -20], [250, 10, 25], [270, 120, 160], [10, 140, 200]].map(([x, y, r], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity=".18">
                {[-50, -25, 0, 25, 50].map((a) => <path key={a} d="M0 0 q 40 -10 80 6 q -40 -2 -80 -6" fill="#3b0f63" transform={`rotate(${a})`} />)}
              </g>
            ))}
          </svg>
          <button className="round small closebtn" onClick={close} aria-label="Fechar"><X size={16} /></button>
          <p className="tag">Leonida Log Premium</p>
          <h2>Mais ferramentas para Leonida</h2>
          <p>Os guias continuam grátis. O Premium adiciona as ferramentas.</p>
        </div>
        <ul className="profeat">
          {PRO_FEATURES.map(([Icon, t, d]) => (
            <li key={t}><Icon size={24} /><div><b>{t}</b><small>{d}</small></div></li>
          ))}
        </ul>
        {premium ? <p className="ok-msg center"><Crown size={16} /> Você já é Premium. Obrigado!</p> : (
          <>
            <div className="plan on">
              <span className="radio-dot"><Check size={14} /></span>
              <div className="grow"><b>Premium vitalício</b><small>Pagamento único, para sempre</small></div>
              <b className="price">R$ 5,00</b>
            </div>
            {user ? (
              <button className="cta full" disabled>Desbloquear por R$ 5,00 · em breve</button>
            ) : (
              <button className="cta full" onClick={() => { close(); go("psn"); }}>Entrar para desbloquear</button>
            )}
            <p className="fine center">Pagamento único, sem renovação. A compra ainda não está disponível; avisaremos em Novidades.</p>
          </>
        )}
      </div>
    </div>
  );
}

function LockCard({ openPro, title, text }) {
  return (
    <button className="glass lockcard" onClick={openPro}>
      <span className="lockicon"><Lock size={18} /></span>
      <span className="grow"><b>{title}</b><small>{text}</small></span>
      <ChevronRight size={18} />
    </button>
  );
}
