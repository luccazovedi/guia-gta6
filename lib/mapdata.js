// Mapa ilustrativo original de Leonida (coordenadas 0–1000).
// Posições aproximadas, baseadas em descrições públicas. Não é o mapa oficial do jogo.

// Categorias agrupadas. "total" = quantidade no jogo (quando conhecida); "counter" = linha do Tracker 100%.
export const GROUPS = [
  { id: "colec", label: "Colecionáveis", items: [
    { key: "flamingo", one: "Flamingo", label: "Flamingos de cocaína", color: "#ec4899", glyph: "✿", icon: "Bird", total: 125, counter: "flamingos" },
    { key: "carta", one: "Carta", label: "Cartas colecionáveis", color: "#8b5cf6", glyph: "♠", icon: "Spade", total: 480 },
    { key: "revista", one: "Revista", label: "Revistas, livros e HQs", color: "#0ea5e9", glyph: "▤", icon: "BookOpen", total: 34, counter: "mags" },
    { key: "relogio", one: "Relógio", label: "Relógios", color: "#f59e0b", glyph: "◷", icon: "Watch" },
    { key: "meditacao", one: "Meditação", label: "Pontos de meditação", color: "#14b8a6", glyph: "☯", icon: "Flower2", total: 18, counter: "meditation" },
    { key: "mergulho", one: "Mergulho", label: "Descobertas subaquáticas", color: "#0284c7", glyph: "≈", icon: "Waves", total: 33, counter: "underwater" },
    { key: "waink", one: "WAiNK", label: "Locais WAiNK", color: "#a855f7", glyph: "◎", icon: "ScanLine", total: 100, counter: "waink" },
  ]},
  { id: "ativ", label: "Atividades", items: [
    { key: "corrida", one: "Corrida", label: "Corridas", color: "#f97316", glyph: "⚑", icon: "Flag", total: 40, counter: "races" },
    { key: "tiro", one: "Estande de tiro", label: "Estandes de tiro", color: "#b91c1c", glyph: "◉", icon: "Target" },
    { key: "drone", one: "Drone", label: "Corridas de drone", color: "#06b6d4", glyph: "✈", icon: "Drone", total: 14 },
    { key: "basquete", one: "Cesta", label: "Cestas de basquete", color: "#ea580c", glyph: "●", icon: "CircleDot", total: 100, counter: "hoops" },
    { key: "sinuca", one: "Sinuca", label: "Sinuca", color: "#16a34a", glyph: "8", icon: "Circle", total: 7, counter: "pool" },
    { key: "minigolfe", one: "Minigolfe", label: "Minigolfe", color: "#65a30d", glyph: "⛳", icon: "FlagTriangleRight", total: 3, counter: "minigolf" },
    { key: "stunt", one: "Acrobacia", label: "Acrobacias", color: "#eab308", glyph: "⚡", icon: "Zap", total: 397, counter: "stunts" },
  ]},
  { id: "crime", label: "Crimes", items: [
    { key: "banco", one: "Banco", label: "Bancos", color: "#1d4ed8", glyph: "$", icon: "Landmark", total: 22, counter: "bankjobs" },
    { key: "cofre", one: "Cofre", label: "Cofres", color: "#334155", glyph: "▣", icon: "Vault", total: 8, counter: "vaults" },
    { key: "loja", one: "Loja", label: "Lojas (Stick Ups)", color: "#dc2626", glyph: "⚑", icon: "ShoppingBag", total: 91, counter: "stickups" },
    { key: "joalheria", one: "Joalheria", label: "Joalherias e penhores", color: "#db2777", glyph: "◆", icon: "Gem", total: 35, counter: "smash" },
    { key: "gangue", one: "Operação de gangue", label: "Operações de gangue", color: "#7f1d1d", glyph: "☠", icon: "Skull", total: 39, counter: "gangops" },
  ]},
  { id: "locais", label: "Locais", items: [
    { key: "poi", one: "Ponto", label: "Pontos de interesse", color: "#7c3aed", glyph: "★", icon: "Star" },
    { key: "casa", one: "Casa", label: "Casas", color: "#0d9488", glyph: "⌂", icon: "House" },
    { key: "negocio", one: "Negócio", label: "Negócios", color: "#be185d", glyph: "$", icon: "Store" },
    { key: "atividade", one: "Atividade", label: "Outras atividades", color: "#ea580c", glyph: "◆", icon: "Activity" },
    { key: "trofeu", one: "Troféu", label: "Troféus", color: "#ca8a04", glyph: "♛", icon: "Trophy" },
    { key: "radio", one: "Rádio", label: "Rádio", color: "#2563eb", glyph: "♪", icon: "Radio" },
    { key: "outro", one: "Pin", label: "Meus outros pins", color: "#475569", glyph: "●", icon: "MapPin" },
  ]},
];
export const CAT = Object.fromEntries(GROUPS.flatMap((g) => g.items.map((i) => [i.key, { ...i, group: g.id }])));

