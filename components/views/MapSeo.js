// Conteúdo textual do mapa para buscadores e leitores de tela (o mapa em si é desenhado no navegador).
import { GROUPS, CAT, MARKERS, POINTS } from "../../lib/mapdata";

export function MapSeo({ cat }) {
  const all = [...MARKERS, ...POINTS];
  const cats = cat && CAT[cat] ? [CAT[cat]] : GROUPS.flatMap((g) => g.items);
  return (
    <section className="sr-only" aria-label="Lista de locais do mapa">
      <h1>{cat && CAT[cat] ? `${CAT[cat].label} — mapa de GTA VI` : "Mapa interativo de Leonida (GTA VI)"}</h1>
      {cats.map((c) => {
        const list = all.filter((m) => m.cat === c.key);
        if (!list.length) return null;
        return (
          <div key={c.key}>
            <h2>{c.label}{c.total ? ` (${c.total} no jogo)` : ""}</h2>
            <ul>{list.map((m) => <li key={m.id}>{m.name}{m.area ? ` — ${m.area}` : ""}{m.text ? `: ${m.text}` : ""}</li>)}</ul>
          </div>
        );
      })}
    </section>
  );
}
