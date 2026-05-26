/* ============================================================
   FINANCIAMENTO — Funcafé (Lote H7).
   Empréstimo subsidiado: 12 parcelas mensais, 10% juros total.
   1 ativo por vez. Limite escala com tamanho da fazenda.
   ============================================================ */

import { FUNCAFE } from "../data/constantes.js";
import { ANOS_FORMACAO } from "../data/constantes.js";

export function limiteEmprestimo(state) {
  const haFormados = state.talhoes
    .filter((t) => t.variedadeId && t.idadeAnos >= ANOS_FORMACAO)
    .reduce((acc, t) => acc + t.hectares, 0);
  return Math.round(FUNCAFE.limiteBase + haFormados * FUNCAFE.limitePorHectare);
}

export function calcularParcela(principal) {
  const totalAPagar = principal * (1 + FUNCAFE.jurosTotal);
  return Math.round(totalAPagar / FUNCAFE.prazoMeses);
}

export function criarEmprestimo(principal) {
  const valorParcela = calcularParcela(principal);
  return {
    principal,
    valorParcela,
    parcelasTotais: FUNCAFE.prazoMeses,
    parcelasRestantes: FUNCAFE.prazoMeses,
    totalAPagar: valorParcela * FUNCAFE.prazoMeses,
  };
}

// Cobra 1 parcela. Retorna { emprestimo, parcelaPaga } com emprestimo=null se quitou.
export function cobrarParcela(emprestimo) {
  if (!emprestimo) return { emprestimo: null, parcelaPaga: 0 };
  const restantes = emprestimo.parcelasRestantes - 1;
  const parcelaPaga = emprestimo.valorParcela;
  if (restantes <= 0) return { emprestimo: null, parcelaPaga, quitado: true };
  return {
    emprestimo: { ...emprestimo, parcelasRestantes: restantes },
    parcelaPaga,
    quitado: false,
  };
}
