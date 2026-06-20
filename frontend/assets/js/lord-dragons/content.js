export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1440;

export const HERO = {
  id: "ryden",
  name: "Ryden",
  age: 16,
  description: "Pele morena, cabelo ruivo, olhos dourados incomuns e corpo atletico.",
  start: { x: 220, y: 230 }
};

export const INITIAL_DEMO_MAP = {
  id: "dragon-valley",
  name: "Vale dos Dragoes",
  landmarks: ["Vila inicial", "Floresta Inicial", "Caverna Antiga", "Castelo em ruinas"]
};

export const TRANSFORMATIONS = [
  { id: "human", name: "Forma Humana", detail: "Aventureiro medieval com espada nas costas.", requirement: "Inicial" },
  { id: "awakening", name: "Instinto Desperto", detail: "Maos envolvidas por calor inexplicavel.", requirement: "Nivel 2" },
  { id: "dragonFlames", name: "Chamas Misteriosas", detail: "Fogo magico reage ao perigo.", requirement: "Evento futuro" },
  { id: "draconic", name: "Forma Desconhecida", detail: "Detalhes bloqueados por misterio.", requirement: "Revelacao futura" },
  { id: "lordDragons", name: "???", detail: "Origem bloqueada.", requirement: "Revelacao futura" }
];

export const WORLD_MAPS = [
  { id: "dragon-valley", name: "Vale dos Dragoes", tone: "Berco esquecido entre vila, floresta, caverna e castelo em ruinas", x: 50, y: 42 },
  { id: "valoria", name: "Valoria", tone: "Cidade dourada e quente", x: 62, y: 34 },
  { id: "sylvandor", name: "Sylvandor", tone: "Floresta fria e ancestral", x: 24, y: 30 },
  { id: "kar-dur", name: "Kar-Dur", tone: "Montanhas, forjas e fortalezas", x: 42, y: 62 },
  { id: "drakhar", name: "Drakhar", tone: "Ruinas antigas proibidas", x: 76, y: 58 },
  { id: "umbraxis", name: "Umbraxis", tone: "Dominio vermelho e negro de Azgorath", x: 83, y: 78 }
];

export const LORE = {
  protagonist: "Ryden foi criado por Altheron depois de ser encontrado ainda bebe.",
  ancientRupture: "Milhares de anos atras, duas forcas antigas romperam uma alianca que poucos ainda compreendem.",
  sealedWarrior: "Um guerreiro selado no Submundo aparece apenas em ecos e sonhos. Sua identidade sera revelada gradualmente.",
  finalBoss: "Azgorath e uma ameaca antiga ligada a uma guerra apagada dos mapas comuns."
};

export const PLAYABLE_CHARACTERS = [
  { id: "ryden", name: "Ryden", role: "Espadachim", style: "Equilibrado, aprende tecnicas de fogo e espada.", npcFallback: false },
  { id: "lyra", name: "Lyra", role: "Arqueira", style: "Rapida, ataca de longe e revela rotas escondidas.", npcFallback: true },
  { id: "elandor", name: "Elandor", role: "Elfo Mago", style: "Controla magia antiga e interpreta ruinas.", npcFallback: true },
  { id: "duran", name: "Duran", role: "Guardiao", style: "Usa escudo pesado, bloqueio e protecao do grupo.", npcFallback: true }
];

export const CAMPAIGN_ARC = [
  { id: "chapter-1", act: "Comeco", title: "O Filho do Mago", place: "Vale dos Dragoes", outcome: "Ryden aprende a sobreviver fora da cabana de Altheron." },
  { id: "chapter-2", act: "Comeco", title: "Ecos de Valoria", place: "Valoria", outcome: "Lyra, Elandor e Duran entram na rota da campanha." },
  { id: "chapter-3", act: "Meio", title: "Ruinas de Drakhar", place: "Drakhar", outcome: "A primeira dungeon revela pistas antigas sem explicar a origem de Ryden." },
  { id: "chapter-4", act: "Meio", title: "Sonhos do Passado", place: "Estradas entre reinos", outcome: "Um guerreiro misterioso surge em sonhos recorrentes." },
  { id: "chapter-5", act: "Meio", title: "Imperio Demonico", place: "Umbraxis", outcome: "O primeiro General Demonio confronta o grupo." },
  { id: "chapter-6", act: "Meio", title: "Despertar Draconico", place: "Santuarios antigos", outcome: "Ryden entende parte da forca que o acompanha desde crianca." },
  { id: "chapter-7", act: "Fim", title: "Encontro com Mordrake", place: "Submundo", outcome: "Uma batalha emocional transforma um inimigo manipulado em aliado." },
  { id: "chapter-8", act: "Fim", title: "Guerra Final", place: "Todos os reinos", outcome: "Humanos, elfos, anoes e forcas antigas marcham contra Azgorath." },
  { id: "chapter-final", act: "Fim", title: "Castelo de Azgorath", place: "Fortaleza final", outcome: "A campanha termina em uma dungeon lendaria com tesouros e chefes especiais." }
];

