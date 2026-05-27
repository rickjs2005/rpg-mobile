/* ============================================================
   DICAS DE MANEJO — "agrônomo virtual".
   Lê o estado da fazenda + a época e gera conselhos contextuais,
   acionáveis e EDUCATIVOS (cada dica explica o porquê). Função
   pura, testável. Ordenada por prioridade (mais urgente primeiro).
   ============================================================ */

import { ANOS_FORMACAO, VERANICO_DIAS_MIN } from "../data/constantes.js";
import { PRAGAS } from "../data/pragas.js";
import { categoriaIdade } from "./talhao.js";

const produtivo = (t) =>
  t.variedadeId && t.idadeAnos >= ANOS_FORMACAO && t.estado === "normal";

export function dicasManejo(state) {
  if (!state) return [];
  const talhoes = state.talhoes || [];
  const mes = state.tempo?.mes ?? 1;
  const inv = state.inventario || {};
  const dicas = [];

  // --- Pragas REVELADAS (já amostradas): pulverizar ---
  const reveladas = new Set();
  for (const t of talhoes) {
    for (const id of Object.keys(t.pragas || {})) {
      if ((t.amostragem || {})[id]) reveladas.add(id);
    }
  }
  if (reveladas.size > 0) {
    const nomes = [...reveladas].map((id) => PRAGAS[id]?.nome || id).join(", ");
    dicas.push({
      prioridade: 100,
      icone: "🛡️",
      titulo: "Hora de pulverizar!",
      texto: `Detectado: ${nomes}. Aplique defensivo nos talhões afetados — quanto antes controlar, menos folha e grão se perdem. (Atenção: defensivo invalida a certificação orgânica.)`,
    });
  }

  // --- Pragas NÃO reveladas (sintomas estranhos): amostrar ---
  const temSintoma = talhoes.some((t) => {
    const ativas = Object.keys(t.pragas || {});
    return ativas.some((id) => !(t.amostragem || {})[id]);
  });
  if (temSintoma) {
    dicas.push({
      prioridade: 90,
      icone: "🔍",
      titulo: "Faça uma amostragem",
      texto: "Há sintomas estranhos em algum talhão. A amostragem (vistoria) identifica a praga antes de gastar defensivo à toa — diagnóstico certo, tratamento certo.",
    });
  }

  // --- Sanidade baixa: adubar ---
  const fracos = talhoes.filter((t) => t.variedadeId && t.estado === "normal" && t.sanidade < 0.4);
  if (fracos.length > 0) {
    dicas.push({
      prioridade: 85,
      icone: "🌱",
      titulo: "Adube a lavoura enfraquecida",
      texto: `${fracos.length} talhão(ões) com sanidade baixa. O adubo (NPK) repõe nutrientes e devolve vigor — lavoura forte produz mais e resiste melhor a pragas.`,
    });
  }

  // --- Veranico longo sem irrigação ---
  const veranico = talhoes.find(
    (t) => produtivo(t) && !t.irrigado && (t.ciclo?.diasSemChuva || 0) >= VERANICO_DIAS_MIN
  );
  if (veranico) {
    dicas.push({
      prioridade: 80,
      icone: "💧",
      titulo: "Lavoura sob veranico",
      texto: `Já são ${veranico.ciclo.diasSemChuva} dias sem chuva. Veranico prolongado estressa a planta; a irrigação garante água nos períodos secos (caro, mas salva safras na estiagem).`,
    });
  }

  // --- Pronto pra colher (mai-ago) ---
  const naColheita = mes >= 5 && mes <= 8;
  const prontos = naColheita
    ? talhoes.filter((t) => produtivo(t) && !t.ciclo?.safraColhida)
    : [];
  if (prontos.length > 0) {
    dicas.push({
      prioridade: 75,
      icone: "🍒",
      titulo: "Colha no ponto cereja",
      texto: `${prontos.length} talhão(ões) no ponto. Frutos cereja (maduros) dão a melhor bebida; verdes pesam menos e amargam. A panha manual é seletiva (só o maduro) e paga mais.`,
    });
  }

  // --- Janela de florada (set-out) sem florada ---
  if (mes === 9 || mes === 10) {
    const semFlorada = talhoes.some((t) => produtivo(t) && !t.ciclo?.floradaPrincipalOk);
    if (semFlorada) {
      dicas.push({
        prioridade: 70,
        icone: "🌸",
        titulo: "Janela de florada",
        texto: "O café floresce quando um veranico é quebrado por uma boa chuva. Sem a florada principal, a safra do ano que vem fica comprometida — torça pela chuva (ou irrigue).",
      });
    }
  }

  // --- Pós-colheita: adubar pra recuperar ---
  const colhidos = talhoes.filter((t) => produtivo(t) && t.ciclo?.safraColhida);
  if (colhidos.length > 0) {
    dicas.push({
      prioridade: 60,
      icone: "🌿",
      titulo: "Reponha após a colheita",
      texto: "Talhão recém-colhido fica 'cansado' — produzir gasta muita energia da planta. Adube no pós-colheita para a lavoura se recuperar e formar bem a próxima safra.",
    });
  }

  // --- Granação (jan-mar) ---
  if (mes >= 1 && mes <= 3 && talhoes.some(produtivo)) {
    dicas.push({
      prioridade: 50,
      icone: "💧",
      titulo: "Granação em curso",
      texto: "De janeiro a março o grão enche (granação). Água e boa nutrição agora deixam a saca mais pesada e cheia; falta de chuva dá grão 'chocho' e leve.",
    });
  }

  // --- Lavoura velha em declínio: renovar ---
  const velha = talhoes.find(
    (t) => produtivo(t) && categoriaIdade(t.idadeAnos, t.densidade) === "declínio"
  );
  if (velha) {
    dicas.push({
      prioridade: 40,
      icone: "🪓",
      titulo: "Renove a lavoura cansada",
      texto: `Talhão com ${velha.idadeAnos} anos em declínio. A recepa (corte rente) ou o esqueletamento fazem a planta 'renascer' usando a raiz adulta — perde 1-2 safras, mas revigora a lavoura.`,
    });
  }

  // --- Mato alto: capinar ---
  const matoso = talhoes.filter(
    (t) => t.variedadeId && t.estado === "normal" && (t.mato || 0) > 0.4
  );
  if (matoso.length > 0) {
    dicas.push({
      prioridade: 65,
      icone: "🧹",
      titulo: "Hora de capinar",
      texto: `${matoso.length} talhão(ões) com mato alto. O mato compete por água e nutrientes e rouba a força do café — capine antes que derrube a produção.`,
    });
  }

  // --- Calagem: boa prática quando sanidade mediana ---
  const medianos = talhoes.filter(
    (t) => t.variedadeId && t.estado === "normal" && t.sanidade >= 0.4 && t.sanidade < 0.7
  );
  if (medianos.length > 0) {
    dicas.push({
      prioridade: 35,
      icone: "🪨",
      titulo: "Considere a calagem",
      texto: "O calcário corrige a acidez do solo — efeito lento (~90 dias), mas duradouro. Solo equilibrado faz o adubo render mais e sustenta a sanidade ao longo do tempo.",
    });
  }

  // --- Estoque vazio de insumos ---
  if ((inv.adubo || 0) === 0 && (inv.defensivo || 0) === 0 && talhoes.some((t) => t.variedadeId)) {
    dicas.push({
      prioridade: 30,
      icone: "🛒",
      titulo: "Abasteça o paiol",
      texto: "Sem adubo nem defensivo no estoque. Tenha insumos à mão na Loja — quando a praga aparece ou a sanidade cai, agir rápido evita perder a safra.",
    });
  }

  // --- Boa prática geral (capina) — informativa, sem botão ---
  if (dicas.length === 0) {
    dicas.push({
      prioridade: 10,
      icone: "🧹",
      titulo: "Mantenha a roça limpa",
      texto: "Capinar (controlar o mato) reduz a competição por água e nutrientes e dificulta pragas. Boa prática constante do cafezal bem cuidado — sua lavoura está em dia!",
    });
  }

  return dicas.sort((a, b) => b.prioridade - a.prioridade);
}
