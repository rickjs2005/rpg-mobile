/* ============================================================
   GLOSSÁRIO — termos técnicos do café, com explicação acessível.
   Consumido pelo modal Glossário (botão flutuante no app).
   ============================================================ */

export const GLOSSARIO = [
  /* ---------- Classificação / Mercado ---------- */
  {
    termo: "Índice de mercado",
    categoria: "Mercado",
    icone: "📈",
    definicao:
      "Multiplicador 0.65x a 1.45x sobre o preço base da saca. Oscila diariamente com tendência + ruído + eventos macro (geada concorrente, crise Vietnã, supersafra colombiana). Vender em alta = lucro. Estocar em baixa = espera.",
  },
  {
    termo: "Evento macro",
    categoria: "Mercado",
    icone: "🌐",
    definicao:
      "Notícia raríssima que move o mercado mundial — geada destrutiva, crise climática, demanda asiática, etc. Aparece no feed de eventos com impacto imediato no índice.",
  },

  {
    termo: "SCA",
    categoria: "Mercado",
    icone: "☕",
    definicao:
      "Pontuação da Specialty Coffee Association, de 60 a 95. Acima de 80 = café especial. Acima de 85 = MICROLOTE (preço explode). Acima de 90 = exemplar (raríssimo).",
  },
  {
    termo: "Tipo BRASIL",
    categoria: "Mercado",
    icone: "📋",
    definicao:
      "Classificação oficial brasileira de 2 (top) a 8 (descarte), baseada em quantos defeitos o lote tem em 300g de amostra. Tipo 2 = no máx 4 defeitos. Tipo 6 = padrão comercial. Tipo 8 = lixo.",
  },
  {
    termo: "Peneira",
    categoria: "Mercado",
    icone: "🔢",
    definicao:
      "Tamanho do grão, escala 12 a 19. Peneira 17-18 = grão graúdo, paga prêmio. Peneira 13 ou menos = grão pequeno, vale menos. Acaiá (grão grande) puxa pra 17. Bourbon vai pra 14.",
  },
  {
    termo: "Microlote",
    categoria: "Mercado",
    icone: "⭐",
    definicao:
      "Lote excepcional com SCA ≥ 85. Vendido separadamente como café especial, preço 2.5x a 5x do comercial. Exige variedade fina + manejo perfeito + método pós superior.",
  },
  {
    termo: "Defeitos",
    categoria: "Mercado",
    icone: "❌",
    definicao:
      "Grãos defeituosos que derrubam o tipo. Pretos = pior (1 defeito cada). Verdes (3 = 1 defeito). Ardidos (2 = 1 defeito). Brocados (5 = 1 defeito).",
  },

  /* ---------- Ciclo agronômico ---------- */
  {
    termo: "Florada",
    categoria: "Ciclo",
    icone: "🌸",
    definicao:
      "Abertura das flores do cafeeiro. Acontece em set-out na Zona da Mata, após VERANICO seguido de chuva. SEM florada principal, a safra do ano seguinte vai pra 10%.",
  },
  {
    termo: "Veranico",
    categoria: "Ciclo",
    icone: "☀️",
    definicao:
      "Período de dias secos consecutivos (10+ dias). É o gatilho da florada: a planta entende que precisa florar quando seca + chuva voltam. Sem veranico = sem florada.",
  },
  {
    termo: "Granação",
    categoria: "Ciclo",
    icone: "💧",
    definicao:
      "Formação do grão dentro do fruto, em jan-fev-mar. Precisa de chuva: sem água, grão fica chocho e leve = saca leve. Ideal: 300mm acumulados na granação.",
  },
  {
    termo: "Bienalidade",
    categoria: "Ciclo",
    icone: "📊",
    definicao:
      "Café alterna safra alta e baixa ano a ano. Alta = +30% sacas, Baixa = −30%. Topázio reduz a oscilação. Cada colheita flipa o ciclo do talhão.",
  },
  {
    termo: "Maduro / Verde / Seco",
    categoria: "Ciclo",
    icone: "🍒",
    definicao:
      "Estágios do fruto na colheita. MADURO (cereja) = melhor bebida. VERDE = derruba qualidade muito. SECO (passou do ponto) = razoável mas inferior ao maduro.",
  },

  /* ---------- Variedades ---------- */
  {
    termo: "Bourbon",
    categoria: "Variedades",
    icone: "☕",
    definicao:
      "Variedade tradicional, bebida excepcional, sensível a pragas. Trade-off clássico: máxima qualidade vs baixa produtividade (~80% do Catuaí).",
  },
  {
    termo: "Topázio",
    categoria: "Variedades",
    icone: "✨",
    definicao:
      "Cultivar moderna com maturação UNIFORME (menos verde na panha) e bienalidade SUAVE (apenas ±15%, vs ±30% padrão). Tolera estiagem.",
  },
  {
    termo: "Paraíso MGS 2",
    categoria: "Variedades",
    icone: "🛡️",
    definicao:
      "Cultivar Epamig. Resistência a ferrugem altíssima (0.85). Quem planta Paraíso quase nunca pega ferrugem. Bebida boa, bienalidade suave.",
  },
  {
    termo: "Conilon (Robusta)",
    categoria: "Variedades",
    icone: "💪",
    definicao:
      "Espécie diferente (Coffea canephora). Produz +25% volume, rústica (resiste pragas e seca), mas bebida neutra (potencial 0.55). Pouco usada na Zona da Mata.",
  },

  /* ---------- Pós-colheita ---------- */
  {
    termo: "Natural",
    categoria: "Pós-colheita",
    icone: "🌞",
    definicao:
      "Método de secagem mais antigo: fruto inteiro seco no terreiro, 18 dias. Barato, mas refém do sol e sem separação cereja/boia.",
  },
  {
    termo: "CD (Cereja Descascado)",
    categoria: "Pós-colheita",
    icone: "🍒",
    definicao:
      "Descasca a cereja antes de secar, 12 dias. Lavador-sifão separa cereja (qualidade) de boia (verde+seco). +8% bebida, custo R$1200.",
  },
  {
    termo: "Lavado",
    categoria: "Pós-colheita",
    icone: "💦",
    definicao:
      "Despolpa + fermenta + lava. 10 dias de secagem. +14% bebida. Lavador-sifão separa MAIS agressivo que CD (95% vs 80%). Custo R$2000.",
  },
  {
    termo: "Cereja vs Boia",
    categoria: "Pós-colheita",
    icone: "⚖️",
    definicao:
      "Lavador-sifão (CD/Lavado) separa por densidade: CEREJA (maduro denso, afunda) tem bebida fina. BOIA (verde+seco, flutua) vira lote inferior tipo 7-8.",
  },

  /* ---------- Manejo ---------- */
  {
    termo: "Cooperativa",
    categoria: "Mercado",
    icone: "🏢",
    definicao:
      "Cocatrel, Cooxupé etc. No jogo: Filiação R$5k + anuidade R$1.5k. Ganhos: -15% em insumos + piso de preço 95% (protege contra mercado em queda). ROI grande pra fazendas grandes.",
  },
  {
    termo: "Funcafé",
    categoria: "Mercado",
    icone: "🏦",
    definicao:
      "Fundo de Defesa da Economia Cafeeira. Linha de crédito subsidiada do governo brasileiro. No jogo: 12 parcelas mensais, 10% juros total. Limite cresce com tamanho da fazenda. Libera expansão.",
  },
  {
    termo: "Sombreamento",
    categoria: "Manejo",
    icone: "🌳",
    definicao:
      "Café plantado sob árvores nativas. Sistema antigo e sustentável: −35% produção, +8% bebida, −50% spawn de pragas, −50% dano de geada. Custo plantio +10%. Estratégia 'qualidade sobre quantidade'.",
  },
  {
    termo: "Adensamento",
    categoria: "Manejo",
    icone: "🌲",
    definicao:
      "Espaçamento de plantio. Tradicional: 3500 pés/ha. Adensado: 5500 (+55% custo +30%, vida curta). Super-adensado: 8000 (+130%, custo +60%, declínio 4 anos antes). Mais denso = mais produção, mais cedo decai.",
  },
  {
    termo: "Tulha",
    categoria: "Manejo",
    icone: "🏚️",
    definicao:
      "Armazém de sacas. Você começa com pequena (50 sacas). Upgrade pra média (150) ou grande (500) na Loja. Sacas que não cabem são vendidas EMERGENCIAIS sem prêmios — perde valor.",
  },
  {
    termo: "Mensalista",
    categoria: "Manejo",
    icone: "👤",
    definicao:
      "Empregado fixo. R$ 2.500/mês, cada um cobre 3ha de manutenção. Mantém a sanidade da lavoura +1%/mês nos talhões cobertos. Vale a pena se vc tem 3+ ha produtivos.",
  },
  {
    termo: "Encarregado",
    categoria: "Manejo",
    icone: "👔",
    definicao:
      "Supervisor da turma. R$ 5.000/mês, +15% rendimento na panha, +4ha cobertura. Máx 1 contratado. ROI grande em fazendas com volume.",
  },
  {
    termo: "Irrigação",
    categoria: "Manejo",
    icone: "💧",
    definicao:
      "Sistema instalado no talhão. Caro (~R$ 12k pra 1ha) + custo mensal. Elimina veranico, garante mm diários, evita seca crítica. ROI vem da safra estável e melhor granação.",
  },
  {
    termo: "Sanidade",
    categoria: "Manejo",
    icone: "🌱",
    definicao:
      "Saúde geral do talhão, 0-100%. Multiplica diretamente a produção. Adubo (+25%) e Defensivo (+10%) sobem; pragas e idade descem. Mantém com manejo regular.",
  },
  {
    termo: "Esqueletamento",
    categoria: "Manejo",
    icone: "✂️",
    definicao:
      "Poda média: corta laterais a 20-30cm do tronco. Talhão perde 1 safra (12 meses), volta com sanidade 85%. Indicado pra lavoura cansada (~7+ anos).",
  },
  {
    termo: "Recepa",
    categoria: "Manejo",
    icone: "🪓",
    definicao:
      "Poda drástica: corte rente ao chão. Perde 2 safras (24 meses), lavoura renasce (idade reset). Faz pra lavoura velha (15+ anos) em declínio.",
  },
  {
    termo: "Adubo NPK",
    categoria: "Manejo",
    icone: "🌱",
    definicao:
      "Insumo principal: +25% sanidade IMEDIATO. NPK = Nitrogênio + Fósforo + Potássio. Custo R$350.",
  },
  {
    termo: "Calcário",
    categoria: "Manejo",
    icone: "🪨",
    definicao:
      "Corrige acidez do solo. Efeito ATRASADO: leva 90 dias pra +18% sanidade. Custo R$200. Aplicar com antecedência.",
  },
  {
    termo: "Defensivo",
    categoria: "Manejo",
    icone: "🛡️",
    definicao:
      "Mata todas as pragas do talhão na hora + 10% sanidade. R$450. CUIDADO: aplicar defensivo INVALIDA certificação Orgânica (em transição ou ativa).",
  },

  /* ---------- Eventos extremos ---------- */
  {
    termo: "Geada negra",
    categoria: "Ciclo",
    icone: "❄️",
    definicao:
      "Evento raro em jun-jul. Quando dispara, TODA a lavoura formada sofre −50% sanidade e perde a florada. Drama máximo da Zona da Mata real.",
  },
  {
    termo: "Granizo",
    categoria: "Ciclo",
    icone: "🌨️",
    definicao:
      "Evento raro em out-fev. Atinge 1 talhão random com −30% sanidade. Se em florada, quebra a florada do talhão.",
  },
  {
    termo: "Seca crítica",
    categoria: "Ciclo",
    icone: "⚠️",
    definicao:
      "Quando o veranico ultrapassa 25 dias, a lavoura começa a perder 1% sanidade por dia. Aviso aparece em 25, 35 e 50 dias.",
  },

  /* ---------- Pragas ---------- */
  {
    termo: "Bicho-mineiro",
    categoria: "Pragas",
    icone: "🦋",
    definicao:
      "Leucoptera coffeella. Aparece em jun-set (estiagem). Lagarta mina folhas → desfolha. Defensivo controla.",
  },
  {
    termo: "Broca-do-café",
    categoria: "Pragas",
    icone: "🪲",
    definicao:
      "Besouro nov-abr. Perfura o grão → defeito BROCADO no lote final. Derruba SCA e tipo. Defensivo controla.",
  },
  {
    termo: "Ferrugem",
    categoria: "Pragas",
    icone: "🍂",
    definicao:
      "Hemileia vastatrix. Dez-mai com chuva. Mancha amarela na folha → desfolha. CATASTRÓFICA em variedade sensível. Paraíso e Arara bloqueiam.",
  },
  {
    termo: "Amostragem",
    categoria: "Pragas",
    icone: "🔍",
    definicao:
      "Por R$50, revela qual praga está no talhão e qual o nível. Sem amostragem, vc só vê 'sintomas estranhos'. Vale a pena pra decidir qual defensivo aplicar.",
  },

  /* ---------- Equipamentos ---------- */
  {
    termo: "Trator",
    categoria: "Equipamentos",
    icone: "🚜",
    definicao:
      "R$18.000. Reduz energia (×0.5) + 10% rendimento. ESPECIALISTA EM PLANO. Em montanhoso, eficiência cai a 40%.",
  },
  {
    termo: "Drone DJI Agras",
    categoria: "Equipamentos",
    icone: "🚁",
    definicao:
      "R$32.000. +5% bebida. ESPECIALISTA EM MONTANHOSO — onde trator e colhedora sofrem.",
  },
  {
    termo: "Colhedora",
    categoria: "Equipamentos",
    icone: "🌾",
    definicao:
      "R$45.000. Colhe rápido (-70% energia) e +5% rendimento, mas −4% bebida. SÓ FUNCIONA EM PLANO. Inclinação > 15% → desliga.",
  },
  {
    termo: "Secador mecânico",
    categoria: "Equipamentos",
    icone: "🌡️",
    definicao:
      "R$25.000. Seca o café independente do clima. +3% bebida. Resolve o problema de secar na chuva.",
  },

  /* ---------- Terreno ---------- */
  {
    termo: "Plano vs Montanhoso",
    categoria: "Terreno",
    icone: "🌄",
    definicao:
      "Inclinação > 15% = MONTANHOSO. Trator/colhedora perdem força (40% eficiência). Drone e mão de obra mantêm. Determina escolha de equipamento.",
  },

  /* ---------- Certificações ---------- */
  {
    termo: "Rainforest Alliance",
    categoria: "Certificações",
    icone: "🌳",
    definicao:
      "R$2.000 + R$500/ano. +10% no preço da saca. Ativa na hora. Manejo sustentável básico.",
  },
  {
    termo: "Fair Trade",
    categoria: "Certificações",
    icone: "🤝",
    definicao:
      "R$3.500 + R$800/ano. +30% no preço. Ativa na hora. Forte no mercado europeu.",
  },
  {
    termo: "Orgânico",
    categoria: "Certificações",
    icone: "🌱",
    definicao:
      "R$5.000 + R$1.000/ano. +35% no preço, mas 3 ANOS DE TRANSIÇÃO sem usar defensivo. Aplicar defensivo durante transição/ativa quebra a certificação.",
  },
];

// Categorias disponíveis (na ordem de relevância no aprendizado)
export const CATEGORIAS = [
  "Ciclo",
  "Mercado",
  "Pós-colheita",
  "Manejo",
  "Pragas",
  "Variedades",
  "Equipamentos",
  "Terreno",
  "Certificações",
];
