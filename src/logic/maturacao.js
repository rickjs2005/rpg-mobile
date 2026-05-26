/* ============================================================
   MATURAÇÃO — perfil maduro/verde/seco do talhão no mês.
   Curva simplificada por mês, modulada pela maturacaoBase
   da variedade (conilon matura rápido; arábica mais lento).
   ============================================================ */

import { VARIEDADES } from "../data/cafe.js";

function perfilBaseMes(mes) {
  if (mes < 5 || mes > 8) return { maduro: 0.0, verde: 1.0, seco: 0.0 };
  return {
    5: { maduro: 0.30, verde: 0.65, seco: 0.05 },
    6: { maduro: 0.55, verde: 0.35, seco: 0.10 },
    7: { maduro: 0.70, verde: 0.15, seco: 0.15 },
    8: { maduro: 0.50, verde: 0.10, seco: 0.40 }, // passou do ponto = café-seco no pé
  }[mes];
}

export function calcularMaturacao(talhao, mes) {
  if (!talhao.variedadeId) return { maduro: 0, verde: 0, seco: 0 };
  const base = perfilBaseMes(mes);
  const variedade = VARIEDADES[talhao.variedadeId];
  // maturacaoBase 0.55..0.75: variedade mais "rápida" empurra perfil pra maduro/seco.
  const ajuste = (variedade.maturacaoBase - 0.6) * 0.5;
  const maduro = Math.max(0, base.maduro + ajuste);
  const verde = Math.max(0, base.verde - ajuste);
  const seco = base.seco;
  const soma = maduro + verde + seco || 1;
  return {
    maduro: maduro / soma,
    verde: verde / soma,
    seco: seco / soma,
  };
}
