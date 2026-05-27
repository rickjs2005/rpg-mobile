/* ============================================================
   PANHA — colher um talhão num método dado.
   Retorna { sacas, perfilColhido, metodo }.
   perfilColhido != perfilMaturacao: é o que ACABOU NO SACO
   após a seletividade do método de colheita.
   ============================================================ */

import { SACAS_BASE_POR_MIL_PES, SOMBREAMENTO, MATO } from "../data/constantes.js";
import { VARIEDADES } from "../data/cafe.js";
import { efeitoEquipamento } from "./equipamentos.js";
import { fatorBienalidade, fatorIdadeProdutiva, estaEmRecuperacao } from "./talhao.js";
import { fatorCicloProducao, ajustarMaturacaoPorFloradas } from "./ciclo.js";
import { fatorDefeitoBroca } from "./pragas.js";
import { bonusEncarregadoPanha } from "./equipe.js";

// Quanto de cada categoria o método APANHA. Manual é seletiva
// (quase só pega o maduro). Derriça (varejo) pega tudo. Colhedora
// também pega quase tudo.
const SELETIVIDADE = {
  manual: { maduro: 1.0, verde: 0.2, seco: 0.7 },
  derrica: { maduro: 1.0, verde: 1.0, seco: 1.0 },
  colhedora: { maduro: 1.0, verde: 0.9, seco: 0.95 },
};

export function colher(talhao, perfilMaturacao, metodo, equipamentos = [], equipe = null) {
  const variedade = VARIEDADES[talhao.variedadeId];
  if (!variedade) return null;
  if (estaEmRecuperacao(talhao)) return null; // Lote B: bloqueio

  const sacasBasePor1000 = SACAS_BASE_POR_MIL_PES[variedade.especie] || 35;

  let bonusRend = 0;
  for (const id of equipamentos) {
    const ef = efeitoEquipamento(id, talhao.terreno);
    if (ef?.bonusRendimento) bonusRend += ef.bonusRendimento * ef.fatorTerreno;
  }
  // Lote H1: encarregado adiciona +15%
  bonusRend += bonusEncarregadoPanha(equipe);

  // Lote C: floradas extras tornam a maturação desuniforme (+verde no saco)
  const numFloradas = talhao.ciclo?.numFloradas || 1;
  const perfilAjustado = ajustarMaturacaoPorFloradas(perfilMaturacao, numFloradas);

  const sel = SELETIVIDADE[metodo] || SELETIVIDADE.manual;
  const fracaoColhida =
    perfilAjustado.maduro * sel.maduro +
    perfilAjustado.verde * sel.verde +
    perfilAjustado.seco * sel.seco;

  // Multiplicadores cumulativos:
  // - produtividadeBase: traço da variedade (Lote A)
  // - fatorBienalidade: alta/baixa por variedade (Lote A)
  // - fatorIdadeProdutiva: 0-3 nada, 4-6 pico, 7-15 estável, decline (Lote A)
  // - fatorCicloProducao: florada ok? granação suficiente? (Lote C)
  const produtividadeBase = variedade.produtividadeBase ?? 1.0;
  const bienal = fatorBienalidade(talhao);
  const idade = fatorIdadeProdutiva(talhao.idadeAnos, talhao.densidade);
  const ciclo = fatorCicloProducao(talhao);

  // Lote H9: sombreamento reduz produção
  const sombra = talhao.sombreado ? SOMBREAMENTO.multiplicadorProducao : 1.0;
  // Mato compete por água/nutrientes — reduz a produção.
  const fatorMato = 1 - (talhao.mato || 0) * MATO.penalidadeProducao;

  const sacasPotencial = (talhao.pes / 1000) * sacasBasePor1000;
  const sacas = Math.round(
    sacasPotencial *
      fracaoColhida *
      talhao.sanidade *
      (1 + bonusRend) *
      produtividadeBase *
      bienal *
      idade *
      ciclo *
      sombra *
      fatorMato
  );

  // Distribuição do que efetivamente foi pro saco (usa perfil ajustado por floradas)
  const denom = fracaoColhida || 1;
  const perfilColhido = {
    maduro: (perfilAjustado.maduro * sel.maduro) / denom,
    verde: (perfilAjustado.verde * sel.verde) / denom,
    seco: (perfilAjustado.seco * sel.seco) / denom,
  };

  // Lote D: broca gera defeitos no lote — agregamos no retorno
  const defeitoBroca = fatorDefeitoBroca(talhao);

  return { sacas, perfilColhido, metodo, defeitoBroca };
}
