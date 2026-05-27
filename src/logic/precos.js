/* ============================================================
   PREÇOS — seletor único do preço final de venda de um lote.
   Mesma fórmula do reducer (acaoVenderLote): preço base do lote
   × prêmio de certificações × índice de mercado (com piso da
   cooperativa). Usado pela UI pra exibir EXATAMENTE o que será
   creditado no caixa. Função pura.
   ============================================================ */

import { precoComCertificacoes } from "./certificacoes.js";
import { fatorMercado } from "./mercado.js";
import { COOPERATIVA } from "../data/constantes.js";

export function mercadoEfetivo(state) {
  let m = fatorMercado(state.mercado);
  if (state.cooperativa?.filiado) m = Math.max(m, COOPERATIVA.floorMercado);
  return m;
}

export function precoFinalSaca(state, lote) {
  return Math.round(
    precoComCertificacoes(lote.precoPorSaca, state.certificacoes) * mercadoEfetivo(state)
  );
}

export function valorLote(state, lote) {
  return lote.sacas * precoFinalSaca(state, lote);
}
