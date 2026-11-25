"use client";
import { Check, X, Heart, Music, ExternalLink, Disc3 } from "lucide-react";
import { RADIOS } from "../../lib/data";
import { StationCover } from "../Art";
import { Sheet, Bar } from "../ui";

const spotifySearch = (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;
const songQuery = (x) => x.replace(" – ", " ").replace(/[()]/g, "");

export function Radios({ state, update, fav, route, Link, closeDetail }) {
  const toggle = (id) => update((st) => ({ radios: { ...st.radios, [id]: !st.radios[id] } }));
  const heard = RADIOS.filter((r) => state.radios[r.id]).length;
  const open = route.id ? RADIOS.find((r) => r.id === route.id) : null;
  return (
    <>
      <div className="glass radio-head">
        <div><b>{RADIOS.length} estações</b><small>{heard} ouvidas · toque numa capa para ver as músicas</small></div>
        <Bar v={heard / RADIOS.length} className="w90" />
      </div>
      <div className="covers">
        {RADIOS.map((r) => (
          <Link key={r.id} to="radio" id={r.id} className={"covercard" + (state.radios[r.id] ? " heard" : "")}>
            <StationCover r={r} size={150} />
            {state.radios[r.id] && <span className="heardtag" aria-label="Ouvida"><Check size={12} /></span>}
            <b>{r.name}</b>
            <small>{r.genre}</small>
          </Link>
        ))}
      </div>
      <div className="glass album">
        <h2 className="h4"><Disc3 size={17} /> Trilha oficial</h2>
        <p className="muted"><b>Grand Theft Auto VI: The Album</b>: 34 faixas originais (57 na Deluxe). <b>Trilha original do Justice</b>: 30 faixas, chega em 11 de dezembro.</p>
        <a className="sp-row" href={spotifySearch("Grand Theft Auto VI The Album")} target="_blank" rel="noreferrer">
          <span className="sp-dot"><Music size={14} /></span> Abrir o álbum no Spotify <ExternalLink size={13} />
        </a>
      </div>
      <p className="pad">Há ainda 2 playlists únicas que contam para os 100% (uma é a do Kodak Black, The Sniper of La Perle).</p>

      {open && (
        <Sheet close={closeDetail} label={open.name} className="station">
          <div className="station-top">
            <StationCover r={open} size={112} />
            <div className="grow">
              <p className="eyebrow">{open.talk ? "Talk radio" : `${open.tracks} faixas`}</p>
              <h2>{open.name}</h2>
              <p className="meta dark">{open.genre} · {open.hosts}</p>
            </div>
            <button className="round small" onClick={closeDetail} aria-label="Fechar"><X size={16} /></button>
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
            <button className={"round" + (state.favs["r:" + open.id] ? " faved" : "")} onClick={() => fav("r:" + open.id)} aria-label="Favoritar" aria-pressed={!!state.favs["r:" + open.id]}>
              <Heart size={20} fill={state.favs["r:" + open.id] ? "currentColor" : "none"} />
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}
