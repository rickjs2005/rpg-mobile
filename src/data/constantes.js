/* ============================================================
   CONSTANTES — números mágicos do jogo num lugar só.
   Toda regra/balanceamento que NÃO é dado de catálogo mora aqui.
   ============================================================ */

/* ---------- Terreno ---------- */
// Inclinação acima desse limite = "montanhoso". O "número de ouro" do design.
export const LIMITE_INCLINACAO_MONTANHOSO = 0.15;

/* ---------- Lavoura ---------- */
// Anos pra um café novo "formar" e começar a produzir.
export const ANOS_FORMACAO = 3;
// Densidade típica de plantio por hectare (pés). Catuaí adensa mais, conilon menos.
export const PES_POR_HECTARE = {
  arabica: 3500,
  robusta: 2200,
};

/* ---------- Sombreamento (Lote H9) ----------
   Café sob árvores nativas. Sistema mais antigo/sustentável.
   Menor produção mas melhor bebida, menos pragas, mais resistente.
*/
export const SOMBREAMENTO = {
  multiplicadorProducao: 0.65,    // -35% sacas
  bonusBebida: 0.08,              // +8 no score SCA
  reducaoPragas: 0.5,             // -50% prob spawn
  reducaoDanoGeada: 0.5,          // -50% impacto geada negra
  multiplicadorCusto: 1.10,       // +10% custo de plantio
};

/* ---------- Adensamento (Lote H8) ----------
   3 densidades: tradicional/adensado/super-adensado.
   Mais pés/ha = mais produção, mas custo maior e declínio mais cedo.
*/
export const DENSIDADES = {
  tradicional: {
    nome: "Tradicional",
    icone: "🌳",
    multiplicadorPes: 1.0,
    multiplicadorCusto: 1.0,
    declinioAntecipadoAnos: 0,
    desc: "Espaçamento clássico (~3500 pés/ha). Equilibra produção e longevidade. Boa pra mecanizar.",
  },
  adensado: {
    nome: "Adensado",
    icone: "🌲",
    multiplicadorPes: 1.55,
    multiplicadorCusto: 1.3,
    declinioAntecipadoAnos: 2,
    desc: "Espaçamento apertado (~5500 pés/ha). +55% pés, custo +30%. Declínio começa 2 anos antes. Mecanização difícil.",
  },
  super: {
    nome: "Super-adensado",
    icone: "🎄",
    multiplicadorPes: 2.3,
    multiplicadorCusto: 1.6,
    declinioAntecipadoAnos: 4,
    desc: "Densidade máxima (~8000 pés/ha). Vida curta intensa: +130% pés, custo +60%, declínio 4 anos antes. Manual obrigatório.",
  },
};

/* ---------- Bienalidade (Lote A) ---------- */
// Café alterna ano de safra "alta" e "baixa". amplitudeBienal da variedade modula.
// alta = 1 + AMPLITUDE × variedade.amplitudeBienal
// baixa = 1 - AMPLITUDE × variedade.amplitudeBienal
// Padrão (1.0): 1.3 ↔ 0.7. Topázio (0.5): 1.15 ↔ 0.85.
export const AMPLITUDE_BIENAL_PADRAO = 0.3;

/* ---------- Curva idade-produtiva (Lote A) ----------
   0-3 anos: formação, sem produção
   4-6 anos: pico produtivo (fator 1.0)
   7-15 anos: estável (fator 0.9)
   16+ anos: declínio (-5%/ano, mínimo 0.3)
*/
export const IDADE_PICO_INI = 4;
export const IDADE_PICO_FIM = 6;
export const IDADE_ESTAVEL_FIM = 15;
export const FATOR_PICO = 1.0;
export const FATOR_ESTAVEL = 0.9;
export const FATOR_DECLINIO_POR_ANO = 0.05;
export const FATOR_MIN = 0.3;

/* ---------- Efeitos atrasados (Lote A) ---------- */
// Calcário precisa de tempo pra reagir no solo (corrige acidez gradualmente).
export const DIAS_EFEITO_CALCARIO = 90;

/* ---------- Pragas (Lote D) ---------- */
// Amostragem revela nível atual das pragas no talhão.
// Sem amostragem, o jogador vê "sintoma estranho" mas não sabe o nível.
export const CUSTO_AMOSTRAGEM = 50;

/* ---------- Cooperativa (Lote H6) ---------- */
// Filiar à cooperativa traz desconto em insumos + floor de preço.
// Anuidade cobrada em 1/jan.
export const COOPERATIVA = {
  nome: "Cocatrel",
  icone: "🏢",
  custoAdesao: 5000,
  anuidade: 1500,
  descontoInsumos: 0.15,           // -15% no preço dos insumos
  floorMercado: 0.95,              // garante no mínimo 95% do preço base na venda
  desc: "Cooperativa de cafeicultores da Zona da Mata. Insumos com 15% de desconto + preço mínimo garantido (proteção contra crashes de mercado).",
};

