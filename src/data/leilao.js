/* ============================================================
   LEILÃO DE CAFÉS ESPECIAIS — Cup of Excellence / Florada Premiada.
   Abre na primavera (set–nov), pós-colheita, quando há microlotes.
   Microlotes (SCA ≥ 85) são arrematados por um múltiplo do valor
   normal, ponderado pela qualidade. Funções puras.
   ============================================================ */

export const LEILAO = {
  nome: "Leilão de Cafés Especiais",
  mesesAbertos: [9, 10, 11], // set–nov (Semana Internacional do Café = nov)
};

export function leilaoAberto(mes) {
  return LEILAO.mesesAbertos.includes(mes);
}

// Faixa de multiplicador sobre o valor normal, por nota SCA.
export function faixaMultiplicador(sca) {
  if (sca >= 90) return { min: 3.0, max: 6.0 };
  if (sca >= 88) return { min: 2.0, max: 3.5 };
  return { min: 1.5, max: 2.5 }; // 85–87
}

// Classificação (flavor) conforme quão alto foi o lance dentro da faixa.
export function classificacaoLeilao(fracDentroDaFaixa) {
  if (fracDentroDaFaixa > 0.8) return "🥇 1º lugar";
  if (fracDentroDaFaixa > 0.5) return "🏅 Top 5";
  return "Top 30";
}