export const COAST =
  "M110 50 L870 50 L878 150 L892 260 L905 360 L922 450 L938 540 L948 620 L944 700 L922 770 L884 826 L830 862 L772 878 L716 868 L664 840 L606 806 L548 774 L494 732 L446 680 L404 620 L362 556 L322 496 L280 436 L240 392 L206 360 L176 330 L150 290 L128 230 L112 160 Z";

export const LAKE = "M560 400 C 575 360, 650 352, 684 380 C 712 404, 700 458, 664 474 C 622 492, 570 476, 556 446 C 548 430, 550 414, 560 400 Z";

export const SWAMP =
  "M470 640 C 520 610, 600 600, 660 620 C 720 640, 760 690, 760 740 C 760 790, 720 830, 670 840 C 610 830, 560 790, 520 750 C 490 720, 466 690, 470 640 Z";

export const FOREST = "M300 70 L640 70 L660 150 L600 220 L470 236 L360 210 L310 150 Z";

export const CITY = "M790 560 L930 548 L944 620 L938 700 L906 742 L842 748 L800 712 L786 640 Z";

// Ilhas-barreira e Keys
export const ISLANDS = [
  "M952 560 L962 566 L966 650 L960 720 L950 724 L946 650 Z", // Vice Beach
  "M906 612 Q920 606 928 614 Q920 622 906 620 Z", // Venetian Islands
  "M898 684 Q914 676 924 686 Q912 696 898 692 Z", // Starfish Island
  "M740 884 Q760 876 772 888 Q756 898 740 894 Z",
  "M694 900 Q718 890 732 902 Q712 914 694 910 Z",
  "M642 918 Q670 906 688 920 Q664 932 642 928 Z",
  "M590 932 Q616 922 634 934 Q612 946 590 942 Z",
  "M540 944 Q566 934 582 946 Q562 958 540 954 Z",
  "M486 956 Q512 946 530 958 Q508 970 486 966 Z",
  "M440 964 Q458 958 470 968 Q456 976 440 974 Z",
];

export const ROADS = [
  { d: "M872 60 L890 240 L906 380 L900 470 L880 560", major: true }, // costa leste
  { d: "M230 360 C 360 380, 460 420, 548 420 C 640 420, 740 520, 820 600", major: true }, // atravessa o estado
  { d: "M900 470 C 860 500, 840 530, 830 580", major: false },
  { d: "M548 420 C 540 300, 520 200, 470 120", major: false }, // para Kalaga
  { d: "M560 780 C 640 760, 720 740, 810 720", major: false }, // Grassrivers → VC
  { d: "M812 740 C 790 800, 770 850, 756 884 Q 700 900 660 916 Q 600 936 540 948 Q 490 958 450 968", major: true }, // estrada das Keys
  { d: "M300 450 C 380 560, 450 640, 520 700", major: false },
];

export const REGIONS_MAP = [
  { id: "kalaga", name: "Mount Kalaga National Park", x: 470, y: 150, county: "Lummox County", text: "Florestas, cânions e rios na fronteira norte." },
  { id: "waning", name: "Waning Sands", x: 790, y: 250, county: "Leonard County", text: "Área nomeada no condado de Leonard, nordeste." },
  { id: "gellhorn", name: "Port Gellhorn", x: 250, y: 360, county: "Kelly County", text: "A \"costa esquecida\": cidade portuária industrial de motéis decadentes." },
  { id: "ambrosia", name: "Ambrosia", x: 520, y: 470, county: "Ambrosia County", text: "Coração industrial ao lado do Lake Leonida, com a refinaria Allied Crystal." },
  { id: "grass", name: "Grassrivers", x: 610, y: 715, county: "Mariana County", text: "Pântanos e manguezais inspirados nos Everglades." },
  { id: "vice", name: "Vice City", x: 860, y: 520, county: "Vice-Dale County", text: "A maior e mais detalhada cidade do jogo." },
  { id: "keys", name: "Leonida Keys", x: 560, y: 975, county: "Mariana County", text: "Ilhas tropicais ligadas por pontes; onde a história começa." },
];

