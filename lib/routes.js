// Rotas do app: cada tela tem URL própria (voltar do navegador, links compartilháveis e SEO).
import { MISSIONS, TROPHIES, RADIOS } from "./data.js";
import { CAT } from "./mapdata.js";

export const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/\*\*/g, "").replace(/&/g, " e ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const VIEW_PATH = {
  inicio: "", guias: "guias", mapa: "mapa", missoes: "missoes", busca: "buscar", trofeus: "trofeus", cem: "100",
  radio: "radio", personagens: "personagens", favoritos: "favoritos", psn: "perfil", novidades: "novidades", notas: "notas",
};
const PATH_VIEW = Object.fromEntries(Object.entries(VIEW_PATH).map(([v, p]) => [p, v]));

export const missionSlug = (m) => `${m.id}-${slugify(m.name)}`;
export const trophySlug = (t) => slugify(t.name);

export function pathFor(view, id) {
  const base = "/" + (VIEW_PATH[view] ?? "");
  if (id == null || id === "") return base;
  if (view === "missoes") { const m = MISSIONS.find((x) => x.id === +id); return m ? `${base}/${missionSlug(m)}` : base; }
  if (view === "trofeus") { const t = TROPHIES.find((x) => x.id === id); return t ? `${base}/${trophySlug(t)}` : base; }
  return `${base}/${encodeURIComponent(id)}`;
}

// "/missoes/12-buck-me" → { view: "missoes", id: 12 }
export function parsePath(segments) {
  const [first = "", second] = segments || [];
  const view = PATH_VIEW[first];
  if (!view) return null;
  if (!second) return { view, id: null };
  const s = decodeURIComponent(second);
  if (view === "missoes") { const m = MISSIONS.find((x) => missionSlug(x) === s); return m ? { view, id: m.id } : null; }
  if (view === "trofeus") { const t = TROPHIES.find((x) => trophySlug(x) === s); return t ? { view, id: t.id } : null; }
  if (view === "radio") return RADIOS.some((r) => r.id === s) ? { view, id: s } : null;
  if (view === "mapa") return CAT[s] ? { view, id: s } : null;
  return null;
}

// Todas as URLs estáticas (para o build e o sitemap)
export function allPaths() {
  return [
    ...Object.keys(VIEW_PATH).map((v) => pathFor(v)),
    ...MISSIONS.map((m) => pathFor("missoes", m.id)),
    ...TROPHIES.map((t) => pathFor("trofeus", t.id)),
    ...RADIOS.map((r) => pathFor("radio", r.id)),
    ...Object.keys(CAT).filter((k) => k !== "outro").map((k) => pathFor("mapa", k)),
  ];
}
