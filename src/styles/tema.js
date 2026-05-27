/* ============================================================
   TEMA — paleta "Hay Day" (clara, quente, cartunesca).
   Mantém os MESMOS nomes de token do tema escuro antigo, mas com
   valores claros — assim toda a UI que usa tema.* migra de uma vez.
   Tokens novos (gold/madeira/verde 3D, bases) servem aos botões
   chunky e bordas grossas estilo farm game.
   Fonte de verdade das cores: design do Stitch (Material claro).
   ============================================================ */

export const tema = {
  // ----- Backgrounds (claros) -----
  bg: "#f5ead4",   // fundo da página (creme quente)
  bg2: "#fffaf0",  // superfície de card/painel (quase branco)
  bg3: "#f1e3c6",  // inset / chip / aba ativa / barra de fundo

  // ----- Linhas/bordas -----
  linha: "#d8c29a",        // borda suave (tan)
  linhaForte: "#82533d",   // borda chunky madeira

  // ----- Texto (escuro sobre claro) -----
  texto: "#201b0c",
  textoDim: "rgba(32,27,12,0.62)",
  textoFraco: "rgba(32,27,12,0.42)",

  // ----- Cores semânticas (legíveis em fundo claro) -----
  dourado: "#9a6a00",        // texto/destaque dourado (títulos, preços)
  douradoEscuro: "#594400",
  verde: "#2a691d",          // positivo / primary (texto)
  vermelho: "#ba1a1a",
  azul: "#386a8c",
  vermelhoEscuro: "#8a2a2a",

  // ----- Tokens 3D Hay Day (fundos de botão + "base" da sombra) -----
  gold: "#f4bf00",      goldBase: "#594400",   goldBorda: "#755b00",   onGold: "#3d2e00",
  madeira: "#82533d",   madeiraBase: "#663c27",
  verdeBtn: "#2a691d",  verdeBase: "#115206",  verdeFixo: "#aef597",   onVerde: "#ffffff",
  erroBg: "#ffdad6",    onErro: "#93000a",
  creme: "#fff8ef",

  // ----- Geometria (cantos mais arredondados) -----
  raio: 14,
  raioPequeno: 8,
  raioGrande: 24,
  gap: 12,

  // ----- Tipografia -----
  fonteH1: 22,
  fonteH2: 16,
  fonteCorpo: 14,
  fontePequeno: 12,
  fonteMicro: 11,
};

// Cor da variedade (vem de data/cafe.js, mas centralizo aqui pra UI usar com fallback)
export function corVariedade(cor) {
  return cor || tema.dourado;
}