export const SKILL_TREES = {
  fire: [
    { id: "burningHands", name: "Maos em Chamas", requirement: "Derrotar Boost", effect: "Golpes de espada deixam brasas no impacto." },
    { id: "flameSword", name: "Espada Flamejante", requirement: "Forjar em Valoria", effect: "Aumenta dano contra mortos-vivos e sombras." },
    { id: "fireBurst", name: "Explosao de Fogo", requirement: "Capitulo 5", effect: "Dano em area ao redor de Ryden." },
    { id: "flameRain", name: "Chuva de Chamas", requirement: "Capitulo Final", effect: "Ataque lendario contra chefes." }
  ],
  warrior: [
    { id: "doubleCut", name: "Corte Duplo", requirement: "Academia dos Guerreiros", effect: "Segundo corte rapido apos ataque leve." },
    { id: "charge", name: "Investida", requirement: "Duran no grupo", effect: "Avanco curto com impacto frontal." },
    { id: "spinSlash", name: "Golpe Giratorio", requirement: "Inicial por treino", effect: "Dano em area com a espada." },
    { id: "royalStrike", name: "Golpe Real", requirement: "Capitulo Final", effect: "Ataque supremo de espada." }
  ],
  dragon: [
    { id: "draconicRoar", name: "Rugido Antigo", requirement: "Capitulo 6", effect: "Atordoa inimigos proximos." },
    { id: "dragonScales", name: "Escamas Antigas", requirement: "Capitulo 6", effect: "Aumenta defesa por curto periodo." },
    { id: "temporaryWings", name: "Asas Temporarias", requirement: "Capitulo 7", effect: "Atravessa armadilhas por instantes." },
    { id: "supremeForm", name: "Forma Suprema", requirement: "Depois de Azgorath", effect: "Forma lendaria liberada apenas no encerramento." }
  ]
};

export const STORY_PANELS = {
  chapter1Intro: {
    title: "Capitulo 1: O Filho do Mago",
    speaker: "Narrador",
    art: "Cabana sob chuva fina, uma floresta fria adiante e uma luz dourada na janela.",
    lines: [
      "Ryden cresceu no Vale dos Dragoes, longe dos reinos, criado por Altheron em uma cabana isolada.",
      "Ele nao sabe quem foram seus pais. Nao sabe por que seus sentidos sao tao fortes. Nao sabe por que sonha com fogo e asas.",
      "Hoje, pela primeira vez, o mundo parece maior que a floresta."
    ]
  },
  boostAwakening: {
    title: "Primeiro Despertar",
    speaker: "Ryden",
    art: "Maos em chamas refletidas nos olhos dourados de Ryden.",
    lines: [
      "O fogo nao queima sua pele.",
      "A espada vibra como se reconhecesse uma antiga promessa.",
      "Ryden nao entende o que aconteceu. E talvez Altheron ainda nao esteja pronto para explicar."
    ]
  },
  drakharGate: {
    title: "Capitulo 3: Ruinas de Drakhar",
    speaker: "Elandor",
    art: "Torres quebradas emergem da nevoa, cobertas por runas que pulsam em vermelho escuro.",
    lines: [
      "Drakhar nao e uma cidade morta. E uma pergunta que sobreviveu aos seculos.",
      "Se algo aqui reagir a voce, Ryden, nao toque sem observar.",
      "Algumas ruinas guardam memoria. Outras guardam fome."
    ]
  },
  mordrakeDream: {
    title: "Sonho do Passado",
    speaker: "Voz distante",
    art: "Um guerreiro acorrentado ergue uma espada diante de um abismo vermelho.",
    lines: [
      "Ryden ve fogo, correntes e uma silhueta que parece lutar contra si mesma.",
      "A voz chama por alguem, mas o nome se perde antes de acordar.",
      "Ao abrir os olhos, resta apenas o calor nas maos."
    ]
  }
};

