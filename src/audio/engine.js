/* ============================================================
   MOTOR DE ÁUDIO — defensivo e silencioso por padrão.
   - Usa expo-audio, mas TUDO é envolvido em try/catch: se o módulo
     nativo não estiver disponível, vira no-op (sem crash).
   - Se o som registrado for null (sem arquivo), também é no-op.
   - Preferências (música/efeitos on-off + volumes) são GLOBAIS
     (independentes do save), persistidas no AsyncStorage — assim
     valem inclusive no menu, antes de existir uma partida.
   ============================================================ */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { EFEITOS, MUSICAS } from "./sons.js";

// Import defensivo: se expo-audio faltar/quebrar, Audio = null → no-op.
let Audio = null;
try {
  Audio = require("expo-audio");
} catch {
  Audio = null;
}

// Configura o modo de áudio o quanto antes (no import do módulo), pois os
// efeitos de componentes-filho podem disparar tocarMusica() antes do boot
// do App. Definição (hoisted) logo abaixo.
configurarModoAudio();

const PREFS_KEY = "imperio-audio-v1";

let prefs = { musica: true, efeitos: true, volMusica: 0.5, volEfeitos: 0.85 };
const listeners = new Set();

export function getPrefsAudio() {
  return prefs;
}
export function subscribePrefs(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  for (const fn of listeners) {
    try {
      fn(prefs);
    } catch {}
  }
}

// Configura o modo de áudio: no iOS, sem isto a música NÃO toca com o
// switch de silencioso ligado. Idempotente.
async function configurarModoAudio() {
  if (!Audio?.setAudioModeAsync) {
    console.warn("[audio] expo-audio indisponível (setAudioModeAsync ausente)");
    return;
  }
  try {
    await Audio.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
  } catch (e) {
    console.warn("[audio] setAudioModeAsync falhou:", e?.message || e);
  }
}

export async function carregarPrefsAudio() {
  await configurarModoAudio();
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) prefs = { ...prefs, ...JSON.parse(raw) };
  } catch {}
  aplicarMusicaPrefs();
  notify();
  return prefs;
}

export async function setPrefsAudio(patch) {
  prefs = { ...prefs, ...patch };
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
  aplicarMusicaPrefs();
  notify();
}

/* ---------- Efeitos (SFX) ---------- */
const playersEfeito = {}; // key -> AudioPlayer (criado sob demanda)

function playerEfeito(key) {
  const asset = EFEITOS[key];
  if (!Audio || !asset) return null; // silencioso
  if (!playersEfeito[key]) {
    try {
      playersEfeito[key] = Audio.createAudioPlayer(asset);
    } catch {
      return null;
    }
  }
  return playersEfeito[key];
}

export function tocarEfeito(key, opts = {}) {
  if (!prefs.efeitos) return;
  const p = playerEfeito(key);
  if (!p) return;
  try {
    const vol = opts.volume != null ? opts.volume : prefs.volEfeitos;
    p.volume = Math.max(0, Math.min(1, vol));
    p.seekTo(0);
    p.play();
  } catch {}
}

// Pré-carrega os players dos SFX informados (cria o AudioPlayer agora pra
// evitar latência no 1º toque). Som ainda null → ignora silenciosamente.
export function preCarregarEfeitos(keys = []) {
  for (const k of keys) playerEfeito(k);
}

// Fanfarra de conquista com PRIORIDADE: volume cheio + "duck" na música.
export function tocarMarco() {
  tocarEfeito("marco", { volume: 1.0 });
  duckMusica(0.3, 1500);
}

/* ---------- Música (loop) ---------- */
let musicaPlayer = null;
let musicaAtual = null;

export function tocarMusica(key) {
  // Já tocando essa faixa? só garante o play (respeitando pref).
  if (musicaAtual === key && musicaPlayer) {
    if (prefs.musica) {
      try {
        musicaPlayer.play();
      } catch {}
    }
    return;
  }
  // Troca de faixa: descarta a anterior.
  if (musicaPlayer) {
    try {
      musicaPlayer.remove();
    } catch {}
    musicaPlayer = null;
  }
  musicaAtual = key;

  const asset = MUSICAS[key];
  if (!Audio) {
    console.warn("[audio] expo-audio indisponível — música não toca");
    return;
  }
  if (!asset) {
    console.warn(`[audio] sem arquivo para a música "${key}" (registro null)`);
    return;
  }
  if (!prefs.musica) return; // mudo por preferência
  try {
    musicaPlayer = Audio.createAudioPlayer(asset);
    musicaPlayer.loop = true;
    musicaPlayer.volume = prefs.volMusica;
    musicaPlayer.play();
  } catch (e) {
    console.warn(`[audio] falha ao tocar música "${key}":`, e?.message || e);
    musicaPlayer = null;
  }
}

export function pararMusica() {
  musicaAtual = null;
  if (!musicaPlayer) return;
  try {
    musicaPlayer.remove();
  } catch {}
  musicaPlayer = null;
}

// Abaixa a música temporariamente (ex.: durante a fanfarra de marco) e
// restaura o volume depois de `ms`. No-op se não há música tocando.
let duckTimer = null;
export function duckMusica(fator = 0.3, ms = 1500) {
  if (!musicaPlayer) return;
  try {
    musicaPlayer.volume = prefs.volMusica * fator;
    if (duckTimer) clearTimeout(duckTimer);
    duckTimer = setTimeout(() => {
      duckTimer = null;
      try {
        if (musicaPlayer && prefs.musica) musicaPlayer.volume = prefs.volMusica;
      } catch {}
    }, ms);
  } catch {}
}

// Aplica o estado das prefs à música atual (liga/desliga/volume).
function aplicarMusicaPrefs() {
  if (prefs.musica) {
    if (musicaAtual && !musicaPlayer) {
      const k = musicaAtual;
      musicaAtual = null; // força recriação
      tocarMusica(k);
    } else if (musicaPlayer) {
      try {
        musicaPlayer.volume = prefs.volMusica;
        musicaPlayer.play();
      } catch {}
    }
  } else if (musicaPlayer) {
    try {
      musicaPlayer.pause();
    } catch {}
  }
}
