"use client";
import { useEffect, useState } from "react";
import { Sparkles, Layers, Map as MapIcon, Newspaper, Megaphone, MessagesSquare, ArrowRight, ExternalLink, StickyNote, Plus, Check, Trash2 } from "lucide-react";
import { NEWS } from "../../lib/data";
import { supabase } from "../../lib/supabase";
import { fmtDate, LockCard, Sheet } from "../ui";

const CAT_ICON = { "Recurso": Sparkles, "Conteúdo": Layers, "Mapa": MapIcon, "Notícia": Newspaper, "Oficial": Megaphone, "Fórum": MessagesSquare, "Imprensa": Newspaper };

/* ---------- Novidades (linha do tempo) ---------- */
export function News({ update, premium, go, openPro, state }) {
  const [newCount] = useState(Math.max(0, NEWS.length - state.newsSeen));
  const [official, setOfficial] = useState([]);
  useEffect(() => { update(() => ({ newsSeen: NEWS.length })); }, [update]);
  useEffect(() => {
    if (!premium) return;
    supabase.from("news").select("title, body, published_at, url, source, cat").order("published_at", { ascending: false }).limit(60)
      .then(({ data }) => setOfficial((data || []).map((x) => ({ date: x.published_at, cat: x.cat || "Notícia", title: x.title, text: x.body, url: x.url, source: x.source, official: true }))));
  }, [premium]);
  const items = [...NEWS.map((x, i) => ({ ...x, isNew: i < newCount })), ...official]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <>
      <p className="lead">Atualizações do guia e notícias de GTA VI. As notícias são coletadas a cada 3 horas do Newswire da Rockstar, do r/GTA6, do GTAForums e da imprensa.</p>
      {newCount > 0 && <p className="newline"><Megaphone size={18} /> {newCount} {newCount === 1 ? "novidade" : "novidades"} desde sua última visita</p>}
      {!premium && <LockCard openPro={openPro} title="Notícias oficiais do jogo" text="Disponíveis no Premium." />}
      <ol className="timeline">
        {items.map((x, i) => {
          const Icon = CAT_ICON[x.cat] || Sparkles;
          return (
            <li key={i}>
              <span className={"tdot" + (x.isNew ? " new" : "")}><Icon size={16} /></span>
              <article className="glass tcard">
                <div className="row wrap">
                  <span className={"catchip c-" + x.cat.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}><Icon size={13} /> {x.cat}</span>
                  {x.isNew && <span className="newchip">NOVO</span>}
                </div>
                <small className="date2"><time dateTime={x.date}>{fmtDate(x.date)}</time></small>
                <h2 className="b">{x.title}</h2>
                <p>{x.text}</p>
                {x.go && <button className="pill solid" onClick={() => go(x.go)}><ArrowRight size={16} /> Abrir</button>}
                {x.url && <a className="pill" href={x.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> {x.source || "Fonte"}</a>}
              </article>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/* ---------- Minhas notas ---------- */
export function Notes({ state, update }) {
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
          <li key={n.id}>
            <button className="glass note" onClick={() => setEditing(n)}>
              <span className="noteicon"><StickyNote size={18} /></span>
              <span className="grow"><b>{n.title || "Sem título"}</b><small>{n.text.slice(0, 120)}</small><small className="date2">{fmtDate(n.date)}</small></span>
            </button>
          </li>
        ))}
      </ul>
      {editing && (
        <Sheet close={() => setEditing(null)} label={editing.title || "Nota"}>
          <input className="field title" placeholder="Título" aria-label="Título" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <textarea className="field area" placeholder="Escreva sua nota…" aria-label="Texto da nota" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
          <div className="row">
            <button className="cta" onClick={() => save({ ...editing, date: new Date().toISOString() })}><Check size={17} /> Salvar</button>
            {notes.some((x) => x.id === editing.id) && (
              <button className="round" onClick={() => { if (confirm("Apagar esta nota?")) { update((st) => ({ notes: st.notes.filter((x) => x.id !== editing.id) })); setEditing(null); } }} aria-label="Apagar nota"><Trash2 size={18} /></button>
            )}
          </div>
        </Sheet>
      )}
    </>
  );
}
