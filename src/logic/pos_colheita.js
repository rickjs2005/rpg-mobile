/* ============================================================
   PÓS-COLHEITA — secagem dia a dia.
   Lote E: CD e Lavado passam pelo lavador-sifão, separando
   o lote em cereja (denso, qualidade alta) e boia (verde+seco
   que flutuam, qualidade ruim). Natural mantém tudo junto.
   ============================================================ */

import { METODOS_POS } from "../data/cafe.js";
import { fatorSecagem } from "./clima.js";
import { METODOS_QUE_SEPARAM, FRACAO_BOIA } from "../data/constantes.js";

export const UMIDADE_INICIAL = 0.6;
export const UMIDADE_PRONTA = 0.12;

const PERDA_DIARIA_SOL_PLENO = {
  natural: (UMIDADE_INICIAL - UMIDADE_PRONTA) / 18,
  cd:      (UMIDADE_INICIAL - UMIDADE_PRONTA) / 12,
  lavado:  (UMIDADE_INICIAL - UMIDADE_PRONTA) / 10,
};

/* ---------- Lavador-sifão (Lote E) ---------- */
// Divide colheita em cereja (denso) + boia (flutua). Só usado em CD/Lavado.
// Retorna { cereja, boia } cada um com { sacas, perfilColhido, defeitoBroca }.
export function separarSifao(colheita, metodoPosId) {
  const eficiencia = FRACAO_BOIA[metodoPosId] || 0;
  const p = colheita.perfilColhido;

  // Quantos kg/sacas vão pra cada lado, baseado em quão eficiente é a separação
  // dos verdes/secos. CD captura 80%, Lavado captura 95%.
  const fracaoBoia =
    p.verde * eficiencia + p.seco * eficiencia * 0.6;
  const fracaoCereja = 1 - fracaoBoia;

  const sacasCereja = Math.round(colheita.sacas * fracaoCereja);
  const sacasBoia = colheita.sacas - sacasCereja;

  // Recalcula perfis: cereja fica concentrado em maduro; boia em verde+seco.
  // Cereja: 90% maduro, 5% verde, 5% seco
  const cereja = {
    sacas: sacasCereja,
    perfilColhido: { maduro: 0.9, verde: 0.05, seco: 0.05 },
    defeitoBroca: (colheita.defeitoBroca || 0) * 0.3, // brocados caem mais como boia
  };
  const boia = {
    sacas: sacasBoia,
    perfilColhido: { maduro: 0.1, verde: 0.55, seco: 0.35 },
    defeitoBroca: (colheita.defeitoBroca || 0) * 1.5,
  };
  return { cereja, boia };
}

/* ---------- Secagem ---------- */
export function iniciarSecagem(colheita, metodoPosId, talhaoId, variedadeId) {
  if (!METODOS_POS[metodoPosId]) return null;

  // CD ou Lavado: separa cereja antes de secar; o que vai pra secagem é só o cereja.
  // O boia é resolvido ao FINAL da secagem (vai pro estoque junto com o cereja seco).
  if (METODOS_QUE_SEPARAM.includes(metodoPosId)) {
    const { cereja, boia } = separarSifao(colheita, metodoPosId);
    return {
      sacas: cereja.sacas,
      perfilColhido: cereja.perfilColhido,
      defeitoBroca: cereja.defeitoBroca,
      // Memória do boia que será processado ao final
      boiaPendente: boia,
      metodoPos: metodoPosId,
      umidade: UMIDADE_INICIAL,
      dias: 0,
      talhaoId,
      variedadeId,
    };
  }

  // Natural: tudo junto
  return {
    sacas: colheita.sacas,
    perfilColhido: colheita.perfilColhido,
    defeitoBroca: colheita.defeitoBroca || 0,
    boiaPendente: null,
    metodoPos: metodoPosId,
    umidade: UMIDADE_INICIAL,
    dias: 0,
    talhaoId,
    variedadeId,
  };
}

export function avancarSecagemDia(lote, climaTipo, equipamentos = []) {
  const baseDiaria = PERDA_DIARIA_SOL_PLENO[lote.metodoPos] || 0.04;
  let perda = baseDiaria * fatorSecagem(climaTipo);

  if (equipamentos.includes("secador")) {
    perda = baseDiaria * 1.2;
  }

  let umidadeNova = lote.umidade - perda;
  if (umidadeNova < UMIDADE_PRONTA) umidadeNova = UMIDADE_PRONTA;
  if (umidadeNova > UMIDADE_INICIAL) umidadeNova = UMIDADE_INICIAL;

  return { ...lote, umidade: umidadeNova, dias: lote.dias + 1 };
}

export function secagemPronta(lote) {
  return lote.umidade <= UMIDADE_PRONTA;
}
