/* ============================================================
   RESUMO DA FAZENDA — agregados + pontos de atenção pro painel
   do topo da tela Fazenda. Função PURA, testável.
   ============================================================ */

import { ANOS_FORMACAO } from "../data/constantes.js";
import { calcularMaturacao } from "./maturacao.js";
import { colher } from "./panha.js";

const produtivo = (t) =>
  t.variedadeId && t.idadeAnos >= ANOS_FORMACAO && t.estado === "normal";

export function resumoFazenda(state) {
  const talhoes = state?.talhoes || [];
  const pes = talhoes.reduce((a, t) => a + (t.pes || 0), 0);
  const hectares = talhoes.reduce((a, t) => a + (t.hectares || 0), 0);
  const ativos = talhoes.filter((t) => t.variedadeId).length;

  const mes = state?.tempo?.mes ?? 1;
  const naEpoca = mes >= 5 && mes <= 8;

  // Sacas estimadas se colhesse (manual) AGORA — só faz sentido na janela.
  let sacasEstimadas = null;
  if (naEpoca) {
    sacasEstimadas = 0;
    for (const t of talhoes) {
      if (!produtivo(t) || t.ciclo?.safraColhida) continue;
      const mat = calcularMaturacao(t, mes);
      const c = colher(t, mat, "manual", state.equipamentos || [], state.equipe || null);
      if (c) sacasEstimadas += c.sacas;
    }
  }

  // Pontos de atenção (acionáveis).
  const atencao = [];
  if ((state?.caixa ?? 0) < 0) {
    atencao.push({ icone: "💸", texto: "Caixa negativo", nivel: "critico" });
  }
  const prontos = naEpoca
    ? talhoes.filter((t) => produtivo(t) && !t.ciclo?.safraColhida)
    : [];
  if (prontos.length) {
    atencao.push({
      icone: "🍒",
      texto: `${prontos.length} talhão(ões) pronto(s) pra colher`,
      nivel: "acao",
    });
  }
  const comPragas = talhoes.filter(
    (t) => Object.keys(t.pragas || {}).length > 0
  );
  if (comPragas.length) {
    atencao.push({
      icone: "🐛",
      texto: `${comPragas.length} talhão(ões) com pragas`,
      nivel: "aviso",
    });
  }
  const sanBaixa = talhoes.filter(
    (t) => t.variedadeId && t.sanidade < 0.4 && t.estado === "normal"
  );
  if (sanBaixa.length) {
    atencao.push({
      icone: "🩹",
      texto: `${sanBaixa.length} com sanidade baixa`,
      nivel: "aviso",
    });
  }
  // Florada perdida (janela já passou: novembro em diante)
  if (mes >= 11) {
    const semFlorada = talhoes.filter(
      (t) => produtivo(t) && !t.ciclo?.floradaPrincipalOk
    );
    if (semFlorada.length) {
      atencao.push({
        icone: "💔",
        texto: `${semFlorada.length} sem florada (safra comprometida)`,
        nivel: "critico",
      });
    }
  }

  return { pes, hectares, talhoes: talhoes.length, ativos, sacasEstimadas, atencao };
}
