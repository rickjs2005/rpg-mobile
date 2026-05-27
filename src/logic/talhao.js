/* ============================================================
   TALHÃO — criação, plantio, formação, manejo.
   Talhão é a unidade abstrata (sem simular pé a pé).
   Estado mutado SEMPRE via funções puras (retorna talhão novo).

   Lote A adicionou:
   - cicloBienal ('alta' | 'baixa') — alterna a cada safra
   - efeitosPendentes [] — timers (ex: calagem 90 dias)
   - fatorIdadeProdutiva() — curva pico/estável/declínio
   - fatorBienalidade() — multiplier alta/baixa por variedade
   ============================================================ */

import {
  ANOS_FORMACAO,
  SANIDADE_INICIAL,
  SANIDADE_MAX,
  SANIDADE_MIN,
  PES_POR_HECTARE,
  LIMITE_INCLINACAO_MONTANHOSO,
  DIAS_EFEITO_CALCARIO,
  AMPLITUDE_BIENAL_PADRAO,
  IDADE_PICO_INI,
  IDADE_PICO_FIM,
  IDADE_ESTAVEL_FIM,
  FATOR_PICO,
  FATOR_ESTAVEL,
  FATOR_DECLINIO_POR_ANO,
  FATOR_MIN,
  ESQUELETAMENTO,
  RECEPA,
  DENSIDADES,
} from "../data/constantes.js";
import { VARIEDADES } from "../data/cafe.js";
import { cicloVazio, cicloProduzindoSafra } from "./ciclo.js";

let proximoId = 1;
export function gerarIdTalhao() {
  return `t${Date.now().toString(36)}${proximoId++}`;
}

export function classificarTerreno(inclinacao) {
  return inclinacao > LIMITE_INCLINACAO_MONTANHOSO ? "montanhoso" : "plano";
}

export function criarTalhao(opts) {
  const terreno = opts.terreno || classificarTerreno(opts.inclinacao || 0);
  return {
    id: gerarIdTalhao(),
    variedadeId: opts.variedadeId || null,
    hectares: opts.hectares,
    pes: opts.pes || 0,
    terreno,
    inclinacao: opts.inclinacao ?? (terreno === "montanhoso" ? 0.22 : 0.07),
    idadeAnos: opts.idadeAnos || 0,
    sanidade: opts.sanidade ?? 0,
    cicloBienal: opts.cicloBienal || "alta",
    efeitosPendentes: opts.efeitosPendentes || [],
    // Lote B: estado de renovação. 'normal' | 'recuperando_esqueletamento' | 'recuperando_recepa'
    estado: opts.estado || "normal",
    diasRecuperacao: opts.diasRecuperacao || 0,
    // Lote C: ciclo fenológico. Já-formado começa com safra encaminhada;
    // vazio/formando começa zerado.
    ciclo:
      opts.ciclo ||
      (opts.variedadeId && (opts.idadeAnos || 0) >= ANOS_FORMACAO
        ? cicloProduzindoSafra()
        : cicloVazio()),
    // Lote D: pragas ativas + amostragem revelada
    pragas: opts.pragas || {},
    amostragem: opts.amostragem || {},
    // Lote H5: irrigação instalada
    irrigado: opts.irrigado || false,
    // Lote H8: densidade de plantio
    densidade: opts.densidade || "tradicional",
    // Lote H9: sombreado vs sol pleno
    sombreado: opts.sombreado || false,
    // Mato/capina: 0 (limpo) a 1 (tomado). Cresce com a chuva.
    mato: opts.mato || 0,
  };
}

// Planta variedade num talhão vazio. Calcula nº de pés via densidade × espécie.
// Lote H8: aceita densidade ("tradicional" | "adensado" | "super").
export function plantarTalhao(talhao, variedadeId, densidadeId = "tradicional", sombreado = false) {
  if (talhao.variedadeId) return talhao;
  if (!VARIEDADES[variedadeId]) return talhao;
  const especie = VARIEDADES[variedadeId].especie;
  const densidadePadrao = PES_POR_HECTARE[especie] || 3000;
  const mult = DENSIDADES[densidadeId]?.multiplicadorPes || 1.0;
  return {
    ...talhao,
    variedadeId,
    pes: Math.round(talhao.hectares * densidadePadrao * mult),
    idadeAnos: 0,
    sanidade: SANIDADE_INICIAL,
    cicloBienal: "alta",
    efeitosPendentes: [],
    ciclo: cicloVazio(),
    densidade: densidadeId,
    sombreado,
  };
}

export function estaFormado(talhao) {
  return !!talhao.variedadeId && talhao.idadeAnos >= ANOS_FORMACAO;
}

export function envelhecerTalhao(talhao, anos) {
  if (!talhao.variedadeId) return talhao;
  return {
    ...talhao,
    idadeAnos: talhao.idadeAnos + anos,
    // Decaimento natural sem manejo. Manejo (insumos) repõe.
    sanidade: clamp(talhao.sanidade - 0.05 * anos),
  };
}

// Aplica insumo. Calcário tem efeito ATRASADO (vai pra fila),
// adubo e defensivo são imediatos.
export function aplicarInsumo(talhao, insumoId) {
  if (!talhao.variedadeId) return talhao;
  if (insumoId === "calcario") {
    return {
      ...talhao,
      efeitosPendentes: [
        ...(talhao.efeitosPendentes || []),
        {
          tipo: "calcario",
          diasRestantes: DIAS_EFEITO_CALCARIO,
          ganhoSanidade: 0.18,
        },
      ],
    };
  }
  const ganhoImediato = { adubo: 0.25, defensivo: 0.1 }[insumoId] || 0;
  return { ...talhao, sanidade: clamp(talhao.sanidade + ganhoImediato) };
}

