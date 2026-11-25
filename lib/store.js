"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { EMPTY, normalize, stamp, mergeState, cloudPayload } from "./progress.js";

export { stats, applyPsn } from "./progress.js";

const KEY = "leonida-log:v1";

export function useProgress() {
  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(normalize(JSON.parse(raw)));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); setSaveError(false); }
    catch { setSaveError(true); } // armazenamento cheio ou bloqueado: avisa em vez de falhar em silêncio
  }, [state, ready]);

  // update: alteração do usuário (registra a data de cada item alterado)
  const update = useCallback((fn) => setState((s) => {
    const next = { ...s, ...fn(s) };
    next._mt = stamp(s, next);
    return next;
  }), []);
  // replace: aplica dados vindos de fora (nuvem, migração) sem registrar como alteração nova
  const replace = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);
  return { state, update, replace, ready, saveError };
}

// Sincroniza o progresso com a conta (Supabase).
// Antes de cada envio lê a versão da nuvem e mescla item a item pela alteração mais recente,
// para que um aparelho com dados antigos não apague o que foi feito em outro.
export function useCloudSync(state, replace, ready, user) {
  const [status, setStatus] = useState("idle");
  const loaded = useRef(null);
  const lastPushed = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const pull = useCallback(async () => {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase.from("progress").select("data").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return data?.data && Object.keys(data.data).length ? data.data : null;
  }, [user]);

  const absorb = useCallback((remote) => {
    if (!remote) return;
    replace((st) => {
      const m = mergeState(st, remote);
      return JSON.stringify(cloudPayload(m)) === JSON.stringify(cloudPayload(st)) ? {} : m;
    });
  }, [replace]);

  // ao entrar: traz a nuvem e mescla
  useEffect(() => {
    if (!ready || !user || loaded.current === user.id) return;
    loaded.current = user.id;
    (async () => {
      try { absorb(await pull()); setStatus("synced"); } catch { setStatus("error"); }
    })();
  }, [ready, user, pull, absorb]);

  // ao voltar para a aba: busca alterações feitas em outro aparelho
  useEffect(() => {
    if (!ready || !user) return;
    const f = () => { if (document.visibilityState === "visible") pull().then(absorb).catch(() => {}); };
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, [ready, user, pull, absorb]);

  // envia alterações (lê a nuvem antes, para não sobrescrever)
  useEffect(() => {
    if (!ready || !user || loaded.current !== user.id) return;
    const local = JSON.stringify(cloudPayload(state));
    if (local === lastPushed.current) return;
    const t = setTimeout(async () => {
      const { supabase } = await import("./supabase");
      setStatus("saving");
      try {
        const remote = await pull();
        const merged = cloudPayload(mergeState(stateRef.current, remote));
        const { error } = await supabase.from("progress").upsert({ user_id: user.id, data: merged, updated_at: new Date().toISOString() });
        if (error) throw error;
        lastPushed.current = JSON.stringify(merged);
        absorb(remote);
        setStatus("synced");
      } catch { setStatus("error"); }
    }, 1500);
    return () => clearTimeout(t);
  }, [state, ready, user, pull, absorb]);
  return status;
}
