"use client";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  User, Info, Flag, PlayCircle, ArrowRight, Check, Megaphone, Compass, Library, Users, Map as MapIcon,
  Heart, Radio, Search, Home as HomeIcon, Trophy, Target, ChevronRight, ChevronLeft, X, Lightbulb, RefreshCw,
  Lock, Crown, LogOut, Mail, Music, Sparkles, ExternalLink, Fish, Building2, Mic, Landmark, Anchor, Crosshair,
  Package, Gem, Disc3, Cloud, ShieldCheck, Waves, Wrench,
} from "lucide-react";
import { CHAPTERS, MISSIONS, TROPHIES, COMPLETION, RADIOS, CHARACTERS, TIPS, NEWS, REGIONS } from "../lib/data";
import { useProgress, stats, applyPsn, useCloudSync } from "../lib/store";
import { supabase } from "../lib/supabase";
import { StationCover, TrophyIcon } from "../components/Art";

const LeonidaMap = dynamic(() => import("../components/LeonidaMap"), { ssr: false });

const TITLES = {
  guias: "Guias", mapa: "Mapa", missoes: "Missões", busca: "Busca", trofeus: "Troféus", cem: "Tracker 100%",
  radio: "Rádio", personagens: "Personagens", favoritos: "Favoritos", psn: "Conta", novidades: "Novidades",
};
const TABBAR = [["inicio", HomeIcon], ["guias", Library], ["mapa", MapIcon], ["missoes", Flag], ["busca", Search]];