export const CHRONICLES = {
  realms: [
    { id: "valoria", title: "Valoria", text: "Reino humano de muralhas quentes, feiras vivas e academias guerreiras." },
    { id: "sylvandor", title: "Sylvandor", text: "Reino elfico escondido em florestas frias e memorias antigas." },
    { id: "kar-dur", title: "Kar-Dur", text: "Reino dos anoes, forjas profundas e juramentos gravados em pedra." },
    { id: "drakhar", title: "Drakhar", text: "Ruinas proibidas, lembradas apenas por reliquias sem traducao." },
    { id: "umbraxis", title: "Umbraxis", text: "Imperio demoniaco de brasas negras, proibido nos mapas comuns." }
  ],
  dragons: [
    { id: "ancient-rupture", title: "A Ruptura", text: "Registro bloqueado. Encontre reliquias antigas para compreender esta historia." }
  ],
  demons: [
    { id: "azgorath-shadow", title: "A Sombra de Azgorath", text: "O nome Azgorath aparece em avisos antigos, mas poucos ousam explica-lo." }
  ]
};

export const DISCOVERIES = [
  {
    id: "altheron-desk",
    name: "Diario de Altheron",
    x: 260,
    y: 295,
    type: "lore",
    reward: { xp: 8, gold: 0, items: [] },
    text: "A letra de Altheron diz: 'O menino tem olhos dourados demais para serem comuns, mas chora como qualquer crianca perdida.'",
    hint: "Ha algo sobre a mesa da Casa do Mago."
  },
  {
    id: "dragon-mark",
    name: "Marca Queimada",
    x: 505,
    y: 300,
    type: "story",
    reward: { xp: 18, gold: 6, items: ["herb"] },
    questStep: "discover_dragon_mark",
    text: "No chao, uma marca em espiral ainda esta quente. Ela reage aos olhos dourados de Ryden.",
    hint: "Uma luz estranha pulsa perto da entrada da Floresta Inicial."
  },
  {
    id: "old-waystone",
    name: "Pedra do Caminho Antigo",
    x: 735,
    y: 145,
    type: "world",
    reward: { xp: 12, gold: 8, items: [] },
    text: "A pedra aponta para Valoria, Sylvandor e Drakhar. Ha nomes antigos apagados por musgo e medo.",
    hint: "Uma pedra antiga fica fora da trilha principal."
  },
  {
    id: "mordrake-echo",
    name: "Eco Selado",
    x: 1185,
    y: 505,
    type: "legend",
    reward: { xp: 28, gold: 12, items: ["scale"] },
    text: "Uma voz distante sussurra: 'Viva... um dia o selo se abrira.' Ryden nao reconhece a voz.",
    hint: "Um eco chama por Ryden perto da Ponte Antiga."
  },
  {
    id: "drakhar-rune",
    name: "Runa de Drakhar",
    x: 1310,
    y: 1025,
    type: "dungeon",
    reward: { xp: 38, gold: 18, items: ["moonSteel"] },
    questStep: "discover_drakhar_clue",
    text: "A runa reage ao calor das maos de Ryden e mostra uma batalha antiga sem nomes claros.",
    hint: "Uma runa pulsa no salao central de Drakhar."
  },
  {
    id: "sealed-mural",
    name: "Mural Selado",
    x: 1550,
    y: 1135,
    type: "legend",
    reward: { xp: 44, gold: 22, items: ["ancientRelic"] },
    text: "O mural mostra um guerreiro protegendo um bebe enquanto sombras descem do ceu.",
    hint: "Ha um mural escondido nas ruinas inferiores de Drakhar."
  }
];

