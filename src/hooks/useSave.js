/* ============================================================
   useSave — versão React Native (async).
   Diferença do web: AsyncStorage é Promise-based, então o boot
   precisa esperar a leitura. Exposto como hook que retorna
   { estado, carregando } pra o App mostrar splash enquanto lê.
   ============================================================ */

import { useEffect, useState, useRef } from "react";
import {
  salvarLocal,
  carregarLocal,
  apagarLocal,
  temSaveSalvo,
} from "../logic/save.js";

// Hook de boot: carrega save uma vez, retorna estado quando pronto.
export function useCarregarSaveInicial() {
  const [estado, setEstado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    carregarLocal().then((e) => {
      if (cancelado) return;
      setEstado(e);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return { estado, carregando };
}

// Auto-save: salva a cada mudança de state. Estado null = sem partida.
export function useAutoSave(state) {
  const apagouRef = useRef(false);

  useEffect(() => {
    if (state === null) {
      if (apagouRef.current === false) {
        apagarLocal();
      }
      apagouRef.current = true;
      return;
    }
    apagouRef.current = false;
    salvarLocal(state);
  }, [state]);
}

export { apagarLocal, temSaveSalvo };
