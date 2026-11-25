// Lógica pura de progresso (sem React): estatísticas, PSN e mesclagem com a nuvem.
import { COMPLETION, MISSIONS, TROPHIES, CHAPTERS } from "./data.js";

export const EMPTY = {
  missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], visited: {}, favs: {}, notes: [], mapNotes: {},
  theme: "auto", newsSeen: 0, spoilerFree: true, psn: null, _mt: {},
};

// Seções guardadas como objeto: cada chave tem sua própria data de alteração (_mt["missions.12"]).
export const MAP_SECTIONS = ["missions", "trophies", "radios", "visited", "favs", "counters", "mapNotes"];
// Listas com id: cada item tem data própria (_mt["notes.<id>"]).
export const LIST_SECTIONS = ["notes", "pins"];
// Preferências: a seção inteira tem uma data (_mt["theme"]).
export const WHOLE_SECTIONS = ["theme", "spoilerFree", "mapHidden", "mapHideFound", "mapOnlyFavs", "newsSeen"];
// Ficam só no aparelho
export const LOCAL_ONLY = ["psn", "photos"];

const byId = (list) => Object.fromEntries((list || []).map((x) => [String(x.id), x]));
const same = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);

export function normalize(st) {
  const s = { ...EMPTY, ...st, _mt: { ...(st?._mt || {}) } };
  // pins antigos não tinham id
  s.pins = (s.pins || []).map((p, i) => (p.id ? p : { ...p, id: "pin-legacy-" + i }));
  s.notes = (s.notes || []).map((n) => ({ ...n, id: n.id ?? Date.now() }));
  return s;
}

// Registra a data de alteração de tudo que mudou entre prev e next.
export function stamp(prev, next, now = Date.now()) {
  const mt = { ...(prev._mt || {}) };
  for (const sec of MAP_SECTIONS) {
    const a = prev[sec] || {}, b = next[sec] || {};
    if (a === b) continue;
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (!same(a[k], b[k])) mt[sec + "." + k] = now;
  }
  for (const sec of LIST_SECTIONS) {
    if (prev[sec] === next[sec]) continue;
    const a = byId(prev[sec]), b = byId(next[sec]);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (!same(a[k], b[k])) mt[sec + "." + k] = now;
  }
  for (const sec of WHOLE_SECTIONS) if (!same(prev[sec], next[sec])) mt[sec] = now;
  return mt;
}

// Mescla dois estados: para cada item vale a alteração mais recente (inclusive remoções).
export function mergeState(local, remote) {
  if (!remote) return local;
  const lt = local._mt || {}, rt = remote._mt || {};
  const out = { ...local };
  const mt = { ...lt };
  for (const [k, t] of Object.entries(rt)) if (!(mt[k] >= t)) mt[k] = t;

  const pick = (key, inA, inB, va, vb, tieMax) => {
    const ta = lt[key] || 0, tb = rt[key] || 0;
    if (ta > tb) return { has: inA, v: va };
    if (tb > ta) return { has: inB, v: vb };
    if (tieMax && inA && inB) return { has: true, v: Math.max(va || 0, vb || 0) };
    return inA ? { has: true, v: va } : { has: inB, v: vb };
  };

  for (const sec of MAP_SECTIONS) {
    const a = local[sec] || {}, b = remote[sec] || {};
    const r = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const p = pick(sec + "." + k, k in a, k in b, a[k], b[k], sec === "counters");
      if (p.has) r[k] = p.v;
    }
    out[sec] = r;
  }
  for (const sec of LIST_SECTIONS) {
    const a = byId(local[sec]), b = byId(remote[sec]);
    const order = [...(local[sec] || []).map((x) => String(x.id)), ...(remote[sec] || []).map((x) => String(x.id)).filter((id) => !(id in a))];
    out[sec] = order.map((id) => pick(sec + "." + id, id in a, id in b, a[id], b[id])).filter((p) => p.has && p.v).map((p) => p.v);
  }
  for (const sec of WHOLE_SECTIONS) {
    if (!(sec in remote)) continue;
    if ((rt[sec] || 0) > (lt[sec] || 0)) out[sec] = remote[sec];
  }
  out._mt = mt;
  return out;
}