/* ---------- Financiamento Funcafé (Lote H7) ---------- */
// Linha de crédito subsidiada do governo. Limite escala com tamanho.
// 12 parcelas mensais. Juros total 10% sobre o principal.
export const FUNCAFE = {
  limiteBase: 50000,            // R$ base de empréstimo permitido
  limitePorHectare: 10000,      // adicional por hectare de lavoura formada
  minEmprestimo: 5000,
  prazoMeses: 12,
  jurosTotal: 0.10,             // 10% sobre o principal
};

/* ---------- Irrigação (Lote H5) ---------- */
// Instalação cara, mas elimina veranico e garante mm mínimos.
// Custo upfront escala com hectares; custo mensal também.
export const IRRIGACAO = {
  custoBase: 8000,                  // R$ fixo de instalação
  custoPorHectare: 4000,            // adicional por ha
  custoMensalPorHectare: 200,       // operação contínua (água+energia+manutenção)
  mmDiarioGarantido: 4,             // simula chuva mínima diária no talhão irrigado
};

/* ---------- Classificação multi-dimensional (Lote E) ---------- */
// Tipo BRASIL: 2 (top) a 8 (descarte). Limite de defeitos equivalentes:
export const TIPO_BRASIL_LIMITES = [
  { tipo: 2, maxDefeitos: 4 },
  { tipo: 3, maxDefeitos: 12 },
  { tipo: 4, maxDefeitos: 26 },
  { tipo: 5, maxDefeitos: 46 },
  { tipo: 6, maxDefeitos: 86 },
  { tipo: 7, maxDefeitos: 160 },
  { tipo: 8, maxDefeitos: Infinity },
];

// Preço base por saca por Tipo (R$, comercial 2025 aprox).
export const PRECO_TIPO_BRASIL = {
  2: 1900, 3: 1700, 4: 1500, 5: 1300, 6: 1100, 7: 900, 8: 700,
};

// Bônus/penalidade por peneira.
export const PENEIRA_AJUSTE_PRECO = {
  17: 1.12, 18: 1.18, 16: 1.0, 15: 0.98, 14: 0.92, 13: 0.85,
};

// Multipliers SCA — só sobem o preço (acima do tipo BRASIL base).
export const SCA_LIMIARES = [
  { min: 90, mult: 5.0, classe: "Exemplar (90+)" },
  { min: 85, mult: 2.5, classe: "Especial (85+)" },
  { min: 80, mult: 1.4, classe: "Premium (80+)" },
  { min: 0,  mult: 1.0, classe: "Comercial" },
];

// Lavador-sifão (separação cereja vs boia) só roda em CD ou Lavado.
// Natural mistura tudo, mantém comportamento antigo.
export const METODOS_QUE_SEPARAM = ["cd", "lavado"];

// Fração da colheita que vai pro "boia" (verde+seco que flutuam no sifão).
// CD remove só os mais óbvios; Lavado é mais agressivo.
export const FRACAO_BOIA = { cd: 0.8, lavado: 0.95 };

// Microlote: lote elegível pra venda como "café especial".
export const LIMIAR_MICROLOTE_SCA = 85;

/* ---------- Renovação de lavoura (Lote B) ---------- */
// Esqueletamento: corta laterais a 20-30cm do tronco. Perde 1 safra,
// volta produzindo no ano seguinte. Indicado pra lavoura cansada (~7+ anos).
export const ESQUELETAMENTO = {
  duracaoDias: 365,           // ~1 ano fora de produção
  custo: 1500,                // mão de obra + ferramentas
  idadeMinima: 7,             // só vale a pena após o pico
  sanidadeAposIniciar: 0.4,   // planta estressada após o corte
  sanidadeAposVoltar: 0.85,   // forte ao retornar
};

// Recepa: corte rente ao chão (30-40 cm). Perde 2 safras, mas a lavoura
// "renasce" — usa o sistema radicular adulto pra crescer rápido.
// Indicado pra lavoura velha (~15+ anos) que tá em declínio.
export const RECEPA = {
  duracaoDias: 730,           // ~2 anos fora de produção
  custo: 3000,                // mais drástico, mais caro
  idadeMinima: 15,            // só após estável + 1+ ano em declínio
  sanidadeAposIniciar: 0.2,   // corte radical, estresse máximo
  sanidadeAposVoltar: 0.85,
  idadeAposVoltar: 2,         // "lavoura renovada", formação acelerada
};
// Sanidade inicial de talhão recém-plantado e o teto.
export const SANIDADE_INICIAL = 0.7;
export const SANIDADE_MAX = 1.0;
export const SANIDADE_MIN = 0.0;

/* ---------- Produção ---------- */
// Sacas de 60kg por 1000 pés num ano "padrão" (sanidade 1.0, clima ok).
// Conilon produz mais volume; arábica menos mas com melhor qualidade.
export const SACAS_BASE_POR_MIL_PES = {
  arabica: 35,
  robusta: 50,
};

