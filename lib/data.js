// Dados compilados de guias públicos (semana de lançamento, nov/2026).
// Guia fã-made, sem vínculo com a Rockstar Games ou Take-Two.

export const CHAPTERS = [
  { id: 1, name: "Just Like Paradise", from: 1, to: 22, trophy: "Paradise Lost" },
  { id: 2, name: "Paradise Lost", from: 23, to: 33, trophy: "T**s Ass Drug Money" },
  { id: 3, name: "Tits Ass Drug Money", from: 34, to: 59, trophy: "Vice City, Baby!" },
  { id: 4, name: "Vice City, Baby", from: 60, to: 84, trophy: "Top Of The World, Ma" },
  { id: 5, name: "Top of the World, Ma", from: 85, to: 91, trophy: "You Gotta Know When to Get Off" },
];

const M = [
  "Prologue", "Gone Fishing", "Gear Up", "Just a Scratch", "Lab Fees", "Unwanted Attention", "Pipework",
  "Hey Arnold!", "Island Dreams", "Feng Shui", "Coming Home", "Buck Me", "Clean Up After Donnie",
  "Down to Earth", "Clear Skies", "Day Release", "Swamped", "Don Gone", "Recalibration", "Tourist Trap",
  "Home Sweet Home", "Discharge Time",
  "What's in the Bag?", "Ambulance Chaser", "Just Moved In", "Girls' Trip", "Moses", "Daily Driver",
  "Slam Dunk", "Breakfast Run", "Coffee Break", "Afternoon Delight", "Checking Out",
  "Welcome to Vice City", "Dealer's Choice", "Meet the Heders", "Dubious Provenance", "Mami Knows Best",
  "South Leonida Real Estate", "Tyrone", "Here, Kitty Kitty", "Car Service", "Top Billing", "Boobie Time",
  "First Impressions", "Caught Slipping", "Crosstown Traffic", "Credit Check", "Steal the Zorrusso for Randy",
  "Sinfrontera National Bank", "Security Expert", "Ride or Die", "Company Property", "The Missing Link",
  "Safe Word", "Cooties", "Bricked Up", "Hidden Charges", "The Cartel Heist",
  "Ocean Beach", "Another Life", "Company Cars", "Lawyer Up", "Party Hard", "Heavy Lifting", "Photo/Shoot",
  "Making Gainz", "Watch It", "Cash Injections", "Amateur Hour", "Dirty Work", "Too Much Baggage",
  "Adventures in Babysitting", "Fresh Evidence", "Power Play", "Child's Play", "Headliners",
  "Close Surveillance", "Delivery Method", "Team Building", "Fully Catered", "VCIA Takedown", "Sunset",
  "Starting from Zero",
  "Bird in the Hand", "Taking Liberties", "VC Baby", "Doggie Bag", "Operation Savage Glory",
  "Protective Custody", "The End of the Road",
];

const NOTES = {
  1: "Tutorial com a Lucia na prisão, com flashback de assalto.",
  2: "Jason recolhe os pacotes do avião do Donnie e enfrenta os Kingfishers.",
  3: "Libera lojas de armas e o gerenciamento de equipamento.",
  4: "Leve o carro do Jason para consertar.",
  5: "Cobre o aluguel do inquilino do Brian. Libera o depósito (Lockup) do Brian.",
  6: "Libera Pay 'n' Spray e o rádio da polícia (Cop Scanner).",
  7: "Cobre o aluguel da Mandy.",
  9: "Começa a linha do Kenton e os mergulhos (descobertas subaquáticas contam para 100%).",
  12: "Libera o banco Buck Me. A partir daqui guarde seu dinheiro: você perde o que carrega ao morrer.",
  30: "Troféu \"Trust\".",
  59: "Troféu \"Break the Bank\".",
  76: "Troféu \"Family Matters\".",
  77: "Troféu \"DWNFALL\".",
  82: "Troféu \"Hi-Jacked\".",
  89: "Troféu \"Snow Storm\".",
  91: "Missão final: troféu de ouro \"You Gotta Know When to Get Off\".",
};