export const DISTRICTS = [
  { name: "Rockridge", x: 830, y: 578 },
  { name: "La Perle", x: 862, y: 596 },
  { name: "Stockyard", x: 820, y: 620 },
  { name: "Downtown", x: 868, y: 644 },
  { name: "Little Cuba", x: 828, y: 670 },
  { name: "Porto de VC", x: 892, y: 668 },
  { name: "Venetian Islands", x: 915, y: 600 },
  { name: "Washington Beach", x: 958, y: 590 },
  { name: "Ocean Beach", x: 958, y: 650 },
  { name: "Vice Beach", x: 958, y: 712 },
  { name: "Starfish Island", x: 912, y: 704 },
];

export const MARKERS = [
  // Vice City
  { id: "vcia", cat: "poi", name: "Aeroporto Internacional de Vice City", x: 800, y: 632, text: "Principal aeroporto. Roubar um jato na ponte de embarque e voar ~1 km dá o troféu oculto Catch Me If You Can." , trophy: true },
  { id: "oceanview", cat: "poi", name: "Ocean View Hotel", x: 956, y: 664, text: "Hotel art déco clássico da orla de Ocean Beach." },
  { id: "metro", cat: "poi", name: "Estação de metrô de Vice City", x: 860, y: 630, text: "Parada de transporte no centro." },
  { id: "jack", cat: "negocio", name: "Jack of Hearts", x: 842, y: 652, text: "Clube do Boobie Ike, ponto de encontro com o Dre'Quan." },
  { id: "vault", cat: "radio", name: "The Vault (boate)", x: 876, y: 614, text: "Escaneie o pôster da máscara de gás com o celular para liberar a rádio secreta The Vault Radio." },
  { id: "drink", cat: "trofeu", name: "Drink com vista em Ocean Beach", x: 962, y: 640, text: "Dica do troféu oculto In The Beginning… (ainda não confirmado)." },
  // Keys
  { id: "jason", cat: "casa", name: "Casa do Jason", x: 721, y: 892, text: "Ponto de partida. Tem academia (treine força com a Lucia para o troféu Personal Best) e dá para dormir para pular a noite." },
  { id: "marina", cat: "poi", name: "Marina do Brian", x: 770, y: 880, text: "Base do Brian Heder; você volta para cá em Gone Fishing." },
  { id: "vercetti", cat: "poi", name: "Vercetti Estate", x: 687, y: 895, text: "Marco nas Keys." },
  { id: "keylento", cat: "negocio", name: "Key Lento – loja 247", x: 660, y: 901, text: "A revista RX Men fica no expositor da loja." },
  { id: "willies", cat: "negocio", name: "One-Eyed Willie's", x: 630, y: 906, text: "Comércio local nas Keys." },
  { id: "fang", cat: "negocio", name: "Electric Fang Tattoo", x: 590, y: 918, text: "Estúdio de tatuagem." },
  { id: "stock305", cat: "negocio", name: "Stock 305", x: 553, y: 923, text: "Comércio nas Keys." },
  { id: "milezero", cat: "trofeu", name: "Mile Zero Air Station", x: 336, y: 943, text: "Tanque Rhino: use um para o troféu oculto Challenging Tank." },
  // Interior
  { id: "kingpin", cat: "trofeu", name: "Kingpin Bowling", x: 262, y: 386, text: "Roube os três itens de valor e despiste a polícia: troféu Let's Go Bowling." },
  { id: "refinery", cat: "poi", name: "Refinaria Allied Crystal", x: 520, y: 430, text: "Domina o horizonte de Ambrosia." },
  { id: "bret", cat: "atividade", name: "Cabana do Bret", x: 400, y: 190, text: "Alvos e caçadas do Bret (só Jason): 15 alvos para os 100% e o troféu Fair Game." },
  { id: "kalaga-trail", cat: "atividade", name: "Trilhas de Mount Kalaga", x: 540, y: 120, text: "Off-road, caça e animais para estudar com o binóculo (100 para os 100%)." },
];

