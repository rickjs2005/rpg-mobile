/* ============================================================
   SAVE — versão React Native (AsyncStorage).
   Mesma API do web, mas TUDO é async (Promise).
   A camada que consome (useSave) já está preparada pra isso.
   ============================================================ */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SAVE_KEY } from "../data/constantes.js";

const VERSAO_SAVE = 1;

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

export async function salvarLocal(estado) {
  try {
    await AsyncStorage.setItem(SAVE_KEY, serializar(estado));
    return true;
  } catch {
    return false;
  }
}

export async function carregarLocal() {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    return deserializar(raw);
  } catch {
    return null;
  }
}

export async function apagarLocal() {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function temSaveSalvo() {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    return !!raw;
  } catch {
    return false;
  }
}
