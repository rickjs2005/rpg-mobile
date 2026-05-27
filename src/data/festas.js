/* ============================================================
   FESTAS & CALENDÁRIO CULTURAL — eventos anuais com efeito.
   Disparam no dia/mês marcados (durante o laço diário) e dão um
   bônus temático: XP, mercado aquecido ou desconto em insumos.
   Funções puras.
   ============================================================ */

export const FESTAS = [
  {
    id: "folia_reis",
    icone: "👑",
    nome: "Folia de Reis",
    mes: 1,
    dia: 6,
    desc: "Fé e renovação pra começar o ano na roça.",
    efeito: { tipo: "xp", valor: 50 },
  },
  {
    id: "sao_joao",
    icone: "🔥",
    nome: "Festa Junina (São João)",
    mes: 6,
    dia: 24,
    desc: "Fogueira, quadrilha e comida de tropeiro animam a colheita.",
    efeito: { tipo: "xp", valor: 40 },
  },
  {
    id: "festa_cafe",
    icone: "☕",
    nome: "Festa do Café",
    mes: 8,
    dia: 15,
    desc: "Feira agro na cidade — insumos com desconto!",
    efeito: { tipo: "descontoInsumos", valor: 0.25, duracaoDias: 30 },
  },
  {
    id: "semana_intl",
    icone: "🌍",
    nome: "Semana Internacional do Café",
    mes: 11,
    dia: 10,
    desc: "Vitrine global em Belo Horizonte aquece o mercado.",
    efeito: { tipo: "mercado", valor: 0.1 },
  },
];

export function festaDoDia(mes, dia) {
  return FESTAS.find((f) => f.mes === mes && f.dia === dia) || null;
}

// Próxima festa a partir de um mês (pra Timeline/antecipação).
export function proximaFesta(mes) {
  return (
    FESTAS.find((f) => f.mes >= mes) || FESTAS[0] || null
  );
}
