/* ============================================================
   BEBIDA — classificação multi-dimensional (Lote E).
   Antes: score 0-1 + 5 classes simples.
   Agora: SCA pontos (60-95) + Tipo BRASIL (2-8) + Peneira (12-19)
          → preço final composto.

   Mantém função `classificarBebida` (retorna score 0-1) pra compat
   de partes que ainda consomem o score cru.
   ============================================================ */

import { METODOS_POS, VARIEDADES } from "../data/cafe.js";
import {
  TIPO_BRASIL_LIMITES,
  PRECO_TIPO_BRASIL,
  PENEIRA_AJUSTE_PRECO,
  SCA_LIMIARES,
  LIMIAR_MICROLOTE_SCA,
  SOMBREAMENTO,
} from "../data/constantes.js";
import { efeitoEquipamento } from "./equipamentos.js";

/* ---------- Score interno 0-1 (mantido pra compat) ---------- */
export function classificarBebida({ lote, talhao, equipamentos = [] }) {
  const variedade = VARIEDADES[talhao.variedadeId];
  const metodo = METODOS_POS[lote.metodoPos];
  if (!variedade || !metodo) return 0;

  const fatorPerfil =
    lote.perfilColhido.maduro * 1.0 +
    lote.perfilColhido.verde * 0.55 +
    lote.perfilColhido.seco * 0.7;

  let score =
    variedade.potencialBebida * fatorPerfil * (0.6 + 0.4 * talhao.sanidade) +
    metodo.bonusBebida;

  for (const id of equipamentos) {
    const ef = efeitoEquipamento(id, talhao.terreno);
    if (!ef) continue;
    if (ef.bonusBebida) score += ef.bonusBebida * ef.fatorTerreno;
    if (ef.penalidadeBebida) score += ef.penalidadeBebida;
  }

  const defeitoBroca = lote.defeitoBroca || 0;
  score -= defeitoBroca * 1.5;

  // Lote H9: sombreamento melhora a bebida
  if (talhao.sombreado) score += SOMBREAMENTO.bonusBebida;

  return Math.max(0, Math.min(1, score));
}

/* ---------- Defeitos equivalentes (pra tipo BRASIL) ---------- */
function calcularDefeitos(lote, talhao) {
  // Cada % de verde no saco = ~0.4 defeitos.
  // Cada % brocado = ~0.6 defeitos. Sanidade ruim adiciona "outros defeitos".
  const verdes = (lote.perfilColhido?.verde || 0) * 40;       // 0-40
  const secos  = (lote.perfilColhido?.seco || 0) * 12;        // 0-12 (seco penaliza menos)
  const brocados = (lote.defeitoBroca || 0) * 60;             // 0-15
  const outros = Math.max(0, (1 - talhao.sanidade) * 15);     // 0-15
  return Math.round(verdes + secos + brocados + outros);
}

function tipoFromDefeitos(defeitos) {
  for (const linha of TIPO_BRASIL_LIMITES) {
    if (defeitos <= linha.maxDefeitos) return linha.tipo;
  }
  return 8;
}

/* ---------- Peneira (tamanho do grão) ---------- */
function calcularPeneira(talhao) {
  const variedade = VARIEDADES[talhao.variedadeId];
  if (!variedade) return 14;
  let p = variedade.peneiraMedia || 15;
  // Granação boa → grão maior
  const granacao = talhao.ciclo?.chuvaGranacao || 0;
  if (granacao >= 280) p += 1;
  else if (granacao < 120) p -= 1;
  // Sanidade alta → grão melhor
  if (talhao.sanidade >= 0.85) p += 1;
  else if (talhao.sanidade < 0.4) p -= 1;
  return Math.max(12, Math.min(19, p));
}

/* ---------- SCA pontos (58-92) ----------
   Bar mais alto: microlote (≥85) exige score ~0.79 (antes ~0.71),
   tornando o café especial mais difícil/raro. */
function scoreSCA(scoreNormalizado) {
  return Math.round(58 + scoreNormalizado * 34);
}

function classeFromSCA(sca) {
  for (const linha of SCA_LIMIARES) {
    if (sca >= linha.min) return linha;
  }
  return SCA_LIMIARES[SCA_LIMIARES.length - 1];
}

/* ---------- Preço final ---------- */
function precoPorSaca(tipo, peneira, sca) {
  const base = PRECO_TIPO_BRASIL[tipo] || 700;
  const fatorPeneira = PENEIRA_AJUSTE_PRECO[peneira] || 1.0;
  const linhaSca = classeFromSCA(sca);
  return Math.round(base * fatorPeneira * linhaSca.mult);
}

/* ---------- API pública: tudo num só lugar ---------- */
export function classificarLote(lote, talhao, equipamentos = []) {
  const scoreNormalizado = classificarBebida({ lote, talhao, equipamentos });
  const sca = scoreSCA(scoreNormalizado);
  const defeitos = calcularDefeitos(lote, talhao);
  const tipo = tipoFromDefeitos(defeitos);
  const peneira = calcularPeneira(talhao);
  const linhaSca = classeFromSCA(sca);
  const preco = precoPorSaca(tipo, peneira, sca);
  const microlote = sca >= LIMIAR_MICROLOTE_SCA;
  return {
    sca,
    defeitos,
    tipo,
    peneira,
    classeSca: linhaSca.classe,
    classeNome: `Tipo ${tipo} · P${peneira} · ${linhaSca.classe}`,
    precoPorSaca: preco,
    microlote,
  };
}

/* ---------- Compat com Lote A-D (tabela antiga) ----------
   Quem ainda chama `consultarTabela(score)` recebe { nome, preco }
   simulando a tabela antiga.
*/
export function consultarTabela(scoreNormalizado) {
  const sca = scoreSCA(scoreNormalizado);
  const linha = classeFromSCA(sca);
  return { nome: linha.classe, preco: precoPorSaca(5, 15, sca) };
}
