/* ============================================================
   ESTATÍSTICAS GLOBAIS — recordes que sobrevivem a apagar o save.
   Store simples (à parte do reducer), persistido no AsyncStorage,
   com subscription pra UI reagir. Mesmo padrão das prefs de áudio.
   ============================================================ */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

const KEY = "imperio-stats-globais-v1";

let stats = {
  partidasJogadas: 0,
  maiorCaixa: 0,
  melhorSca: 0,
};
const listeners = new Set();

export function getStatsGlobais() {
  return stats;
}
export function subscribeStatsGlobais(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  for (const fn of listeners) {
    try {
      fn(stats);
    } catch {}
  }
}
async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(stats));
  } catch {}
}

// PURA: mescla um progresso nos recordes, mantendo os máximos. Testável.
export function mesclarProgresso(base, prog = {}) {
  const out = { ...base };
  let mudou = false;
  if (typeof prog.caixa === "number" && prog.caixa > (base.maiorCaixa || 0)) {
    out.maiorCaixa = prog.caixa;
    mudou = true;
  }
  if (typeof prog.sca === "number" && prog.sca > (base.melhorSca || 0)) {
    out.melhorSca = prog.sca;
    mudou = true;
  }
  return { stats: out, mudou };
}

export async function carregarStatsGlobais() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) stats = { ...stats, ...JSON.parse(raw) };
  } catch {}
  notify();
  return stats;
}

export async function registrarPartidaIniciada() {
  stats = { ...stats, partidasJogadas: (stats.partidasJogadas || 0) + 1 };
  await persist();
  notify();
}

export async function registrarProgresso(prog) {
  const r = mesclarProgresso(stats, prog);
  if (!r.mudou) return;
  stats = r.stats;
  await persist();
  notify();
}

export function useStatsGlobais() {
  const [s, setS] = useState(getStatsGlobais());
  useEffect(() => subscribeStatsGlobais(setS), []);
  return s;
}
