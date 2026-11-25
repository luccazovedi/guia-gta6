"use client";
// Fotos dos pontos do mapa ficam no IndexedDB, separadas do progresso.
// Antes ficavam no localStorage junto com tudo e, ao lotar (~5 MB), o progresso parava de salvar.
import { useCallback, useEffect, useState } from "react";

const DB = "leonida-log", STORE = "photos";

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => res(out?.result);
    t.onerror = () => rej(t.error);
  });
}
async function getAll() {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, "readonly");
    const st = t.objectStore(STORE);
    const out = {};
    const c = st.openCursor();
    c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
    c.onerror = () => rej(c.error);
  });
}

export function usePhotos(state, replace, ready) {
  const [photos, setPhotos] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        // migra fotos antigas que estavam dentro do progresso
        const legacy = state.photos && Object.keys(state.photos).length ? state.photos : null;
        if (legacy) {
          await tx("readwrite", (st) => { for (const [k, v] of Object.entries(legacy)) st.put(v, k); });
          replace(() => ({ photos: undefined }));
        }
        setPhotos(await getAll());
      } catch { setError("Fotos indisponíveis neste navegador."); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const setPhoto = useCallback(async (id, url) => {
    try { await tx("readwrite", (st) => st.put(url, id)); setPhotos((p) => ({ ...p, [id]: url })); setError(null); }
    catch { setError("Não foi possível salvar a foto: armazenamento cheio."); }
  }, []);
  const removePhoto = useCallback(async (id) => {
    try { await tx("readwrite", (st) => st.delete(id)); } catch {}
    setPhotos((p) => { const n = { ...p }; delete n[id]; return n; });
  }, []);
  const clearPhotos = useCallback(async () => {
    try { await tx("readwrite", (st) => st.clear()); } catch {}
    setPhotos({});
  }, []);
  return { photos, setPhoto, removePhoto, clearPhotos, photoError: error };
}
