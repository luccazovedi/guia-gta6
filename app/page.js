"use client";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  User, Info, Flag, PlayCircle, ArrowRight, Check, Megaphone, Compass, Library, Users, Map as MapIcon,
  Heart, Radio, Search, Home as HomeIcon, Trophy, Target, ChevronRight, ChevronLeft, X, Lightbulb, RefreshCw,
} from "lucide-react";
import { CHAPTERS, MISSIONS, TROPHIES, COMPLETION, RADIOS, CHARACTERS, TIPS, NEWS, REGIONS } from "../lib/data";
import { useProgress, stats, applyPsn } from "../lib/store";

const LeonidaMap = dynamic(() => import("../components/LeonidaMap"), { ssr: false });

const TITLES = {
  guias: "Guias", mapa: "Mapa", missoes: "Missões", busca: "Busca", trofeus: "Troféus", cem: "Tracker 100%",
  radio: "Rádio", personagens: "Personagens", favoritos: "Favoritos", psn: "Conta PSN", novidades: "Novidades",
};
const TABBAR = [["inicio", HomeIcon], ["guias", Library], ["mapa", MapIcon], ["missoes", Flag], ["busca", Search]];

export default function App() {
  const { state, update, ready } = useProgress();
  const [view, setView] = useState("inicio");
  const [prev, setPrev] = useState("inicio");
  const [sheet, setSheet] = useState(null);
  const s = useMemo(() => stats(state), [state]);

  const go = (v) => { setPrev(view); setView(v); window.scrollTo({ top: 0 }); };
  const fav = (key) => update((st) => ({ favs: { ...st.favs, [key]: !st.favs[key] } }));
  const toggleMission = (id, val) => update((st) => ({ missions: { ...st.missions, [id]: val ?? !st.missions[id] } }));
  const ctx = { state, update, s, go, fav, toggleMission, openMission: setSheet };

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
          {view === "mapa" && (
            <LeonidaMap pins={state.pins} visited={state.visited || {}}
              onToggleVisited={(id) => update((st) => ({ visited: { ...(st.visited || {}), [id]: !(st.visited || {})[id] } }))}
              onAddPin={(p) => update((st) => ({ pins: [...st.pins, p] }))}
              onRemovePin={(i) => update((st) => ({ pins: st.pins.filter((_, j) => j !== i) }))} />
          )}
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

/* ---------- Início ---------- */
function HomeView({ state, s, go, toggleMission, openMission }) {
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
          <User size={20} />{state.psn && <span className="online" />}
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
function Guides({ go }) {
  const icons = { Dinheiro: "💵", "Polícia e roubos": "🚔", Progresso: "📈", Personagens: "🔁" };
  return (
    <>
      <div className="tiles">
        <button className="tile peach" onClick={() => go("trofeus")}><Trophy size={26} /><span>Troféus</span></button>
        <button className="tile lav" onClick={() => go("cem")}><Target size={26} /><span>Checklist 100%</span></button>
      </div>
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
function Trophies({ state, update, fav }) {
  const [f, setF] = useState("todos");
  const [showHidden, setShowHidden] = useState(false);
  const list = TROPHIES.filter((t) => f === "todos" || (f === "faltam" ? !state.trophies[t.id] : t.grade === f));
  const toggle = (id) => update((st) => ({ trophies: { ...st.trophies, [id]: !st.trophies[id] } }));
  return (
    <>
      <div className="segs">
        {["todos", "faltam", "platina", "ouro", "prata", "bronze"].map((x) => (
          <button key={x} className={f === x ? "on" : ""} onClick={() => setF(x)}>{x}</button>
        ))}
      </div>
      <label className="glass switchrow">
        <span><b>Mostrar ocultos</b><small>28 troféus ocultos contêm spoilers</small></span>
        <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
      </label>
      <ul className="cards">
        {list.map((t) => {
          const hide = t.hidden && !showHidden && !state.trophies[t.id];
          const done = !!state.trophies[t.id];
          return (
            <li key={t.id} className={"glass trophy" + (done ? " done" : "")}>
              <button className={"medal " + t.grade} onClick={() => toggle(t.id)} aria-label="Marcar">{done && <Check size={16} />}</button>
              <div className="grow" onClick={() => toggle(t.id)}>
                <b>{hide ? "Troféu oculto" : t.name}</b>
                <small>{hide ? "Ative “Mostrar ocultos” para ver." : t.desc}</small>
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
function Radios({ state, update, fav }) {
  const toggle = (id) => update((st) => ({ radios: { ...st.radios, [id]: !st.radios[id] } }));
  return (
    <>
      <p className="muted pad">Toque no rádio para marcar como ouvida. Há ainda 2 playlists únicas que contam para os 100% (uma delas é a do Kodak Black, The Sniper of La Perle).</p>
      <ul className="cards">
        {RADIOS.map((r, i) => (
          <li key={r.id} className={"glass radio" + (state.radios[r.id] ? " on" : "")} style={{ "--h": (280 + i * 23) % 360 }}>
            <button className="disc" onClick={() => toggle(r.id)} aria-label="Marcar como ouvida">{state.radios[r.id] ? <Check size={18} /> : <Radio size={18} />}</button>
            <div className="grow">
              <b>{r.name}</b>
              <small className="genre">{r.genre}{r.tracks ? ` · ${r.tracks} faixas` : ""}</small>
              <small>{r.hosts}</small>
              {r.songs && <small className="songs">♪ {r.songs.join(" · ")}</small>}
              {r.secret && <small className="secret">{r.secret}</small>}
            </div>
            <FavBtn on={state.favs["r:" + r.id]} onClick={() => fav("r:" + r.id)} />
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Personagens ---------- */
function Characters({ state, fav }) {
  return (
    <ul className="cards">
      {CHARACTERS.map((c, i) => (
        <li key={c.name} className="glass char">
          <span className="ava" style={{ "--h": (300 + i * 29) % 360 }}>{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
          <div className="grow"><b>{c.name}</b><small className="genre">{c.role}</small><small>{c.text}</small></div>
          <FavBtn on={state.favs["c:" + c.name]} onClick={() => fav("c:" + c.name)} />
        </li>
      ))}
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
function News({ state, update }) {
  useEffect(() => { update(() => ({ newsSeen: NEWS.length })); }, [update]);
  return (
    <ul className="cards">
      {NEWS.map((x, i) => (
        <li key={i} className="glass news">
          <span className="date">{x.date}</span>
          <div className="grow"><b>{x.title}</b><small>{x.text}</small></div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- PSN ---------- */
function Psn({ state, update }) {
  const [npsso, setNpsso] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function sync() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/psn", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ npsso }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erro");
      if (!data.found) {
        setMsg({ ok: false, text: `Conectado${data.onlineId ? " como " + data.onlineId : ""}, mas o GTA VI ainda não aparece nos seus troféus. Ganhe o primeiro troféu e sincronize de novo.` });
        update(() => ({ psn: { onlineId: data.onlineId, syncedAt: new Date().toISOString(), found: false } }));
      } else {
        update((st) => applyPsn(st, data));
        const n = data.trophies.filter((t) => t.earned).length;
        setMsg({ ok: true, text: `Pronto: ${n} de ${data.trophies.length} troféus (${data.progress}% na PSN). Missões e contadores atualizados.` });
      }
      setNpsso("");
    } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  }

  return (
    <>
      {state.psn && (
        <div className="nextcard compact">
          <p className="tag">Conectado</p>
          <h2>{state.psn.onlineId || "Conta PSN"}</h2>
          <p className="meta">Última sincronização: {new Date(state.psn.syncedAt).toLocaleString("pt-BR")}</p>
          <button className="pill" onClick={() => update(() => ({ psn: null }))}><X size={16} /> Desconectar</button>
        </div>
      )}
      <div className="glass">
        <h4>{state.psn ? "Sincronizar de novo" : "Conectar com a PSN"}</h4>
        <p className="muted">Lê seus troféus de GTA VI e marca sozinho troféus, missões (pelos troféus de capítulo) e parte do 100%.</p>
        <ol className="steps">
          <li>Entre em <a href="https://www.playstation.com" target="_blank" rel="noreferrer">playstation.com</a>.</li>
          <li>Na mesma aba, abra <a href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noreferrer">ca.account.sony.com/api/v1/ssocookie</a>.</li>
          <li>Copie só o valor de <code>npsso</code> e cole aqui.</li>
        </ol>
        <input className="field" type="password" placeholder="Cole seu NPSSO" value={npsso} onChange={(e) => setNpsso(e.target.value)} autoComplete="off" />
        <button className="cta full" disabled={busy || npsso.length < 40} onClick={sync}><RefreshCw size={18} className={busy ? "spin" : ""} /> {busy ? "Sincronizando…" : "Sincronizar troféus"}</button>
        {msg && <p className={msg.ok ? "ok-msg" : "err-msg"}>{msg.text}</p>}
        <p className="fine">O NPSSO funciona como uma senha: não compartilhe. Ele é usado só nesta sincronização e não fica salvo no site nem no servidor. A integração usa a API não oficial da PSN e pode parar se a Sony mudar algo.</p>
      </div>
      <div className="glass">
        <h4>Zerar progresso</h4>
        <p className="muted">Apaga tudo o que está salvo neste aparelho.</p>
        <button className="cta ghost" onClick={() => { if (confirm("Apagar todo o progresso?")) update(() => ({ missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], favs: {}, psn: null })); }}>Zerar</button>
      </div>
    </>
  );
}