export const CHAPTERS = [
  {
    id: "chapter-1",
    title: "Capitulo 1: O Filho do Mago",
    panelId: "chapter1Intro",
    summary: "Ryden deixa a protecao de Altheron, aprende a explorar, ouvir historias e seguir pistas rumo a Valoria.",
    goals: [
      "Ouvir a introducao de Altheron.",
      "Aprender movimento, interacao, inventario e save.",
      "Abrir o primeiro bau na Casa do Mago.",
      "Investigar a primeira marca antiga.",
      "Derrotar os primeiros monstros da Floresta Inicial.",
      "Conhecer os primeiros NPCs no caminho.",
      "Comprar na primeira loja e visitar o primeiro ferreiro."
    ]
  },
  {
    id: "chapter-2",
    title: "Capitulo 2: Ecos de Valoria",
    summary: "Ryden chega a Valoria, encontra a Academia dos Guerreiros e percebe que sua presenca desperta objetos antigos.",
    goals: [
      "Explorar Valoria sem abandonar as pistas do caminho.",
      "Falar com guardas e moradores sobre a Academia.",
      "Encontrar Elandor e ouvir sobre ruinas antigas.",
      "Investigar artefatos que reagem aos olhos dourados de Ryden."
    ]
  },
  {
    id: "chapter-3",
    title: "Capitulo 3: Ruinas de Drakhar",
    panelId: "drakharGate",
    summary: "O grupo atravessa uma ruina proibida com armadilhas, puzzle de runas, espiritos e esqueletos.",
    goals: [
      "Reunir Lyra, Elandor e Duran como aliados da campanha.",
      "Entrar na primeira dungeon principal.",
      "Sobreviver as armadilhas de Drakhar.",
      "Resolver o puzzle das tres runas.",
      "Encontrar pistas antigas sem revelar tudo cedo demais.",
      "Derrotar o Guardiao de Drakhar."
    ]
  },
  {
    id: "chapter-4",
    title: "Capitulo 4: Sonhos do Passado",
    panelId: "mordrakeDream",
    summary: "Ryden passa a sonhar com um guerreiro misterioso preso por correntes escuras.",
    goals: ["Dormir apos Drakhar.", "Registrar sonhos no diario.", "Procurar novas respostas em Sylvandor."]
  },
  {
    id: "chapter-5",
    title: "Capitulo 5: Imperio Demonico",
    summary: "Umbraxis pressiona as fronteiras com novos monstros, armas sombrias e o primeiro General Demonio.",
    goals: ["Entrar em Umbraxis.", "Forjar novas armaduras.", "Derrotar o primeiro General Demonio."]
  },
  {
    id: "chapter-6",
    title: "Capitulo 6: Despertar Draconico",
    summary: "A metade da campanha revela a natureza da forca de Ryden e abre novas transformacoes.",
    goals: ["Encontrar o santuario antigo.", "Desbloquear tecnicas do ramo Dragao.", "Voltar aos reinos com uma nova responsabilidade."]
  },
  {
    id: "chapter-7",
    title: "Capitulo 7: Encontro com Mordrake",
    summary: "Mordrake aparece como adversario manipulado, em uma batalha emocional que pode salva-lo.",
    goals: ["Encontrar Mordrake.", "Vencer sem abandonar o elo familiar.", "Trazer Mordrake para o lado do grupo."]
  },
  {
    id: "chapter-8",
    title: "Capitulo 8: Guerra Final",
    summary: "Humanos, elfos, anoes e forcas antigas se unem para abrir caminho ate Azgorath.",
    goals: ["Unir os reinos.", "Defender Valoria.", "Abrir a rota para o castelo final."]
  },
  {
    id: "chapter-final",
    title: "Capitulo Final: Castelo de Azgorath",
    summary: "A maior dungeon do jogo encerra a campanha com chefes especiais, tesouros lendarios e a batalha final.",
    goals: ["Explorar o castelo.", "Encontrar tesouros lendarios.", "Derrotar Azgorath.", "Desbloquear a forma final apenas apos o fim."]
  }
];

export const REGIONS = [
  { id: "wizard-house", name: "Casa do Mago", x: 70, y: 80, w: 380, h: 310, color: 0x735c3a },
  { id: "forest", name: "Floresta Inicial", x: 450, y: 80, w: 430, h: 520, color: 0x1f6b48 },
  { id: "bridge", name: "Ponte Antiga", x: 880, y: 360, w: 300, h: 160, color: 0x8d7650 },
  { id: "camp", name: "Acampamento", x: 1180, y: 280, w: 360, h: 300, color: 0x4d6f52 },
  { id: "valoria", name: "Cidade de Valoria", x: 1540, y: 140, w: 500, h: 520, color: 0x596d83 },
  { id: "academy", name: "Academia dos Guerreiros", x: 2040, y: 250, w: 300, h: 320, color: 0x7a4855 },
  { id: "drakhar-ruins", name: "Ruinas de Drakhar", x: 1020, y: 835, w: 760, h: 470, color: 0x503836 },
  { id: "underworld-gate", name: "Portao do Submundo", x: 2020, y: 760, w: 320, h: 280, color: 0x3a2030 }
];

