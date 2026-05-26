/* ============================================================
   EVENTOS CLIMÁTICOS EXTREMOS — Lote H2.
   Sorteados no loop diário em janelas específicas. Causam dano
   massivo, transformam a partida.

   - Geada negra: jun-jul, atinge todos os talhões formados
   - Granizo: out-fev, atinge 1 talhão random
   - Seca crítica: consequência do veranico > 25 dias (gradual)
   ============================================================ */

export const EVENTOS_EXTREMOS = {
  geada_negra: {
    nome: "Geada negra",
    icone: "❄️",
    mesesValidos: [6, 7, 8],
    probDiaria: 0.004,                  // ~3-4% por trimestre (jun-ago)
    impactoSanidade: 0.5,                // -50% sanidade
    quebraFlorada: true,
    mensagem: "❄️ GEADA NEGRA! Lavoura queimada — sanidade caiu 50%, florada perdida.",
    alvo: "todos",                       // todos talhões formados
  },
  granizo: {
    nome: "Chuva de granizo",
    icone: "🌨️",
    mesesValidos: [10, 11, 12, 1, 2],
    probDiaria: 0.0025,                  // ~3% por trimestre (out-fev)
    impactoSanidade: 0.3,                // -30% sanidade
    quebraFlorada: true,                 // se estava em florada
    mensagem: "🌨️ GRANIZO atingiu um talhão! −30% sanidade, florada comprometida.",
    alvo: "random",                      // 1 talhão random
  },
};

// Seca crítica: parâmetros do dano gradual quando veranico passa do limite.
export const SECA_CRITICA = {
  diasParaCritico: 25,                  // após 25d sem chuva, começa dano gradual
  danoSanidadeDia: 0.01,                // -1% sanidade por dia adicional
  marcosAviso: [25, 35, 50],            // emite alerta nesses dias
};
