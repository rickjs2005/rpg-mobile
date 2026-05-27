/* ============================================================
   TEMPO — calendário e avanço.
   Modo HÍBRIDO escolhido: passo padrão = 7 dias, mas vira 1 dia
   nas fases sensíveis (panha, secagem). A regra mora aqui.
   ============================================================ */

import {
  FASES_DIARIAS,
  MES_COLHEITA_INICIO,
  MES_COLHEITA_FIM,
} from "../data/constantes.js";

// Calendário simplificado: bissexto não importa pro jogo.
const DIAS_POR_MES = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NOMES_MES = ["", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function tempoInicial() {
  return { ano: 1, mes: 1, dia: 1, totalDias: 0 };
}

export function diasMes(mes) {
  return DIAS_POR_MES[mes];
}

export function avancarUmDia(tempo) {
  let { ano, mes, dia, totalDias } = tempo;
  dia += 1;
  totalDias += 1;
  if (dia > diasMes(mes)) {
    dia = 1;
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return { ano, mes, dia, totalDias };
}

export function avancarDias(tempo, n) {
  let t = tempo;
  for (let i = 0; i < n; i++) t = avancarUmDia(t);
  return t;
}

// Decide quantos dias o botão "Avançar" deve pular, dada a fase atual.
// Fases sensíveis (secagem) são sempre diárias; fora delas, usa a
// velocidade configurada pelo jogador (padrão 7 = 1 semana).
export function passoEmDias(fase, velocidade = 7) {
  return FASES_DIARIAS.includes(fase) ? 1 : velocidade || 7;
}

// Rótulo do botão "Avançar" conforme fase + velocidade.
export function rotuloPasso(fase, velocidade = 7) {
  if (FASES_DIARIAS.includes(fase)) return "1 dia";
  const n = velocidade || 7;
  if (n === 7) return "1 semana";
  if (n === 14) return "2 semanas";
  if (n === 30) return "1 mês";
  return `${n} dias`;
}

export function estaEpocaColheita(tempo) {
  return tempo.mes >= MES_COLHEITA_INICIO && tempo.mes <= MES_COLHEITA_FIM;
}

export function formatarData(tempo) {
  return `${tempo.dia}/${NOMES_MES[tempo.mes]}/Ano ${tempo.ano}`;
}

// Diferença em anos inteiros entre dois tempos (pra envelhecer talhões na virada do ano)
export function anosCompletos(antes, depois) {
  return depois.ano - antes.ano;
}
