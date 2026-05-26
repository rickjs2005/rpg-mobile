/* ============================================================
   DADOS — pragas e doenças do cafeeiro (Lote D).
   Cada praga tem janela sazonal, clima favorável, prob de spawn
   diário, dano semanal, e se há defesa via variedade resistente.
   ============================================================ */

export const PRAGAS = {
  bicho_mineiro: {
    nome: "Bicho-mineiro",
    icone: "🦋",
    tipo: "praga",
    estacoes: [6, 7, 8, 9],            // jun-set, estiagem
    climaFavorece: ["sol"],
    probSpawnDia: 0.018,
    danoSanidadeSemana: 0.04,
    afetadoPorDefensivo: true,
    afetadoPorResistencia: false,
    desc: "Lagarta mina folhas e derruba folhagem — reduz fotossíntese.",
  },
  broca: {
    nome: "Broca-do-café",
    icone: "🪲",
    tipo: "praga",
    estacoes: [11, 12, 1, 2, 3, 4],
    climaFavorece: ["chuva", "nublado"],
    probSpawnDia: 0.012,
    danoSanidadeSemana: 0.02,
    defeitoBrocadoSemana: 0.05,        // 5% chance/sem de defeito brocado por dia ativo
    afetadoPorDefensivo: true,
    afetadoPorResistencia: false,
    desc: "Besouro perfura o grão — gera defeito 'brocado' no lote final.",
  },
  cigarrinha: {
    nome: "Cigarrinha",
    icone: "🦗",
    tipo: "praga",
    estacoes: [10, 11, 12, 1, 2, 3],
    climaFavorece: ["chuva"],
    probSpawnDia: 0.010,
    danoSanidadeSemana: 0.025,
    afetadoPorDefensivo: true,
    afetadoPorResistencia: false,
    desc: "Suga seiva, debilita a planta.",
  },
  ferrugem: {
    nome: "Ferrugem",
    icone: "🍂",
    tipo: "doenca",
    estacoes: [12, 1, 2, 3, 4, 5],
    climaFavorece: ["chuva", "nublado"],
    probSpawnDia: 0.028,
    danoSanidadeSemana: 0.06,
    afetadoPorDefensivo: true,
    afetadoPorResistencia: true,       // variedade resistente bloqueia muito
    desc: "Hemileia vastatrix — mancha amarela, derruba folhas. Catastrófica em variedade sensível.",
  },
  cercosporiose: {
    nome: "Cercosporiose",
    icone: "🟤",
    tipo: "doenca",
    estacoes: [9, 10, 11, 12, 1, 2],
    climaFavorece: ["chuva"],
    probSpawnDia: 0.015,
    danoSanidadeSemana: 0.03,
    requisito: { sanidadeAbaixoDe: 0.6 }, // só ataca lavoura mal nutrida
    afetadoPorDefensivo: true,
    afetadoPorResistencia: false,
    desc: "Ataca lavoura mal nutrida. Aduba bem e ela some.",
  },
  phoma: {
    nome: "Mancha-de-phoma",
    icone: "⚫",
    tipo: "doenca",
    estacoes: [7, 8, 9],
    climaFavorece: ["nublado"],
    probSpawnDia: 0.012,
    danoSanidadeSemana: 0.03,
    afetadoPorDefensivo: true,
    afetadoPorResistencia: false,
    desc: "Frio + umidade na altitude. Lesões em folhas e ramos.",
  },
};

// Nível mostrado na UI (1-5). Calculado a partir de diasAtivos.
export function nivelPraga(diasAtivos) {
  if (diasAtivos <= 3) return 1;
  if (diasAtivos <= 7) return 2;
  if (diasAtivos <= 14) return 3;
  if (diasAtivos <= 25) return 4;
  return 5;
}
