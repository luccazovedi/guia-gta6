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
  { id: "keys", name: "Leonida Keys", x: 600, y: 985, county: "Mariana County", text: "Ilhas tropicais ligadas por pontes; onde a história começa." },
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
  { id: "jason", cat: "casa", name: "Casa do Jason", x: 720, y: 892, text: "Ponto de partida. Tem academia (treine força com a Lucia para o troféu Personal Best) e dá para dormir para pular a noite." },
  { id: "marina", cat: "poi", name: "Marina do Brian", x: 756, y: 878, text: "Base do Brian Heder; você volta para cá em Gone Fishing." },
  { id: "vercetti", cat: "poi", name: "Vercetti Estate", x: 690, y: 902, text: "Marco nas Keys." },
  { id: "keylento", cat: "negocio", name: "Key Lento – loja 247", x: 664, y: 918, text: "A revista RX Men fica no expositor da loja." },
  { id: "willies", cat: "negocio", name: "One-Eyed Willie's", x: 636, y: 926, text: "Comércio local nas Keys." },
  { id: "fang", cat: "negocio", name: "Electric Fang Tattoo", x: 606, y: 934, text: "Estúdio de tatuagem." },
  { id: "stock305", cat: "negocio", name: "Stock 305", x: 576, y: 942, text: "Comércio nas Keys." },
  { id: "milezero", cat: "trofeu", name: "Mile Zero Air Station", x: 470, y: 962, text: "Tanque Rhino: use um para o troféu oculto Challenging Tank." },
  // Interior
  { id: "kingpin", cat: "trofeu", name: "Kingpin Bowling", x: 262, y: 386, text: "Roube os três itens de valor e despiste a polícia: troféu Let's Go Bowling." },
  { id: "refinery", cat: "poi", name: "Refinaria Allied Crystal", x: 520, y: 430, text: "Domina o horizonte de Ambrosia." },
  { id: "bret", cat: "atividade", name: "Cabana do Bret", x: 400, y: 190, text: "Alvos e caçadas do Bret (só Jason): 15 alvos para os 100% e o troféu Fair Game." },
  { id: "kalaga-trail", cat: "atividade", name: "Trilhas de Mount Kalaga", x: 540, y: 120, text: "Off-road, caça e animais para estudar com o binóculo (100 para os 100%)." },
];