// O que vai para a nuvem
export function cloudPayload(state) {
  const data = { ...state };
  for (const k of LOCAL_ONLY) delete data[k];
  return data;
}

export function stats(state) {
  const missionsDone = MISSIONS.filter((m) => state.missions[m.id]).length;
  const trophiesDone = TROPHIES.filter((t) => state.trophies[t.id]).length;
  const lines = COMPLETION.flatMap((g) => g.items);
  const lineScore = lines.map((it) => {
    const v = it.id === "story" ? missionsDone : state.counters[it.id] || 0;
    return Math.min(v / it.need, 1);
  });
  const completion = Math.round((lineScore.reduce((a, b) => a + b, 0) / lines.length) * 1000) / 10;
  const linesDone = lineScore.filter((x) => x >= 1).length;
  return { missionsDone, trophiesDone, completion, linesDone, linesTotal: lines.length };
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Converte troféus da PSN em progresso local
export function applyPsn(state, psn) {
  const trophies = { ...state.trophies };
  const missions = { ...state.missions };
  const counters = { ...state.counters };
  const earnedNames = new Set(psn.trophies.filter((t) => t.earned).map((t) => norm(t.name)));
  const has = (name) => earnedNames.has(norm(name)) ||
    // "T**s Ass Drug Money" pode vir sem censura
    (name.includes("**") && [...earnedNames].some((n) => n.endsWith(norm(name.split("**")[1]))));

  for (const t of TROPHIES) if (has(t.name)) trophies[t.id] = true;

  // A história é linear: um troféu de missão implica todas as anteriores
  let upTo = 0;
  const byMission = { "Just Like Paradise": 2, "Trust": 30, "Break the Bank": 59, "Family Matters": 76, "DWNFALL": 77, "Hi-Jacked": 82, "Snow Storm": 89 };
  for (const [name, n] of Object.entries(byMission)) if (has(name)) upTo = Math.max(upTo, n);
  for (const c of CHAPTERS) if (has(c.trophy)) upTo = Math.max(upTo, c.to);
  for (let i = 1; i <= upTo; i++) missions[i] = true;

  const floor = (id, v) => { counters[id] = Math.max(counters[id] || 0, v); };
  if (has("The Shootist")) floor("range", 42);
  if (has("Cunning Stunts")) floor("stunts", 250);
  if (has("You WAiNKer!")) floor("waink", 100);
  if (has("Don't Touch My Deck")) floor("cards", 3);
  if (has("Maximum Withdrawal")) floor("vaults", 5);
  if (has("Dime on the Dollar")) floor("bills", 250);
  if (has("Top Fun")) floor("drones", 14);
  if (has("Earn Cash, Not Kudos")) floor("races", 20);
  if (has("One Last Thing")) floor("challenges", 50);
  if (has("Whip It Good")) floor("vehicles", 100);
  if (has("A Long Road")) for (const g of COMPLETION) for (const it of g.items) floor(it.id, it.need);

  // Dados da PSN por troféu (data e raridade) para a aba Troféus
  const psnTrophies = {};
  for (const t of TROPHIES) {
    const hit = psn.trophies.find((x) => norm(x.name) === norm(t.name) ||
      (t.name.includes("**") && norm(x.name).endsWith(norm(t.name.split("**")[1]))));
    if (hit) psnTrophies[t.id] = { earned: !!hit.earned, earnedAt: hit.earnedAt || null, rate: hit.rate ?? null };
  }
  return {
    trophies, missions, counters,
    psn: { onlineId: psn.onlineId, syncedAt: psn.syncedAt, progress: psn.progress, title: psn.title, found: true, trophies: psnTrophies },
  };
}
