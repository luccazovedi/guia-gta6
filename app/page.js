"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CHAPTERS, MISSIONS, TROPHIES, COMPLETION, RADIOS, CHARACTERS, TIPS } from "../lib/data";
import { useProgress, stats, applyPsn } from "../lib/store";

const LeonidaMap = dynamic(() => import("../components/LeonidaMap"), { ssr: false });

const TABS = [
  ["painel", "Painel"], ["mapa", "Mapa"], ["missoes", "Missões"], ["trofeus", "Troféus"],
  ["cem", "100%"], ["radios", "Rádios"], ["personagens", "Personagens"], ["dicas", "Dicas"], ["psn", "PSN"],
];

export default function Home() {
  const { state, update, ready } = useProgress();
  const [tab, setTab] = useState("painel");
  const s = useMemo(() => stats(state), [state]);

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <span className="logo">LL</span>
          <div>
            <h1>Leonida Log</h1>
            <p>Guia de GTA VI · tracker 100% · troféus PSN</p>
          </div>
        </div>
        <div className="ring" title="Conclusão estimada">
          <Ring value={s.completion} />
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      <main className={ready ? "" : "loading"}>
        {tab === "painel" && <Dashboard s={s} state={state} go={setTab} />}
        {tab === "mapa" && (
          <LeonidaMap
            pins={state.pins}
            onAddPin={(p) => update((st) => ({ pins: [...st.pins, p] }))}
            onRemovePin={(i) => update((st) => ({ pins: st.pins.filter((_, j) => j !== i) }))}
          />
        )}
        {tab === "missoes" && <Missions state={state} update={update} />}
        {tab === "trofeus" && <Trophies state={state} update={update} />}
        {tab === "cem" && <Completion state={state} update={update} s={s} />}
        {tab === "radios" && <Radios state={state} update={update} />}
        {tab === "personagens" && <Characters />}
        {tab === "dicas" && <Tips />}
        {tab === "psn" && <Psn state={state} update={update} />}
      </main>

      <footer>
        Projeto de fã, sem vínculo com a Rockstar Games, Take-Two ou Sony. Dados compilados de guias públicos da semana de lançamento (nov/2026) — alguns itens ainda não foram confirmados.
      </footer>
    </div>
  );
}

function Ring({ value, size = 64 }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} stroke="#ffffff14" strokeWidth="6" fill="none" />
      <circle cx="32" cy="32" r={r} stroke="url(#g)" strokeWidth="6" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 32 32)" />
      <defs><linearGradient id="g"><stop offset="0" stopColor="#ff4f9a" /><stop offset="1" stopColor="#ffb547" /></linearGradient></defs>
      <text x="32" y="36" textAnchor="middle" className="ring-txt">{Math.floor(value)}%</text>
    </svg>
  );
}