// Protagonista confirmado por guias (quando conhecido)
const WHO = { 1: "Lucia", 2: "Jason", 3: "Jason", 4: "Jason", 5: "Jason", 6: "Jason", 7: "Jason", 21: "Lucia",
  35: "Jason", 38: "Lucia", 39: "Lucia", 40: "Jason", 41: "Jason", 44: "Jason", 47: "Lucia" };

export const MISSIONS = M.map((name, i) => {
  const n = i + 1;
  const ch = CHAPTERS.find((c) => n >= c.from && n <= c.to);
  return { id: n, name, chapter: ch.id, note: NOTES[n] || "", who: WHO[n] || null };
});

export const NEWS = [
  { date: "25 nov", title: "Todas as 23 rádios", text: "21 estações de música, 2 de talk radio e como liberar a The Vault Radio." },
  { date: "25 nov", title: "Lista completa de troféus", text: "Os 55 troféus, incluindo os 28 ocultos (5 ainda sem requisito confirmado)." },
  { date: "25 nov", title: "Tracker 100%", text: "As 35 linhas do menu Progresso, com o mínimo exigido e o total disponível." },
  { date: "25 nov", title: "Sincronização PSN", text: "Conecte sua conta para marcar troféus, missões e contadores automaticamente." },
  { date: "24 nov", title: "91 missões da história", text: "Os 5 capítulos em ordem, com modo sem spoiler." },
  { date: "24 nov", title: "Mapa com pins", text: "Marque flamingos, cartas e cofres no mapa de Leonida." },
];

