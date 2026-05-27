/* ============================================================
   IMPÉRIO DO CAFÉ — DADOS DE ECONOMIA
   Módulo de dados: equipamentos, insumos, propriedades à venda.
   Separado da lógica e da UI (estilo modular).
   ============================================================ */

/* ---------- INSUMOS (loja de agro — consumíveis) ---------- */
export const INSUMOS = {
  adubo: {
    nome: "Adubo NPK",
    custo: 350,
    icone: "🌱",
    efeito: "sanidade +0.25 num talhão",
    desc: "Nutrição da lavoura. Recupera vigor e sustenta a produção.",
  },
  calcario: {
    nome: "Calcário",
    custo: 200,
    icone: "⛏️",
    efeito: "sanidade +0.15, dura mais",
    desc: "Corrige a acidez do solo. Efeito mais lento e duradouro.",
  },
  defensivo: {
    nome: "Defensivo",
    custo: 450,
    icone: "🛡️",
    efeito: "protege contra ferrugem/broca",
    desc: "Controla pragas e doenças. Reduz perda de sanidade na chuva.",
  },
  adubo_foliar: {
    nome: "Adubo foliar",
    custo: 220,
    icone: "🍃",
    efeito: "sanidade +0.15 rápida (folha)",
    desc: "Micronutrientes (Zn, B, Mn) pulverizados na folha — correção rápida em florada/granação.",
  },
  esterco: {
    nome: "Esterco / composto",
    custo: 180,
    icone: "🌾",
    efeito: "sanidade +0.20, orgânico",
    desc: "Adubação orgânica. Melhora o solo e é compatível com a certificação orgânica.",
  },
  gesso: {
    nome: "Gesso agrícola",
    custo: 160,
    icone: "🧱",
    efeito: "sanidade +0.12, lento (raiz)",
    desc: "Leva cálcio e enxofre à profundidade — raízes mais fundas. Efeito gradual (~60 dias).",
  },
  bio_controle: {
    nome: "Controle biológico",
    custo: 600,
    icone: "🐞",
    efeito: "elimina pragas sem invalidar orgânico",
    desc: "Beauveria bassiana / parasitoides. Controla pragas sem químico — não derruba a certificação orgânica.",
  },
};

/* ---------- EQUIPAMENTOS (compra única, impacto duradouro) ----------
   Impactam EFICIÊNCIA (menos energia/mais rápido) E QUALIDADE/RENDIMENTO.
   Têm custo de operação contínuo (a trava econômica do "compra livre").    */
export const EQUIPAMENTOS = {
  trator: {
    nome: "Trator",
    icone: "🚜",
    custo: 18000,
    custoOperacao: 80, // por uso (combustível/manutenção)
    desc: "Agiliza manejo e preparo. Eficiente no plano, perde força na ladeira.",
    efeitos: {
      eficienciaEnergia: 0.5, // gasta metade da energia no trato
      bonusRendimento: 0.1, // +10% sacas (preparo melhor do solo)
    },
    melhorEm: "plano",
  },
  drone: {
    nome: "Drone DJI Agras",
    icone: "🚁",
    custo: 32000,
    custoOperacao: 60,
    desc: "Pulverização rápida e precisa. Brilha na ladeira onde o trator não vai.",
    efeitos: {
      eficienciaEnergia: 0.4,
      bonusBebida: 0.05, // aplicação precisa = grão mais saudável
    },
    melhorEm: "montanhoso",
  },
  secador: {
    nome: "Secador mecânico",
    icone: "🌡️",
    custo: 25000,
    custoOperacao: 120,
    desc: "Seca o café sem depender do sol. Salva lotes na época de chuva.",
    efeitos: {
      secagemRapida: true, // seca independente do clima
      bonusBebida: 0.03, // secagem controlada preserva qualidade
    },
    melhorEm: "qualquer",
  },
  colhedora: {
    nome: "Colhedora",
    icone: "🌾",
    custo: 45000,
    custoOperacao: 150,
    desc: "Colhe muito rápido. Só rende no plano — acima de ~15% de inclinação, perde eficiência.",
    efeitos: {
      eficienciaEnergia: 0.3,
      bonusRendimento: 0.05,
      penalidadeBebida: -0.04, // menos seletiva que a panha manual
    },
    melhorEm: "plano",
  },
  derricadeira: {
    nome: "Derriçadeira (mãozinha)",
    icone: "🔧",
    custo: 3500,
    custoOperacao: 20,
    desc: "Derriçadeira portátil motorizada. Acelera a colheita até no morro — rende em qualquer terreno.",
    efeitos: { bonusRendimento: 0.08 },
    melhorEm: "qualquer",
  },
  despolpadora: {
    nome: "Despolpadora CD",
    icone: "⚙️",
    custo: 8000,
    custoOperacao: 30,
    desc: "Descasca a cereja antes de secar — café mais limpo e melhor bebida.",
    efeitos: { bonusBebida: 0.06 },
    melhorEm: "qualquer",
  },
  classificadora: {
    nome: "Catador / classificadora",
    icone: "🔎",
    custo: 22000,
    custoOperacao: 40,
    desc: "Separa grãos por cor e tamanho, removendo defeitos — eleva o tipo do lote.",
    efeitos: { bonusBebida: 0.05 },
    melhorEm: "qualquer",
  },
};