// Avança 1 dia nos efeitos pendentes. Quando diasRestantes chega a 0,
// o efeito é aplicado e o item é removido. Retorna { talhao, eventos }.
export function avancarEfeitosPendentesUmDia(talhao) {
  if (!talhao.efeitosPendentes || talhao.efeitosPendentes.length === 0) {
    return { talhao, eventos: [] };
  }
  const eventos = [];
  const pendentes = [];
  let sanidade = talhao.sanidade;

  for (const e of talhao.efeitosPendentes) {
    const dias = e.diasRestantes - 1;
    if (dias <= 0) {
      sanidade = clamp(sanidade + (e.ganhoSanidade || 0));
      eventos.push(
        `🪨 Calcário fez efeito num talhão (+${Math.round((e.ganhoSanidade || 0) * 100)}% sanidade).`
      );
    } else {
      pendentes.push({ ...e, diasRestantes: dias });
    }
  }
  return {
    talhao: { ...talhao, sanidade, efeitosPendentes: pendentes },
    eventos,
  };
}

// Alterna o ciclo bienal (chamado após cada colheita).
export function flipBienal(talhao) {
  const proximo = talhao.cicloBienal === "alta" ? "baixa" : "alta";
  return { ...talhao, cicloBienal: proximo };
}

// Multiplier de produção pela bienalidade da variedade.
export function fatorBienalidade(talhao) {
  const variedade = VARIEDADES[talhao.variedadeId];
  const amp = variedade?.amplitudeBienal ?? 1.0;
  return (talhao.cicloBienal || "alta") === "alta"
    ? 1 + AMPLITUDE_BIENAL_PADRAO * amp
    : 1 - AMPLITUDE_BIENAL_PADRAO * amp;
}

// Multiplier pela idade: 0-3 nada, 4-6 pico, 7-15 estável, depois decaí.
// Lote H8: densidade alta antecipa o início do declínio.
export function fatorIdadeProdutiva(idadeAnos, densidadeId = "tradicional") {
  const antecipa = DENSIDADES[densidadeId]?.declinioAntecipadoAnos || 0;
  const estavelFim = IDADE_ESTAVEL_FIM - antecipa;
  if (idadeAnos < IDADE_PICO_INI) return 0;
  if (idadeAnos <= IDADE_PICO_FIM) return FATOR_PICO;
  if (idadeAnos <= estavelFim) return FATOR_ESTAVEL;
  const anosDecaindo = idadeAnos - estavelFim;
  return Math.max(FATOR_MIN, FATOR_ESTAVEL - anosDecaindo * FATOR_DECLINIO_POR_ANO);
}

// Categoria textual da idade — usado pela UI.
export function categoriaIdade(idadeAnos, densidadeId = "tradicional") {
  const antecipa = DENSIDADES[densidadeId]?.declinioAntecipadoAnos || 0;
  const estavelFim = IDADE_ESTAVEL_FIM - antecipa;
  if (idadeAnos < IDADE_PICO_INI) return "formação";
  if (idadeAnos <= IDADE_PICO_FIM) return "pico produtivo";
  if (idadeAnos <= estavelFim) return "estável";
  return "declínio";
}

/* ---------- Lote B: Renovação (podas drásticas) ---------- */

export function estaEmRecuperacao(talhao) {
  return talhao.estado === "recuperando_esqueletamento" || talhao.estado === "recuperando_recepa";
}

export function podeSerEsqueletado(talhao) {
  return (
    !!talhao.variedadeId &&
    !estaEmRecuperacao(talhao) &&
    talhao.idadeAnos >= ESQUELETAMENTO.idadeMinima
  );
}

export function podeSerRecepado(talhao) {
  return (
    !!talhao.variedadeId &&
    !estaEmRecuperacao(talhao) &&
    talhao.idadeAnos >= RECEPA.idadeMinima
  );
}

export function iniciarEsqueletamento(talhao) {
  return {
    ...talhao,
    estado: "recuperando_esqueletamento",
    diasRecuperacao: ESQUELETAMENTO.duracaoDias,
    sanidade: ESQUELETAMENTO.sanidadeAposIniciar,
  };
}

export function iniciarRecepa(talhao) {
  return {
    ...talhao,
    estado: "recuperando_recepa",
    diasRecuperacao: RECEPA.duracaoDias,
    sanidade: RECEPA.sanidadeAposIniciar,
  };
}

// Avança 1 dia na recuperação. Quando chega a 0, planta "volta" produzindo.
// Retorna { talhao, eventos }.
export function avancarRecuperacaoUmDia(talhao) {
  if (!estaEmRecuperacao(talhao)) return { talhao, eventos: [] };

  const diasNovos = talhao.diasRecuperacao - 1;
  if (diasNovos > 0) {
    return {
      talhao: { ...talhao, diasRecuperacao: diasNovos },
      eventos: [],
    };
  }

  // Terminou — talhão volta ao "normal"
  if (talhao.estado === "recuperando_esqueletamento") {
    return {
      talhao: {
        ...talhao,
        estado: "normal",
        diasRecuperacao: 0,
        sanidade: ESQUELETAMENTO.sanidadeAposVoltar,
      },
      eventos: [`✂️ Talhão esqueletado voltou a produzir!`],
    };
  }
  // recepa
  return {
    talhao: {
      ...talhao,
      estado: "normal",
      diasRecuperacao: 0,
      sanidade: RECEPA.sanidadeAposVoltar,
      idadeAnos: RECEPA.idadeAposVoltar,
      cicloBienal: "alta", // renovação reseta o ciclo
    },
    eventos: [`🌱 Talhão recepado renasceu — produção recomeça!`],
  };
}

function clamp(v) {
  return Math.max(SANIDADE_MIN, Math.min(SANIDADE_MAX, v));
}