export const TROPHIES = [
  ["Vice Got a Price!", "platina", "Conquiste todos os outros troféus."],
  ["A Long Road", "ouro", "Alcance 100% de conclusão."],
  ["Cunning Stunts", "prata", "Complete 250 acrobacias (stunts)."],
  ["The Shootist", "prata", "Medalha de ouro em todos os 42 desafios do estande de tiro."],
  ["Maximum Withdrawal", "prata", "Roube 5 cofres de banco e escape."],
  ["Strangers & Freaks", "prata", "Termine 8 linhas de missões de estranhos em Leonida."],
  ["Don't Touch My Deck", "prata", "Complete 3 coleções de Cartas Colecionáveis."],
  ["You WAiNKer!", "prata", "Use o WAiNK em 100 locais."],
  ["Master of None", "bronze", "Experimente cada tipo de atividade uma vez (9 no total)."],
  ["Earn Cash, Not Kudos", "bronze", "Vença 20 corridas diferentes."],
  ["Hot Together", "bronze", "Com seu parceiro, fuja de um nível de procurado de 4 estrelas."],
  ["Retail Therapy", "bronze", "Com seu parceiro, roube 3 lojas seguidas sem perder o nível de procurado."],
  ["Whip It Good", "bronze", "Descubra 100 veículos."],
  ["The Goodtime State", "bronze", "Explore toda Leonida."],
  ["Pest Control", "bronze", "Roube uma Operação Ilegal de cada gangue."],
  ["Dime on the Dollar", "bronze", "Ganhe $250.000 lavando notas marcadas."],
  ["Top Fun", "bronze", "Vença uma corrida de drone Top Fun em todos os 14 locais."],
  ["Treat Yo Self", "bronze", "Gaste $100.000 em lojas."],
  ["Little Boxes", "bronze", "Compre todas as garagens."],
  ["On the Spot", "bronze", "Registre 10 veículos no app Scooter Bros."],
  ["Baited My Tackle", "bronze", "Vença o Cal num desafio de pesca."],
  ["Stick Fiddler", "bronze", "Complete um jogo de fliperama."],
  ["Positive Mental Attitude", "bronze", "Medite em todos os pontos de Leonida. Faça a meditação na varanda da Lucia no Capítulo 1 antes de ele acabar (possível perdível)."],
  ["Gunslinger", "bronze", "Derrube 5 inimigos com um único uso do Combat Focus."],
  ["Sneakthief", "bronze", "Roube uma joalheria sem ser detectado."],
  ["A Classic Blitz Play", "bronze", "Roube um carro-forte e escape."],
  ["One Last Thing", "bronze", "Complete 50 desafios."],
  ["Just Like Paradise", "bronze", "Complete Gone Fishing.", true],
  ["Paradise Lost", "bronze", "Complete o Capítulo 1.", true],
  ["T**s Ass Drug Money", "bronze", "Complete o Capítulo 2.", true],
  ["Vice City, Baby!", "bronze", "Complete o Capítulo 3.", true],
  ["Top Of The World, Ma", "bronze", "Complete o Capítulo 4.", true],
  ["You Gotta Know When to Get Off", "ouro", "Complete a missão final.", true],
  ["Trust", "bronze", "Complete Breakfast Run.", true],
  ["Break the Bank", "bronze", "Complete The Cartel Heist.", true],
  ["Family Matters", "bronze", "Complete Child's Play.", true],
  ["DWNFALL", "bronze", "Complete Headliners.", true],
  ["Hi-Jacked", "bronze", "Complete VCIA Takedown.", true],
  ["Snow Storm", "bronze", "Complete Operation Savage Glory.", true],
  ["Road to Rehabilitation", "bronze", "Complete a missão final do Andy (só Lucia).", true],
  ["This Was No Boat Accident", "bronze", "Complete a missão final do Kenton.", true],
  ["The Lone Rider", "bronze", "Complete a missão final do Billy.", true],
  ["Supply & Demand", "bronze", "Complete a missão final do Randy.", true],
  ["Spin On This!", "bronze", "Complete a missão final do Tyrone (só Jason).", true],
  ["Fair Game", "bronze", "Cace um animal único para o Bret (só Jason).", true],
  ["Catch Me If You Can", "bronze", "Faça uma \"partida não programada\" no VCIA (roubar um jato na ponte de embarque e voar ~1 km).", true],
  ["Challenging Tank", "bronze", "Use um tanque Rhino (dica: Mile Zero Air Station).", true],
  ["Let's Go Bowling", "bronze", "Roube os três itens de valor do Kingpin Bowling e despiste a polícia.", true],
  ["Personal Best", "bronze", "Força máxima nos dois personagens, treinando com o parceiro.", true],
  ["Actions Speak Louder", "bronze", "Faça 500 ações que alterem seu Perfil Criminal.", true],
  ["In The Beginning…", "bronze", "Não confirmado. Dica: um drink com vista em Ocean Beach.", true],
  ["Capital Offense", "bronze", "Não confirmado. Dica: saia quebrando uma concessionária.", true],
  ["Bad Luck, I Guess", "bronze", "Não confirmado. Dica: a segunda vez é a que vale.", true],
  ["The Truth Is Out There", "bronze", "Não confirmado. Dica: uma pergunta sobre o que acabou de acontecer.", true],
  ["Ten Pin", "bronze", "Não confirmado. Dica: derrube inimigos com um drive-by corpo a corpo.", true],
].map(([name, grade, desc, hidden], i) => ({ id: `t${i + 1}`, name, grade, desc, hidden: !!hidden }));