export const TOWN_FOLK = [
  { name: "Mira", role: "Moradora", x: 1600, y: 460 },
  { name: "Torren", role: "Mercador", x: 1730, y: 250 },
  { name: "Ira", role: "Guarda", x: 1970, y: 520 },
  { name: "Borin", role: "Taverneiro", x: 1810, y: 540 },
  { name: "Nalia", role: "Moradora", x: 1555, y: 555 },
  { name: "Kael", role: "Ferreiro", x: 1920, y: 430 }
];

export const ITEMS = {
  potion: { id: "potion", name: "Pocao de Vida", type: "consumable", price: 12, heal: 35 },
  ether: { id: "ether", name: "Elixir de Poder", type: "consumable", price: 18, power: 40 },
  iron: { id: "iron", name: "Minerio de Ferro", type: "material", price: 5 },
  scale: { id: "scale", name: "Escama Rubra", type: "material", price: 8 },
  herb: { id: "herb", name: "Erva Lunar", type: "material", price: 4 },
  boneShard: { id: "boneShard", name: "Fragmento Osseo", type: "material", price: 7 },
  moonSteel: { id: "moonSteel", name: "Aco Lunar", type: "material", price: 18 },
  ancientRelic: { id: "ancientRelic", name: "Reliquia Antiga", type: "material", price: 30 },
  trainingSword: { id: "trainingSword", name: "Espada de Treino", type: "weapon", attack: 4, price: 24 },
  sword: { id: "sword", name: "Espada de Aprendiz", type: "weapon", attack: 8, price: 45 },
  guardianBlade: { id: "guardianBlade", name: "Lamina de Drakhar", type: "weapon", attack: 26, price: 210 },
  armor: { id: "armor", name: "Armadura de Couro", type: "armor", defense: 5, price: 55 },
  emberArmor: { id: "emberArmor", name: "Armadura de Brasas", type: "armor", defense: 14, price: 190 },
  flameSword: { id: "flameSword", name: "Espada Flamejante", type: "weapon", attack: 18, price: 140 }
};

export const RECIPES = {
  trainingSword: { item: "trainingSword", cost: { iron: 1 }, gold: 8 },
  sword: { item: "sword", cost: { iron: 3 }, gold: 20 },
  armor: { item: "armor", cost: { iron: 2, herb: 2 }, gold: 25 },
  potion: { item: "potion", cost: { herb: 2 }, gold: 4 },
  guardianBlade: { item: "guardianBlade", cost: { moonSteel: 3, boneShard: 2 }, gold: 80 },
  emberArmor: { item: "emberArmor", cost: { iron: 4, moonSteel: 2, scale: 1 }, gold: 75 },
  flameSword: { item: "flameSword", cost: { iron: 4, scale: 3 }, gold: 65, requires: "dragonFlames" }
};

