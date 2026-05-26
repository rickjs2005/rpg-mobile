/* ============================================================
   MARCOS — metas/achievements desbloqueáveis (Lote G7).
   Condições são funções puras sobre state. O reducer verifica
   após cada ação e dispara evento quando algum marco completa.
   ============================================================ */

export const MARCOS = [
  /* ---------- Plantio ---------- */
  {
    id: "primeira_semente",
    nome: "Primeira semente",
    desc: "Plantou sua primeira variedade.",
    icone: "🌱",
    categoria: "Plantio",
    condicao: (s) => s.talhoes.some((t) => t.variedadeId),
  },
  {
    id: "colecao_bourbon",
    nome: "Coleção Bourbon",
    desc: "Plantou Bourbon Amarelo E Vermelho na mesma fazenda.",
    icone: "☕",
    categoria: "Plantio",
    condicao: (s) =>
      s.talhoes.some((t) => t.variedadeId === "bourbon_amarelo") &&
      s.talhoes.some((t) => t.variedadeId === "bourbon_vermelho"),
  },
  {
    id: "diversificou",
    nome: "Diversificou",
    desc: "Plantou 3 variedades diferentes na fazenda.",
    icone: "🎨",
    categoria: "Plantio",
    condicao: (s) => {
      const variedades = new Set(s.talhoes.filter((t) => t.variedadeId).map((t) => t.variedadeId));
      return variedades.size >= 3;
    },
  },

  /* ---------- Colheita ---------- */
  {
    id: "primeira_safra",
    nome: "Primeira safra",
    desc: "Colheu seu primeiro talhão.",
    icone: "🍒",
    categoria: "Colheita",
    condicao: (s) => (s.stats?.vendasCount || 0) > 0 || s.estoqueSacas.length > 0 || s.fase === "aguardando_pos" || s.fase === "secagem",
  },

  /* ---------- Mercado ---------- */
  {
    id: "primeira_venda",
    nome: "Primeira venda",
    desc: "Vendeu seu primeiro lote no Mercado.",
    icone: "💰",
    categoria: "Mercado",
    condicao: (s) => (s.stats?.vendasCount || 0) >= 1,
  },
  {
    id: "saco_cheio",
    nome: "Saco cheio",
    desc: "Vendeu 100 sacas no total.",
    icone: "📦",
    categoria: "Mercado",
    condicao: (s) => (s.stats?.sacasVendidasTotal || 0) >= 100,
  },
  {
    id: "mil_sacas",
    nome: "Mil sacas",
    desc: "Vendeu 1.000 sacas no total.",
    icone: "📦📦",
    categoria: "Mercado",
    condicao: (s) => (s.stats?.sacasVendidasTotal || 0) >= 1000,
  },
  {
    id: "primeira_fortuna",
    nome: "Primeira fortuna",
    desc: "Caixa atingiu R$ 50.000.",
    icone: "💵",
    categoria: "Mercado",
    condicao: (s) => s.caixa >= 50000,
  },
  {
    id: "cem_mil",
    nome: "Cem mil",
    desc: "Caixa atingiu R$ 100.000.",
    icone: "💎",
    categoria: "Mercado",
    condicao: (s) => s.caixa >= 100000,
  },
  {
    id: "meio_milhao",
    nome: "Meio milhão",
    desc: "Lucro líquido (receita − despesa) atingiu R$ 500.000.",
    icone: "🏆",
    categoria: "Mercado",
    condicao: (s) =>
      (s.stats?.receitaTotal || 0) - (s.stats?.despesaTotal || 0) >= 500000,
  },

  /* ---------- Microlote ---------- */
  {
    id: "cafe_premium",
    nome: "Café premium",
    desc: "Vendeu lote com SCA ≥ 80 (Premium).",
    icone: "⭐",
    categoria: "Microlote",
    condicao: (s) => (s.stats?.melhorLote?.sca || 0) >= 80,
  },
  {
    id: "primeiro_microlote",
    nome: "Primeiro microlote",
    desc: "Vendeu lote com SCA ≥ 85 (Especial).",
    icone: "⭐⭐",
    categoria: "Microlote",
    condicao: (s) => (s.stats?.melhorLote?.sca || 0) >= 85,
  },
  {
    id: "exemplar",
    nome: "Exemplar",
    desc: "Vendeu lote com SCA ≥ 90 (raríssimo).",
    icone: "🌟",
    categoria: "Microlote",
    condicao: (s) => (s.stats?.melhorLote?.sca || 0) >= 90,
  },

  /* ---------- Equipamentos ---------- */
  {
    id: "mecanizacao",
    nome: "Mecanização",
    desc: "Comprou seu primeiro equipamento.",
    icone: "🚜",
    categoria: "Equipamentos",
    condicao: (s) => s.equipamentos.length >= 1,
  },
  {
    id: "frota_completa",
    nome: "Frota completa",
    desc: "Possui trator + drone + secador + colhedora.",
    icone: "🏭",
    categoria: "Equipamentos",
    condicao: (s) =>
      ["trator", "drone", "secador", "colhedora"].every((e) =>
        s.equipamentos.includes(e)
      ),
  },

  /* ---------- Expansão ---------- */
  {
    id: "cresceu",
    nome: "Cresceu",
    desc: "Tem 2 ou mais talhões.",
    icone: "🌳",
    categoria: "Expansão",
    condicao: (s) => s.talhoes.length >= 2,
  },
  {
    id: "latifundio",
    nome: "Latifúndio",
    desc: "Tem 5 ou mais talhões.",
    icone: "🏞️",
    categoria: "Expansão",
    condicao: (s) => s.talhoes.length >= 5,
  },
  {
    id: "vizinhanca_toda",
    nome: "Vizinhança toda",
    desc: "Comprou todas as propriedades disponíveis (4).",
    icone: "🗺️",
    categoria: "Expansão",
    condicao: (s) => (s.propriedadesCompradas?.length || 0) >= 4,
  },

  /* ---------- Certificações ---------- */
  {
    id: "sustentavel",
    nome: "Sustentável",
    desc: "Aderiu sua primeira certificação.",
    icone: "🌳",
    categoria: "Certificações",
    condicao: (s) =>
      Object.values(s.certificacoes || {}).some(
        (c) => c.ativa || c.emTransicao
      ),
  },
  {
    id: "trio_dourado",
    nome: "Trio dourado",
    desc: "Possui as 3 certificações ATIVAS (Rainforest + Fair Trade + Orgânico).",
    icone: "🥇",
    categoria: "Certificações",
    condicao: (s) =>
      ["rainforest", "fairtrade", "organico"].every(
        (id) => s.certificacoes?.[id]?.ativa
      ),
  },

  /* ---------- Manejo ---------- */
  {
    id: "renovou",
    nome: "Renovou",
    desc: "Fez sua primeira recepa de lavoura.",
    icone: "🪓",
    categoria: "Manejo",
    condicao: (s) =>
      s.talhoes.some(
        (t) =>
          t.estado === "recuperando_recepa" ||
          (t.idadeAnos <= 3 && t.sanidade >= 0.8 && t.variedadeId)
      ),
  },

  /* ---------- Tempo ---------- */
  {
    id: "veterano",
    nome: "Veterano",
    desc: "Completou 5 anos como cafeicultor.",
    icone: "⌛",
    categoria: "Tempo",
    condicao: (s) => s.tempo.ano >= 5,
  },
  {
    id: "lenda",
    nome: "Lenda",
    desc: "Completou 10 anos como cafeicultor.",
    icone: "👑",
    categoria: "Tempo",
    condicao: (s) => s.tempo.ano >= 10,
  },
];

export const CATEGORIAS_MARCOS = [
  "Plantio",
  "Colheita",
  "Mercado",
  "Microlote",
  "Equipamentos",
  "Expansão",
  "Certificações",
  "Manejo",
  "Tempo",
];