export default function App() {
  const { state, update, ready } = useProgress();
  const [view, setView] = useState("inicio");
  const [prev, setPrev] = useState("inicio");
  const [sheet, setSheet] = useState(null);
  const s = useMemo(() => stats(state), [state]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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
  const cloud = useCloudSync(state, update, ready, user);
  const premium = !!profile?.is_premium;

  const go = (v) => { setPrev(view); setView(v); window.scrollTo({ top: 0 }); };
  const fav = (key) => update((st) => ({ favs: { ...st.favs, [key]: !st.favs[key] } }));
  const toggleMission = (id, val) => update((st) => ({ missions: { ...st.missions, [id]: val ?? !st.missions[id] } }));
  const ctx = { state, update, s, go, fav, toggleMission, openMission: setSheet, user, profile, premium, cloud };

  return (
    <div className="bg">
      <div className="phone">
        {view !== "inicio" && (
          <header className="subhead">
            <button className="round" onClick={() => go(TABBAR.some(([t]) => t === view) ? "inicio" : prev === view ? "inicio" : prev)} aria-label="Voltar"><ChevronLeft size={20} /></button>
            <h1>{TITLES[view]}</h1>
            <span style={{ width: 40 }} />
          </header>
        )}

        <main className={ready ? "" : "loading"}>
          {view === "inicio" && <HomeView {...ctx} />}
          {view === "guias" && <Guides {...ctx} />}
          {view === "mapa" && <MapTabs>{(
            <LeonidaMap pins={state.pins} visited={state.visited || {}}
              onToggleVisited={(id) => update((st) => ({ visited: { ...(st.visited || {}), [id]: !(st.visited || {})[id] } }))}
              onAddPin={(p) => update((st) => ({ pins: [...st.pins, p] }))}
              onRemovePin={(i) => update((st) => ({ pins: st.pins.filter((_, j) => j !== i) }))} />
          )}</MapTabs>}
          {view === "missoes" && <Missions {...ctx} />}
          {view === "busca" && <SearchView {...ctx} />}
          {view === "trofeus" && <Trophies {...ctx} />}
          {view === "cem" && <Completion {...ctx} />}
          {view === "radio" && <Radios {...ctx} />}
          {view === "personagens" && <Characters {...ctx} />}
          {view === "favoritos" && <Favorites {...ctx} />}
          {view === "psn" && <Psn {...ctx} />}
          {view === "novidades" && <News {...ctx} />}
          <p className="legal">Projeto de fã, sem vínculo com Rockstar Games, Take-Two ou Sony. Dados de guias públicos da semana de lançamento (nov/2026).</p>
        </main>

        <nav className="tabbar">
          {TABBAR.map(([id, Icon]) => (
            <button key={id} className={view === id ? "on" : ""} onClick={() => go(id)} aria-label={TITLES[id] || "Início"}>
              <Icon size={22} strokeWidth={view === id ? 2.6 : 2} />
              {id === "inicio" && NEWS.length - state.newsSeen > 0 && <span className="badge">{NEWS.length - state.newsSeen}</span>}
            </button>
          ))}
        </nav>

        {sheet && <MissionSheet m={sheet} {...ctx} close={() => setSheet(null)} />}
      </div>
    </div>
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
          <iframe src={IGN_URL} title="Mapa interativo de GTA 6 da IGN" loading="lazy" allow="fullscreen" referrerPolicy="no-referrer-when-downgrade" />
          <div className="glass ign-note">
            <p className="muted">Mapa interativo da IGN, exibido do site deles. Se aparecer em branco ou bloqueado, a IGN não permite ser aberta dentro de outros sites — abra direto:</p>
            <a className="cta full linkbtn" href={IGN_URL} target="_blank" rel="noreferrer">Abrir na IGN ↗</a>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Início ---------- */
function HomeView({ state, s, go, toggleMission, openMission, user, premium }) {
  const next = MISSIONS.find((m) => !state.missions[m.id]);
  const unseen = NEWS.length - state.newsSeen;
  const tiles = [
    ["guias", "Guias", Library, "lav"], ["personagens", "Personagens", Users, "pink"],
    ["mapa", "Mapa", MapIcon, "peach"], ["missoes", "Missões", Flag, "lav"],
    ["favoritos", "Favoritos", Heart, "pink"], ["radio", "Rádio", Radio, "pink"],
    ["trofeus", "Troféus", Trophy, "peach"], ["cem", "100%", Target, "lav"],
  ];
  return (
    <>
      <div className="homebar">
        <button className="round avatar" onClick={() => go("psn")} aria-label="Conta PSN">
          <User size={20} />{user && <span className="online" />}{premium && <span className="crown"><Crown size={11} /></span>}
        </button>
        <button className="round" onClick={() => go("novidades")} aria-label="Sobre"><Info size={20} /></button>
      </div>
      <h1 className="apptitle">Leonida Log</h1>

      <p className="eyebrow"><Flag size={15} /> Continue sua história</p>
      {next ? (
        <div className="nextcard">
          <p className="tag"><PlayCircle size={15} fill="currentColor" stroke="#f3d6ee" /> A seguir</p>
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
          {unseen > 0 && <em>{unseen} novidades</em>}
          <small>{NEWS[0].title}, {NEWS[1].title.toLowerCase()} e mais</small>
        </span>
        <ChevronRight size={20} />
      </button>

      <div className="glass statrow">
        <Mini label="Conclusão" v={s.completion.toFixed(1) + "%"} />
        <Mini label="Troféus" v={`${s.trophiesDone}/55`} />
        <Mini label="Rádios" v={`${Object.values(state.radios).filter(Boolean).length}/${RADIOS.length}`} />
      </div>

      <h3 className="section"><Compass size={20} /> Explorar</h3>
      <div className="tiles">
        {tiles.map(([id, label, Icon, tone]) => (
          <button key={id} className={"tile " + tone} onClick={() => go(id)}>
            <Icon size={26} strokeWidth={2.4} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
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
function Guides({ go, premium, user }) {
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
      ) : <Paywall go={go} user={user} what="Perdíveis, rota de 100%, cheats escondidos e troféus fáceis." />}

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

function Paywall({ go, user, what }) {
  return (
    <div className="paywall">
      <div className="pw-icon"><Lock size={22} /></div>
      <b>Acesso premium</b>
      <p>{what}</p>
      <ul>
        <li><Check size={14} /> Dicas exclusivas</li>
        <li><Check size={14} /> Vínculo com a PSN</li>
        <li><Check size={14} /> Novidades do jogo</li>
      </ul>
      <button className="cta full" disabled={!!user} onClick={() => go("psn")}>
        <Crown size={17} /> {user ? "Desbloquear por R$ 5 · pagamento único" : "Entrar para desbloquear"}
      </button>
      {user && <small>Pagamento em breve. Avisaremos quando estiver disponível.</small>}
    </div>
  );
}


/* ---------- Troféus ---------- */
function Trophies({ state, update, fav, premium, go }) {
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
          : <button className="pill sm" onClick={() => go("psn")}>Conectar</button>}
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

/* ---------- Novidades ---------- */
function News({ update, premium, go, user }) {
  const [items, setItems] = useState(null);
  useEffect(() => { update(() => ({ newsSeen: NEWS.length })); }, [update]);
  useEffect(() => {
    if (!premium) return;
    supabase.from("news").select("title, body, published_at").order("published_at", { ascending: false }).then(({ data }) => setItems(data || []));
  }, [premium]);
  return (
    <>
      <h3 className="section"><Sparkles size={20} /> Notícias do jogo</h3>
      {premium ? (
        <ul className="cards">
          {(items || []).map((x, i) => (
            <li key={i} className="glass news">
              <span className="date">{new Date(x.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              <div className="grow"><b>{x.title}</b><small>{x.body}</small></div>
            </li>
          ))}
        </ul>
      ) : <Paywall go={go} user={user} what="Notícias de atualizações, trilha sonora e lançamentos de GTA VI." />}
      <h3 className="section"><Megaphone size={20} /> Novidades do app</h3>
      <ul className="cards">
        {NEWS.map((x, i) => (
          <li key={i} className="glass news">
            <span className="date">{x.date}</span>
            <div className="grow"><b>{x.title}</b><small>{x.text}</small></div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Conta (login, premium e PSN) ---------- */
function Psn({ state, update, user, profile, premium, cloud }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [npsso, setNpsso] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function login() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) setMsg({ ok: false, text: error.message }); else setSent(true);
  }
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
  }

  if (!user) return (
    <div className="glass">
      <h4><Mail size={17} /> Entrar ou criar conta</h4>
      <p className="muted">Sua conta guarda o progresso na nuvem (troca de celular sem perder nada) e libera o acesso premium e a PSN.</p>
      {sent ? (
        <p className="ok-msg">Enviamos um link de acesso para <b>{email}</b>. Abra o e-mail neste aparelho para entrar.</p>
      ) : (
        <>
          <input className="field" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="cta full" disabled={busy || !/\S+@\S+\.\S+/.test(email)} onClick={login}>{busy ? "Enviando…" : "Receber link de acesso"}</button>
        </>
      )}
      {msg && <p className="err-msg">{msg.text}</p>}
    </div>
  );

  return (
    <>
      <div className="nextcard compact">
        <p className="tag">{premium ? <><Crown size={15} /> Premium</> : "Conta gratuita"}</p>
        <h2 className="mail">{user.email}</h2>
        <p className="meta"><Cloud size={14} /> Progresso na nuvem: {cloud === "saving" ? "salvando…" : cloud === "error" ? "erro ao salvar" : "sincronizado"}</p>
        <button className="pill" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Sair</button>
      </div>

      {!premium && <Paywall go={() => {}} user={user} what="Desbloqueie tudo com um pagamento único de R$ 5." />}

      <div className={"glass" + (premium ? "" : " locked")}>
        <h4><span className="psnlogo sm">PSN</span> Vínculo com a PlayStation Network</h4>
        {state.psn?.trophies && (
          <p className="ok-msg">Vinculado como <b>{state.psn.onlineId || "—"}</b> · última sincronização {new Date(state.psn.syncedAt).toLocaleString("pt-BR")}</p>
        )}
        <p className="muted">Lê seus troféus de GTA VI e marca sozinho troféus (com data e raridade), missões e parte do 100%. Depois do primeiro vínculo, basta tocar em sincronizar.</p>
        {premium ? (
          <>
            {state.psn?.trophies && (
              <div className="row">
                <button className="cta" disabled={busy} onClick={() => connect({})}><RefreshCw size={17} className={busy ? "spin" : ""} /> Sincronizar agora</button>
                <button className="cta ghost" onClick={unlink}>Desvincular</button>
              </div>
            )}
            <ol className="steps">
              <li>Entre em <a href="https://www.playstation.com" target="_blank" rel="noreferrer">playstation.com</a>.</li>
              <li>Na mesma aba, abra <a href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noreferrer">ca.account.sony.com/api/v1/ssocookie</a>.</li>
              <li>Copie só o valor de <code>npsso</code> e cole aqui.</li>
            </ol>
            <input className="field" type="password" placeholder="Cole seu NPSSO" value={npsso} onChange={(e) => setNpsso(e.target.value)} autoComplete="off" />
            <button className="cta full" disabled={busy || npsso.length < 40} onClick={() => connect({ npsso })}>
              <RefreshCw size={18} className={busy ? "spin" : ""} /> {busy ? "Conectando…" : state.psn?.trophies ? "Reconectar com novo NPSSO" : "Vincular PSN"}
            </button>
          </>
        ) : <p className="lockline"><Lock size={15} /> Disponível no acesso premium.</p>}
        {msg && <p className={msg.ok ? "ok-msg" : "err-msg"}>{msg.text}</p>}
        <p className="fine">O NPSSO não é salvo. O servidor guarda só um token de renovação da PSN, que fica inacessível pelo navegador e é apagado quando você desvincula. A integração usa a API não oficial da PSN e pode parar se a Sony mudar algo.</p>
      </div>

      <div className="glass">
        <h4>Zerar progresso</h4>
        <p className="muted">Apaga o progresso deste aparelho e da nuvem.</p>
        <button className="cta ghost" onClick={() => { if (confirm("Apagar todo o progresso?")) update(() => ({ missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], visited: {}, favs: {}, psn: null })); }}>Zerar</button>
      </div>
    </>
  );
}
