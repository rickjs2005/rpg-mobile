/* ============================================================
   CLIMA — perfis mensais (Zona da Mata mineira, simplificado).
   Cada mês traz: probabilidade de chuva, sol e geada por dia.
   A função que SORTEIA o clima do dia mora em logic/clima.js
   (este arquivo só descreve "como é normalmente cada mês").
   ============================================================ */

// Probabilidades somam ~1.0 (chuva + sol + nublado implícito).
// Geada é evento raro, fora dessa soma — sorteio separado.
export const PERFIL_MENSAL = {
  1: { nome: "Janeiro", pChuva: 0.65, pSol: 0.25, pGeada: 0 }, // verão, muita água
  2: { nome: "Fevereiro", pChuva: 0.55, pSol: 0.3, pGeada: 0 },
  3: { nome: "Março", pChuva: 0.45, pSol: 0.4, pGeada: 0 },
  4: { nome: "Abril", pChuva: 0.3, pSol: 0.55, pGeada: 0 },
  5: { nome: "Maio", pChuva: 0.15, pSol: 0.75, pGeada: 0 }, // início colheita
  6: { nome: "Junho", pChuva: 0.1, pSol: 0.8, pGeada: 0.03 }, // pico colheita, risco frio
  7: { nome: "Julho", pChuva: 0.08, pSol: 0.82, pGeada: 0.05 }, // mais frio
  8: { nome: "Agosto", pChuva: 0.1, pSol: 0.8, pGeada: 0.02 }, // fim colheita
  9: { nome: "Setembro", pChuva: 0.25, pSol: 0.65, pGeada: 0 }, // florada
  10: { nome: "Outubro", pChuva: 0.5, pSol: 0.4, pGeada: 0 },
  11: { nome: "Novembro", pChuva: 0.6, pSol: 0.3, pGeada: 0 },
  12: { nome: "Dezembro", pChuva: 0.65, pSol: 0.25, pGeada: 0 },
};

// Tipos possíveis num dia.
export const TIPOS_CLIMA = ["chuva", "sol", "nublado", "geada"];