/* ---------- TULHA / ARMAZENAGEM (Lote H4) ----------
   Limita capacidade de estoque. Sacas excedentes ao colher
   são vendidas FORÇADAMENTE no preço comercial (sem cert/mercado).
*/
export const TULHAS = {
  pequena: {
    nome: "Tulha pequena",
    icone: "🏚️",
    capacidade: 50,
    custoUpgrade: 0,             // inicial, "grátis"
    desc: "Construção rústica de madeira. Cabem ~50 sacas. Quem começa tem essa.",
  },
  media: {
    nome: "Tulha média",
    icone: "🏠",
    capacidade: 150,
    custoUpgrade: 15000,
    desc: "Estrutura adequada, ventilação melhor. 150 sacas, ideal pra fazenda formada.",
  },
  grande: {
    nome: "Armazém pleno",
    icone: "🏭",
    capacidade: 500,
    custoUpgrade: 40000,
    desc: "Armazém completo: separação por lote, controle de umidade. 500 sacas. Pra quem quer estocar pra vender no pico do mercado.",
  },
};

export const TULHA_PROGRESSAO = ["pequena", "media", "grande"];

/* ---------- EQUIPE / MÃO DE OBRA (Lote H1) ----------
   Mensalista: salário fixo, cobre 3ha de manutenção/mês.
   Encarregado: máx 1, +15% bônus na panha, +4ha de cobertura.
   Diaristas: contratação dinâmica na panha (custo por saca, já existia).
*/
export const EQUIPE = {
  mensalista: {
    nome: "Mensalista",
    icone: "👤",
    salarioMensal: 2500,
    hectaresCobertura: 3,
    ganhoSanidadeMensal: 0.01,
    desc: "Empregado fixo. Mantém a lavoura saudável continuamente. Cada um cobre até 3ha.",
  },
  encarregado: {
    nome: "Encarregado",
    icone: "👔",
    salarioMensal: 5000,
    hectaresCobertura: 4,
    ganhoSanidadeMensal: 0.01,
    bonusRendimentoPanha: 0.15,    // +15% sacas
    desc: "Supervisor. Organiza a turma, aumenta rendimento da panha em 15% e cobre 4ha de manutenção. Máx 1.",
  },
};

/* ---------- CERTIFICAÇÕES (Lote F) ----------
   Adesão paga uma vez + custo anual de auditoria.
   Cada cert ativa multiplica o preço da saca por (1 + premio).
   Combinação de certs é cumulativa (sum dos prêmios).
*/
export const CERTIFICACOES = {
  rainforest: {
    nome: "Rainforest Alliance",
    icone: "🌳",
    custoAdesao: 2000,
    custoAnual: 500,
    premio: 0.10,
    requisitoTexto: "Manejo sustentável (auditoria anual).",
    diasTransicao: 0,
    invalidadoPorDefensivo: false,
    desc: "Selo internacional reconhecido. Prêmio modesto, custo baixo — porta de entrada.",
  },
  fairtrade: {
    nome: "Fair Trade",
    icone: "🤝",
    custoAdesao: 3500,
    custoAnual: 800,
    premio: 0.30,
    requisitoTexto: "Compromisso com preço mínimo e transparência social.",
    diasTransicao: 0,
    invalidadoPorDefensivo: false,
    desc: "Prêmio forte no mercado europeu. Pago pela visibilidade ética da operação.",
  },
  organico: {
    nome: "Orgânico",
    icone: "🌱",
    custoAdesao: 5000,
    custoAnual: 1000,
    premio: 0.35,
    requisitoTexto: "3 anos SEM defensivo químico em nenhum talhão.",
    diasTransicao: 365 * 3,
    invalidadoPorDefensivo: true,
    desc: "Caro e exigente. Pragas viram ameaça existencial. Maior prêmio, exige paciência.",
  },
};

/* ---------- PROPRIEDADES À VENDA (expansão) ----------
   Duas modalidades: terra NUA (barata, planta do zero) e
   LAVOURA PRONTA (cara, produz já). Terreno: plano vs montanhoso
   (o número de ouro dos 15% de inclinação vira "montanhoso").       */
export const PROPRIEDADES_VENDA = [
  {
    id: "sitio_baixada",
    nome: "Sítio da Baixada",
    hectares: 3,
    terreno: "plano",
    tipo: "nua",
    preco: 22000,
    desc: "Terra plana e barata. Boa pra mecanizar, mas precisa formar a lavoura (~3 anos).",
  },
  {
    id: "ladeira_serra",
    nome: "Ladeira da Serra",
    hectares: 4,
    terreno: "montanhoso",
    tipo: "nua",
    preco: 15000,
    desc: "Íngreme e barata. Trator sofre aqui — ideal pra quem tem drone. Planta do zero.",
  },
  {
    id: "fazenda_velha",
    nome: "Fazenda Velha",
    hectares: 3,
    terreno: "plano",
    tipo: "pronta",
    variedade: "mundo_novo",
    preco: 58000,
    desc: "Lavoura de Mundo Novo já formada e produzindo. Cara, mas rende na próxima safra.",
  },
  {
    id: "morro_arabica",
    nome: "Morro do Arábica",
    hectares: 2,
    terreno: "montanhoso",
    tipo: "pronta",
    variedade: "catuai_vermelho",
    preco: 42000,
    desc: "Catuaí formado em altitude — bebida fina. Montanhoso, melhor com drone/turma.",
  },
];
