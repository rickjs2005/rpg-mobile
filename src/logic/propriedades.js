/* ============================================================
   PROPRIEDADES — compra de terra (nua ou lavoura pronta).
   Devolve { preco, talhao } pronto pra integrar ao estado.
   O reducer é quem debita o caixa e adiciona o talhão.
   ============================================================ */

import { PROPRIEDADES_VENDA } from "../data/economia.js";
import { criarTalhao } from "./talhao.js";
import {
  ANOS_FORMACAO,
  SANIDADE_INICIAL,
  PES_POR_HECTARE,
} from "../data/constantes.js";
import { VARIEDADES } from "../data/cafe.js";

export function buscarPropriedade(propId) {
  return PROPRIEDADES_VENDA.find((p) => p.id === propId);
}

export function comprar(propId) {
  const prop = buscarPropriedade(propId);
  if (!prop) return null;

  // Inclinação típica simulada a partir do tipo de terreno.
  const inclinacao = prop.terreno === "montanhoso" ? 0.25 : 0.08;

  if (prop.tipo === "nua") {
    return {
      preco: prop.preco,
      talhao: criarTalhao({
        hectares: prop.hectares,
        terreno: prop.terreno,
        inclinacao,
        idadeAnos: 0,
        sanidade: 0,
      }),
    };
  }

  // Lavoura pronta: já vem formada e produzindo.
  const especie = VARIEDADES[prop.variedade]?.especie || "arabica";
  const densidade = PES_POR_HECTARE[especie] || 3000;
  return {
    preco: prop.preco,
    talhao: criarTalhao({
      variedadeId: prop.variedade,
      hectares: prop.hectares,
      pes: Math.round(prop.hectares * densidade),
      terreno: prop.terreno,
      inclinacao,
      idadeAnos: ANOS_FORMACAO + 1,
      sanidade: SANIDADE_INICIAL,
    }),
  };
}