export const NPCS = [
  {
    id: "altheron",
    name: "Altheron",
    role: "Mago",
    x: 250,
    y: 190,
    lines: [
      "Ryden, hoje voce deixa de ser apenas o menino da cabana.",
      "Abra o bau da casa, observe o caminho e fale com quem encontrar. O mundo recompensa olhos atentos."
    ],
    questStep: "talk_altheron"
  },
  {
    id: "tomas",
    name: "Tomas",
    role: "Morador",
    x: 410,
    y: 330,
    lines: [
      "Tomas: Altheron pediu que eu vigiasse a estrada. Use E ou Interagir para falar com pessoas, ler marcas e abrir baus.",
      "Nem todo progresso vem da espada. Muitas respostas ficam em pedras antigas, diarios e gente comum."
    ],
    questStep: "meet_tomas"
  },
  {
    id: "maia",
    name: "Maia",
    role: "Moradora",
    x: 360,
    y: 205,
    lines: [
      "Maia: O Vale dos Dragoes guarda muitas placas velhas. Leia tudo que encontrar.",
      "As vezes uma recompensa pequena na estrada muda o rumo de uma jornada inteira."
    ]
  },
  {
    id: "orin",
    name: "Orin",
    role: "Guarda",
    x: 485,
    y: 344,
    lines: [
      "Orin: A floresta esta fria demais para esta estacao.",
      "Se as Fagulhas Selvagens chegarem perto da vila, use a esquiva antes de contra-atacar."
    ]
  },
  {
    id: "sella",
    name: "Sella",
    role: "Mercadora",
    x: 900,
    y: 265,
    lines: ["Sella: Primeira viagem? Leve pocoes. A floresta cobra caro de quem economiza errado."],
    shop: ["potion", "ether", "trainingSword"],
    questStep: "visit_first_shop"
  },
  {
    id: "brann",
    name: "Brann",
    role: "Ferreiro Aprendiz",
    x: 980,
    y: 520,
    lines: ["Brann: Nao sou mestre de Valoria, mas consigo forjar uma Espada de Treino com um minerio."],
    craft: ["trainingSword"],
    questStep: "visit_first_blacksmith"
  },
  { id: "merchant", name: "Mercador", role: "Loja", x: 1640, y: 320, lines: ["Valoria abre suas bolsas para viajantes honestos."], shop: ["potion", "ether", "sword", "armor"] },
  { id: "blacksmith", name: "Ferreiro", role: "Forja", x: 1780, y: 400, lines: ["Traga minerios e eu darei forma ao seu destino."], craft: ["sword", "armor", "flameSword"] },
  { id: "alchemist", name: "Alquimista", role: "Alquimia", x: 1880, y: 310, lines: ["Ervas certas salvam vidas erradas."], craft: ["potion"] },
  { id: "innkeeper", name: "Estalajadeiro", role: "Estalagem", x: 1690, y: 520, lines: ["Uma noite sob teto firme custa 10 ouros."], inn: true },
  { id: "guard", name: "Guarda", role: "Guarda", x: 2060, y: 440, lines: ["A Academia aceita quem provou coragem na Ponte Antiga."] },
  { id: "lyra", name: "Lyra", role: "Arqueira", x: 1280, y: 380, personality: "Observadora e direta.", routine: "Patrulha o Acampamento e marca rastros de monstros.", lines: ["Sou Lyra. Minhas flechas viram o Boost rondando a ponte.", "Se precisar de olhos no alto, eu vou junto."], questStep: "meet_lyra" },
  { id: "elandor", name: "Elandor", role: "Elfo", x: 1460, y: 430, personality: "Calmo, culto e desconfiado de ruinas.", routine: "Estuda arvores antigas e pedras marcadas.", lines: ["Elandor: Certas arvores lembram guerras que os homens esqueceram. Seus olhos parecem ouvir essas lembrancas.", "Drakhar fica ao sul. Nao entre sem ler as runas."], questStep: "talk_elandor" },
  { id: "duran", name: "Duran", role: "Guardiao", x: 2170, y: 470, personality: "Leal, protetor e impaciente com covardia.", routine: "Treina escudo na Academia e guarda rotas perigosas.", lines: ["Duran: Se Drakhar abriu os olhos, alguem precisa segurar a linha de frente.", "Eu posso lutar como aliado ou continuar guardando a Academia."], questStep: "meet_duran" }
];

export const ENEMY_TYPES = {
  spark: { name: "Fagulha Selvagem", hp: 18, attack: 4, xp: 12, gold: 4, drops: ["herb"], color: 0xf08a35 },
  slime: { name: "Lodo Sombrio", hp: 34, attack: 7, xp: 22, gold: 7, drops: ["herb"], color: 0x5bbd76 },
  imp: { name: "Diabrete", hp: 48, attack: 10, xp: 32, gold: 10, drops: ["iron"], color: 0xa94a52 },
  wolf: { name: "Lobo Cinzento", hp: 42, attack: 9, xp: 28, gold: 9, drops: ["herb"], color: 0x777b86 },
  skeleton: { name: "Esqueleto de Drakhar", hp: 58, attack: 12, xp: 42, gold: 14, drops: ["boneShard"], color: 0xb8ad8f },
  spirit: { name: "Espirito Antigo", hp: 46, attack: 15, xp: 48, gold: 12, drops: ["moonSteel"], color: 0x75a9c8 },
  drakharGuardian: { name: "Guardiao de Drakhar", hp: 240, attack: 22, xp: 190, gold: 95, drops: ["moonSteel", "ancientRelic", "boneShard"], color: 0x8c2d35, boss: true },
  demonGeneral: { name: "General Demonio", hp: 290, attack: 26, xp: 260, gold: 130, drops: ["scale", "moonSteel"], color: 0x9b1c2b, boss: true },
  boost: { name: "Boost", hp: 180, attack: 18, xp: 140, gold: 70, drops: ["scale", "scale", "iron"], color: 0xcf6b28, boss: true },
  azgorath: { name: "Azgorath", hp: 340, attack: 28, xp: 320, gold: 180, drops: ["scale", "scale", "scale"], color: 0x7d2434, boss: true }
};

