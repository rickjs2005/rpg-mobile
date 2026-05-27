/* ============================================================
   ALERTAS — calcula info "situacional" do estado.
   Próximo evento importante, alertas críticos, saúde da fazenda.
   Função pura, consumida pelo HUD e dashboard.
   ============================================================ */

import { ANOS_FORMACAO, VERANICO_DIAS_MIN } from "../data/constantes.js";

const NOMES_MES = ["", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/* ---------- Próximo evento (1 linha resumo) ---------- */
export function calcularProximoEvento(state) {
  if (!state) return null;
  const { tempo, talhoes, fase, colheitaPendente, loteSecagem } = state;

  // Fases ativas têm prioridade absoluta
  if (fase === "aguardando_pos") {
    return { icone: "🍒", texto: "Decida método pós-colheita", nivel: "acao" };
  }
  if (fase === "secagem" && loteSecagem) {
    const umidPct = Math.round(loteSecagem.umidade * 100);
    return { icone: "🌡️", texto: `Secagem ${umidPct}% → 12%`, nivel: "info" };
  }

  // Talhões prontos pra colher na época
  const naEpoca = tempo.mes >= 5 && tempo.mes <= 8;
  const formados = talhoes.filter(
    (t) =>
      t.variedadeId &&
      t.idadeAnos >= ANOS_FORMACAO &&
      t.estado === "normal" &&
      (t.ciclo?.floradaPrincipalOk || !t.ciclo)
  );
  // Pra "colheita disponível", ignora talhões cuja safra já foi colhida.
  const colhiveis = formados.filter((t) => !t.ciclo?.safraColhida);
  if (naEpoca && colhiveis.length > 0) {
    return {
      icone: "🍒",
      texto: `Colheita disponível em ${colhiveis.length} talhão(ões)`,
      nivel: "acao",
    };
  }

  // Janela de florada (set-out)
  if (tempo.mes === 9 || tempo.mes === 10) {
    const semFlorada = formados.length === 0
      ? null
      : formados.some((t) => !t.ciclo?.floradaPrincipalOk);
    if (semFlorada) {
      return {
        icone: "🌸",
        texto: "Janela de florada — aguardando veranico + chuva",
        nivel: "info",
      };
    }
  }

  // Granação (jan-mar)
  if (tempo.mes >= 1 && tempo.mes <= 3) {
    return { icone: "💧", texto: "Granação — chuva enche o grão", nivel: "info" };
  }

  // Talhões em formação — quantos anos até produzir?
  const emFormacao = talhoes.filter((t) => t.variedadeId && t.idadeAnos < ANOS_FORMACAO);
  if (emFormacao.length > 0) {
    const maisVelho = Math.max(...emFormacao.map((t) => t.idadeAnos));
    const faltam = ANOS_FORMACAO - maisVelho;
    return {
      icone: "🌱",
      texto: `${faltam} ano(s) pra lavoura jovem produzir`,
      nivel: "info",
    };
  }

  // Talhão em recuperação?
  const recup = talhoes.filter((t) => t.estado && t.estado !== "normal");
  if (recup.length > 0) {
    const minDias = Math.min(...recup.map((t) => t.diasRecuperacao));
    return {
      icone: "🛌",
      texto: `Recuperação em ${recup.length} talhão — ${minDias}d restantes`,
      nivel: "info",
    };
  }

  // Janela de colheita em X meses
  const proxMes = tempo.mes < 5 ? 5 - tempo.mes : tempo.mes > 8 ? 12 - tempo.mes + 5 : 0;
  if (proxMes > 0) {
    return {
      icone: "📅",
      texto: `Próxima colheita em ~${proxMes} ${proxMes === 1 ? "mês" : "meses"}`,
      nivel: "info",
    };
  }

  return { icone: "📅", texto: "Entressafra", nivel: "info" };
}

/* ---------- Alertas críticos (lista) ---------- */
export function calcularAlertas(state) {
  if (!state) return [];
  const alertas = [];

  // 🔴 Caixa baixo
  if (state.caixa < 0) {
    alertas.push({ nivel: "critico", texto: `💸 Caixa negativo: R$${state.caixa}` });
  } else if (state.caixa < 1000) {
    alertas.push({ nivel: "critico", texto: `⚠️ Caixa baixo: R$${state.caixa}` });
  }

  // 🦋 Pragas em talhões (com ou sem amostragem)
  const comPragas = state.talhoes.filter(
    (t) => Object.keys(t.pragas || {}).length > 0
  );
  if (comPragas.length > 0) {
    alertas.push({
      nivel: "aviso",
      texto: `🐛 Pragas em ${comPragas.length} talhão(ões)`,
    });
  }

  // 🌱 Sanidade baixa em algum talhão
  const sanidadeBaixa = state.talhoes.filter(
    (t) => t.variedadeId && t.sanidade < 0.4 && t.estado === "normal"
  );
  if (sanidadeBaixa.length > 0) {
    alertas.push({
      nivel: "aviso",
      texto: `🌾 Sanidade baixa em ${sanidadeBaixa.length} talhão(ões)`,
    });
  }

  // ⚠️ Veranico longo durante janela de florada
  if (state.tempo.mes >= 9 && state.tempo.mes <= 10) {
    const veranico = state.talhoes.find(
      (t) => (t.ciclo?.diasSemChuva || 0) >= VERANICO_DIAS_MIN
    );
    if (veranico) {
      alertas.push({
        nivel: "info",
        texto: `🌧️ Veranico ativo — café pronto pra florar`,
      });
    }
  }

  // 💔 Florada perdida (janela passou sem florada principal)
  if (state.tempo.mes === 11) {
    const semFlorada = state.talhoes.filter(
      (t) =>
        t.variedadeId &&
        t.idadeAnos >= ANOS_FORMACAO &&
        !t.ciclo?.floradaPrincipalOk
    );
    if (semFlorada.length > 0) {
      alertas.push({
        nivel: "critico",
        texto: `💔 Florada perdida em ${semFlorada.length} talhão(ões)`,
      });
    }
  }

  return alertas;
}

/* ---------- Rótulo curto da estação/fase atual (pro menu) ---------- */
// Usado no resumo do "Continuar". Prioriza as fases ativas; senão,
// deriva da janela do calendário do café.
export function rotuloEstacao(state) {
  if (!state) return "";
  if (state.fase === "secagem") return "🌡️ Secagem";
  if (state.fase === "aguardando_pos") return "🍒 Pós-colheita";
  const m = state.tempo?.mes ?? 1;
  if (m >= 5 && m <= 8) return "🍒 Colheita";
  if (m === 9 || m === 10) return "🌸 Florada";
  if (m >= 1 && m <= 3) return "💧 Granação";
  return "🌱 Vegetativo";
}

/* ---------- Saúde geral da fazenda ---------- */
export function saudeFazenda(state) {
  const alertas = calcularAlertas(state);
  if (alertas.some((a) => a.nivel === "critico")) return "ruim";
  if (alertas.some((a) => a.nivel === "aviso")) return "atencao";
  return "boa";
}

/* ---------- Estatísticas rápidas ---------- */
export function totalSacasEstoque(state) {
  return state.estoqueSacas.reduce((acc, l) => acc + l.sacas, 0);
}

export function totalTalhoesComPragas(state) {
  return state.talhoes.filter(
    (t) => Object.keys(t.pragas || {}).length > 0
  ).length;
}
