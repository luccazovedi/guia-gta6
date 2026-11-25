"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, Library, Map as MapIcon, Flag, Search, AlertTriangle, X } from "lucide-react";
import { MISSIONS, NEWS } from "../lib/data";
import { useProgress, stats, useCloudSync } from "../lib/store";
import { usePhotos } from "../lib/photos";
import { supabase } from "../lib/supabase";
import { pathFor, parsePath } from "../lib/routes";
import { meta } from "../lib/seo";
import { CAT_COUNTER } from "../lib/links";
import { HomeView } from "./views/Home";
import { Missions, MissionSheet } from "./views/Missions";
import { Trophies, TrophySheet } from "./views/Trophies";
import { Guides, Completion, Characters, Favorites } from "./views/Lists";
import { Radios } from "./views/Radios";
import { SearchView } from "./views/Search";
import { News, Notes } from "./views/News";
import { Profile, ProSheet } from "./views/Profile";
import { MapSeo } from "./views/MapSeo";

const LeonidaMap = dynamic(() => import("./LeonidaMap"), { ssr: false, loading: () => <div className="lm lm-loading" aria-busy="true" /> });

const TITLES = {
  guias: "Guias", mapa: "Mapa", missoes: "Missões", busca: "Buscar", trofeus: "Troféus", cem: "Tracker 100%",
  radio: "Rádio", personagens: "Personagens", favoritos: "Favoritos", psn: "Perfil", novidades: "Novidades", notas: "Minhas notas",
};
const TABBAR = [["inicio", null, "Início"], ["guias", Library, "Guias"], ["mapa", MapIcon, "Mapa"], ["missoes", Flag, "Missões"], ["busca", Search, "Buscar"]];

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

const readRoute = () => parsePath(location.pathname.split("/").filter(Boolean)) || { view: "inicio", id: null };
const readPoint = () => new URLSearchParams(location.search).get("p");

