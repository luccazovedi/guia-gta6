// Glossário do guia: explicações curtas sobre ícones, telas, ações e configurações.
// Escrito pelo Leonida Log a partir de guias públicos e das convenções da série.
// Detalhes exatos (nomes de menus, botões) podem variar com atualizações do jogo.
export const GLOSSARY_CATS = [
  { id: "hud", label: "Tela e HUD", icon: "Monitor" },
  { id: "mapa", label: "Ícones do mapa", icon: "Map" },
  { id: "acoes", label: "Ações e mecânicas", icon: "Hand" },
  { id: "crime", label: "Crimes e dinheiro", icon: "Banknote" },
  { id: "colec", label: "Colecionáveis e 100%", icon: "Gem" },
  { id: "config", label: "Configurações", icon: "Settings" },
];

export const GLOSSARY = [
  // HUD
  { cat: "hud", term: "Minimapa (radar)", text: "Canto inferior da tela. Mostra ruas próximas, o destino da missão (rota colorida) e pontos de interesse. A polícia não aparece nele: para acompanhar viaturas, use o Cop Scanner.", tags: "radar gps rota" },
  { cat: "hud", term: "Estrelas de procurado", text: "Indicam o nível de procura da polícia: quanto mais estrelas, mais viaturas, bloqueios e helicópteros. Somem quando você despista a polícia por tempo suficiente ou usa um Pay 'n' Spray.", tags: "wanted policia estrela" },
  { cat: "hud", term: "Cop Scanner", text: "Rádio da polícia liberado na missão Unwanted Attention. Como as viaturas não aparecem no minimapa, ele é a forma de saber onde a polícia está.", tags: "fuga esconder policia busca scanner radio" },
  { cat: "hud", term: "Barras de vida e colete", text: "Ficam junto ao minimapa. A vida se recupera parcialmente com o tempo; o colete absorve dano e precisa ser reposto.", tags: "saude armadura colete vida" },
  { cat: "hud", term: "Roda de armas", text: "Segure o botão de seleção para abrir a roda e escolher armas por categoria. O jogo desacelera enquanto ela está aberta.", tags: "arma selecionar roda" },
  { cat: "hud", term: "Celular", text: "Usado para contatos, mensagens, câmera, internet e apps. Apps importantes: WAiNK (escaneia carros e locais), Buck Me (banco) e Scooter Bros (registro de carros). A câmera também libera a rádio secreta The Vault.", tags: "telefone smartphone app camera" },
  { cat: "hud", term: "Notificações de missão", text: "Ícones e mensagens no canto da tela avisam quando há missão nova, contato ligando ou atividade liberada. Missões disponíveis aparecem no mapa com a inicial do personagem.", tags: "aviso missao contato" },

  // Mapa (ícones do mapa deste guia)
  { cat: "mapa", term: "Marcador com ✓ verde", text: "No mapa do Leonida Log, indica que você marcou o ponto como encontrado. Use “Esconder encontrados” para limpar o mapa.", tags: "encontrado check" },
  { cat: "mapa", term: "Ponto rosa no marcador", text: "Marca um favorito. Ative o filtro Favoritos para ver só eles.", tags: "favorito coracao" },
  { cat: "mapa", term: "“Posição aproximada”", text: "O ponto vem de guias públicos e está dentro da área certa, mas não no local exato. Ajuste com um pin seu se achar o lugar.", tags: "aproximado precisao" },
  { cat: "mapa", term: "Banco ($ azul) e cofre (▣ cinza)", text: "Bancos pequenos podem ser assaltados no caixa; os grandes têm cofre e pagam mais, com mais segurança.", tags: "banco cofre assalto" },
  { cat: "mapa", term: "Receptador (⇄ marrom)", text: "Contatos que compram itens roubados. Cada região tem os seus: Brian e Donnie nas Keys, Moses e Dunk em Port Gellhorn, Tyrone, Yasmani e Randy em Vice City.", tags: "fence vender roubo" },
  { cat: "mapa", term: "Empréstimo ($ verde)", text: "Lojas de empréstimo que viram alvos de assalto depois da missão Credit Check (Capítulo 3). A de Little Cuba paga mais e tem segurança alta.", tags: "payday loan credit check" },
  { cat: "mapa", term: "Pay 'n' Spray (⚙)", text: "Oficina que repinta o carro e apaga o nível de procurado (funciona depois da missão Unwanted Attention).", tags: "pintar carro oficina procurado" },
  { cat: "mapa", term: "Pins pessoais", text: "Toque em “Marcar” (ou segure no mapa) para criar um pin com categoria, nome e nota. Eles sincronizam com sua conta.", tags: "pin marcar nota" },

  // Ações
  { cat: "acoes", term: "Alternar entre Jason e Lucia", text: "Fora de missões, troque de protagonista no direcional para baixo. Algumas missões e linhas de estranhos são exclusivas de um dos dois (Tyrone e Bret só com Jason, Andy só com Lucia).", tags: "trocar personagem protagonista" },
  { cat: "acoes", term: "Esconder-se e despistar", text: "Quebre a linha de visão (becos, garagens, água), troque de veículo longe da polícia e use o Cop Scanner para saber onde as viaturas estão.", tags: "fugir policia despistar" },
  { cat: "acoes", term: "Meditação", text: "Em pontos marcados, o personagem medita e você segue o ritmo na tela. Conta para o Tracker 100% e a do Ascent Mountain só libera depois das outras.", tags: "meditar ponto" },
  { cat: "acoes", term: "Academia e atributos", text: "Treinar aumenta força e resistência. Na casa do Jason dá para treinar junto da Lucia (troféu Personal Best).", tags: "forca treino academia atributo" },
  { cat: "acoes", term: "Salvar o jogo", text: "Não há replay de missões, então faça saves manuais antes das missões grandes. Dormir em casa também avança o relógio.", tags: "cama hora noite salvar save replay" },
  { cat: "acoes", term: "Pescar", text: "Atividade ligada ao Cal Hampton; pegar peixes conta para o troféu Baited My Tackle.", tags: "pesca peixe cal" },
  { cat: "acoes", term: "Binóculo e vida selvagem", text: "Observar animais com o binóculo registra espécies (100 contam para os 100%). Mount Kalaga e Grassrivers têm mais variedade.", tags: "animal binoculo fauna" },

  // Crime e dinheiro
  { cat: "crime", term: "Stick Up", text: "Assalto a loja de conveniência. Renda baixa e rápida; a polícia chega logo, então planeje a fuga.", tags: "loja assalto stickup" },
  { cat: "crime", term: "Smash & Grab", text: "Roubo relâmpago a joalherias e casas de penhor: quebre as vitrines e fuja antes da polícia. Depois venda as peças a um receptador.", tags: "joalheria penhor vitrine" },
  { cat: "crime", term: "Operações de gangue", text: "Ataques a esconderijos de gangues espalhados pelo mapa. Contam para o Tracker 100%.", tags: "gangue esconderijo" },
  { cat: "crime", term: "Receptadores", text: "Compram narcóticos, joias, notas marcadas e veículos. Cada um tem meta própria nos 100%.", tags: "dinheiro vender lavar fence" },
  { cat: "crime", term: "Buck Me e dinheiro na mão", text: "Você perde o dinheiro que carrega ao morrer. Antes do Buck Me, esconda a grana sob o assoalho; depois, deposite em caixas eletrônicos. A conta rende juros.", tags: "banco app deposito morrer juros" },
  { cat: "crime", term: "Roubar carros", text: "Escaneie o carro com o WAiNK para ver alarme e rastreador. Carro roubado só vira seu depois de registrado no app Scooter Bros.", tags: "carro veiculo roubar alarme scooter" },

  // Colecionáveis
  { cat: "colec", term: "Flamingos de cocaína", text: "125 no total, espalhados por Leonida. Os primeiros ficam em Belpoint, no motel de Watson Bay e em La Perle.", tags: "flamingo colecionavel" },
  { cat: "colec", term: "Cartas colecionáveis", text: "Cartas de times e séries fictícias escondidas em garagens, trailers e apartamentos. Algumas são perdíveis (Starlet Motel).", tags: "carta card" },
  { cat: "colec", term: "Locais WAiNK", text: "Pontos que você escaneia com o app WAiNK do celular. 100 contam para o Tracker 100%.", tags: "waink escanear camera" },
  { cat: "colec", term: "Itens perdíveis", text: "Alguns colecionáveis ficam em lugares que você não volta depois de certo capítulo (casa do Jason, Starlet Motel, apartamento de Bayside). Pegue antes de avançar.", tags: "perdivel missable" },
  { cat: "colec", term: "Relógios e cheats", text: "Relógios colecionáveis liberam cheats: 10 para avançar o tempo e 20 para pausar o horário.", tags: "relogio cheat tempo" },
  { cat: "colec", term: "Tracker 100%", text: "A aba 100% soma missões, atividades e coleções. Contadores sobem quando você marca pontos no mapa ou sincroniza com a PSN.", tags: "100 completo progresso" },

  // Configurações
  { cat: "config", term: "Mira assistida", text: "Define quanto a mira gruda nos alvos. A opção total facilita tiroteios; a livre é mais precisa e exigente.", tags: "mira aim assist" },
  { cat: "config", term: "Legendas e tamanho do texto", text: "Ative legendas para as conversas no carro e rádio falada. Aumente o tamanho se joga longe da TV.", tags: "legenda texto acessibilidade" },
  { cat: "config", term: "Modo de imagem (desempenho x qualidade)", text: "Em consoles, desempenho prioriza taxa de quadros; qualidade prioriza resolução e efeitos. Escolha conforme sua TV.", tags: "grafico fps resolucao" },
  { cat: "config", term: "HDR", text: "Ajuste o brilho máximo e o nível de branco para a sua TV seguindo a tela de calibração. HDR mal calibrado deixa o céu estourado.", tags: "brilho hdr calibrar" },
  { cat: "config", term: "Câmera do veículo", text: "Escolha entre câmera próxima, distante e primeira pessoa. Uma câmera mais distante ajuda em perseguições.", tags: "camera carro primeira pessoa" },
  { cat: "config", term: "Rádio favorita", text: "Desligue estações que você não curte nas opções de áudio para pular direto às favoritas no carro.", tags: "radio estacao audio" },
  { cat: "config", term: "Vibração e gatilhos adaptáveis", text: "No DualSense, os gatilhos podem endurecer ao atirar ou frear. Desative se cansar a mão.", tags: "dualsense vibracao gatilho" },
];
