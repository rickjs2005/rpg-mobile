/* ============================================================
   MISSÕES / CONTRATOS — metas ativas com prazo aberto + recompensa.
   Dão direção ao jogo ("só mais uma safra"). O jogador mantém 3
   ativas; ao concluir uma, a próxima do pool entra no lugar.
   Cada missão tem meta(state) → { atual, alvo } (progresso) e
   recompensa { caixa, xp }. Funções puras.
   ============================================================ */

import { ANOS_FORMACAO } from "./constantes.js";

const formados = (s) =>
  (s.talhoes || []).filter((t) => t.variedadeId && t.idadeAnos >= ANOS_FORMACAO).length;
const certsAtivas = (s) =>
  Object.values(s.certificacoes || {}).filter((c) => c.ativa).length;
const sacasVendidas = (s) => s.stats?.sacasVendidasTotal || 0;
const melhorSca = (s) => s.stats?.melhorLote?.sca || 0;

// Pool ordenado do mais fácil ao mais difícil.
export const MISSOES = [
  { id: "colher1", icone: "🍒", titulo: "Primeira safra", desc: "Venda 10 sacas de café", meta: (s) => ({ atual: sacasVendidas(s), alvo: 10 }), recompensa: { caixa: 500, xp: 30 } },
  { id: "equip1", icone: "🚜", titulo: "Mecanizar", desc: "Compre seu 1º equipamento", meta: (s) => ({ atual: s.equipamentos?.length || 0, alvo: 1 }), recompensa: { caixa: 800, xp: 40 } },
  { id: "sca80", icone: "⭐", titulo: "Café premium", desc: "Produza um lote SCA ≥ 80", meta: (s) => ({ atual: melhorSca(s), alvo: 80 }), recompensa: { caixa: 2000, xp: 80 } },
  { id: "vender50", icone: "📦", titulo: "Sacaria cheia", desc: "Venda 50 sacas no total", meta: (s) => ({ atual: sacasVendidas(s), alvo: 50 }), recompensa: { caixa: 1500, xp: 60 } },
  { id: "talhoes2", icone: "🌳", titulo: "Expandir a roça", desc: "Tenha 2 talhões produzindo", meta: (s) => ({ atual: formados(s), alvo: 2 }), recompensa: { caixa: 1000, xp: 50 } },
  { id: "cert1", icone: "🏅", titulo: "Selo de qualidade", desc: "Conquiste uma certificação", meta: (s) => ({ atual: certsAtivas(s), alvo: 1 }), recompensa: { caixa: 1500, xp: 60 } },
  { id: "microlote", icone: "🌟", titulo: "Microlote especial", desc: "Feche um lote SCA ≥ 85", meta: (s) => ({ atual: melhorSca(s), alvo: 85 }), recompensa: { caixa: 3000, xp: 120 } },
  { id: "terra1", icone: "🗺️", titulo: "Comprar terra", desc: "Adquira uma nova propriedade", meta: (s) => ({ atual: s.propriedadesCompradas?.length || 0, alvo: 1 }), recompensa: { caixa: 1000, xp: 60 } },
  { id: "caixa30k", icone: "💰", titulo: "Capitalizar", desc: "Acumule R$ 30.000 em caixa", meta: (s) => ({ atual: Math.max(0, s.caixa || 0), alvo: 30000 }), recompensa: { caixa: 0, xp: 100 } },
  { id: "vender200", icone: "📦", titulo: "Produtor de respeito", desc: "Venda 200 sacas no total", meta: (s) => ({ atual: sacasVendidas(s), alvo: 200 }), recompensa: { caixa: 4000, xp: 150 } },
  { id: "vender500", icone: "🏭", titulo: "Grande safra", desc: "Venda 500 sacas no total", meta: (s) => ({ atual: sacasVendidas(s), alvo: 500 }), recompensa: { caixa: 8000, xp: 250 } },
  { id: "sca90", icone: "🏆", titulo: "Café exemplar", desc: "Produza um lote SCA ≥ 90", meta: (s) => ({ atual: melhorSca(s), alvo: 90 }), recompensa: { caixa: 10000, xp: 300 } },
];

export const MISSOES_INICIAIS = ["colher1", "equip1", "sca80"];

export function missaoPorId(id) {
  return MISSOES.find((m) => m.id === id) || null;
}

export function infoMissao(def, state) {
  const { atual, alvo } = def.meta(state);
  return {
    atual,
    alvo,
    frac: alvo ? Math.max(0, Math.min(1, atual / alvo)) : 0,
    completa: atual >= alvo,
  };
}

// Próxima missão do pool ainda não concluída e não ativa.
export function proximaMissao(ativas, completadas) {
  return (
    MISSOES.find((m) => !completadas[m.id] && !ativas.includes(m.id))?.id || null
  );
}