export const ENEMIES = [
  { type: "spark", x: 520, y: 255, chapter: 1 },
  { type: "spark", x: 585, y: 360, chapter: 1 },
  { type: "slime", x: 610, y: 220 },
  { type: "slime", x: 760, y: 460 },
  { type: "wolf", x: 530, y: 500 },
  { type: "imp", x: 1040, y: 430 },
  { type: "boost", x: 1130, y: 490 },
  { type: "skeleton", x: 1170, y: 980 },
  { type: "skeleton", x: 1470, y: 1190 },
  { type: "spirit", x: 1360, y: 1080 },
  { type: "spirit", x: 1630, y: 980 },
  { type: "drakharGuardian", x: 1660, y: 1160 },
  { type: "azgorath", x: 2190, y: 900 }
];

export const CHESTS = [
  { id: "house-chest", x: 330, y: 285, gold: 20, items: ["potion", "herb", "iron"], questStep: "open_first_chest" },
  { id: "forest-chest", x: 820, y: 180, gold: 15, items: ["iron"] },
  { id: "camp-chest", x: 1390, y: 520, gold: 25, items: ["ether", "scale"] },
  { id: "drakhar-chest", x: 1245, y: 1195, gold: 45, items: ["moonSteel", "boneShard", "ether"] },
  { id: "guardian-chest", x: 1695, y: 1240, gold: 80, items: ["ancientRelic", "moonSteel"] }
];

export const INTERACTIVE_OBJECTS = [
  { id: "dragon-valley-sign", type: "sign", x: 190, y: 390, title: "Placa do Vale", lines: ["Vale dos Dragoes: vila inicial, floresta, caverna antiga e castelo em ruinas adiante."] },
  { id: "sign-home", type: "sign", x: 385, y: 238, title: "Placa de Madeira", lines: ["Casa de Altheron. Visitantes devem bater antes de tocar nos livros."] },
  { id: "pot-house", type: "pot", x: 310, y: 330, title: "Pote de Ervas", reward: { item: "herb", gold: 0 }, lines: ["Ryden encontrou ervas secas preparadas por Altheron."] },
  { id: "bush-forest-a", type: "bush", x: 535, y: 420, title: "Arbusto", reward: { item: "herb", gold: 0 }, lines: ["Entre as folhas havia uma Erva Lunar."] },
  { id: "bush-forest-b", type: "bush", x: 690, y: 520, title: "Arbusto", reward: { item: "herb", gold: 0 }, lines: ["O arbusto se mexeu com o vento frio. Ryden achou uma erva escondida."] },
  { id: "old-stone", type: "rock", x: 760, y: 220, title: "Pedra Entalhada", lines: ["Ha marcas antigas na pedra. Elas brilham por um instante e apagam antes que Ryden entenda."] },
  { id: "valoria-sign", type: "sign", x: 1505, y: 380, title: "Placa de Valoria", lines: ["Valoria ao leste. Academia dos Guerreiros ao norte da muralha interna."] },
  { id: "academy-door", type: "door", x: 2140, y: 350, title: "Portao da Academia", lines: ["Guardas observam Ryden. O portao se abrira quando a recomendacao de Valoria estiver completa."] },
  { id: "drakhar-trap-a", type: "trap", x: 1160, y: 1080, title: "Armadilha de Lanca", damage: 16, questStep: "survive_drakhar_trap", lines: ["Pedras rangem. Lancas antigas saltam do chao e recuam lentamente."] },
  { id: "drakhar-rune-puzzle", type: "puzzle", x: 1405, y: 1115, title: "Puzzle das Tres Runas", reward: { item: "moonSteel", gold: 20 }, questStep: "solve_drakhar_puzzle", lines: ["Lyra nota marcas de flecha, Elandor traduz a ordem das runas e Duran segura a porta de pedra.", "As tres runas acendem em silencio. Um corredor escondido se abre."] },
  { id: "drakhar-altar", type: "relic", x: 1600, y: 1040, title: "Altar Sem Nome", reward: { item: "ancientRelic", gold: 0 }, lines: ["O altar responde ao calor das maos de Ryden, mas nao entrega respostas completas."] }
];

