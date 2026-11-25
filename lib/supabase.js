"use client";
import { createClient } from "@supabase/supabase-js";

// Chave publicável: segura para o navegador (o acesso é controlado por RLS).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cufhawoieuwypbzcllcx.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_mfoNGMO0eIbFA1uwICBejw_umf-TDrP";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
