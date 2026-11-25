"use client";
import { supabase } from "./supabase";

// Chama a função segura no servidor (Supabase Edge Function psn-sync)
export async function syncPsn(body) {
  const { data, error } = await supabase.functions.invoke("psn-sync", { body });
  if (error) {
    let m = "Falha ao sincronizar.";
    try { m = (await error.context.json()).error || m; } catch {}
    return { ok: false, error: m };
  }
  if (!data.found) return { ok: false, error: `Conectado${data.onlineId ? " como " + data.onlineId : ""}, mas o GTA VI ainda não aparece nos seus troféus.` };
  return { ok: true, data };
}