export const QUESTS = [
  { id: "chapter-1-intro", chapter: "chapter-1", text: "Capitulo 1: fale com Altheron na Casa do Mago.", step: "talk_altheron", hint: "Altheron espera dentro da cabana." },
  { id: "chapter-1-chest", chapter: "chapter-1", text: "Abra o primeiro bau na Casa do Mago.", step: "open_first_chest", hint: "O bau fica perto da mesa de Altheron." },
  { id: "chapter-1-npc", chapter: "chapter-1", text: "Fale com Tomas na saida da Casa do Mago.", step: "meet_tomas" },
  { id: "chapter-1-tutorial", chapter: "chapter-1", text: "Tutorial: mova Ryden ate a estrada da Floresta Inicial.", step: "tutorial_move" },
  { id: "chapter-1-discovery", chapter: "chapter-1", text: "Investigue a Marca Queimada na entrada da floresta.", step: "discover_dragon_mark" },
  { id: "chapter-1-monsters", chapter: "chapter-1", text: "Derrote 2 Fagulhas Selvagens na Floresta Inicial.", step: "defeat_first_monsters" },
  { id: "chapter-1-shop", chapter: "chapter-1", text: "Visite a primeira loja com Sella.", step: "visit_first_shop" },
  { id: "chapter-1-forge", chapter: "chapter-1", text: "Visite Brann, o primeiro ferreiro.", step: "visit_first_blacksmith" },
  { id: "world", chapter: "chapter-1", text: "Atravesse a Floresta Inicial e encontre Lyra.", step: "meet_lyra" },
  { id: "boost", chapter: "chapter-1", text: "Derrote Boost na Ponte Antiga.", step: "defeat_boost" },
  { id: "forge", chapter: "chapter-2", text: "Forje a Espada Flamejante em Valoria.", step: "craft_flame_sword" },
  { id: "academy", chapter: "chapter-2", text: "Apresente-se na Academia dos Guerreiros.", step: "reach_academy" },
  { id: "chapter-2-start", chapter: "chapter-2", text: "Capitulo 2: investigue Valoria e procure sinais sobre a Academia.", step: "explore_valoria" },
  { id: "chapter-2-elandor", chapter: "chapter-2", text: "Fale com Elandor sobre ruinas antigas.", step: "talk_elandor" },
  { id: "chapter-2-duran", chapter: "chapter-2", text: "Convide Duran para proteger a rota ate Drakhar.", step: "meet_duran" },
  { id: "chapter-3-enter", chapter: "chapter-3", text: "Capitulo 3: entre nas Ruinas de Drakhar.", step: "enter_drakhar", hint: "Drakhar fica ao sul da Ponte Antiga." },
  { id: "chapter-3-trap", chapter: "chapter-3", text: "Sobreviva a primeira armadilha de Drakhar.", step: "survive_drakhar_trap" },
  { id: "chapter-3-puzzle", chapter: "chapter-3", text: "Resolva o puzzle das tres runas.", step: "solve_drakhar_puzzle" },
  { id: "chapter-3-clue", chapter: "chapter-3", text: "Investigue a runa que reage a Ryden.", step: "discover_drakhar_clue" },
  { id: "chapter-3-boss", chapter: "chapter-3", text: "Derrote o Guardiao de Drakhar.", step: "defeat_drakhar_guardian" },
  { id: "chapter-4-dream", chapter: "chapter-4", text: "Descanse e registre o sonho com o guerreiro misterioso.", step: "dream_mysterious_warrior" },
  { id: "chapter-5-general", chapter: "chapter-5", text: "Avance contra o primeiro General Demonio.", step: "defeat_demon_general" },
  { id: "azgorath", chapter: "chapter-final", text: "Derrote Azgorath no castelo final.", step: "defeat_azgorath" },
  { id: "sealed-warrior", chapter: "chapter-final", text: "A campanha terminou. A forma lendaria pode enfim despertar.", step: "end" }
];
