/* ============================================================
   HOOKS DE ÁUDIO.
   - usePrefsAudio(): lê/observa as preferências globais (pro UI).
   - useAudioBus(): "barramento" — toca a música conforme o contexto
     (menu / jogo / secagem) e dispara o SFX do evento mais recente
     do log, aproveitando a categorização que o reducer já faz.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import {
  getPrefsAudio,
  subscribePrefs,
  tocarEfeito,
  tocarMarco,
  tocarMusica,
} from "./engine.js";
import { efeitoParaEvento } from "./sons.js";

// Mesma chave não dispara 2× num intervalo curto (ex.: "Vender tudo" no
// Mercado despacha vários VENDER_LOTE em sequência → 1 som, não vários).
const MIN_INTERVALO_MS = 80;

export function usePrefsAudio() {
  const [prefs, setPrefs] = useState(getPrefsAudio());
  useEffect(() => subscribePrefs(setPrefs), []);
  return prefs;
}

export function useAudioBus({ state, emJogo }) {
  // Música conforme o contexto.
  useEffect(() => {
    if (!emJogo) {
      tocarMusica("menu");
      return;
    }
    tocarMusica(state?.fase === "secagem" ? "secagem" : "jogo");
  }, [emJogo, state?.fase]);

  // SFX do evento mais recente. Não há id de evento, então usamos uma
  // assinatura (dia + texto). Na 1ª passagem só "memoriza" o topo atual
  // pra não tocar o evento que já estava lá ao entrar no jogo.
  const ultimoRef = useRef(null);
  const ultimoSomTs = useRef({}); // chave → timestamp do último toque

  // Ao sair pro menu, esquece o último evento — assim, ao entrar/trocar de
  // fazenda, o bus re-memoriza o topo atual sem tocar SFX "fantasma".
  useEffect(() => {
    if (!emJogo) ultimoRef.current = null;
  }, [emJogo]);

  useEffect(() => {
    if (!emJogo) return;
    const ev = state?.eventos?.[0];
    if (!ev) return;
    const sig = `${ev.tempo?.totalDias ?? ""}|${ev.texto}`;
    if (ultimoRef.current === null) {
      ultimoRef.current = sig;
      return;
    }
    if (sig === ultimoRef.current) return;
    ultimoRef.current = sig;

    const key = efeitoParaEvento(ev);
    if (!key) return;
    // Debounce por chave.
    const agora = Date.now();
    if (agora - (ultimoSomTs.current[key] ?? 0) < MIN_INTERVALO_MS) return;
    ultimoSomTs.current[key] = agora;

    if (key === "marco") tocarMarco();
    else tocarEfeito(key);
  }, [state?.eventos, emJogo]);
}
