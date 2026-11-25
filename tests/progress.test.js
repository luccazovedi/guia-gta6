import { test } from "node:test";
import assert from "node:assert/strict";
import { stamp, mergeState, normalize, applyPsn, stats, cloudPayload, EMPTY } from "../lib/progress.js";
import { MISSIONS, TROPHIES } from "../lib/data.js";

const edit = (s, patch, now) => { const n = { ...s, ...patch }; n._mt = stamp(s, n, now); return n; };

test("a alteração mais recente vence, item a item", () => {
  const base = normalize({});
  const pc = edit(base, { missions: { 1: true, 2: true } }, 100);
  const phone = edit(base, { missions: { 3: true } }, 50); // aparelho com dados antigos
  const m = mergeState(phone, pc);
  assert.deepEqual(m.missions, { 1: true, 2: true, 3: true });
});

test("desmarcar em um aparelho propaga para o outro", () => {
  let a = edit(normalize({}), { missions: { 5: true } }, 10);
  const b = a; // outro aparelho já sincronizado
  a = edit(a, { missions: { 5: false } }, 20);
  assert.equal(mergeState(b, a).missions[5], false);
  assert.equal(mergeState(a, b).missions[5], false);
});

test("zerar apaga também o que veio da nuvem antiga", () => {
  const remote = { ...normalize({ missions: { 1: true }, notes: [{ id: 1, title: "x", text: "" }] }) }; // sem datas (legado)
  const local = edit(normalize(remote), { missions: {}, notes: [] }, 30);
  const m = mergeState(local, remote);
  assert.deepEqual(m.missions, {});
  assert.deepEqual(m.notes, []);
});

test("notas e pins de aparelhos diferentes são somados", () => {
  const base = normalize({});
  const a = edit(base, { notes: [{ id: 1, title: "a", text: "" }] }, 10);
  const b = edit(base, { notes: [{ id: 2, title: "b", text: "" }], pins: [{ id: "pin-1", name: "P", x: 1, y: 1 }] }, 12);
  const m = mergeState(a, b);
  assert.deepEqual(m.notes.map((n) => n.id).sort(), [1, 2]);
  assert.equal(m.pins.length, 1);
});

test("contadores legados (sem data) ficam com o maior valor", () => {
  const m = mergeState(normalize({ counters: { waink: 3 } }), normalize({ counters: { waink: 7 } }));
  assert.equal(m.counters.waink, 7);
});

test("preferências: vence a mais recente", () => {
  const a = edit(normalize({}), { theme: "dark" }, 50);
  const b = edit(normalize({}), { theme: "light" }, 40);
  assert.equal(mergeState(b, a).theme, "dark");
  assert.equal(mergeState(a, b).theme, "dark");
});

test("cloudPayload não envia PSN nem fotos", () => {
  const p = cloudPayload({ ...EMPTY, psn: { x: 1 }, photos: { a: "data:" } });
  assert.ok(!("psn" in p) && !("photos" in p));
});

test("pins antigos ganham id", () => {
  assert.equal(normalize({ pins: [{ name: "a" }] }).pins[0].id, "pin-legacy-0");
});

test("PSN: troféu de capítulo marca as missões anteriores", () => {
  const ch2 = TROPHIES.find((t) => t.name === "T**s Ass Drug Money");
  const r = applyPsn(normalize({}), { onlineId: "x", syncedAt: 1, progress: 5, trophies: [{ name: "Tits Ass Drug Money", earned: true }] });
  assert.equal(r.trophies[ch2.id], true);
  assert.equal(Object.keys(r.missions).length, 33);
});

test("stats", () => {
  const st = normalize({ missions: Object.fromEntries(MISSIONS.map((m) => [m.id, true])) });
  const s = stats(st);
  assert.equal(s.missionsDone, MISSIONS.length);
  assert.ok(s.completion > 0 && s.completion < 100);
});
