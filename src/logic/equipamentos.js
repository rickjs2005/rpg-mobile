/* ============================================================
   EQUIPAMENTOS — modificadores efetivos por terreno.
   A regra "trator perde no montanhoso, drone ganha" é aplicada
   aqui via fatorTerreno. Colhedora simplesmente NÃO opera em
   montanhoso (regra dura, decisão de design).
   ============================================================ */

import { EQUIPAMENTOS } from "../data/economia.js";

export function efeitoEquipamento(equipId, terreno) {
  const eq = EQUIPAMENTOS[equipId];
  if (!eq) return null;

  // Regra dura: colhedora não trabalha em ladeira.
  if (equipId === "colhedora" && terreno === "montanhoso") return null;

  const fatorTerreno =
    eq.melhorEm === "qualquer" || eq.melhorEm === terreno ? 1.0 : 0.4;

  return { ...eq.efeitos, fatorTerreno };
}

// Custo diário de operação total (combustível/manutenção) dos equipamentos.
// Esta é a trava econômica: equipamento parado custa caixa.
export function custoOperacaoTotal(equipIds = []) {
  return equipIds.reduce((acc, id) => {
    const eq = EQUIPAMENTOS[id];
    return acc + (eq?.custoOperacao || 0);
  }, 0);
}

export function temEquipamento(equipIds = [], id) {
  return equipIds.includes(id);
}