// Lista de 100% do menu de Progresso (35 linhas). need = exigido; total = disponível (quando conhecido)
export const COMPLETION = [
  { group: "História e tarefas", items: [
    ["story", "Missões principais da história", 91, 91],
    ["optional", "Tarefas opcionais (marcadores roxos)", 100, null],
    ["gangops", "Operações de gangue", 39, 39],
    ["bankjobs", "Roubos a banco", 22, 22],
    ["payday", "Trabalhos de empréstimo (Payday loan)", 7, 7],
    ["smash", "Smash 'N' Grabs (penhores e joalherias)", 34, 35],
    ["stickups", "Stick Ups (lojas, bebidas, fast food)", 50, 91],
    ["narco", "Narcóticos vendidos a receptadores ($ mil)", 100, null],
    ["jewel", "Joias vendidas a receptadores ($ mil)", 100, null],
    ["bills", "Notas marcadas lavadas ($ mil)", 250, null],
    ["vaults", "Cofres grandes roubados", 8, 8],
    ["vehfence", "Veículos vendidos a receptadores ($ mil)", 200, null],
  ]},
  { group: "Exploração e atividades", items: [
    ["kenton", "Coleções do Kenton", 5, 7],
    ["cards", "Coleções de Cartas completas", 15, 18],
    ["waink", "Locais escaneados com WAiNK", 100, null],
    ["underwater", "Descobertas subaquáticas", 33, 33],
    ["mags", "Revistas, livros e HQs", 30, 34],
    ["meditation", "Pontos de meditação", 15, 18],
    ["flamingos", "Flamingos de cocaína", 100, 125],
    ["playlists", "Playlists únicas", 2, 2],
    ["styles", "Estilos descobertos", 70, 79],
    ["races", "Corridas únicas vencidas", 30, 40],
    ["racegold", "Ouro em desafios de corrida", 10, 13],
    ["range", "Ouro no estande de tiro", 42, 42],
    ["videogames", "Videogames jogados", 4, 4],
    ["pool", "Oponentes de sinuca vencidos", 5, 7],
    ["minigolf", "Campos de minigolfe", 2, 3],
    ["hoops", "Cestas de basquete", 90, 100],
    ["drones", "Contra-relógios de drone Top Fun", 42, 42],
    ["stunts", "Acrobacias (stunts)", 300, 397],
    ["challenges", "Desafios", 70, 80],
    ["bret", "Alvos do Bret (só Jason)", 15, 15],
  ]},
  { group: "Descobertas", items: [
    ["vehicles", "Veículos base escaneados (WAiNK)", 200, 277],
    ["weapons", "Armas padrão empunhadas", 50, 66],
    ["animals", "Animais estudados (binóculo)", 100, 255],
  ]},
].map((g) => ({ ...g, items: g.items.map(([id, label, need, total]) => ({ id, label, need, total })) }));

export const RADIOS = [
  { id: "vcrr", name: "VCRR", genre: "Rap atual", hosts: "JT, DJ Stevie J", tracks: null },
  { id: "dsc", name: "Dirty South Classics", genre: "Clássicos do rap sulista", hosts: "Trick Daddy, Trina", tracks: 39, songs: ["David Banner – Like A Pimp"] },
  { id: "honey", name: "Honey FM", genre: "R&B e soul dos anos 90", hosts: "Chilli, T-Boz", tracks: 52 },
  { id: "cocoteo", name: "Cocoteo FM", genre: "Latino moderno", hosts: "Bad Bunny, RaiNao", tracks: 30, songs: ["Bad Bunny – EoO", "Romeo Santos & El Chaval de la Bachata – Canalla"] },
  { id: "laola", name: "Radio La Ola", genre: "Salsa e latino clássico", hosts: "Gloria e Emilio Estefan", tracks: 25 },
  { id: "afrobank", name: "AfroBank FM", genre: "Afrobeats e amapiano", hosts: "Burna Boy, Palms Trax", tracks: 31, songs: ["Asake – Joha"] },
  { id: "onu", name: "Radio On-U", genre: "Dub e reggae", hosts: "Adrian Sherwood", tracks: null },
  { id: "backcountry", name: "Back Country Radio", genre: "Country", hosts: "Morgan Wallen, Lana Del Rey", tracks: 24 },
  { id: "gloriana", name: "Gloriana Blues Radio", genre: "Blues", hosts: "Buddy Guy, Keith Richards", tracks: 23 },
  { id: "worldwide", name: "Worldwide FM", genre: "Jazz, soul e world club", hosts: "Gilles Peterson", tracks: null },
  { id: "flash", name: "Flash FM", genre: "Pop", hosts: "Robyn, Alex Consani", tracks: 80, songs: ["Charli xcx – Good Ones", "MGMT – Electric Feel"] },
  { id: "emotion", name: "Emotion 98.3", genre: "Soft rock e baladas", hosts: "Doug Stanhope", tracks: 35 },
  { id: "vcfm", name: "Vice City FM", genre: "Pop anos 80 e new wave", hosts: "\"Weird Al\" Yankovic, Brigitte Nielsen", tracks: null },
  { id: "vrock", name: "V-Rock", genre: "Rock clássico", hosts: "Lindsey Buckingham, Michael McDonald", tracks: null },
  { id: "chamber", name: "The Chamber 106.6", genre: "Metal", hosts: "Kerry King, Tom Araya", tracks: null, songs: ["Slayer – Raining Blood"] },
  { id: "stockyard", name: "Stockyard FM", genre: "Indie e house", hosts: "The Dare, PinkPantheress", tracks: null },
  { id: "circoloco", name: "CircoLoco Records Radio", genre: "House e techno", hosts: "Seth Troxler, Antonio Carbonaro", tracks: 27 },
  { id: "kaleido", name: "Kaleidoscope FM", genre: "Pop internacional", hosts: "Jeremy Irons", tracks: 18 },
  { id: "ljr", name: "Leonida Jazz Radio", genre: "Jazz fusion", hosts: "Randy Brecker, Stanley Clarke", tracks: 36 },
  { id: "symphony", name: "Symphony FM", genre: "Clássica", hosts: "Yuja Wang", tracks: null },
  { id: "vault", name: "The Vault Radio", genre: "House e eletrônica", hosts: "DJ Pretzel", tracks: null, secret: "Secreta: escaneie o pôster da máscara de gás na boate The Vault com o celular." },
  { id: "wktt", name: "WKTT", genre: "Talk radio conservador", hosts: "Jason Sudeikis (Richard Bastion)", tracks: 0, talk: true },
  { id: "wipe", name: "The Wipe", genre: "Talk e programas de ligação", hosts: "Anitta (Dr. Nita), John Leguizamo (El Enigma)", tracks: 0, talk: true },
];

