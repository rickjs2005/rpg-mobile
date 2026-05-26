/* ============================================================
   MERCADO — atualização diária do índice + sorteio de evento.
   Função pura, RNG passado de fora.
   ============================================================ */

import { PARAMS_MERCADO, EVENTOS_MACRO } from "../data/mercado.js";

export function mercadoInicial() {
  return {
    indice: PARAMS_MERCADO.indiceInicial,
    tendencia: 0, // -1, 0, 1
    historico: [{ indice: 1.0 }], // últimos 30 valores
  };
}

function clampIndice(v) {
  return Math.max(PARAMS_MERCADO.indiceMin, Math.min(PARAMS_MERCADO.indiceMax, v));
}

// Avança 1 dia no mercado. Retorna { mercado, eventos }.
export function avancarMercadoDia(rng, mercado) {
  if (!mercado) mercado = mercadoInicial();
  let { indice, tendencia, historico } = mercado;
  const eventos = [];

  // 1) Talvez mudar tendência
  if (rng.chance(PARAMS_MERCADO.probMudarTendenciaDia)) {
    const r = rng.next();
    if (r < 0.4) tendencia = -1;
    else if (r < 0.8) tendencia = 1;
    else tendencia = 0;
  }

  // 2) Aplicar tendência + ruído gaussiano simples (uniforme)
  const ruido = (rng.next() - 0.5) * 2 * PARAMS_MERCADO.volatilidadeDiaria;
  const pull = tendencia * PARAMS_MERCADO.forcaTendenciaDia;
  indice = clampIndice(indice + pull + ruido);

  // 3) Talvez disparar evento macro
  if (rng.chance(PARAMS_MERCADO.probEventoMacroDia)) {
    const ev = EVENTOS_MACRO[Math.floor(rng.next() * EVENTOS_MACRO.length)];
    indice = clampIndice(indice + ev.impacto);
    const direcao = ev.impacto > 0 ? "+" : "";
    eventos.push(
      `${ev.icone} ${ev.texto} (índice ${direcao}${Math.round(ev.impacto * 100)}%).`
    );
    // Eventos grandes podem virar a tendência também
    tendencia = ev.impacto > 0 ? 1 : -1;
  }

  // 4) Atualiza histórico (cap 30)
  const novoHist = [...(historico || []), { indice }].slice(-30);

  return {
    mercado: { indice, tendencia, historico: novoHist },
    eventos,
  };
}

// Multiplicador atual pra aplicar no preço da saca.
export function fatorMercado(mercado) {
  if (!mercado) return 1.0;
  return mercado.indice ?? 1.0;
}

// Texto curto pra UI: índice + setinha.
export function rotuloMercado(mercado) {
  if (!mercado) return "→ 1.00x";
  const pct = Math.round((mercado.indice - 1) * 100);
  const seta = mercado.tendencia > 0 ? "↑" : mercado.tendencia < 0 ? "↓" : "→";
  return `${seta} ${pct >= 0 ? "+" : ""}${pct}%`;
}
