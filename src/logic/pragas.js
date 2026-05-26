/* ============================================================
   PRAGAS — sorteio diário de spawn + dano contínuo.
   Função pura. RNG passado de fora pro sortear seedável.
   ============================================================ */

import { PRAGAS } from "../data/pragas.js";
import { VARIEDADES } from "../data/cafe.js";
import { SOMBREAMENTO } from "../data/constantes.js";

// Tenta spawnar pragas no talhão hoje. Retorna { talhao, eventos }.
export function tentarSpawnPragasDia(rng, talhao, mes, climaTipo) {
  if (!talhao.variedadeId) return { talhao, eventos: [] };
  const variedade = VARIEDADES[talhao.variedadeId];
  const pragasAtuais = talhao.pragas || {};
  const eventos = [];
  let novasPragas = pragasAtuais;
  let mudou = false;

  for (const [pragaId, praga] of Object.entries(PRAGAS)) {
    // Já tem? incrementa diasAtivos no fim do loop
    if (pragasAtuais[pragaId]) continue;
    // Estação errada?
    if (!praga.estacoes.includes(mes)) continue;
    // Clima desfavorável?
    if (!praga.climaFavorece.includes(climaTipo)) continue;
    // Requisito de sanidade baixa (cercospora)?
    if (praga.requisito?.sanidadeAbaixoDe !== undefined) {
      if (talhao.sanidade >= praga.requisito.sanidadeAbaixoDe) continue;
    }
    // Variedade resistente reduz a prob (ferrugem)?
    let prob = praga.probSpawnDia;
    if (praga.afetadoPorResistencia && variedade?.resistenciaFerrugem) {
      prob = prob * (1 - variedade.resistenciaFerrugem);
    }
    // Lote H9: sombreamento reduz spawn (microclima desfavorece pragas)
    if (talhao.sombreado) prob *= SOMBREAMENTO.reducaoPragas;
    // Sorteia
    if (rng.chance(prob)) {
      if (!mudou) {
        novasPragas = { ...pragasAtuais };
        mudou = true;
      }
      novasPragas[pragaId] = { diasAtivos: 1 };
      eventos.push(`${praga.icone} ${praga.nome} apareceu num talhão.`);
    }
  }

  if (!mudou) return { talhao, eventos };
  return { talhao: { ...talhao, pragas: novasPragas }, eventos };
}

// Aplica dano diário de todas as pragas ativas + incrementa diasAtivos.
export function aplicarDanoPragasDia(talhao) {
  const pragasAtuais = talhao.pragas || {};
  const ids = Object.keys(pragasAtuais);
  if (ids.length === 0) return { talhao, eventos: [] };

  let sanidade = talhao.sanidade;
  const novasPragas = {};
  for (const id of ids) {
    const praga = PRAGAS[id];
    const danoDiario = (praga.danoSanidadeSemana || 0) / 7;
    sanidade = Math.max(0, sanidade - danoDiario);
    novasPragas[id] = { diasAtivos: pragasAtuais[id].diasAtivos + 1 };
  }
  return {
    talhao: { ...talhao, sanidade, pragas: novasPragas },
    eventos: [],
  };
}

// Limpa todas as pragas do talhão (efeito do defensivo).
export function zerarPragas(talhao) {
  return { ...talhao, pragas: {} };
}

// Quantos % de defeitos brocados o lote vai ter, dado o quanto a broca
// agiu no talhão. Usado na panha.
export function fatorDefeitoBroca(talhao) {
  const broca = talhao.pragas?.broca;
  if (!broca) return 0;
  // 5% por semana de atividade, cap em 25%
  return Math.min(0.25, (broca.diasAtivos / 7) * 0.05);
}

// Existe alguma praga não revelada por amostragem? Pra a UI mostrar
// "sintomas estranhos" sem dar o nome.
export function temPragaNaoRevelada(talhao) {
  const ativas = Object.keys(talhao.pragas || {});
  const reveladas = Object.keys(talhao.amostragem || {});
  return ativas.some((p) => !reveladas.includes(p));
}

// Revela todas as pragas ativas no talhão (resultado da amostragem).
export function amostrarTalhao(talhao) {
  return { ...talhao, amostragem: { ...(talhao.pragas || {}) } };
}
