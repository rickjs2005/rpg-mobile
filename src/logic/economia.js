/* ============================================================
   ECONOMIA — preço de venda, custos, helpers de caixa.
   Funções pequenas. O REDUCER orquestra; aqui só tem números.
   ============================================================ */

import { INSUMOS, EQUIPAMENTOS } from "../data/economia.js";
import { TABELA_BEBIDA, METODOS_POS } from "../data/cafe.js";

export function precoPorSaca(score) {
  for (const linha of TABELA_BEBIDA) {
    if (score >= linha.min) return linha.preco;
  }
  return TABELA_BEBIDA[TABELA_BEBIDA.length - 1].preco;
}

export function valorLote(lote, scoreBebida) {
  return lote.sacas * precoPorSaca(scoreBebida);
}

export function custoInsumo(insumoId) {
  return INSUMOS[insumoId]?.custo || 0;
}

export function custoEquipamento(equipId) {
  return EQUIPAMENTOS[equipId]?.custo || 0;
}

export function custoMetodoPos(metodoId) {
  return METODOS_POS[metodoId]?.custo || 0;
}

export function podePagar(caixa, valor) {
  return caixa >= valor;
}
