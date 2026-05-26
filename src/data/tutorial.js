/* ============================================================
   TUTORIAL — passos guiados na primeira partida.
   Cada passo tem uma "condição de avanço" — quando o jogador
   executa a ação esperada, o tutorial avança automaticamente.
   "Entendi" no balão também avança (fast-track manual).
   ============================================================ */

export const PASSOS_TUTORIAL = [
  {
    id: "bemvindo",
    texto:
      "🎉 Bem-vindo! Você é cafeicultor na Zona da Mata mineira. Esta é sua fazenda. Toque em ▶ Avançar (acima) pra passar uma semana.",
    condicao: (state, action) => action?.type === "AVANCAR",
  },
  {
    id: "esperar_colheita",
    texto:
      "✅ Cada Avançar passa 1 semana. A colheita só rola entre maio e agosto. Continue avançando até chegar nesse período.",
    condicao: (state) =>
      state.tempo.mes >= 5 && state.tempo.mes <= 8 && state.fase === "normal",
  },
  {
    id: "colher",
    texto:
      "🍒 Época de colheita! Vá em Fazenda e toque em '⚒️ Manual' no seu talhão de Catuaí. Manual paga mais por saca mas só pega frutos maduros.",
    condicao: (state, action) => action?.type === "COLHER",
  },
  {
    id: "pos_colheita",
    texto:
      "📦 Café colhido! Agora vá em Safra e escolha um método de pós-colheita. CD (R$1200) é equilibrado: separa cereja de boia e gera melhor bebida que Natural.",
    condicao: (state, action) => action?.type === "INICIAR_POS_COLHEITA",
  },
  {
    id: "secagem",
    texto:
      "🌡️ Secagem começou! Agora cada Avançar passa 1 DIA (mais granular). Continue avançando até a barra azul encher e o lote ir pro estoque.",
    condicao: (state) =>
      state.fase === "normal" && state.estoqueSacas.length > 0,
  },
  {
    id: "vender",
    texto:
      "💰 Lote no estoque! Vá no Mercado e venda. Lotes com SCA ≥ 85 viram microlote e pagam 2.5-5x o normal — mas só com manejo perfeito.",
    condicao: (state, action) =>
      action?.type === "VENDER_LOTE" || action?.type === "VENDER_TUDO",
  },
  {
    id: "final",
    texto:
      "🏆 Primeira venda! Você fez um ciclo completo. Agora explore: compre adubo, plante novas variedades, adquira terras, busque microlotes. Toque no 📖 (canto inferior) sempre que ver um termo novo.",
    condicao: () => false, // só fecha manualmente
    final: true,
  },
];