function Bar({ value, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return <div className="bar"><span style={{ width: pct + "%" }} /></div>;
}

function Dashboard({ s, state, go }) {
  const next = MISSIONS.find((m) => !state.missions[m.id]);
  const chapter = next ? CHAPTERS.find((c) => c.id === next.chapter) : null;
  return (
    <section className="grid">
      <div className="card hero">
        <p className="eyebrow">Conclusão estimada</p>
        <p className="big">{s.completion.toFixed(1)}%</p>
        <Bar value={s.completion} max={100} />
        <p className="muted">{s.linesDone} de {s.linesTotal} linhas da lista de 100% concluídas.</p>
      </div>
      <Stat label="Missões da história" v={s.missionsDone} max={91} onClick={() => go("missoes")} />
      <Stat label="Troféus" v={s.trophiesDone} max={55} onClick={() => go("trofeus")} />
      <Stat label="Rádios sintonizadas" v={Object.values(state.radios).filter(Boolean).length} max={RADIOS.length} onClick={() => go("radios")} />
      <div className="card">
        <p className="eyebrow">Próxima missão</p>
        {next ? (<><h3>{state.spoilerFree ? "Missão #" + next.id : next.name}</h3><p className="muted">Capítulo {chapter.id} · {chapter.name}</p></>) : <h3>História concluída 🌴</h3>}
      </div>
      <div className="card">
        <p className="eyebrow">PSN</p>
        {state.psn ? (
          <><h3>{state.psn.onlineId || "Conta conectada"}</h3><p className="muted">Última sincronização: {new Date(state.psn.syncedAt).toLocaleString("pt-BR")}</p></>
        ) : (
          <><h3>Não conectada</h3><button className="btn small" onClick={() => go("psn")}>Conectar PSN</button></>
        )}
      </div>
    </section>
  );
}

function Stat({ label, v, max, onClick }) {
  return (
    <button className="card stat" onClick={onClick}>
      <p className="eyebrow">{label}</p>
      <p className="mid">{v}<small>/{max}</small></p>
      <Bar value={v} max={max} />
    </button>
  );
}

function Missions({ state, update }) {
  const [open, setOpen] = useState(() => (MISSIONS.find((m) => !state.missions[m.id])?.chapter) || 1);
  const lastDone = Math.max(0, ...MISSIONS.filter((m) => state.missions[m.id]).map((m) => m.id));
  const toggle = (id) => update((st) => ({ missions: { ...st.missions, [id]: !st.missions[id] } }));
  return (
    <section>
      <div className="row between">
        <h2>Missões da história <small>91 missões · 5 capítulos</small></h2>
        <label className="switch">
          <input type="checkbox" checked={state.spoilerFree} onChange={(e) => update(() => ({ spoilerFree: e.target.checked }))} />
          Sem spoilers
        </label>
      </div>
      {CHAPTERS.map((c) => {
        const list = MISSIONS.filter((m) => m.chapter === c.id);
        const done = list.filter((m) => state.missions[m.id]).length;
        return (
          <div key={c.id} className="card chapter">
            <button className="chapter-head" onClick={() => setOpen(open === c.id ? 0 : c.id)}>
              <span>Capítulo {c.id} · {state.spoilerFree && done === 0 && c.id > 1 ? "???" : c.name}</span>
              <span className="muted">{done}/{list.length} {open === c.id ? "▴" : "▾"}</span>
            </button>
            <Bar value={done} max={list.length} />
            {open === c.id && (
              <ul className="checklist">
                {list.map((m) => {
                  const hide = state.spoilerFree && !state.missions[m.id] && m.id > lastDone + 1;
                  return (
                    <li key={m.id} className={state.missions[m.id] ? "done" : ""}>
                      <label>
                        <input type="checkbox" checked={!!state.missions[m.id]} onChange={() => toggle(m.id)} />
                        <span className="num">{String(m.id).padStart(2, "0")}</span>
                        <span className={hide ? "blur" : ""}>{m.name}</span>
                      </label>
                      {m.note && !hide && <p className="note">{m.note}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

function Trophies({ state, update }) {
  const [f, setF] = useState("todos");
  const [showHidden, setShowHidden] = useState(false);
  const list = TROPHIES.filter((t) => f === "todos" || (f === "faltam" ? !state.trophies[t.id] : t.grade === f));
  const toggle = (id) => update((st) => ({ trophies: { ...st.trophies, [id]: !st.trophies[id] } }));
  return (
    <section>
      <div className="row between wrap">
        <h2>Troféus <small>1 platina · 2 ouro · 6 prata · 46 bronze</small></h2>
        <label className="switch"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /> Mostrar ocultos</label>
      </div>
      <div className="row chips">
        {["todos", "faltam", "platina", "ouro", "prata", "bronze"].map((x) => (
          <button key={x} className={"chip" + (f === x ? " on" : "")} onClick={() => setF(x)}>{x}</button>
        ))}
      </div>
      <ul className="trophies">
        {list.map((t) => {
          const hide = t.hidden && !showHidden && !state.trophies[t.id];
          return (
            <li key={t.id} className={"card trophy " + t.grade + (state.trophies[t.id] ? " done" : "")} onClick={() => toggle(t.id)}>
              <span className={"medal " + t.grade} />
              <div>
                <h4>{hide ? "Troféu oculto" : t.name}</h4>
                <p className="muted">{hide ? "Toque em “Mostrar ocultos” para ver (contém spoilers)." : t.desc}</p>
              </div>
              <span className="check">{state.trophies[t.id] ? "✓" : ""}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Completion({ state, update, s }) {
  const set = (id, v) => update((st) => ({ counters: { ...st.counters, [id]: Math.max(0, v) } }));
  return (
    <section>
      <h2>Tracker 100% <small>35 linhas do menu Progresso</small></h2>
      <p className="muted">Informe seus números (veja em Progresso no jogo). Missões da história vêm da aba Missões. Valores em $ estão em milhares.</p>
      {COMPLETION.map((g) => (
        <div key={g.group} className="card">
          <h3>{g.group}</h3>
          <ul className="counters">
            {g.items.map((it) => {
              const v = it.id === "story" ? s.missionsDone : state.counters[it.id] || 0;
              const ok = v >= it.need;
              return (
                <li key={it.id} className={ok ? "done" : ""}>
                  <div className="row between">
                    <span>{it.label}</span>
                    <span className="muted">precisa {it.need}{it.total ? ` de ${it.total}` : ""}</span>
                  </div>
                  <div className="row">
                    {it.id !== "story" && <button className="step" onClick={() => set(it.id, v - 1)}>−</button>}
                    {it.id === "story" ? <span className="val">{v}</span> : (
                      <input className="val" type="number" inputMode="numeric" value={v} onChange={(e) => set(it.id, +e.target.value || 0)} />
                    )}
                    {it.id !== "story" && <button className="step" onClick={() => set(it.id, v + 1)}>+</button>}
                    <Bar value={v} max={it.need} />
                    {ok && <span className="ok">✓</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

function Radios({ state, update }) {
  const toggle = (id) => update((st) => ({ radios: { ...st.radios, [id]: !st.radios[id] } }));
  return (
    <section>
      <h2>Estações de rádio <small>{RADIOS.length} estações</small></h2>
      <p className="muted">Marque as que já ouviu. Há ainda 2 playlists únicas que contam para os 100% (entre elas a playlist desbloqueável do Kodak Black, The Sniper of La Perle).</p>
      <div className="radio-grid">
        {RADIOS.map((r, i) => (
          <button key={r.id} className={"card radio" + (state.radios[r.id] ? " on" : "")} onClick={() => toggle(r.id)} style={{ "--h": (i * 37) % 360 }}>
            <div className="dial">{r.talk ? "TALK" : "FM"}</div>
            <h4>{r.name}</h4>
            <p className="genre">{r.genre}</p>
            <p className="muted">{r.hosts}</p>
            {r.tracks ? <p className="fine">{r.tracks} faixas</p> : null}
            {r.songs && <p className="fine">♪ {r.songs.join(" · ")}</p>}
            {r.secret && <p className="secret">{r.secret}</p>}
            <span className="check">{state.radios[r.id] ? "✓ ouvida" : "marcar"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Characters() {
  return (
    <section>
      <h2>Personagens</h2>
      <div className="char-grid">
        {CHARACTERS.map((c) => (
          <div key={c.name} className="card char">
            <div className="avatar">{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
            <div>
              <h4>{c.name}</h4>
              <p className="eyebrow">{c.role}</p>
              <p className="muted">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tips() {
  return (
    <section>
      <h2>Dicas</h2>
      <div className="grid">
        {TIPS.map((t) => (
          <div key={t.cat} className="card">
            <h3>{t.cat}</h3>
            <ul className="tips">{t.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

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
        setMsg({ ok: false, text: `Conectado${data.onlineId ? " como " + data.onlineId : ""}, mas o GTA VI ainda não aparece na sua lista de troféus. Jogue até ganhar o primeiro troféu e sincronize de novo.` });
        update(() => ({ psn: { onlineId: data.onlineId, syncedAt: new Date().toISOString(), found: false } }));
      } else {
        update((st) => applyPsn(st, data));
        const n = data.trophies.filter((t) => t.earned).length;
        setMsg({ ok: true, text: `Sincronizado: ${n} de ${data.trophies.length} troféus (${data.progress}% na PSN). Missões e contadores foram atualizados.` });
      }
      setNpsso("");
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(false); }
  }

  return (
    <section className="psn">
      <h2>Conexão com a PSN</h2>
      <div className="card">
        <p>Lê seus troféus de GTA VI na PlayStation Network e preenche automaticamente troféus, missões (pelos troféus de capítulo) e parte do tracker 100%.</p>
        <ol className="steps">
          <li>Entre em <a href="https://www.playstation.com" target="_blank" rel="noreferrer">playstation.com</a> com sua conta.</li>
          <li>Na mesma aba, abra <a href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noreferrer">ca.account.sony.com/api/v1/ssocookie</a>.</li>
          <li>Copie só o valor de <code>npsso</code> (64 caracteres) e cole abaixo.</li>
        </ol>
        <div className="row">
          <input className="field" type="password" placeholder="Cole seu NPSSO" value={npsso} onChange={(e) => setNpsso(e.target.value)} autoComplete="off" />
          <button className="btn" disabled={busy || npsso.length < 40} onClick={sync}>{busy ? "Sincronizando…" : "Sincronizar"}</button>
        </div>
        {msg && <p className={msg.ok ? "ok-msg" : "err-msg"}>{msg.text}</p>}
        <p className="fine">O NPSSO funciona como uma senha da sua conta: não compartilhe. Ele é usado uma única vez por sincronização e não é salvo neste site nem no servidor. A integração usa a API não oficial da PSN (biblioteca psn-api) e pode parar de funcionar se a Sony mudar algo.</p>
      </div>
      {state.psn && (
        <div className="card row between">
          <div><p className="eyebrow">Conta</p><h3>{state.psn.onlineId || "—"}</h3><p className="muted">Sincronizado em {new Date(state.psn.syncedAt).toLocaleString("pt-BR")}</p></div>
          <button className="btn small ghost" onClick={() => update(() => ({ psn: null }))}>Desconectar</button>
        </div>
      )}
      <div className="card danger">
        <h3>Zerar progresso</h3>
        <p className="muted">Apaga tudo o que está salvo neste aparelho.</p>
        <button className="btn small ghost" onClick={() => { if (confirm("Apagar todo o progresso?")) update(() => ({ missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], psn: null })); }}>Zerar</button>
      </div>
    </section>
  );
}
