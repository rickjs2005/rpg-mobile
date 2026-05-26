/* ============================================================
   DADOS — Café: variedades e métodos de pós-colheita
   Dados puros, sem lógica. Fonte única de verdade do café.

   Campos NOVOS no Lote A:
   - amplitudeBienal: quanto a bienalidade oscila (1.0 = padrão,
     <1 = variedades estáveis tipo Topázio)
   - produtividadeBase: multiplier de sacas (1.0 = padrão)
   ============================================================ */

export const VARIEDADES = {
  /* ---------- TRADICIONAIS ---------- */
  catuai_vermelho: {
    nome: "Catuaí Vermelho",
    especie: "arabica",
    porte: "baixo",
    maturacaoBase: 0.55,
    resistenciaFerrugem: 0.3,
    potencialBebida: 0.7,
    amplitudeBienal: 1.0,
    produtividadeBase: 1.0,
    peneiraMedia: 15,
    cor: "#8B1A1A",
    desc: "O cavalo de batalha do Brasil. Equilibrado, produtivo, porte baixo facilita colheita.",
  },
  catuai_amarelo: {
    nome: "Catuaí Amarelo",
    especie: "arabica",
    porte: "baixo",
    maturacaoBase: 0.55,
    resistenciaFerrugem: 0.3,
    potencialBebida: 0.72,
    amplitudeBienal: 1.0,
    produtividadeBase: 1.0,
    peneiraMedia: 15,
    cor: "#D4A437",
    desc: "Mesma genética do Catuaí Vermelho, frutos amarelos. Levemente mais doce.",
  },
  mundo_novo: {
    nome: "Mundo Novo",
    especie: "arabica",
    porte: "alto",
    maturacaoBase: 0.6,
    resistenciaFerrugem: 0.25,
    potencialBebida: 0.72,
    amplitudeBienal: 1.1,
    produtividadeBase: 1.05,
    peneiraMedia: 16,
    cor: "#A0331A",
    desc: "Clássico, alto vigor, exige espaço. Boa produtividade, bebida mediana.",
  },

  /* ---------- BOURBON (bebida fina, baixa produção) ---------- */
  bourbon_amarelo: {
    nome: "Bourbon Amarelo",
    especie: "arabica",
    porte: "alto",
    maturacaoBase: 0.55,
    resistenciaFerrugem: 0.1,
    potencialBebida: 0.85,
    amplitudeBienal: 1.1,
    produtividadeBase: 0.82,
    peneiraMedia: 14,
    cor: "#E8B647",
    desc: "Tradicional, bebida excepcional, sensível a pragas. Trade-off clássico: qualidade vs volume.",
  },
  bourbon_vermelho: {
    nome: "Bourbon Vermelho",
    especie: "arabica",
    porte: "alto",
    maturacaoBase: 0.55,
    resistenciaFerrugem: 0.1,
    potencialBebida: 0.88,
    amplitudeBienal: 1.1,
    produtividadeBase: 0.78,
    peneiraMedia: 14,
    cor: "#7A0A0A",
    desc: "Bourbon dos exigentes. Bebida fina demanda manejo cuidadoso e proteção contra ferrugem.",
  },

  /* ---------- MODERNAS RESISTENTES ---------- */
  catucai: {
    nome: "Catucaí",
    especie: "arabica",
    porte: "alto",
    maturacaoBase: 0.65,
    resistenciaFerrugem: 0.55,
    potencialBebida: 0.65,
    amplitudeBienal: 1.0,
    produtividadeBase: 1.0,
    peneiraMedia: 15,
    cor: "#7A2518",
    desc: "Cruzamento Icatu × Catuaí. Boa resistência, bebida mediana.",
  },
  paraiso: {
    nome: "Paraíso MGS 2",
    especie: "arabica",
    porte: "baixo",
    maturacaoBase: 0.62,
    resistenciaFerrugem: 0.85,
    potencialBebida: 0.72,
    amplitudeBienal: 0.7,
    produtividadeBase: 1.0,
    peneiraMedia: 15,
    cor: "#7FA065",
    desc: "Cultivar Epamig. Muito resistente a ferrugem, bienalidade suave. Bom escolha pra ZM.",
  },
  arara: {
    nome: "Arara",
    especie: "arabica",
    porte: "baixo",
    maturacaoBase: 0.6,
    resistenciaFerrugem: 0.8,
    potencialBebida: 0.78,
    amplitudeBienal: 0.8,
    produtividadeBase: 1.05,
    peneiraMedia: 15,
    cor: "#E2C04B",
    desc: "Lançamento recente, frutos amarelos, dupla aptidão: resistência alta + bebida boa.",
  },

  /* ---------- ESPECIAIS ---------- */
  topazio: {
    nome: "Topázio",
    especie: "arabica",
    porte: "baixo",
    maturacaoBase: 0.6,
    resistenciaFerrugem: 0.45,
    potencialBebida: 0.7,
    amplitudeBienal: 0.5, // <-- mais estável ano a ano
    produtividadeBase: 1.05,
    peneiraMedia: 15,
    cor: "#D9A85F",
    desc: "Maturação uniforme (menos verde na panha), bienalidade suave, tolera estiagem.",
  },
  acaia: {
    nome: "Acaiá",
    especie: "arabica",
    porte: "alto",
    maturacaoBase: 0.58,
    resistenciaFerrugem: 0.25,
    potencialBebida: 0.78,
    amplitudeBienal: 1.0,
    produtividadeBase: 1.1, // grão graúdo, alta produção
    peneiraMedia: 17,
    cor: "#A05A1E",
    desc: "Grão grande (peneira 17+), alta produtividade, sabor frutado e achocolatado.",
  },

  /* ---------- ROBUSTA ---------- */
  conilon: {
    nome: "Conilon (Robusta)",
    especie: "robusta",
    porte: "alto",
    maturacaoBase: 0.75,
    resistenciaFerrugem: 0.7,
    potencialBebida: 0.55,
    amplitudeBienal: 0.6,
    produtividadeBase: 1.25, // robusta produz mais volume
    peneiraMedia: 16,
    cor: "#5C3A1E",
    desc: "Robusta — rústico, alta produção, bebida neutra. Pouco usado na Zona da Mata mas viável.",
  },
};

