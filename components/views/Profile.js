"use client";
import { useState } from "react";
import {
  User, Crown, PieChart, ChevronRight, Layers, CircleCheck, MapPin, Heart, StickyNote, Camera, Trophy, Link2, Gamepad2,
  Lock, Mail, Cloud, LogOut, RefreshCw, X, Check, Sparkles, Newspaper, Flag, Radio, Download, Upload,
} from "lucide-react";
import { MISSIONS, TROPHIES, RADIOS } from "../../lib/data";
import { applyPsn } from "../../lib/store";
import { normalize } from "../../lib/progress";
import { syncPsn } from "../../lib/psn";
import { supabase } from "../../lib/supabase";
import { Sheet, Bar } from "../ui";

export function Profile({ state, update, s, go, Link, user, premium, cloud, openPro, photos, clearPhotos }) {
  const [linkPsn, setLinkPsn] = useState(false);
  const heard = Object.values(state.radios).filter(Boolean).length;
  const favs = Object.values(state.favs).filter(Boolean).length;
  const rows = [
    [Flag, "Missões da história", s.missionsDone / MISSIONS.length],
    [Trophy, "Troféus", s.trophiesDone / TROPHIES.length],
    [PieChart, "Lista de 100%", s.completion / 100],
    [Radio, "Rádios ouvidas", heard / RADIOS.length],
  ];

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: "leonida-log", version: 1, exportedAt: new Date().toISOString(), data: state }, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leonida-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importData(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    f.text().then((txt) => {
      const j = JSON.parse(txt);
      if (j.app !== "leonida-log" || !j.data) throw new Error();
      if (!confirm("Substituir o progresso deste aparelho pelo do arquivo?")) return;
      const { _mt, psn, ...data } = normalize(j.data);
      update(() => data);
    }).catch(() => alert("Arquivo inválido."));
  }

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
        <div className="row between"><h2 className="h4"><PieChart size={18} /> Seu progresso</h2><span className="pct big">{Math.floor(s.completion)}%</span></div>
        {rows.map(([Icon, label, v]) => (
          <div key={label} className="prow">
            <div className="row between"><span className="row"><Icon size={18} /> {label}</span><span className="pct">{Math.floor(v * 100)}%</span></div>
            <Bar v={v} />
          </div>
        ))}
        <Link to="cem" className="linkrow">Abrir o Tracker 100% <ChevronRight size={18} /></Link>
      </div>

      <div className="glass">
        <h2 className="h4 row"><Layers size={18} /> Sua Leonida</h2>
        <div className="statgrid">
          <Link to="mapa"><span><CircleCheck size={18} /> {Object.values(state.visited || {}).filter(Boolean).length}</span><small>Lugares encontrados</small></Link>
          <Link to="mapa"><span><MapPin size={18} /> {(state.pins || []).length}</span><small>Meus pins</small></Link>
          <Link to="favoritos"><span><Heart size={18} /> {favs}</span><small>Favoritos</small></Link>
          <Link to="notas"><span><StickyNote size={18} /> {(state.notes || []).length}</span><small>Notas</small></Link>
          <Link to="mapa"><span><Camera size={18} /> {Object.keys(photos || {}).length}</span><small>Fotos</small></Link>
          <Link to="trofeus"><span><Trophy size={18} /> {s.trophiesDone}</span><small>Troféus</small></Link>
        </div>
      </div>

      <h2 className="section"><Link2 size={20} /> Contas vinculadas</h2>
      <div className="glass acct ps">
        <span className="acicon ps"><Gamepad2 size={26} /></span>
        <div className="grow"><b>PlayStation</b><small>{state.psn?.trophies ? `${state.psn.onlineId || "Vinculado"} · ${state.psn.progress ?? 0}%` : "Troféus e progresso do GTA VI"}</small></div>
        <button className="pill solid" onClick={() => (premium ? setLinkPsn(true) : openPro())}>
          {premium ? <><Link2 size={15} /> {state.psn?.trophies ? "Gerenciar" : "Vincular"}</> : <><Lock size={14} /> Premium</>}
        </button>
      </div>
      <p className="fine pad2">Vincular é opcional e usa uma API não oficial da PSN, que pode parar se a Sony mudar algo. O NPSSO não é salvo.</p>

      <h2 className="section"><User size={20} /> Conta</h2>
      <AccountBox user={user} cloud={cloud} premium={premium} openPro={openPro} />

      <div className="glass">
        <h2 className="h4">Aparência</h2>
        <div className="segs inset" role="group" aria-label="Tema">
          {[["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]].map(([k, l]) => (
            <button key={k} className={(state.theme || "auto") === k ? "on" : ""} aria-pressed={(state.theme || "auto") === k} onClick={() => update(() => ({ theme: k }))}>{l}</button>
          ))}
        </div>
      </div>

      <div className="glass">
        <h2 className="h4">Backup</h2>
        <p className="muted">Baixe seu progresso num arquivo ou restaure de um backup (fotos não entram).</p>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="cta ghost" onClick={exportData}><Download size={16} /> Exportar</button>
          <label className="cta ghost"><Upload size={16} /> Importar<input type="file" accept="application/json,.json" hidden onChange={importData} /></label>
        </div>
      </div>

      <div className="glass">
        <h2 className="h4">Zerar progresso</h2>
        <p className="muted">Apaga o progresso deste aparelho e da nuvem.</p>
        <button className="cta ghost" onClick={() => {
          if (!confirm("Apagar todo o progresso?")) return;
          update(() => ({ missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], visited: {}, mapNotes: {}, favs: {}, notes: [], psn: null }));
          clearPhotos?.();
        }}>Zerar</button>
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
  async function login(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + "/perfil" } });
    setBusy(false);
    if (error) setErr(error.message); else setSent(true);
  }
  if (!user) return (
    <form className="glass" onSubmit={login}>
      <h3 className="h4 row"><Mail size={17} /> Entrar ou criar conta</h3>
      <p className="muted">Guarde o progresso na nuvem e use em qualquer aparelho.</p>
      {sent ? <p className="ok-msg" role="status">Enviamos um link de acesso para <b>{email}</b>. Abra o e-mail neste aparelho.</p> : (
        <>
          <input className="field" type="email" autoComplete="email" aria-label="E-mail" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="cta full" disabled={busy || !/\S+@\S+\.\S+/.test(email)}>{busy ? "Enviando…" : "Receber link de acesso"}</button>
        </>
      )}
      {err && <p className="err-msg" role="alert">{err}</p>}
    </form>
  );
  return (
    <div className="glass">
      <p className="row muted" role="status"><Cloud size={16} /> Nuvem: {cloud === "saving" ? "salvando…" : cloud === "error" ? "erro ao salvar" : "sincronizado"}</p>
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
    <Sheet close={close} label="Vincular PlayStation">
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
      <input className="field" type="password" aria-label="NPSSO" placeholder="Cole seu NPSSO" value={npsso} onChange={(e) => setNpsso(e.target.value)} autoComplete="off" />
      <button className="cta full" disabled={busy || npsso.length < 40} onClick={() => connect({ npsso })}>
        <RefreshCw size={18} className={busy ? "spin" : ""} /> {busy ? "Conectando…" : state.psn?.trophies ? "Reconectar" : "Vincular PSN"}
      </button>
      {msg && <p className={msg.ok ? "ok-msg" : "err-msg"} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}
      <p className="fine">O NPSSO funciona como senha: não compartilhe. Ele não é salvo; o servidor guarda só um token de renovação, apagado ao desvincular.</p>
    </Sheet>
  );
}

/* ---------- Premium ---------- */
const PRO_FEATURES = [
  [Sparkles, "Dicas exclusivas", "Perdíveis, rota de 100%, cheats escondidos e troféus fáceis."],
  [Trophy, "Sincronização de troféus", "Seus troféus do GTA VI na PSN, com data e raridade, e as listas do guia marcadas conforme você ganha."],
  [Newspaper, "Notícias do jogo", "Atualizações, trilha sonora e lançamentos de GTA VI direto no app."],
  [Heart, "Apoie o guia", "Os guias continuam grátis. O Premium mantém as atualizações chegando."],
];
export function ProSheet({ close, user, premium, go }) {
  return (
    <Sheet close={close} label="Leonida Log Premium" className="pro">
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
    </Sheet>
  );
}
