/* ============================================================
   TEMA — paleta + constantes visuais (substituto do :root CSS).
   Tudo que era CSS variable na versão web mora aqui.
   Todo componente importa daqui — zero cor hardcoded.
   ============================================================ */

export const tema = {
  // Backgrounds
  bg: "#1c1410",
  bg2: "#2a1d15",
  bg3: "#3a2418",
  // Linhas/bordas
  linha: "#4a3024",
  // Texto
  texto: "#f3e9dd",
  textoDim: "rgba(243, 233, 221, 0.65)",
  textoFraco: "rgba(243, 233, 221, 0.45)",
  // Cores semânticas
  dourado: "#d9a85f",
  douradoEscuro: "#8b6a3f",
  verde: "#7fc97f",
  vermelho: "#c84444",
  azul: "#6fa8c8",
  vermelhoEscuro: "#6b2a2a",
  // Geometria
  raio: 8,
  raioPequeno: 4,
  gap: 12,
  // Tipografia
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