/* ---------- Tempo ---------- */
// O usuário escolheu modo HÍBRIDO: avança em semanas, vira diário em fases sensíveis.
export const PASSO_PADRAO = "semana"; // 7 dias por clique
export const PASSO_INTENSIVO = "dia"; // 1 dia por clique
// Fases do estado que disparam o modo intensivo (passo = 1 dia).
// Panha por enquanto é ação instantânea (1 botão = colheita inteira).
// Só a secagem é diária — porque o clima dia a dia importa.
export const FASES_DIARIAS = ["secagem"];

/* ---------- Custos operacionais (cobrados nas ações) ---------- */
// Plantar 1 hectare: mudas + preparo do solo + plantio.
export const CUSTO_PLANTIO_POR_HECTARE = 800;
// Mão de obra na colheita por saca colhida.
export const CUSTO_MAO_OBRA_PANHA = {
  manual: 15,    // R$/saca — mais cara, mais seletiva
  derrica: 8,    // R$/saca — barata, pega tudo
  colhedora: 0,  // cobra só o custoOperacao da colhedora (fixo)
};

/* ---------- Custos fixos de escala (cobrados todo dia 1º do mês) ---------- */
// Manutenção da lavoura por hectare plantado (capina geral, conservação,
// mão de obra base). Faz fazenda grande ter overhead — expandir é decisão.
export const CUSTO_MANUTENCAO_HA_MES = 60;

/* ---------- Venda de terra (revenda do talhão) ---------- */
// Valor de referência por hectare conforme o terreno (R$).
export const VALOR_HECTARE = { plano: 7000, montanhoso: 4500 };
// Quem vende recebe abaixo do mercado (deságio).
export const DEPRECIACAO_VENDA = 0.7;

/* ---------- Caixa inicial por modo de partida ---------- */
export const SAVE_KEY = "imperio-cafe-save-v1";

export const INICIO_ROCINHA_PRONTA = {
  caixa: 5000,
  // 1 talhão de Catuaí Vermelho já formado, pequeno e apertado.
  talhao: {
    variedadeId: "catuai_vermelho",
    hectares: 1.5,
    pes: 1200,
    terreno: "plano",
    inclinacao: 0.06,
    idadeAnos: 4, // já formado
    sanidade: 0.65,
  },
};

export const INICIO_TERRA_NUA = {
  caixa: 3000,
  // 1 talhão vazio, jogador planta no dia 1 e espera ~3 anos.
  talhao: {
    variedadeId: null,
    hectares: 1.0,
    pes: 0,
    terreno: "plano",
    inclinacao: 0.08,
    idadeAnos: 0,
    sanidade: 0,
  },
};

/* ---------- Calendário ---------- */
// Mês da florada e mês esperado da colheita (Zona da Mata, simplificado).
export const MES_FLORADA = 9; // setembro
export const MES_COLHEITA_INICIO = 5; // maio
export const MES_COLHEITA_FIM = 8; // agosto

/* ---------- Ciclo fenológico (Lote C) ---------- */
// Florada: precisa de veranico + chuva pra "abrir".
// Sem florada principal = safra praticamente cancelada (10% das sacas).
// Múltiplas floradas = maturação desuniforme (mais verde na panha).
export const VERANICO_DIAS_MIN = 10;       // dias secos consecutivos pra "carregar" botões
export const CHUVA_FLORADA_MM_MIN = 5;     // chuva pós-veranico pra abrir flor
export const FLORADA_JANELA = { inicioMes: 9, fimMes: 10 }; // set-out

// Granação: o grão enche da florada à colheita (nov-abr na Zona da Mata).
// Sem água = grão "chocho", saca leve. Multiplier sobre as sacas.
export const GRANACAO_MESES = [11, 12, 1, 2, 3, 4];
export const GRANACAO_MM_IDEAL = 550;      // mm acumulados ideais (janela mais longa)
export const GRANACAO_MM_MINIMO = 180;     // abaixo disso, safra muito comprometida

// Nutrição de florada (set-nov): a "adubação de choque" que dá força à
// planta recém-desperta. Sem adubar nessa janela, a safra perde potencial.
export const NUTRICAO_FLORADA = {
  meses: [9, 10, 11],
  fatorSemNutricao: 0.8, // -20% de produção se não adubar na janela
};

// Mato/capina: o mato cresce com a chuva e rouba água/nutrientes.
export const MATO = {
  crescimentoChuvaDia: 0.018, // sobe por dia de chuva (cap 1.0)
  crescimentoSecoDia: 0.004,  // sobe devagar mesmo sem chuva
  penalidadeProducao: 0.35,   // mato cheio (1.0) = -35% de produção
  danoSanidadeDia: 0.003,     // dreno de sanidade/dia quando mato alto
  limiarDano: 0.6,            // acima disso, começa a roubar sanidade
};
// Capinar custa mão de obra por hectare.
export const CUSTO_CAPINA_POR_HECTARE = 60;

// Chuva em mm — sorteada por dia conforme tipo de clima.
export const MM_MIN_DIA = {
  chuva: { min: 5, max: 30 },
  nublado: { min: 0, max: 2 },
  sol: { min: 0, max: 0 },
  geada: { min: 0, max: 0 },
};