export const CHARACTERS = [
  { name: "Lucia Caminos", role: "Protagonista", text: "Aprendeu a brigar cedo e nunca parou. Começa a história saindo da prisão e quer virar o jogo a seu favor em Vice City." },
  { name: "Jason Duval", role: "Protagonista", text: "Parceiro da Lucia. Mora num imóvel do Brian nas Keys e faz serviços sujos para ele em troca do aluguel." },
  { name: "Cal Hampton", role: "Amigo do Jason", text: "Paranoico, esperto e sempre de olho; escuta rádio da Guarda Costeira por diversão. Tem desafio de pesca (troféu Baited My Tackle)." },
  { name: "Brian Heder", role: "Senhorio e contrabandista", text: "Veterano do tráfico e dono de imóveis. Patrão e senhorio do Jason ao mesmo tempo." },
  { name: "Lori Heder", role: "Esposa do Brian", text: "Terceira esposa do Brian; aparece já no Capítulo 1." },
  { name: "Boobie Ike", role: "Empresário", text: "Dono do clube Jack of Hearts e de imóveis em Vice City. Sócio do Dre'Quan na gravadora Only Raw Records." },
  { name: "Dre'Quan Priest", role: "Magnata da música", text: "Veio das ruas, mas o foco sempre foi a música. Contratou as Real Dimez e mira a cena de Vice City." },
  { name: "Real Dimez", role: "Dupla de rap", text: "Bae-Luxe e Roxy, sensações das redes sociais, contratadas pela Only Raw Records." },
  { name: "Raul Bautista", role: "Assaltante de bancos", text: "Experiente e implacável; tende a levar Jason e Lucia para situações complicadas." },
  { name: "Kenton Rees", role: "Linha de estranhos", text: "Começa em Island Dreams. Suas coleções e mergulhos contam para os 100%. Missão final: troféu This Was No Boat Accident." },
  { name: "Bret", role: "Caçador (só Jason)", text: "Mora em Lummox County. Alvos e caçadas valem 100% e o troféu Fair Game." },
  { name: "Tyrone", role: "Linha de estranhos (só Jason)", text: "Missão final dá o troféu Spin On This!" },
  { name: "Randy", role: "Linha de estranhos", text: "Missão final dá o troféu Supply & Demand." },
  { name: "Andy", role: "Linha de estranhos (só Lucia)", text: "Missão final dá o troféu Road to Rehabilitation." },
  { name: "Billy", role: "Linha de estranhos", text: "Missão final dá o troféu The Lone Rider." },
];