export const METODOS_POS = {
  natural: {
    nome: "Natural (terreiro)",
    custo: 0,
    diasSecagem: 18,
    bonusBebida: 0,
    riscoChuva: 0.9,
    fatorBenef: 0.5,
    desc: "Café cereja seco inteiro no terreiro. Barato, mas refém do sol.",
  },
  cd: {
    nome: "Cereja Descascado (CD)",
    custo: 1200,
    diasSecagem: 12,
    bonusBebida: 0.08,
    riscoChuva: 0.6,
    fatorBenef: 0.55,
    desc: "Descasca a cereja antes de secar. Mais limpo, seca mais rápido.",
  },
  lavado: {
    nome: "Lavado (despolpado)",
    custo: 2000,
    diasSecagem: 10,
    bonusBebida: 0.14,
    riscoChuva: 0.5,
    fatorBenef: 0.58,
    desc: "Remove mucilagem com água. Bebida mais limpa e ácida.",
  },
};

// Classificação por bebida -> preço por saca (R$). Ilustrativo.
export const TABELA_BEBIDA = [
  { min: 0.85, nome: "Especial (85+)", preco: 1850 },
  { min: 0.78, nome: "Bebida Mole", preco: 1500 },
  { min: 0.68, nome: "Bebida Dura", preco: 1280 },
  { min: 0.55, nome: "Riado", preco: 1050 },
  { min: 0.0, nome: "Rio (defeituoso)", preco: 820 },
];
