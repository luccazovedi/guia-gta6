// Ligações entre troféus, missões, mapa e o Tracker 100%.
import { TROPHIES, CHAPTERS, MISSIONS, COMPLETION } from "./data.js";
import { CAT } from "./mapdata.js";

// Troféu → { counter, need } (progresso no Tracker), map (camada do mapa), mission, char, view, missable
const BY_NAME = {
  "A Long Road": { view: "cem" },
  "Cunning Stunts": { counter: "stunts", need: 250, map: "stunt" },
  "The Shootist": { counter: "range", need: 42, map: "tiro" },
  "Maximum Withdrawal": { counter: "vaults", need: 5, map: "cofre" },
  "Strangers & Freaks": { view: "personagens" },
  "Don't Touch My Deck": { counter: "cards", need: 3, map: "carta" },
  "You WAiNKer!": { counter: "waink", need: 100, map: "waink" },
  "Earn Cash, Not Kudos": { counter: "races", need: 20, map: "corrida" },
  "Retail Therapy": { map: "loja" },
  "Whip It Good": { counter: "vehicles", need: 100 },
  "Pest Control": { map: "gangue" },
  "Dime on the Dollar": { counter: "bills", need: 250, map: "receptador" },
  "Top Fun": { counter: "drones", need: 14, map: "drone" },
  "Baited My Tackle": { char: "Cal Hampton" },
  "Positive Mental Attitude": { counter: "meditation", need: 18, map: "meditacao", missable: "A meditação da varanda da casa das Keys só pode ser feita no Capítulo 1.", point: "med1" },
  "Sneakthief": { map: "joalheria" },
  "One Last Thing": { counter: "challenges", need: 50 },
  "Road to Rehabilitation": { char: "Andy" },
  "This Was No Boat Accident": { char: "Kenton Rees" },
  "The Lone Rider": { char: "Billy" },
  "Supply & Demand": { char: "Randy" },
  "Spin On This!": { char: "Tyrone" },
  "Fair Game": { char: "Bret" },
  "Catch Me If You Can": { point: "vcia" },
  "Challenging Tank": { map: "trofeu" },
  "Let's Go Bowling": { map: "trofeu" },
  "Personal Best": { tipCat: "Personagens" },
  "Trust": { mission: 30 }, "Break the Bank": { mission: 59 }, "Family Matters": { mission: 76 },
  "DWNFALL": { mission: 77 }, "Hi-Jacked": { mission: 82 }, "Snow Storm": { mission: 89 },
  "Just Like Paradise": { mission: 2 }, "You Gotta Know When to Get Off": { mission: 91 },
};
for (const c of CHAPTERS) if (!BY_NAME[c.trophy]) BY_NAME[c.trophy] = { mission: c.to };

export const TROPHY_LINKS = Object.fromEntries(TROPHIES.map((t) => [t.id, BY_NAME[t.name] || {}]));

// Missão → troféu que ela dá
export const MISSION_TROPHY = Object.fromEntries(
  TROPHIES.filter((t) => TROPHY_LINKS[t.id].mission).map((t) => [TROPHY_LINKS[t.id].mission, t]),
);

// Avisos de itens perdíveis antes de concluir uma missão
export const MISSION_WARN = {
  22: { text: "Última missão do Capítulo 1. Antes de concluí-la, medite na varanda da casa das Keys: é perdível e conta para o troféu Positive Mental Attitude.", point: "med1" },
};

// Linha do Tracker 100% → camada do mapa
export const COUNTER_MAP = Object.fromEntries(Object.values(CAT).filter((c) => c.counter).map((c) => [c.counter, c.key]));

export const COUNTER_LABEL = Object.fromEntries(COMPLETION.flatMap((g) => g.items).map((it) => [it.id, it.label]));

export const MISSABLE_TROPHIES = TROPHIES.filter((t) => TROPHY_LINKS[t.id].missable);

export const missionById = (id) => MISSIONS.find((m) => m.id === +id);

// Camada do mapa → linha do Tracker 100%
export const CAT_COUNTER = Object.fromEntries(Object.values(CAT).filter((c) => c.counter).map((c) => [c.key, c.counter]));
