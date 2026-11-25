"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { COMPLETION, MISSIONS, TROPHIES, CHAPTERS } from "./data";

const KEY = "leonida-log:v1";
const EMPTY = { missions: {}, trophies: {}, counters: {}, radios: {}, pins: [], visited: {}, favs: {}, notes: [], theme: "auto", newsSeen: 0, spoilerFree: true, psn: null };

export function useProgress() {
  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, ready]);

  const update = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);
  return { state, update, ready };
}

// Sincroniza o progresso com a conta (Supabase) quando o usuário está logado
export function useCloudSync(state, update, ready, user) {
  const [status, setStatus] = useState("idle");
  const loaded = useRef(null);
  useEffect(() => {
    if (!ready || !user) return;
    if (loaded.current === user.id) return;
    loaded.current = user.id;
    (async () => {
      const { supabase } = await import("./supabase");
      const { data } = await supabase.from("progress").select("data, updated_at").eq("user_id", user.id).maybeSingle();
      const remote = data?.data;
      if (remote && Object.keys(remote).length) {
        // mescla: o que estiver marcado em qualquer lado continua marcado
        update((st) => ({
          missions: { ...remote.missions, ...st.missions },
          trophies: { ...remote.trophies, ...st.trophies },
          radios: { ...remote.radios, ...st.radios },
          visited: { ...(remote.visited || {}), ...(st.visited || {}) },
          favs: { ...(remote.favs || {}), ...st.favs },
          counters: Object.fromEntries([...new Set([...Object.keys(remote.counters || {}), ...Object.keys(st.counters)])]
            .map((k) => [k, Math.max(remote.counters?.[k] || 0, st.counters[k] || 0)])),
          pins: st.pins.length ? st.pins : remote.pins || [],
          mapNotes: { ...(remote.mapNotes || {}), ...(st.mapNotes || {}) },
          notes: [...(st.notes || []), ...(remote.notes || []).filter((n) => !(st.notes || []).some((x) => x.id === n.id))],
        }));
      }
      setStatus("synced");
    })();
  }, [ready, user, update]);

  useEffect(() => {
    if (!ready || !user || loaded.current !== user.id) return;
    const t = setTimeout(async () => {
      const { supabase } = await import("./supabase");
      const { psn, photos, ...data } = state; // fotos ficam só no aparelho
      setStatus("saving");
      const { error } = await supabase.from("progress").upsert({ user_id: user.id, data, updated_at: new Date().toISOString() });
      setStatus(error ? "error" : "synced");
    }, 1500);
    return () => clearTimeout(t);
  }, [state, ready, user]);
  return status;
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
