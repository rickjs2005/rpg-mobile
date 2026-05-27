/* ============================================================
   NÍVEIS & XP — progressão da roça.
   XP vem de VENDER sacas (+ bônus de marcos). Subir de nível
   desbloqueia variedades, equipamentos e propriedades.
   Funções puras (testáveis). Certificações NÃO são travadas por
   nível (só por dinheiro/transição).
   ============================================================ */

// XP ganho
export const XP_POR_SACA = 5;
export const XP_MARCO = 50;
export function xpVender(sacas) {
  return Math.max(0, Math.round((sacas || 0) * XP_POR_SACA));
}

// Curva de níveis (xpNecessario = XP acumulado mínimo).
export const NIVEIS = [
  { nivel: 1, xpNecessario: 0, titulo: "Roceiro" },
  { nivel: 2, xpNecessario: 150, titulo: "Meeiro" },
  { nivel: 3, xpNecessario: 450, titulo: "Cafeicultor" },
  { nivel: 4, xpNecessario: 1000, titulo: "Produtor" },
  { nivel: 5, xpNecessario: 2000, titulo: "Mestre do Café" },
];

export function nivelPorXp(xp) {
  const x = xp || 0;
  let atual = NIVEIS[0];
  for (const n of NIVEIS) if (x >= n.xpNecessario) atual = n;
  return atual;
}
export function proximoNivel(xp) {
  const atual = nivelPorXp(xp);
  return NIVEIS.find((n) => n.nivel === atual.nivel + 1) || null;
}
export function progressoNivel(xp) {
  const x = xp || 0;
  const atual = nivelPorXp(x);
  const prox = proximoNivel(x);
  if (!prox) return { atual, prox: null, frac: 1, faltam: 0 };
  const base = atual.xpNecessario;
  const frac = (x - base) / (prox.xpNecessario - base);
  return { atual, prox, frac: Math.max(0, Math.min(1, frac)), faltam: prox.xpNecessario - x };
}

/* ---------- Desbloqueios por nível ---------- */
export const NIVEL_VARIEDADE = {
  catuai_vermelho: 1,
  catuai_amarelo: 1,
  mundo_novo: 1,
  catucai: 2,
  paraiso: 2,
  arara: 3,
  topazio: 3,
  acaia: 3,
  bourbon_amarelo: 4,
  bourbon_vermelho: 4,
  conilon: 5,
};
export const NIVEL_EQUIPAMENTO = { trator: 2, secador: 2, drone: 3, colhedora: 4 };
export const NIVEL_PROPRIEDADE = {
  sitio_baixada: 2,
  ladeira_serra: 2,
  fazenda_velha: 4,
  morro_arabica: 4,
};

export function nivelRequerido(mapa, id) {
  return mapa[id] || 1;
}
export function desbloqueado(mapa, id, nivelAtual) {
  return (mapa[id] || 1) <= nivelAtual;
}
