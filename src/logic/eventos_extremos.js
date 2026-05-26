/* ============================================================
   EVENTOS EXTREMOS — sorteio + aplicação.
   Função pura. RNG passado de fora (seedável).
   ============================================================ */

import { EVENTOS_EXTREMOS, SECA_CRITICA } from "../data/eventos_extremos.js";
import { estaEmRecuperacao, estaFormado } from "./talhao.js";
import { SOMBREAMENTO } from "../data/constantes.js";

/* ---------- Geada / Granizo (sorteio diário) ---------- */

export function tentarEventoExtremoDia(rng, state) {
  for (const [id, ev] of Object.entries(EVENTOS_EXTREMOS)) {
    if (!ev.mesesValidos.includes(state.tempo.mes)) continue;
    if (!rng.chance(ev.probDiaria)) continue;
    return aplicarEvento(state, ev, rng);
  }
  return null;
}

function aplicarEvento(state, ev, rng) {
  const elegiveis = state.talhoes.filter(
    (t) => estaFormado(t) && !estaEmRecuperacao(t)
  );
  if (elegiveis.length === 0) return null;

  const alvos =
    ev.alvo === "random"
      ? [elegiveis[Math.floor(rng.next() * elegiveis.length)]]
      : elegiveis;
  const alvoIds = new Set(alvos.map((t) => t.id));

  const novosTalhoes = state.talhoes.map((t) => {
    if (!alvoIds.has(t.id)) return t;
    // Lote H9: sombreamento reduz dano da geada
    const danoFinal = t.sombreado
      ? ev.impactoSanidade * SOMBREAMENTO.reducaoDanoGeada
      : ev.impactoSanidade;
    let novo = {
      ...t,
      sanidade: Math.max(0, t.sanidade - danoFinal),
    };
    if (ev.quebraFlorada && novo.ciclo && !t.sombreado) {
      // Sombreado protege parcialmente a florada
      novo = {
        ...novo,
        ciclo: { ...novo.ciclo, floradaPrincipalOk: false, numFloradas: 0 },
      };
    }
    return novo;
  });

  return { state: { ...state, talhoes: novosTalhoes }, eventos: [ev.mensagem] };
}

/* ---------- Seca crítica (dano gradual no veranico longo) ----------
   Aplicada por talhão. Chamada do loop diário.
   Retorna { talhao, eventos } com modificações se houver.
*/
export function aplicarSecaCriticaDia(talhao) {
  if (!estaFormado(talhao) || estaEmRecuperacao(talhao)) {
    return { talhao, eventos: [] };
  }
  const dias = talhao.ciclo?.diasSemChuva || 0;
  if (dias <= SECA_CRITICA.diasParaCritico) return { talhao, eventos: [] };

  // Dano gradual
  const novoTalhao = {
    ...talhao,
    sanidade: Math.max(0, talhao.sanidade - SECA_CRITICA.danoSanidadeDia),
  };

  // Aviso em marcos específicos
  const eventos = [];
  if (SECA_CRITICA.marcosAviso.includes(dias)) {
    eventos.push(
      `⚠️ Seca de ${dias} dias castigando a lavoura — sanidade caindo.`
    );
  }

  return { talhao: novoTalhao, eventos };
}
