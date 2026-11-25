import { test } from "node:test";
import assert from "node:assert/strict";
import { pathFor, parsePath, allPaths } from "../lib/routes.js";
import { MISSIONS, TROPHIES } from "../lib/data.js";
import { TROPHY_LINKS, MISSION_TROPHY } from "../lib/links.js";
import { CAT, MARKERS, POINTS } from "../lib/mapdata.js";

test("todas as rotas vão e voltam", () => {
  for (const p of allPaths()) {
    const r = parsePath(p.split("/").filter(Boolean)) || (p === "/" ? { view: "inicio", id: null } : null);
    assert.ok(r, "rota inválida: " + p);
    assert.equal(pathFor(r.view, r.id), p);
  }
});

test("urls únicas", () => {
  const all = allPaths();
  assert.equal(new Set(all).size, all.length);
  assert.ok(all.length > MISSIONS.length + TROPHIES.length);
});

test("ligações de troféus apontam para coisas que existem", () => {
  const ids = new Set([...MARKERS, ...POINTS].map((m) => m.id));
  for (const t of TROPHIES) {
    const l = TROPHY_LINKS[t.id];
    if (l.map) assert.ok(CAT[l.map], t.name + " → camada " + l.map);
    if (l.point) assert.ok(ids.has(l.point), t.name + " → ponto " + l.point);
    if (l.mission) assert.ok(MISSIONS.some((m) => m.id === l.mission), t.name);
  }
  assert.equal(MISSION_TROPHY[91].name, "You Gotta Know When to Get Off");
});
