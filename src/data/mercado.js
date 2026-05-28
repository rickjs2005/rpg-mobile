/* ============================================================
   MERCADO — preço da saca varia diariamente (Lote H3).
   Inspirado na bolsa ICE NY: arábica oscilou US$2.60 a US$4.30
   em 12 meses na realidade. Aqui: índice 0.65 a 1.45x sobre base.
   ============================================================ */

export const PARAMS_MERCADO = {
  indiceInicial: 1.0,
  indiceMin: 0.65,
  indiceMax: 1.45,
  // Ruído diário pequeno (sempre presente).
  volatilidadeDiaria: 0.008,           // ±0.8%/dia
  // Tendência puxa o índice em uma direção.
  forcaTendenciaDia: 0.004,            // 0.4%/dia (acumula 2.8% em uma semana)
  // Probabilidade de inverter tendência por dia.
  probMudarTendenciaDia: 0.05,         // ~35% por semana
  // Probabilidade de evento macro (raro, dramático).
  probEventoMacroDia: 0.0015,
  // Oferta x demanda: cada saca vendida derruba o índice (recupera com a
  // deriva diária). Vender em massa achata o preço — freio de escala.
  impactoVendaPorSaca: 0.0009,
};

// Eventos macro: notícias que afetam o mercado mundial.
// Quando dispara, aplica impacto IMEDIATO no índice + mensagem.
export const EVENTOS_MACRO = [
  {
    id: "geada_concorrente",
    icone: "❄️",
    texto: "Geada destrói safra no Cerrado mineiro — bolsa dispara",
    impacto: 0.18,
  },
  {
    id: "crise_vietna",
    icone: "🌐",
    texto: "Crise climática no Vietnã reduz oferta global",
    impacto: 0.14,
  },
  {
    id: "demanda_china",
    icone: "📈",
    texto: "Boom de cafés especiais na Ásia aquece o mercado",
    impacto: 0.10,
  },
  {
    id: "supersafra_colombia",
    icone: "📉",
    texto: "Supersafra colombiana derruba os preços globais",
    impacto: -0.12,
  },
  {
    id: "estoque_mundial_alto",
    icone: "📦",
    texto: "Estoque mundial em alta — compradores recuam",
    impacto: -0.08,
  },
  {
    id: "recessao_eua",
    icone: "💼",
    texto: "Recessão nos EUA reduz consumo global de café",
    impacto: -0.10,
  },
  {
    id: "tarifa_eua",
    icone: "🚧",
    texto: "EUA impõem tarifa de importação — pressão de preço",
    impacto: -0.07,
  },
];
