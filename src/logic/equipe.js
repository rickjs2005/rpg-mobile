/* ============================================================
   EQUIPE — Lote H1.
   Mensalistas + encarregado. Cobertura proporcional (ratio).
   Manutenção mensal aplica +sanidade nos talhões cobertos.
   ============================================================ */

import { EQUIPE } from "../data/economia.js";

export function equipeVazia() {
  return { mensalistas: 0, encarregado: false };
}

export function hectaresCobertura(equipe) {
  if (!equipe) return 0;
  return (
    (equipe.mensalistas || 0) * EQUIPE.mensalista.hectaresCobertura +
    (equipe.encarregado ? EQUIPE.encarregado.hectaresCobertura : 0)
  );
}

export function folhaPagamentoMensal(equipe) {
  if (!equipe) return 0;
  return (
    (equipe.mensalistas || 0) * EQUIPE.mensalista.salarioMensal +
    (equipe.encarregado ? EQUIPE.encarregado.salarioMensal : 0)
  );
}

// Aplica manutenção mensal nos talhões. Cobertura proporcional:
// se vc tem 6ha de cobertura mas 10ha de talhões, ganho × 0.6.
export function aplicarManutencaoMensal(state) {
  const equipe = state.equipe || equipeVazia();
  const cobertura = hectaresCobertura(equipe);
  if (cobertura === 0) return { talhoes: state.talhoes, eventos: [] };

  const hectaresTotais = state.talhoes.reduce(
    (acc, t) => acc + (t.variedadeId ? t.hectares : 0),
    0
  );
  if (hectaresTotais === 0) return { talhoes: state.talhoes, eventos: [] };

  const ratio = Math.min(1, cobertura / hectaresTotais);
  const ganhoBase = EQUIPE.mensalista.ganhoSanidadeMensal;
  const ganho = ganhoBase * ratio;
  const novosTalhoes = state.talhoes.map((t) => {
    if (!t.variedadeId) return t;
    return { ...t, sanidade: Math.min(1, t.sanidade + ganho) };
  });
  const coberturaPct = Math.round(ratio * 100);
  return {
    talhoes: novosTalhoes,
    eventos: [
      `👥 Manutenção mensal da equipe (+${(ganho * 100).toFixed(1)}% sanidade, cobertura ${coberturaPct}%).`,
    ],
  };
}

export function bonusEncarregadoPanha(equipe) {
  return equipe?.encarregado ? EQUIPE.encarregado.bonusRendimentoPanha : 0;
}
