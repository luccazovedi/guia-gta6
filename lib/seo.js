// Títulos e descrições por rota (usados no servidor e ao navegar no app).
import { MISSIONS, TROPHIES, RADIOS, CHAPTERS } from "./data.js";
import { CAT, MARKERS, POINTS } from "./mapdata.js";

export const SITE = "Leonida Log";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000")).replace(/\/$/, "");

const VIEW = {
  inicio: ["Leonida Log — Guia de GTA VI com tracker 100% e troféus PSN", `Guia fã-made de GTA VI: mapa de Leonida, ${MISSIONS.length} missões, ${TROPHIES.length} troféus, todas as rádios, personagens, dicas e tracker 100% com sincronização PSN.`],
  guias: ["Guias e dicas de GTA VI", "Dicas essenciais de GTA VI: dinheiro, polícia e roubos, progresso, personagens e regiões de Leonida."],
  mapa: ["Mapa interativo de GTA VI (Leonida)", "Mapa de Leonida com colecionáveis, atividades, crimes e locais: marque o que encontrou, favorite, anote e adicione fotos."],
  missoes: [`Todas as ${MISSIONS.length} missões de GTA VI`, `Lista das ${MISSIONS.length} missões da história de GTA VI nos ${CHAPTERS.length} capítulos, com modo sem spoiler e checklist.`],
  busca: ["Buscar no guia de GTA VI", "Busque missões, troféus, rádios, lugares do mapa e explicações do jogo."],
  trofeus: [`Lista de troféus de GTA VI (${TROPHIES.length})`, `Os ${TROPHIES.length} troféus de GTA VI com guia, perdíveis, roteiro da platina e sincronização com a PSN.`],
  cem: ["Tracker 100% de GTA VI", "Checklist das linhas do menu Progresso de GTA VI com o mínimo exigido para os 100%."],
  radio: [`As ${RADIOS.length} rádios de GTA VI`, `Todas as ${RADIOS.length} estações de rádio de GTA VI com apresentadores e músicas.`],
  personagens: ["Personagens de GTA VI", "Lucia, Jason e os personagens de Leonida, incluindo as linhas de missões de estranhos."],
  favoritos: ["Favoritos", "Seus favoritos no Leonida Log."],
  psn: ["Perfil", "Seu progresso, contas vinculadas e preferências."],
  novidades: ["Novidades", "Atualizações do guia e notícias de GTA VI."],
  notas: ["Minhas notas", "Suas anotações sobre GTA VI."],
};

export function meta(route) {
  const { view, id } = route || { view: "inicio" };
  if (view === "missoes" && id) {
    const m = MISSIONS.find((x) => x.id === +id);
    const ch = CHAPTERS.find((c) => c.id === m.chapter);
    return { title: `${m.name} — Missão ${m.id} de GTA VI`, description: `Missão ${m.id} de ${MISSIONS.length}, Capítulo ${ch.id} (${ch.name})${m.who ? ", jogando com " + m.who : ""}. ${m.note || "Guia e checklist da missão."}` };
  }
  if (view === "trofeus" && id) {
    const t = TROPHIES.find((x) => x.id === id);
    return { title: `${t.name} — Troféu ${t.grade} de GTA VI`, description: `Como conseguir o troféu ${t.name} em GTA VI: ${t.desc}` };
  }
  if (view === "radio" && id) {
    const r = RADIOS.find((x) => x.id === id);
    return { title: `${r.full || r.name} — Rádio de GTA VI`, description: `${r.name} (${r.genre}), apresentada por ${r.hosts}.${r.songs ? " Músicas: " + r.songs.slice(0, 4).join(", ") + "." : ""}` };
  }
  if (view === "mapa" && id && CAT[id]) {
    const c = CAT[id];
    const n = [...MARKERS, ...POINTS].filter((m) => m.cat === id).length;
    return { title: `${c.label} — Mapa de GTA VI`, description: `Mapa de ${c.label.toLowerCase()} em GTA VI${c.total ? ` (${c.total} no jogo)` : ""}: ${n} locais marcados em Leonida, com checklist.` };
  }
  const [title, description] = VIEW[view] || VIEW.inicio;
  return { title, description };
}
