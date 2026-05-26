/* ============================================================
   useJogo — Context + Provider + hook de consumo.
   A UI inteira fala com o jogo via { state, dispatch } daqui.
   ============================================================ */

import { createContext, useContext, useReducer, useMemo } from "react";
import { reducer, ESTADO_VAZIO } from "./reducer.js";

const JogoContext = createContext(null);

export function JogoProvider({ children, estadoInicial }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial ?? ESTADO_VAZIO);
  // useMemo evita re-render de consumidores quando só a referência muda.
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <JogoContext.Provider value={value}>{children}</JogoContext.Provider>;
}

export function useJogo() {
  const ctx = useContext(JogoContext);
  if (!ctx) throw new Error("useJogo deve ser usado dentro de <JogoProvider>");
  return ctx;
}
