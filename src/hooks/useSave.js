/* ============================================================
   useSave — múltiplos slots (async).
   - useCarregarSlots(): carrega os N slots no boot; expõe recarregar().
   - useAutoSave(state, slot): grava o estado no SLOT ATIVO a cada mudança.
   ============================================================ */

import { useEffect, useState, useCallback } from "react";
import {
  salvarSlot,
  carregarSlot,
  apagarSlot,
  carregarTodosSlots,
  NUM_SLOTS,
} from "../logic/save.js";

// Boot: carrega todos os slots; retorna { slots, carregando, recarregar }.
export function useCarregarSlots() {
  const [slots, setSlots] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const s = await carregarTodosSlots();
    setSlots(s);
    setCarregando(false);
    return s;
  }, []);

  useEffect(() => {
    let cancelado = false;
    carregarTodosSlots().then((s) => {
      if (cancelado) return;
      setSlots(s);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return { slots, carregando, recarregar };
}

// Auto-save: grava no slot ativo a cada mudança de estado. Sem estado ou
// sem slot ativo (no menu), não faz nada. A exclusão é sempre explícita.
export function useAutoSave(state, slot) {
  useEffect(() => {
    if (state == null || slot == null) return;
    salvarSlot(slot, state);
  }, [state, slot]);
}

export { apagarSlot, carregarSlot, carregarTodosSlots, NUM_SLOTS };