// Posições aproximadas em um mapa estilizado (0-100). Não é o mapa oficial.
export const REGIONS = [
  { id: "kalaga", name: "Mount Kalaga National Park", x: 52, y: 12, text: "Parque nacional na fronteira norte: trilhas off-road, caça e vida selvagem." },
  { id: "gellhorn", name: "Port Gellhorn", x: 18, y: 32, text: "A \"costa esquecida\": motéis decadentes, shoppings vazios e porto em atividade." },
  { id: "ambrosia", name: "Ambrosia", x: 50, y: 42, text: "À beira do Lake Leonida, dominada pela refinaria de açúcar Allied Crystal." },
  { id: "grass", name: "Grassrivers", x: 36, y: 66, text: "Pântano inspirado nos Everglades: aerobarcos, jacarés e os Kingfishers." },
  { id: "vice", name: "Vice City", x: 76, y: 66, text: "Capital do sol e da diversão: Ocean Beach, art déco, porto e vida noturna." },
  { id: "keys", name: "Leonida Keys", x: 52, y: 90, text: "Arquipélago tropical onde a história começa; casa do Jason e de Key Lento." },
];

export const POIS = [
  { name: "Casa do Jason (Shoeless Keys)", x: 46, y: 91, type: "safe", text: "Tem academia para treinar força. Durma aqui para pular a noite." },
  { name: "Key Lento", x: 58, y: 93, type: "place", text: "A loja 247 tem a revista RX Men no expositor." },
  { name: "Mile Zero Air Station", x: 66, y: 96, type: "trophy", text: "Tanque Rhino: troféu Challenging Tank." },
  { name: "Ocean Beach", x: 84, y: 62, type: "trophy", text: "Dica do troféu oculto In The Beginning…" },
  { name: "Aeroporto VCIA", x: 70, y: 58, type: "trophy", text: "Roube um jato na ponte de embarque: Catch Me If You Can." },
  { name: "The Vault (boate)", x: 77, y: 69, type: "radio", text: "Pôster da máscara de gás libera a rádio The Vault." },
  { name: "Jack of Hearts", x: 73, y: 72, type: "place", text: "Clube de strip do Boobie." },
  { name: "Kingpin Bowling", x: 20, y: 36, type: "trophy", text: "Roube os 3 itens de valor e fuja: Let's Go Bowling." },
  { name: "Lake Leonida", x: 54, y: 38, type: "place", text: "Maior lago do estado, ao lado de Ambrosia." },
  { name: "Cabana do Bret (Lummox County)", x: 44, y: 16, type: "place", text: "Caçadas e alvos do Bret (só Jason)." },
];

export const TIPS = [
  { cat: "Dinheiro", items: [
    "Você perde o dinheiro que carrega ao morrer. Até liberar o Buck Me, esconda a grana sob o assoalho; depois, deposite em caixas eletrônicos.",
    "A conta no Buck Me rende juros: deixar dinheiro parado lá vale a pena.",
    "Receptadores pagam por narcóticos, joias, notas marcadas e veículos — e cada um tem meta própria nos 100%.",
  ]},
  { cat: "Polícia e roubos", items: [
    "A polícia não aparece no minimapa. Ative o Cop Scanner (liberado em Unwanted Attention) para ouvir as viaturas.",
    "Escaneie carros com o WAiNK antes de roubar para ver alarme e rastreador.",
    "Carros roubados não ficam seus automaticamente: registre no app Scooter Bros (troféu On the Spot com 10).",
    "Pay 'n' Spray limpa o nível de procurado depois de Unwanted Attention.",
  ]},
  { cat: "Progresso", items: [
    "Não há replay de missões: faça saves manuais antes das grandes.",
    "Avance na história cedo: banco, ferramentas e lojas são liberados por missões.",
    "Faça a meditação na varanda da Lucia ainda no Capítulo 1 (troféu Positive Mental Attitude).",
    "Faça as 7 coleções do Kenton: as descobertas subaquáticas (33/33) dependem delas.",
    "Relógios colecionáveis liberam cheats: 10 para avançar o tempo, 20 para pausar o horário.",
  ]},
  { cat: "Personagens", items: [
    "Troque entre Jason e Lucia no direcional para baixo.",
    "Treine força com o parceiro na academia da casa do Jason (troféu Personal Best).",
    "Algumas linhas são exclusivas: Tyrone e Bret só com Jason, Andy só com Lucia.",
  ]},
];
