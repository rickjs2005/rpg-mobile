/* ============================================================
   REGISTRO DE SONS — modo silencioso por padrão.
   Cada som começa `null`. Pra ATIVAR, troque null pelo require do
   arquivo, ex.:
     vender: require("../../assets/audio/vender.m4a"),
   O motor (engine.js) ignora entradas null, então o jogo roda
   normalmente sem nenhum arquivo de áudio presente.
   Formatos recomendados: .m4a/.aac. SFX < 1s; músicas em loop ~1-2min.
   ============================================================ */

// ---------- Efeitos curtos (SFX) ----------
export const EFEITOS = {
  ui_click: null,        // toque de botão
  ui_modal: null,        // abrir/fechar modal
  erro: null,            // ação inválida / caixa insuficiente
  plantar: null,         // 🌱 plantio
  insumo: null,          // 🪨🛡️ adubo/calcário/defensivo
  colher: null,          // 🍒 colheita
  secagem: null,         // 🌡️ terreiro / lote pronto
  vender: null,          // 💰 venda (ka-ching)
  comprar: null,         // 🛒🏡🏦 compra/aquisição
  praga: null,           // 🦋 praga detectada
  poda: null,            // ✂️🪓 esqueletar/recepar
  marco: null,           // 🏆 conquista (fanfarra)
  florada: null,         // 🌸 florada
  avancar: null,         // ▶ passar o tempo
  geada_negra: null,     // ❄️ evento extremo
  granizo: null,         // 🌨️ evento extremo
  alerta: null,          // 🔔 alerta crítico do HUD
};

// ---------- Músicas (loops) ----------
export const MUSICAS = {
  menu: require("../../assets/audio/menu.mp3"), // "Echoes Beyond Horizons" (StockTune)
  jogo: null,            // ambiente de roça (pássaros)
  secagem: null,         // variação calma durante a secagem
};

// ---------- Evento (categorizado no reducer) → efeito ----------
// Recebe o objeto de evento { texto, categoria } e devolve a chave de
// EFEITOS (ou null pra ficar em silêncio). Refina alguns casos pelo texto.
export function efeitoParaEvento(ev) {
  if (!ev) return null;
  const t = ev.texto || "";

  // Especiais (independem da categoria)
  if (t.startsWith("❄️ GEADA NEGRA")) return "geada_negra";
  if (t.startsWith("🌨️")) return "granizo";
  if (ev.categoria === "marcos") return "marco";

  switch (ev.categoria) {
    case "economia":
      return /^(💰|💵)/.test(t) ? "vender" : "comprar";
    case "manejo":
      return t.startsWith("🌱 Plantou") ? "plantar" : "insumo";
    case "colheita":
      return t.includes("Lote pronto") ? "secagem" : "colher";
    case "secagem":
      return "secagem";
    case "pragas":
      return "praga";
    case "podas":
      return "poda";
    case "erros":
      return "erro";
    case "ciclo":
      return /^(🌸|🌼)/.test(t) ? "florada" : null; // demais eventos de ciclo: sem som
    default:
      return null;
  }
}