// Cidades, bairros e áreas citadas em guias públicos (posições aproximadas no mapa ilustrativo)
export const TOWNS = [
  { name: "Key Lento", x: 660, y: 912 }, { name: "Watson Bay", x: 600, y: 858 }, { name: "Capri", x: 500, y: 790 },
  { name: "Buckskin Swamp", x: 430, y: 600 }, { name: "Frogswater", x: 300, y: 430 }, { name: "Camp Moonflower", x: 330, y: 300 },
  { name: "Manifest Canyon", x: 370, y: 255 }, { name: "Lost Vista", x: 215, y: 330 }, { name: "Moreau", x: 560, y: 175 },
  { name: "Tallaloko", x: 380, y: 135 }, { name: "Millport", x: 620, y: 110 }, { name: "Belville", x: 760, y: 310 },
  { name: "Hamlet", x: 800, y: 735 }, { name: "Tequesta Retreat", x: 905, y: 545 }, { name: "Bayside", x: 848, y: 612 },
  { name: "Crosstown", x: 842, y: 640 }, { name: "Peacock Bay", x: 820, y: 700 }, { name: "Gloriana Key", x: 930, y: 765 },
  { name: "Leaf Links", x: 960, y: 722 },
];

// Pontos conhecidos (nome e área vêm de guias públicos; a posição é aproximada dentro da área)
const P = (id, cat, name, x, y, area, text) => ({ id, cat, name, x, y, area, text, approx: true });
export const POINTS = [
  // Meditação (10 locais, 18 meditações)
  P("med1", "meditacao", "Meditação na casa do Jason", 724, 888, "Key Lento", "Na varanda com os equipamentos de treino. Só no Capítulo 1 (perdível)."),
  P("med2", "meditacao", "Smooth Sand", 478, 800, "Capri", "Num banco de areia na costa oeste de Capri."),
  P("med3", "meditacao", "Swamp", 436, 610, "Buckskin Swamp", "Num píer de madeira ao lado de uma torre de observação, no meio do pântano."),
  P("med4", "meditacao", "Worn Stone", 322, 292, "Camp Moonflower", "Na margem do Emerald River."),
  P("med5", "meditacao", "Red Rocks", 378, 262, "Manifest Canyon", "Perto de onde os trilhos cruzam a rodovia."),
  P("med6", "meditacao", "Water Wheel", 570, 192, "South Moreau", "Perto da roda d'água de uma fábrica de papel em ruínas, à beira do rio."),
  P("med7", "meditacao", "Jutting Cliff", 500, 128, "Mount Kalaga National Park", "Ao lado de uma torre com vista para uma mina."),
  P("med8", "meditacao", "Waterfall", 360, 118, "Noroeste de Tallaloko", "Com vista para uma cachoeira num rio que corre para o leste."),
  P("med9", "meditacao", "Seaside", 880, 255, "Leste de Waning Sands", "Num afloramento de pedra na praia."),
  P("med10", "meditacao", "Ascent Mountain", 466, 96, "Pico do Mount Kalaga", "No círculo de pedras do cume. Só libera depois das outras meditações."),
  // Bancos (14 pequenos + 8 cofres)
  P("b1", "banco", "Fleeca – Key Lento", 666, 905, "Key Lento", "Banco pequeno."),
  P("b2", "banco", "Shorefront – Watson Bay", 604, 862, "Watson Bay", "Banco pequeno."),
  P("b4", "banco", "Lombank – Peacock Bay", 816, 702, "Peacock Bay", "Banco pequeno."),
  P("b5", "banco", "Fleeca – Peacock Bay", 826, 708, "Peacock Bay", "Banco pequeno."),
  P("b6", "banco", "Shorefront – Downtown", 872, 650, "Downtown", "Banco pequeno."),
  P("b7", "banco", "Shorefront – Rockridge", 830, 584, "Rockridge", "Banco pequeno."),
  P("b8", "banco", "Lombank – Bayside", 852, 616, "Bayside", "Banco pequeno."),
  P("b9", "banco", "Fleeca – Washington Beach", 958, 596, "Washington Beach", "Banco pequeno."),
  P("b10", "banco", "Lombank – Ocean Beach", 956, 640, "Ocean Beach", "Banco pequeno."),
  P("b11", "banco", "Fleeca – Ocean Beach", 960, 655, "Ocean Beach", "Banco pequeno."),
  P("b12", "banco", "Shorefront – Ocean Beach", 957, 668, "Ocean Beach", "Banco pequeno."),
  P("b13", "banco", "Druthers State Bank", 795, 285, "Leonard County", "Banco pequeno."),
  P("b14", "banco", "Shorefront – Ambrosia", 532, 452, "Ambrosia", "Banco pequeno."),
  P("v15", "cofre", "Fleeca – VCIA", 796, 640, "VCIA", "Banco grande com cofre."),
  P("v16", "cofre", "Fleeca – Tequesta", 902, 552, "Tequesta", "Banco grande com cofre."),
  P("v17", "cofre", "Lombank – Downtown", 864, 640, "Downtown", "Banco grande com cofre; o mais rentável."),
  P("v18", "cofre", "Fleeca – Downtown", 878, 638, "Downtown", "Banco grande com cofre."),
  P("v19", "cofre", "Lombank – Ocean Beach", 962, 632, "Ocean Beach", "Banco grande com cofre."),
  P("v20", "cofre", "Fleeca – Ocean Beach", 952, 648, "Ocean Beach", "Banco grande com cofre."),
  P("v21", "cofre", "Lombank – Ocean Beach (2)", 963, 662, "Ocean Beach", "Banco grande com cofre."),
  P("v22", "cofre", "Shorefront – Ocean Beach", 952, 676, "Ocean Beach", "Banco grande com cofre."),
  // Revistas, livros e HQs
  P("r1", "revista", "Ashes of Glory", 718, 890, "Casa do Jason, Key Lento", "Mesa ao lado da cama. Perdível após o Capítulo 1."),
  P("r2", "revista", "Lethal By Design", 720, 896, "Casa do Jason, Key Lento", "Mesa da sala. Perdível após o Capítulo 1."),
  P("r3", "revista", "Orca: A Whole Different Animal", 727, 895, "Casa do Jason, Key Lento", "Mesa perto da janela leste da sala. Perdível após o Capítulo 1."),
  P("r4", "revista", "Off the Hook", 716, 899, "Casa do Jason, Key Lento", "Galpão de ferramentas embaixo da casa. Perdível após o Capítulo 1."),
  P("r5", "revista", "Body Copy", 729, 888, "Casa do Jason, Key Lento", "Deck dos fundos, ao lado dos pesos. Perdível após o Capítulo 1."),
  P("r6", "revista", "RX Men", 658, 908, "247 – Key Lento", "No expositor de revistas da loja."),
  P("r7", "revista", "Help Me Help You Help Me", 244, 376, "Starlet Motel, Port Gellhorn", "Mesa da recepção. Perdível após o Capítulo 2."),
  P("r8", "revista", "Wizard Wang", 238, 380, "Starlet Motel, Port Gellhorn", "Mesa do refeitório. Perdível após o Capítulo 2."),
  P("r9", "revista", "Dicked Down Deep in Space", 218, 334, "Lost Vista, Port Gellhorn", "Trailer que o Dunk marca para roubo, a noroeste da Port Gellhorn Station Garage."),
  P("r10", "revista", "The Johnsons (Issue 1)", 256, 366, "Alpha Gas – Gellhorn", "Dentro do posto, a nordeste do Starlet Motel."),
  P("r11", "revista", "Passion B.C.", 846, 608, "Apartamento de Bayside", "Ao lado da banheira. Perdível após o Capítulo 3."),
  P("r12", "revista", "Two Pricks in the Bush", 850, 606, "Apartamento de Bayside", "Mesa de frente para a TV. Perdível após o Capítulo 3."),
  P("r13", "revista", "Ratface (Issue 1)", 860, 592, "Xero Food Mart – La Perle", "No expositor de revistas."),
  P("r14", "revista", "Special Friends Force (Issue 1)", 866, 594, "Xero Food Mart – La Perle", "No expositor de revistas."),
  P("r15", "revista", "Lights, Camera, Affirmative Action", 908, 546, "Pegassi Residences, Tequesta Retreat", "Mesa da cobertura. Disponível no Capítulo 5."),
  P("r16", "revista", "High Rollerz – Issue 37", 840, 646, "Jack of Hearts, Crosstown", "Corredor do segundo andar, a oeste das cabines de gravação."),
  P("r17", "revista", "Remote Strike", 955, 582, "Ajax Gym, Washington Beach", "Área da sala de trauma. Disponível a partir do Capítulo 4."),
  P("r18", "revista", "¡BOMBAZO! – Issue 2342", 961, 600, "Ron Stop'n'Snack, Washington Beach", "No expositor de revistas."),
  P("r19", "revista", "Foiled", 755, 306, "Belville", "Cama numa garagem arrombável na fileira norte de casas, a oeste da casa do Andy."),
  P("r20", "revista", "The Cowboy's Prayer is to Die Young", 545, 170, "Moreau", "Mesa num prédio sem placa ao norte do Taco Bomb – West Kalaga."),
  // Golfe e minigolfe
  P("g1", "minigolfe", "King Gator Adventure Golf", 444, 596, "Buckskin Swamp", "Minigolfe (par 42)."),
  P("g2", "minigolfe", "Frontier Adventure Golf", 784, 262, "Waning Sands", "Minigolfe (par 43)."),
  P("g3", "minigolfe", "Dino Golf Challenge", 304, 436, "Frogswater", "Minigolfe."),
  P("g4", "atividade", "Leaf Links Golf Challenge", 958, 716, "Vice Beach", "Campo de golfe completo (não conta para os 100% de minigolfe)."),
  P("g5", "atividade", "Mount Hailes Golf Challenge", 800, 238, "Waning Sands", "Campo de golfe completo."),
  // Sinuca, tiro, fliperama
  P("s1", "sinuca", "Skeeter's", 804, 730, "Hamlet", "Sinuca ($100)."),
  P("s2", "sinuca", "Delights Cabaret Bar", 250, 384, "Port Gellhorn", "Sinuca ($10)."),
  P("t1", "tiro", "Griffin Shooting Range", 786, 568, "Noroeste de Vice City", "6 estandes: 3-Point, Hook, Loop, Maze, Compound e Villa."),
  P("t2", "tiro", "Rodgers Ranch & Shooting Range", 296, 336, "Nordeste de Port Gellhorn", "6 estandes: Market, Zombie, Hunting, Saloon, Cops & Robbers e Alien."),
  P("a1", "atividade", "Fliperama Bang! For Your Buck", 258, 372, "Port Gellhorn", "Máquina na frente de uma loja. Conta para o troféu Stick Fiddler."),
  // Corridas
  P("c1", "corrida", "Gellhorn Raceway", 268, 404, "Port Gellhorn", "Corrida de pista, trial de voltas e arrancada."),
  P("c2", "corrida", "Ambrosia Raceway", 506, 478, "Ambrosia", "Demolição e trial de pista."),
  P("c3", "corrida", "Waning Sands – Motocross", 772, 270, "Waning Sands", "Stunt run de motocross."),
  P("c4", "corrida", "Hamlet – BMX Stunt Run", 796, 742, "Hamlet", "Stunt run de BMX."),
  P("c5", "corrida", "Mount Kalaga – Cycling Trial", 520, 140, "Mount Kalaga", "Contra-relógio de bicicleta."),
  P("c6", "corrida", "Hit 'n' Run VC – Ocean Beach", 950, 690, "Ocean Beach", "Corrida de rua."),
  P("c7", "corrida", "Hit 'n' Run VC – La Perle", 870, 600, "La Perle", "Corrida de rua."),
  P("c8", "corrida", "Hit 'n' Run VC – Gloriana Key", 928, 760, "Gloriana Key", "Corrida de rua."),
  // Drones (locais com área identificável)
  P("d1", "drone", "Allied Crystal", 514, 426, "Ambrosia", "Corrida de drone Top Fun."),
  P("d2", "drone", "Port Gellhorn", 232, 360, "Port Gellhorn", "Corrida de drone Top Fun."),
  P("d3", "drone", "Manifest Canyon", 364, 248, "Manifest Canyon", "Corrida de drone Top Fun."),
  P("d4", "drone", "Camp Moonflower", 336, 306, "Camp Moonflower", "Corrida de drone Top Fun."),
  P("d5", "drone", "Watson Bay", 594, 866, "Watson Bay", "Corrida de drone Top Fun."),
  P("d6", "drone", "Capri Lake", 512, 776, "Capri", "Corrida de drone Top Fun."),
  P("d7", "drone", "Capri Train Station", 520, 796, "Capri", "Corrida de drone Top Fun."),
  P("d8", "drone", "Leaf Links", 964, 728, "Vice Beach", "Corrida de drone Top Fun."),
  P("d9", "drone", "Tallaloko Lakeside Resort", 392, 142, "Tallaloko", "Corrida de drone Top Fun."),
  P("d10", "drone", "Abandoned Mining Pit", 548, 160, "Moreau", "Corrida de drone Top Fun."),
  P("d11", "drone", "Rushwood Logging", 630, 118, "Millport", "Corrida de drone Top Fun."),
  P("d12", "drone", "Millport", 614, 104, "Millport", "Corrida de drone Top Fun."),
];