export default function App({ initial }) {
  const { state, update, replace, ready, saveError } = useProgress();
  const [route, setRoute] = useState(initial || { view: "inicio", id: null });
  const [point, setPoint] = useState(null);
  const [pro, setPro] = useState(false);
  const [dismissed, setDismissed] = useState(null);
  const s = useMemo(() => stats(state), [state]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const theme = useTheme(state.theme);
  const photoApi = usePhotos(state, replace, ready);
  const view = route.view;

  // Navegação com URL: cada tela tem endereço, e o voltar do navegador/Android volta uma tela.
  useEffect(() => {
    if (history.state?.idx == null) history.replaceState({ ...(history.state || {}), idx: 0 }, "");
    setPoint(readPoint());
    const pop = () => { setRoute(readRoute()); setPoint(readPoint()); };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => { document.title = meta(route).title.includes("Leonida Log") ? meta(route).title : meta(route).title + " · Leonida Log"; }, [route]);

  const go = useCallback((v, id = null, opts = {}) => {
    const url = pathFor(v, id) + (opts.p ? "?p=" + encodeURIComponent(opts.p) : "");
    const idx = (history.state?.idx || 0) + (opts.replace ? 0 : 1);
    history[opts.replace ? "replaceState" : "pushState"]({ ...(history.state || {}), idx }, "", url);
    setRoute((r) => { if (r.view !== v) window.scrollTo({ top: 0 }); return { view: v, id }; });
    setPoint(opts.p || null);
  }, []);
  const back = useCallback((fallback = "inicio") => {
    if ((history.state?.idx || 0) > 0) history.back();
    else go(fallback, null, { replace: true });
  }, [go]);
  const closeDetail = useCallback(() => back(view), [back, view]);

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
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const cloud = useCloudSync(state, replace, ready, user);
  const premium = !!profile?.is_premium;
  const unseen = Math.max(0, NEWS.length - state.newsSeen);

  const fav = (key) => update((st) => ({ favs: { ...st.favs, [key]: !st.favs[key] } }));
  const toggleMission = (id, val) => update((st) => ({ missions: { ...st.missions, [id]: val ?? !st.missions[id] } }));
  // Marcar no mapa também conta no Tracker 100% (flamingos, meditação, WAiNK…)
  const toggleFound = (m) => update((st) => {
    const on = !(st.visited || {})[m.id];
    const counter = CAT_COUNTER[m.cat];
    const counters = counter ? { ...st.counters, [counter]: Math.max(0, (st.counters[counter] || 0) + (on ? 1 : -1)) } : st.counters;
    return { visited: { ...(st.visited || {}), [m.id]: on }, counters };
  });
  const Link = useCallback(({ to, id, p, children, ...rest }) => (
    <a href={pathFor(to, id) + (p ? "?p=" + encodeURIComponent(p) : "")} {...rest}
      onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); rest.onClick?.(e); go(to, id, { p }); }}>
      {children}
    </a>
  ), [go]);

  const ctx = {
    state, update, s, go, back, fav, toggleMission, toggleFound, Link, route,
    openMission: (m) => go("missoes", m.id), openTrophy: (id) => go("trofeus", id),
    user, profile, premium, cloud, openPro: () => setPro(true), unseen, theme, ...photoApi,
  };

  const warn = saveError ? "Não foi possível salvar no aparelho: o armazenamento do navegador está cheio ou bloqueado. Entre na sua conta para guardar na nuvem."
    : photoApi.photoError || (cloud === "error" ? "Erro ao sincronizar com a nuvem. Tentaremos de novo na próxima alteração." : null);
  const detailMission = view === "missoes" && route.id ? MISSIONS.find((m) => m.id === +route.id) : null;

  return (
    <div className={"bg " + theme}>
      <div className="phone">
        {view !== "inicio" && view !== "mapa" && (
          <header className="subhead">
            <button className="round" onClick={() => back()} aria-label="Voltar"><ChevronLeft size={20} /></button>
            <h1>{TITLES[view]}</h1>
            <span style={{ width: 46 }} />
          </header>
        )}

        <main className={ready ? "" : "loading"} id="conteudo">
          {view === "inicio" && <HomeView {...ctx} />}
          {view === "guias" && <Guides {...ctx} />}
          {view === "mapa" && (
            <>
              <MapSeo cat={route.id} />
              <LeonidaMap state={state} update={update} fav={fav} onBack={() => back()} toggleFound={toggleFound}
                focusCat={route.id} focusPoint={point} photos={photoApi.photos} setPhoto={photoApi.setPhoto} removePhoto={photoApi.removePhoto} />
            </>
          )}
          {view === "missoes" && <Missions {...ctx} />}
          {view === "busca" && <SearchView {...ctx} />}
          {view === "trofeus" && <Trophies {...ctx} />}
          {view === "cem" && <Completion {...ctx} />}
          {view === "radio" && <Radios {...ctx} closeDetail={closeDetail} />}
          {view === "personagens" && <Characters {...ctx} />}
          {view === "favoritos" && <Favorites {...ctx} />}
          {view === "psn" && <Profile {...ctx} />}
          {view === "novidades" && <News {...ctx} />}
          {view === "notas" && <Notes {...ctx} />}
          {view !== "mapa" && <p className="legal">Projeto de fã, sem vínculo com Rockstar Games, Take-Two ou Sony. Dados de guias públicos da semana de lançamento (nov/2026).</p>}
        </main>

        <nav className="tabbar" aria-label="Navegação principal">
          {TABBAR.map(([id, Icon, label]) => (
            <Link key={id} to={id} className={view === id ? "on" : ""} aria-current={view === id ? "page" : undefined}>
              {Icon ? <Icon size={22} strokeWidth={view === id ? 2.6 : 2} /> : <span className="ll" aria-hidden="true">LL</span>}
              <span className="tl">{label}</span>
              {id === "inicio" && unseen > 0 && <span className="badge" aria-label={`${unseen} novidades`}>{unseen}</span>}
            </Link>
          ))}
        </nav>

        {warn && dismissed !== warn && (
          <div className="toast" role="alert">
            <AlertTriangle size={18} /><span className="grow">{warn}</span>
            <button className="round small" onClick={() => setDismissed(warn)} aria-label="Fechar aviso"><X size={15} /></button>
          </div>
        )}

        {detailMission && <MissionSheet m={detailMission} {...ctx} close={closeDetail} />}
        {view === "trofeus" && route.id && <TrophySheet id={route.id} {...ctx} close={closeDetail} />}
        {pro && <ProSheet {...ctx} close={() => setPro(false)} />}
      </div>
    </div>
  );
}
