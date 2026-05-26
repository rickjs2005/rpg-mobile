/* ============================================================
   CLIMA — sorteio diário a partir do perfil mensal.
   Geada é evento raro (sorteio independente). Os outros tipos
   dividem 100% conforme as probabilidades do mês.
   ============================================================ */

import { PERFIL_MENSAL } from "../data/clima.js";
import { MM_MIN_DIA } from "../data/constantes.js";

export function sortearClimaDia(rng, mes) {
  const p = PERFIL_MENSAL[mes];
  if (rng.chance(p.pGeada)) return "geada";
  const r = rng.next();
  if (r < p.pChuva) return "chuva";
  if (r < p.pChuva + p.pSol) return "sol";
  return "nublado";
}

export function climaDescreve(tipo) {
  return {
    sol: "☀️ Sol",
    chuva: "🌧️ Chuva",
    nublado: "⛅ Nublado",
    geada: "❄️ Geada",
  }[tipo] || tipo;
}

// Quantos mm de chuva caíram nesse dia, conforme o tipo de clima.
// Necessário pro ciclo fenológico (florada precisa de chuva forte, granação de chuva acumulada).
export function sortearMmDia(rng, climaTipo) {
  const faixa = MM_MIN_DIA[climaTipo] || MM_MIN_DIA.sol;
  if (faixa.max === 0) return 0;
  if (faixa.min === faixa.max) return faixa.min;
  return faixa.min + Math.floor(rng.next() * (faixa.max - faixa.min + 1));
}

// Quanto seca o lote no terreiro num dia desse clima (multiplicador).
// Chuva é negativo: lote absorve umidade de volta.
export function fatorSecagem(climaTipo) {
  switch (climaTipo) {
    case "sol": return 1.0;
    case "nublado": return 0.4;
    case "chuva": return -0.3;
    case "geada": return 0.2;
    default: return 0.5;
  }
}
