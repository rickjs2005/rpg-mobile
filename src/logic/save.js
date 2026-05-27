/* ============================================================
   SAVE — múltiplos slots (React Native / AsyncStorage).
   Cada slot tem sua própria chave: `${SAVE_KEY}-slot{n}`.
   Migra automaticamente o save único antigo (chave SAVE_KEY) pro slot 0.
   Tudo async (Promise).
   ============================================================ */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SAVE_KEY } from "../data/constantes.js";

const VERSAO_SAVE = 1;
export const NUM_SLOTS = 3;

const slotKey = (slot) => `${SAVE_KEY}-slot${slot}`;

export function serializar(estado) {
  return JSON.stringify({ versao: VERSAO_SAVE, estado });
}

export function deserializar(json) {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (parsed.versao !== VERSAO_SAVE) {
      console.warn("[save] versão diferente — ignorando", parsed.versao);
      return null;
    }
    return parsed.estado;
  } catch (e) {
    console.error("[save] corrompido:", e);
    return null;
  }
}

export async function salvarSlot(slot, estado) {
  try {
    await AsyncStorage.setItem(slotKey(slot), serializar(estado));
    return true;
  } catch {
    return false;
  }
}

export async function carregarSlot(slot) {
  try {
    const raw = await AsyncStorage.getItem(slotKey(slot));
    return deserializar(raw);
  } catch {
    return null;
  }
}

export async function apagarSlot(slot) {
  try {
    await AsyncStorage.removeItem(slotKey(slot));
    return true;
  } catch {
    return false;
  }
}

// Migração suave: se houver save no formato antigo (chave única) e o slot 0
// estiver vazio, move pra lá. Depois remove a chave antiga.
async function migrarSaveLegado() {
  try {
    const legado = await AsyncStorage.getItem(SAVE_KEY);
    if (!legado) return;
    const slot0 = await AsyncStorage.getItem(slotKey(0));
    if (!slot0) await AsyncStorage.setItem(slotKey(0), legado);
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch {}
}

// Carrega todos os slots (pro menu). Retorna [{ slot, estado }].
export async function carregarTodosSlots() {
  await migrarSaveLegado();
  const out = [];
  for (let s = 0; s < NUM_SLOTS; s++) {
    out.push({ slot: s, estado: await carregarSlot(s) });
  }
  return out;
}
