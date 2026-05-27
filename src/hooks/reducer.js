/* ============================================================
   REDUCER — único ponto de mutação do estado do jogo.
   Função PURA: (state, action) -> state. Sem React, testável.
   Toda lógica vem de logic/*; aqui só orquestramos.
   ============================================================ */

import { createRng, newSeed } from "../logic/rng.js";
import {
  tempoInicial,
  avancarUmDia,
  passoEmDias,
  estaEpocaColheita,
} from "../logic/tempo.js";
import { sortearClimaDia, sortearMmDia } from "../logic/clima.js";
import {
  avancarCicloFenologicoDia,
  resetarCicloAnual,
} from "../logic/ciclo.js";
import {
  tentarSpawnPragasDia,
  aplicarDanoPragasDia,
  zerarPragas,
  amostrarTalhao,
} from "../logic/pragas.js";
import {
  tentarEventoExtremoDia,
  aplicarSecaCriticaDia,
} from "../logic/eventos_extremos.js";
import {
  criarTalhao,
  plantarTalhao,
  envelhecerTalhao,
  aplicarInsumo,
  avancarEfeitosPendentesUmDia,
  estaEmRecuperacao,
  estaFormado,
  podeSerEsqueletado,
  podeSerRecepado,
  iniciarEsqueletamento,
  iniciarRecepa,
  avancarRecuperacaoUmDia,
} from "../logic/talhao.js";
import { calcularMaturacao } from "../logic/maturacao.js";
import { colher } from "../logic/panha.js";
import {
  iniciarSecagem,
  avancarSecagemDia,
  secagemPronta,
} from "../logic/pos_colheita.js";
import { classificarLote } from "../logic/bebida.js";
import {
  precoPorSaca,
  custoInsumo,
  custoEquipamento,
  custoMetodoPos,
  podePagar,
} from "../logic/economia.js";
import { comprar as comprarProp } from "../logic/propriedades.js";
import {
  certsVazias,
  aderir as aderirCert,
  avancarTransicaoDia,
  invalidarPorDefensivo,
  precoComCertificacoes,
  custoAnualCertificacoes,
} from "../logic/certificacoes.js";
import {
  equipeVazia,
  folhaPagamentoMensal,
  aplicarManutencaoMensal,
} from "../logic/equipe.js";
import {
  mercadoInicial,
  avancarMercadoDia,
  fatorMercado,
} from "../logic/mercado.js";
import {
  limiteEmprestimo,
  criarEmprestimo,
  cobrarParcela,
} from "../logic/financiamento.js";
import { VARIEDADES, METODOS_POS } from "../data/cafe.js";
import { INSUMOS, EQUIPAMENTOS, CERTIFICACOES, EQUIPE, TULHAS, TULHA_PROGRESSAO } from "../data/economia.js";
import { PASSOS_TUTORIAL } from "../data/tutorial.js";
import { MARCOS } from "../data/marcos.js";
import {
  nivelPorXp,
  xpVender,
  XP_MARCO,
  NIVEL_VARIEDADE,
  NIVEL_EQUIPAMENTO,
  NIVEL_PROPRIEDADE,
  desbloqueado,
} from "../data/niveis.js";
import {
  INICIO_ROCINHA_PRONTA,
  INICIO_TERRA_NUA,
  CUSTO_PLANTIO_POR_HECTARE,
  CUSTO_MAO_OBRA_PANHA,
  ESQUELETAMENTO,
  RECEPA,
  CUSTO_AMOSTRAGEM,
  IRRIGACAO,
  COOPERATIVA,
  DENSIDADES,
  SOMBREAMENTO,
  NUTRICAO_FLORADA,
  MATO,
  CUSTO_CAPINA_POR_HECTARE,
} from "../data/constantes.js";

/* ---------- Estado ---------- */

// Antes de NOVA_PARTIDA, o estado é null (mostra tela de início).
export const ESTADO_VAZIO = null;

export function novaPartida(modo, perfil) {
  const conf = modo === "terra_nua" ? INICIO_TERRA_NUA : INICIO_ROCINHA_PRONTA;
  const talhao = criarTalhao(conf.talhao);
  return {
    versao: 1,
    rngState: newSeed(),
    tempo: tempoInicial(),
    caixa: conf.caixa,
    modoInicio: modo,
    // Personalização da partida (tela de início). Defaults se vier vazio.
    perfil: {
      fazenda: (perfil?.fazenda || "").trim() || "Minha Fazenda",
      produtor: (perfil?.produtor || "").trim() || "Produtor(a)",
      regiao: (perfil?.regiao || "").trim() || "Zona da Mata, MG",
    },
    talhoes: [talhao],
    equipamentos: [],
    inventario: { adubo: 0, calcario: 0, defensivo: 0 },
    estoqueSacas: [],
    colheitaPendente: null,
    loteSecagem: null,
    fase: "normal", // 'normal' | 'aguardando_pos' | 'secagem'
    propriedadesCompradas: [],
    certificacoes: certsVazias(),
    equipe: equipeVazia(), // Lote H1: mão de obra
    mercado: mercadoInicial(), // Lote H3: índice da bolsa
    emprestimo: null, // Lote H7: financiamento Funcafé
    tulha: "pequena", // Lote H4: capacidade de estoque
    velocidade: 7, // dias por "Avançar" fora das fases diárias (config)
    climaHoje: null, // { tipo, mm } do último dia processado (UI)
    xp: 0, // experiência: vender sacas + marcos → sobe de nível → desbloqueia
    cooperativa: { filiado: false }, // Lote H6: cooperativa
    eventos: [], // Lote G6: log estruturado { tempo, texto, categoria }
    // Lote G1: tutorial ativo na primeira partida
    tutorial: { ativo: true, passo: 0, completado: false },
    // Lote G4: estatísticas pro dashboard
    stats: {
      receitaTotal: 0,
      despesaTotal: 0,
      sacasVendidasTotal: 0,
      vendasCount: 0,
      melhorLote: null,
      porAno: {}, // { 1: { receita, despesa, sacas } }
    },
    // Lote G7: marcos desbloqueados
    marcos: {},
  };
}

// Verifica todos os marcos. Se algum passou a satisfazer a condição
// (e não estava completado), marca + emite mensagem.
function verificarMarcos(state) {
  if (!state) return state;
  const completos = state.marcos || {};
  let novosCompletos = completos;
  const eventos = [];
  for (const m of MARCOS) {
    if (completos[m.id]?.completado) continue;
    try {
      if (m.condicao(state)) {
        if (novosCompletos === completos) novosCompletos = { ...completos };
        novosCompletos[m.id] = {
          completado: true,
          dataCompleta: { ...state.tempo },
        };
        eventos.push(`🏆 Marco desbloqueado: ${m.icone} ${m.nome}`);
      }
    } catch {}
  }
  if (novosCompletos === completos) return state;
  let novo = { ...state, marcos: novosCompletos };
  for (const e of eventos) novo = comMensagem(novo, e);
  // Bônus de XP por cada marco recém-desbloqueado (1 evento = 1 marco).
  if (eventos.length > 0) novo = ganharXp(novo, eventos.length * XP_MARCO);
  return novo;
}

// Núcleo do tracking: aplica um delta de caixa nos stats (receita/despesa
// + porAno). delta > 0 = receita, delta < 0 = despesa. delta 0 = no-op.
function aplicarDeltaStats(stats, ano, delta) {
  if (!delta) return stats;
  const base = stats || { receitaTotal: 0, despesaTotal: 0, sacasVendidasTotal: 0, vendasCount: 0, melhorLote: null, porAno: {} };
  const porAno = { ...(base.porAno || {}) };
  if (!porAno[ano]) porAno[ano] = { receita: 0, despesa: 0, sacas: 0 };
  porAno[ano] = { ...porAno[ano] };
  const novoStats = { ...base, porAno };
  if (delta > 0) {
    novoStats.receitaTotal = (base.receitaTotal || 0) + delta;
    porAno[ano].receita += delta;
  } else {
    novoStats.despesaTotal = (base.despesaTotal || 0) + Math.abs(delta);
    porAno[ano].despesa += Math.abs(delta);
  }
  return novoStats;
}

// Mexe no caixa E contabiliza nos stats no MESMO passo. Usado dentro do
// AVANCAR, onde várias transações (folha, parcela, venda forçada) ocorrem
// na mesma ação — diff antes/depois netaria tudo e perderia receita/despesa.
function ajustarCaixa(state, delta) {
  return {
    ...state,
    caixa: state.caixa + delta,
    stats: aplicarDeltaStats(state.stats, state.tempo?.ano || 1, delta),
  };
}

// Atualiza stats baseado no diff de caixa entre antes/depois (auto-track).
// Usado pelas ações pontuais (compra/venda); o AVANCAR contabiliza por evento.
function atualizarStatsCaixa(prev, curr) {
  if (!prev || !curr) return curr;
  const delta = (curr.caixa ?? 0) - (prev.caixa ?? 0);
  if (delta === 0) return curr;
  return { ...curr, stats: aplicarDeltaStats(curr.stats, curr.tempo?.ano || 1, delta) };
}

// Avança tutorial se a condição do passo atual foi cumprida.
function avancarTutorialSeNecessario(state, action) {
  if (!state?.tutorial?.ativo) return state;
  const passo = PASSOS_TUTORIAL[state.tutorial.passo];
  if (!passo || passo.final) return state;
  try {
    if (passo.condicao(state, action)) {
      const proximo = state.tutorial.passo + 1;
      if (proximo >= PASSOS_TUTORIAL.length) {
        return { ...state, tutorial: { ...state.tutorial, ativo: false, completado: true } };
      }
      return { ...state, tutorial: { ...state.tutorial, passo: proximo } };
    }
  } catch {}
  return state;
}

/* ---------- Helpers internos ---------- */

// Heurística que classifica evento pelo emoji inicial — usado pelo
// histórico pra filtrar por categoria (Lote G6).
function categorizarEvento(texto) {
  if (/^(💰|🛒|💵|💎|🏡|🏦|🏢)/.test(texto)) return "economia";
  if (/^(🌱|🪨|🛡️|📋|💸)/.test(texto)) return "manejo";
  if (/^(🍒|🌾|⚒️|🚜)/.test(texto)) return "colheita";
  if (/^(🌡️)/.test(texto)) return "secagem";
  if (/^(🌸|🌼|💧|⚠️|💔|📅|📆|❄️|🌨️|🌪️)/.test(texto)) return "ciclo";
  if (/^(🦋|🪲|🍂|🔍)/.test(texto)) return "pragas";
  if (/^(🏆)/.test(texto)) return "marcos";
  if (/^(✂️|🪓)/.test(texto)) return "podas";
  if (/^(❌)/.test(texto)) return "erros";
  return "outros";
}

function comMensagem(state, msg) {
  const evento = {
    tempo: { ...state.tempo },
    texto: msg,
    categoria: categorizarEvento(msg),
  };
  const eventos = [evento, ...(state.eventos || [])].slice(0, 500);
  return { ...state, eventos };
}

function trocarTalhao(state, id, fn) {
  return {
    ...state,
    talhoes: state.talhoes.map((t) => (t.id === id ? fn(t) : t)),
  };
}

// Adiciona XP e, se subiu de nível, emite mensagem de desbloqueio.
function ganharXp(state, quantia) {
  if (!quantia || quantia <= 0) return state;
  const xpAntes = state.xp || 0;
  const nivelAntes = nivelPorXp(xpAntes).nivel;
  const xp = xpAntes + quantia;
  let novo = { ...state, xp };
  const def = nivelPorXp(xp);
  if (def.nivel > nivelAntes) {
    novo = comMensagem(
      novo,
      `⭐ Subiu pro nível ${def.nivel} — ${def.titulo}! Novos itens liberados na roça.`
    );
  }
  return novo;
}

let proxLoteId = 1;
function gerarIdLote() {
  return `l${Date.now().toString(36)}${proxLoteId++}`;
}

/* ---------- Ações ---------- */

function acaoAvancar(state) {
  const passo = passoEmDias(state.fase, state.velocidade);
  const rng = createRng(state.rngState);
  let novo = state;
  let climaHoje = state.climaHoje || null;

  for (let i = 0; i < passo; i++) {
    const antes = novo.tempo;
    novo = { ...novo, tempo: avancarUmDia(novo.tempo) };

    // Sorteia clima + mm de chuva do dia (Lote C)
    const climaDia = sortearClimaDia(rng, novo.tempo.mes);
    const mmDia = sortearMmDia(rng, climaDia);
    climaHoje = { tipo: climaDia, mm: mmDia };

    // Processa efeitos pendentes (Lote A) + recuperação (Lote B) + ciclo (Lote C)
    const novosTalhoes = [];
    const eventosHoje = [];
    for (const t of novo.talhoes) {
      // Pendentes (calcário)
      let r = avancarEfeitosPendentesUmDia(t);
      eventosHoje.push(...r.eventos);
      // Recuperação (esqueletamento / recepa)
      const r2 = avancarRecuperacaoUmDia(r.talhao);
      eventosHoje.push(...r2.eventos);
      // Ciclo fenológico (florada / granação) — só se formado e fora de recuperação
      const podeAcumular = estaFormado(r2.talhao) && !estaEmRecuperacao(r2.talhao);
      // Lote H5: talhão irrigado garante mm diários mínimos
      const mmEfetivo = r2.talhao.irrigado
        ? Math.max(mmDia, IRRIGACAO.mmDiarioGarantido)
        : mmDia;
      const r3 = avancarCicloFenologicoDia(r2.talhao, mmEfetivo, novo.tempo, podeAcumular);
      eventosHoje.push(...r3.eventos);
      // Pragas (Lote D): spawn + dano contínuo
      let tFinal = r3.talhao;
      if (podeAcumular) {
        const r4 = tentarSpawnPragasDia(rng, tFinal, novo.tempo.mes, climaDia);
        eventosHoje.push(...r4.eventos);
        const r5 = aplicarDanoPragasDia(r4.talhao);
        eventosHoje.push(...r5.eventos);
        // Lote H2: dano gradual por seca crítica
        const r6 = aplicarSecaCriticaDia(r5.talhao);
        eventosHoje.push(...r6.eventos);
        tFinal = r6.talhao;
      }
      // Mato cresce (mais com chuva); acima do limiar, rouba sanidade.
      if (tFinal.variedadeId && !estaEmRecuperacao(tFinal)) {
        const cresc = mmDia > 0 ? MATO.crescimentoChuvaDia : MATO.crescimentoSecoDia;
        const mato = Math.min(1, (tFinal.mato || 0) + cresc);
        const sanidade =
          mato >= MATO.limiarDano
            ? Math.max(0, tFinal.sanidade - MATO.danoSanidadeDia)
            : tFinal.sanidade;
        tFinal = { ...tFinal, mato, sanidade };
      }
      novosTalhoes.push(tFinal);
    }
    novo = { ...novo, talhoes: novosTalhoes };
    for (const ev of eventosHoje) novo = comMensagem(novo, ev);

    // Lote H2: sorteio diário de eventos extremos (geada negra, granizo)
    const eventoExt = tentarEventoExtremoDia(rng, novo);
    if (eventoExt) {
      novo = eventoExt.state;
      for (const ev of eventoExt.eventos) novo = comMensagem(novo, ev);
    }

    // Lote H3: atualiza mercado diariamente
    const rMerc = avancarMercadoDia(rng, novo.mercado);
    novo = { ...novo, mercado: rMerc.mercado };
    for (const ev of rMerc.eventos) novo = comMensagem(novo, ev);

    // Lote F: avança transição das certificações em 1 dia
    const rCert = avancarTransicaoDia(novo.certificacoes || {});
    if (rCert.eventos.length > 0) {
      novo = { ...novo, certificacoes: rCert.certs };
      for (const ev of rCert.eventos) novo = comMensagem(novo, ev);
    } else if (rCert.certs !== novo.certificacoes) {
      novo = { ...novo, certificacoes: rCert.certs };
    }

    // Lote F: cobra custo anual em 1/janeiro
    if (novo.tempo.dia === 1 && novo.tempo.mes === 1) {
      const custoAnual = custoAnualCertificacoes(novo.certificacoes);
      if (custoAnual > 0) {
        novo = comMensagem(
          ajustarCaixa(novo, -custoAnual),
          `📋 Custo anual de auditoria das certificações: -R$${custoAnual.toLocaleString("pt-BR")}`
        );
      }
      // Lote H6: anuidade cooperativa
      if (novo.cooperativa?.filiado) {
        novo = comMensagem(
          ajustarCaixa(novo, -COOPERATIVA.anuidade),
          `🏢 Anuidade ${COOPERATIVA.nome}: -R$${COOPERATIVA.anuidade.toLocaleString("pt-BR")}`
        );
      }
    }

    // Lote H5: cobra operação mensal de irrigação no 1º dia do mês
    if (novo.tempo.dia === 1) {
      const haIrrigados = novo.talhoes
        .filter((t) => t.irrigado)
        .reduce((acc, t) => acc + t.hectares, 0);
      if (haIrrigados > 0) {
        const custoMensal = Math.round(haIrrigados * IRRIGACAO.custoMensalPorHectare);
        novo = comMensagem(
          ajustarCaixa(novo, -custoMensal),
          `💧 Operação de irrigação (${haIrrigados.toFixed(1)}ha): -R$${custoMensal}`
        );
      }

      // Lote H1: folha de pagamento mensal + manutenção da equipe
      const folha = folhaPagamentoMensal(novo.equipe);
      if (folha > 0) {
        novo = comMensagem(
          ajustarCaixa(novo, -folha),
          `👥 Folha de pagamento mensal: -R$${folha.toLocaleString("pt-BR")}`
        );
        const r = aplicarManutencaoMensal(novo);
        if (r.eventos.length > 0) {
          novo = { ...novo, talhoes: r.talhoes };
          for (const ev of r.eventos) novo = comMensagem(novo, ev);
        }
      }

      // Lote H7: cobra parcela do empréstimo (se houver)
      if (novo.emprestimo) {
        const r = cobrarParcela(novo.emprestimo);
        novo = comMensagem(
          { ...ajustarCaixa(novo, -r.parcelaPaga), emprestimo: r.emprestimo },
          r.quitado
            ? `🏦 Última parcela paga! Empréstimo Funcafé QUITADO. -R$${r.parcelaPaga.toLocaleString("pt-BR")}`
            : `🏦 Parcela Funcafé (${novo.emprestimo.parcelasRestantes}/${novo.emprestimo.parcelasTotais}): -R$${r.parcelaPaga.toLocaleString("pt-BR")}`
        );
      }
    }

    // Reset anual do ciclo em 1/setembro (nova janela de florada começando)
    if (novo.tempo.dia === 1 && novo.tempo.mes === 9) {
      const reset = [];
      const eventosReset = [];
      for (const t of novo.talhoes) {
        if (estaFormado(t) && !estaEmRecuperacao(t)) {
          const r = resetarCicloAnual(t);
          reset.push(r.talhao);
          eventosReset.push(...r.eventos);
        } else {
          reset.push(t);
        }
      }
      novo = { ...novo, talhoes: reset };
      for (const ev of eventosReset) novo = comMensagem(novo, ev);
    }

    // Secagem em curso: avança 1 dia com clima sorteado
    if (novo.fase === "secagem" && novo.loteSecagem) {
      const clima = sortearClimaDia(rng, novo.tempo.mes);
      const loteSec = avancarSecagemDia(novo.loteSecagem, clima, novo.equipamentos);
      novo = { ...novo, loteSecagem: loteSec };

      if (secagemPronta(loteSec)) {
        novo = finalizarSecagem(novo);
      }
    }

    // Virou ano? envelhece todos os talhões em 1 ano.
    if (novo.tempo.ano > antes.ano) {
      novo = {
        ...novo,
        talhoes: novo.talhoes.map((t) => envelhecerTalhao(t, 1)),
      };
      novo = comMensagem(novo, `📅 Ano ${novo.tempo.ano}: lavouras envelheceram 1 ano.`);
    }
  }

  return { ...novo, rngState: rng.getState(), climaHoje };
}

function finalizarSecagem(state) {
  const lote = state.loteSecagem;
  const talhao = state.talhoes.find((t) => t.id === lote.talhaoId);
  if (!talhao) {
    return { ...state, loteSecagem: null, fase: "normal" };
  }

  // Lote E: classifica o lote principal (cereja, se houve sifão; senão, lote inteiro)
  const cls = classificarLote(lote, talhao, state.equipamentos);
  const lotePrincipal = {
    id: gerarIdLote(),
    sacas: lote.sacas,
    sca: cls.sca,
    tipo: cls.tipo,
    peneira: cls.peneira,
    classeSca: cls.classeSca,
    classeNome: cls.classeNome,
    precoPorSaca: cls.precoPorSaca,
    microlote: cls.microlote,
    variedadeId: lote.variedadeId,
    metodoPos: lote.metodoPos,
    dataColheita: { ...state.tempo },
    tipoLote: lote.boiaPendente ? "cereja" : "natural",
  };

  // Se houve sifão (CD/Lavado), o boia também vira saca no estoque, com qualidade ruim
  const lotesFinais = [lotePrincipal];
  let mensagem = `🌾 Lote pronto: ${lote.sacas} sacas — ${cls.classeNome}.`;

  if (lote.boiaPendente && lote.boiaPendente.sacas > 0) {
    const loteBoia = {
      ...lote.boiaPendente,
      metodoPos: lote.metodoPos,
      talhaoId: lote.talhaoId,
      variedadeId: lote.variedadeId,
    };
    const clsBoia = classificarLote(loteBoia, talhao, state.equipamentos);
    lotesFinais.push({
      id: gerarIdLote(),
      sacas: loteBoia.sacas,
      sca: clsBoia.sca,
      tipo: clsBoia.tipo,
      peneira: clsBoia.peneira,
      classeSca: clsBoia.classeSca,
      classeNome: clsBoia.classeNome,
      precoPorSaca: clsBoia.precoPorSaca,
      microlote: false,
      variedadeId: lote.variedadeId,
      metodoPos: lote.metodoPos,
      dataColheita: { ...state.tempo },
      tipoLote: "boia",
    });
    mensagem += ` Boia: +${loteBoia.sacas} sacas (${clsBoia.classeNome}).`;
  }

  if (lotePrincipal.microlote) {
    mensagem += ` ⭐ MICROLOTE!`;
  }

  // Lote H4: aplicar capacidade da tulha — excedentes vão pra venda forçada
  const capacidade = TULHAS[state.tulha || "pequena"].capacidade;
  const sacasAtuais = state.estoqueSacas.reduce((acc, l) => acc + l.sacas, 0);
  const sacasNovas = lotesFinais.reduce((acc, l) => acc + l.sacas, 0);
  let estoqueProx = [...state.estoqueSacas, ...lotesFinais];
  let caixaAjuste = 0;

  if (sacasAtuais + sacasNovas > capacidade) {
    let excesso = sacasAtuais + sacasNovas - capacidade;
    // Vende excedente FIFO pelos lotes adicionados primeiro (sem prêmios de cert/mercado)
    const novosLotes = [];
    for (const l of estoqueProx) {
      if (excesso <= 0) {
        novosLotes.push(l);
        continue;
      }
      if (l.sacas <= excesso) {
        // vende lote inteiro
        caixaAjuste += l.sacas * l.precoPorSaca;
        excesso -= l.sacas;
      } else {
        // vende parte
        caixaAjuste += excesso * l.precoPorSaca;
        novosLotes.push({ ...l, sacas: l.sacas - excesso });
        excesso = 0;
      }
    }
    estoqueProx = novosLotes;
    if (caixaAjuste > 0) {
      mensagem += ` ⚠️ Tulha lotada! Excedente vendido às pressas: +R$${caixaAjuste.toLocaleString("pt-BR")}.`;
    }
  }

  return comMensagem(
    {
      ...ajustarCaixa(state, caixaAjuste),
      fase: "normal",
      loteSecagem: null,
      estoqueSacas: estoqueProx,
    },
    mensagem
  );
}

function acaoComprarInsumo(state, { insumoId, qtd = 1 }) {
  if (!INSUMOS[insumoId]) return state;
  // Lote H6: desconto cooperativa
  let custoUnit = custoInsumo(insumoId);
  if (state.cooperativa?.filiado) {
    custoUnit = Math.round(custoUnit * (1 - COOPERATIVA.descontoInsumos));
  }
  const custo = custoUnit * qtd;
  if (!podePagar(state.caixa, custo)) {
    return comMensagem(state, `❌ Caixa insuficiente pra ${INSUMOS[insumoId].nome}.`);
  }
  const inventario = {
    ...state.inventario,
    [insumoId]: (state.inventario[insumoId] || 0) + qtd,
  };
  return comMensagem(
    { ...state, caixa: state.caixa - custo, inventario },
    `🛒 +${qtd}× ${INSUMOS[insumoId].nome}: -R$${custo}`
  );
}

function acaoComprarEquipamento(state, { equipId }) {
  if (!EQUIPAMENTOS[equipId]) return state;
  if (state.equipamentos.includes(equipId)) {
    return comMensagem(state, `Você já tem ${EQUIPAMENTOS[equipId].nome}.`);
  }
  if (!desbloqueado(NIVEL_EQUIPAMENTO, equipId, nivelPorXp(state.xp).nivel)) {
    return comMensagem(state, `🔒 ${EQUIPAMENTOS[equipId].nome} desbloqueia no nível ${NIVEL_EQUIPAMENTO[equipId]}.`);
  }
  const custo = custoEquipamento(equipId);
  if (!podePagar(state.caixa, custo)) {
    return comMensagem(state, `❌ Caixa insuficiente pra ${EQUIPAMENTOS[equipId].nome}.`);
  }
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - custo,
      equipamentos: [...state.equipamentos, equipId],
    },
    `🚜 Comprou ${EQUIPAMENTOS[equipId].nome}: -R$${custo.toLocaleString("pt-BR")}`
  );
}

function acaoComprarPropriedade(state, { propId }) {
  if (state.propriedadesCompradas.includes(propId)) return state;
  const r = comprarProp(propId);
  if (!r) return state;
  if (!desbloqueado(NIVEL_PROPRIEDADE, propId, nivelPorXp(state.xp).nivel)) {
    return comMensagem(state, `🔒 Essa propriedade desbloqueia no nível ${NIVEL_PROPRIEDADE[propId]}.`);
  }
  if (!podePagar(state.caixa, r.preco)) {
    return comMensagem(state, `❌ Caixa insuficiente pra essa propriedade.`);
  }
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - r.preco,
      talhoes: [...state.talhoes, r.talhao],
      propriedadesCompradas: [...state.propriedadesCompradas, propId],
    },
    `🏡 Nova propriedade adquirida: -R$${r.preco.toLocaleString("pt-BR")}`
  );
}

function acaoPlantar(state, { talhaoId, variedadeId, densidade = "tradicional", sombreado = false }) {
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao || talhao.variedadeId) return state;
  if (!VARIEDADES[variedadeId]) return state;
  if (!desbloqueado(NIVEL_VARIEDADE, variedadeId, nivelPorXp(state.xp).nivel)) {
    return comMensagem(state, `🔒 ${VARIEDADES[variedadeId].nome} desbloqueia no nível ${NIVEL_VARIEDADE[variedadeId]}.`);
  }
  // Lote H8+H9: custo escalonado pela densidade × sombreamento
  const multDens = DENSIDADES[densidade]?.multiplicadorCusto || 1.0;
  const multSombra = sombreado ? SOMBREAMENTO.multiplicadorCusto : 1.0;
  const custo = Math.round(
    talhao.hectares * CUSTO_PLANTIO_POR_HECTARE * multDens * multSombra
  );
  if (!podePagar(state.caixa, custo)) {
    return comMensagem(state, `❌ Caixa insuficiente pra plantar (R$${custo}).`);
  }
  const densDef = DENSIDADES[densidade];
  return comMensagem(
    {
      ...trocarTalhao(state, talhaoId, (t) =>
        plantarTalhao(t, variedadeId, densidade, sombreado)
      ),
      caixa: state.caixa - custo,
    },
    `🌱 Plantou ${VARIEDADES[variedadeId].nome} (${densDef.nome}${sombreado ? " · sombreado" : ""}): -R$${custo}`
  );
}

function acaoAplicarInsumo(state, { talhaoId, insumoId }) {
  const qtd = state.inventario[insumoId] || 0;
  if (qtd <= 0) {
    return comMensagem(state, `❌ Sem ${INSUMOS[insumoId]?.nome || insumoId} no estoque.`);
  }
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao || !talhao.variedadeId) return state;

  // Lote D: defensivo zera pragas ANTES de aplicar (efeito principal)
  const tinhaPragas = Object.keys(talhao.pragas || {}).length > 0;
  // Adubo na janela de florada (set-nov) = "adubação de choque" → nutre a safra.
  const nutriFlorada = insumoId === "adubo" && NUTRICAO_FLORADA.meses.includes(state.tempo.mes);
  let novoState = trocarTalhao(state, talhaoId, (t) => {
    let t2 = t;
    if (insumoId === "defensivo") t2 = zerarPragas(t2);
    t2 = aplicarInsumo(t2, insumoId);
    if (nutriFlorada) t2 = { ...t2, ciclo: { ...(t2.ciclo || {}), nutrido: true } };
    return t2;
  });
  novoState = {
    ...novoState,
    inventario: { ...state.inventario, [insumoId]: qtd - 1 },
  };

  // Lote F: defensivo INVALIDA certificação orgânica (em transição ou ativa)
  if (insumoId === "defensivo") {
    const rInv = invalidarPorDefensivo(novoState.certificacoes || {});
    if (rInv.eventos.length > 0) {
      novoState = { ...novoState, certificacoes: rInv.certs };
      for (const ev of rInv.eventos) novoState = comMensagem(novoState, ev);
    }
  }

  const msg =
    insumoId === "defensivo"
      ? tinhaPragas
        ? `🛡️ Defensivo eliminou as pragas do talhão.`
        : `🛡️ Defensivo aplicado preventivamente.`
      : nutriFlorada
        ? `🌱 Adubação de florada aplicada — safra fortalecida!`
        : `🌱 Aplicou ${INSUMOS[insumoId].nome} no talhão.`;
  return comMensagem(novoState, msg);
}

function acaoColher(state, { talhaoId, metodo }) {
  if (state.fase !== "normal") {
    return comMensagem(state, `❌ Já tem colheita em andamento.`);
  }
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao || !talhao.variedadeId) return state;
  if (talhao.idadeAnos < 3) {
    return comMensagem(state, `❌ Lavoura ainda não formou (precisa 3 anos).`);
  }
  // Fora da janela de colheita (mai–ago)? regra mora no reducer, não só na UI.
  if (!estaEpocaColheita(state.tempo)) {
    return comMensagem(state, `❌ Fora da época de colheita (mai–ago).`);
  }
  // Já colheu esta safra? só pode de novo após o reset do ciclo (1/set).
  if (talhao.ciclo?.safraColhida) {
    return comMensagem(state, `❌ Esse talhão já foi colhido nesta safra.`);
  }

  // Colhedora não opera em montanhoso
  if (metodo === "colhedora") {
    if (!state.equipamentos.includes("colhedora")) {
      return comMensagem(state, `❌ Você não tem colhedora.`);
    }
    if (talhao.terreno === "montanhoso") {
      return comMensagem(state, `❌ Colhedora não opera em terreno montanhoso.`);
    }
  }

  const mat = calcularMaturacao(talhao, state.tempo.mes);
  const colheita = colher(talhao, mat, metodo, state.equipamentos, state.equipe);
  if (!colheita || colheita.sacas === 0) {
    return comMensagem(state, `❌ Talhão sem nada pra colher neste mês.`);
  }

  // Custos da colheita
  const maoObra = (CUSTO_MAO_OBRA_PANHA[metodo] || 0) * colheita.sacas;
  const custoOp = metodo === "colhedora" ? EQUIPAMENTOS.colhedora.custoOperacao * 5 : 0;
  const custoTotal = maoObra + custoOp;

  // Marca a safra como colhida (trava re-colheita até o reset de 1/set).
  // A bienalidade alterna no RESET ANUAL (1/set), não na colheita.
  const stateColhido = trocarTalhao(state, talhaoId, (t) => ({
    ...t,
    ciclo: { ...(t.ciclo || {}), safraColhida: true },
  }));

  return comMensagem(
    {
      ...stateColhido,
      caixa: stateColhido.caixa - custoTotal,
      colheitaPendente: { ...colheita, talhaoId, variedadeId: talhao.variedadeId },
      fase: "aguardando_pos",
    },
    `🍒 Colheu ${colheita.sacas} sacas (${metodo}): -R$${custoTotal}.`
  );
}

function acaoIniciarPosColheita(state, { metodoPos }) {
  if (state.fase !== "aguardando_pos" || !state.colheitaPendente) return state;
  if (!METODOS_POS[metodoPos]) return state;
  const custo = custoMetodoPos(metodoPos);
  if (!podePagar(state.caixa, custo)) {
    return comMensagem(state, `❌ Caixa insuficiente pro método ${METODOS_POS[metodoPos].nome}.`);
  }
  const ch = state.colheitaPendente;
  const lote = iniciarSecagem(ch, metodoPos, ch.talhaoId, ch.variedadeId);
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - custo,
      colheitaPendente: null,
      loteSecagem: lote,
      fase: "secagem",
    },
    `🌡️ Secagem iniciada (${METODOS_POS[metodoPos].nome}).`
  );
}

function mercadoEfetivo(state) {
  let merc = fatorMercado(state.mercado);
  // Lote H6: floor garantido se cooperativa
  if (state.cooperativa?.filiado) {
    merc = Math.max(merc, COOPERATIVA.floorMercado);
  }
  return merc;
}

function acaoVenderLote(state, { loteId }) {
  const lote = state.estoqueSacas.find((l) => l.id === loteId);
  if (!lote) return state;
  // Lote H3 + H6: aplica multiplicador de mercado (com floor se coop)
  const precoComCert = precoComCertificacoes(lote.precoPorSaca, state.certificacoes);
  const precoFinal = Math.round(precoComCert * mercadoEfetivo(state));
  const valor = lote.sacas * precoFinal;
  // Lote G4: atualiza melhor lote + contagem
  const stats = state.stats || {};
  const ehMelhor =
    !stats.melhorLote ||
    (lote.sca || 0) > (stats.melhorLote.sca || 0) ||
    valor > (stats.melhorLote.valor || 0);
  const novoMelhor = ehMelhor
    ? {
        sca: lote.sca || 0,
        classe: lote.classeNome,
        precoPorSaca: precoFinal,
        sacas: lote.sacas,
        valor,
        variedadeId: lote.variedadeId,
        ano: state.tempo.ano,
      }
    : stats.melhorLote;
  const ano = state.tempo.ano;
  const porAno = { ...(stats.porAno || {}) };
  if (!porAno[ano]) porAno[ano] = { receita: 0, despesa: 0, sacas: 0 };
  porAno[ano] = { ...porAno[ano], sacas: (porAno[ano].sacas || 0) + lote.sacas };

  const vendido = comMensagem(
    {
      ...state,
      caixa: state.caixa + valor,
      estoqueSacas: state.estoqueSacas.filter((l) => l.id !== loteId),
      stats: {
        ...stats,
        sacasVendidasTotal: (stats.sacasVendidasTotal || 0) + lote.sacas,
        vendasCount: (stats.vendasCount || 0) + 1,
        melhorLote: novoMelhor,
        porAno,
      },
    },
    `💰 Vendeu ${lote.sacas} sacas (${lote.classeNome}): +R$${valor.toLocaleString("pt-BR")}`
  );
  return ganharXp(vendido, xpVender(lote.sacas));
}

function acaoAderirCertificacao(state, { certId }) {
  const def = CERTIFICACOES[certId];
  if (!def) return state;
  if (state.certificacoes?.[certId]) {
    return comMensagem(state, `Você já tem ${def.nome}.`);
  }
  if (!podePagar(state.caixa, def.custoAdesao)) {
    return comMensagem(state, `❌ Caixa insuficiente pra ${def.nome} (R$${def.custoAdesao.toLocaleString("pt-BR")}).`);
  }
  const c = aderirCert(certId, state.tempo);
  const msg = c.emTransicao
    ? `${def.icone} Iniciou transição pra ${def.nome}. Ativa em ${Math.ceil(def.diasTransicao / 30)} meses.`
    : `${def.icone} ${def.nome} ativada! Prêmio +${Math.round(def.premio * 100)}% no preço da saca.`;
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - def.custoAdesao,
      certificacoes: { ...(state.certificacoes || {}), [certId]: c },
    },
    msg
  );
}

function acaoFiliarCooperativa(state) {
  if (state.cooperativa?.filiado) {
    return comMensagem(state, `Você já é cooperado.`);
  }
  if (!podePagar(state.caixa, COOPERATIVA.custoAdesao)) {
    return comMensagem(state, `❌ Caixa insuficiente pra adesão (R$${COOPERATIVA.custoAdesao.toLocaleString("pt-BR")}).`);
  }
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - COOPERATIVA.custoAdesao,
      cooperativa: { filiado: true },
    },
    `🏢 Filiado à ${COOPERATIVA.nome}! Desconto ${Math.round(COOPERATIVA.descontoInsumos * 100)}% em insumos + preço mínimo garantido. -R$${COOPERATIVA.custoAdesao.toLocaleString("pt-BR")}.`
  );
}

function acaoUpgradeTulha(state, { tipo }) {
  if (!TULHAS[tipo]) return state;
  const atual = state.tulha || "pequena";
  const idxAtual = TULHA_PROGRESSAO.indexOf(atual);
  const idxNovo = TULHA_PROGRESSAO.indexOf(tipo);
  if (idxNovo <= idxAtual) {
    return comMensagem(state, `❌ Já tem essa tulha ou maior.`);
  }
  const def = TULHAS[tipo];
  if (!podePagar(state.caixa, def.custoUpgrade)) {
    return comMensagem(state, `❌ Caixa insuficiente (R$${def.custoUpgrade.toLocaleString("pt-BR")}).`);
  }
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - def.custoUpgrade,
      tulha: tipo,
    },
    `${def.icone} ${def.nome} construída (${def.capacidade} sacas). -R$${def.custoUpgrade.toLocaleString("pt-BR")}.`
  );
}

function acaoPedirEmprestimo(state, { valor }) {
  if (state.emprestimo) {
    return comMensagem(state, `❌ Já tem um empréstimo ativo — quite antes de pegar outro.`);
  }
  const limite = limiteEmprestimo(state);
  if (valor < 5000) {
    return comMensagem(state, `❌ Empréstimo mínimo: R$5.000.`);
  }
  if (valor > limite) {
    return comMensagem(state, `❌ Limite atual: R$${limite.toLocaleString("pt-BR")}.`);
  }
  const emprestimo = criarEmprestimo(valor);
  return comMensagem(
    {
      ...state,
      caixa: state.caixa + valor,
      emprestimo,
    },
    `🏦 Funcafé liberou R$${valor.toLocaleString("pt-BR")}. Parcela mensal: R$${emprestimo.valorParcela.toLocaleString("pt-BR")} × ${emprestimo.parcelasTotais}.`
  );
}

function acaoContratarMensalista(state) {
  const equipe = state.equipe || equipeVazia();
  const custoIni = EQUIPE.mensalista.salarioMensal; // 1º mês na contratação
  if (!podePagar(state.caixa, custoIni)) {
    return comMensagem(state, `❌ Caixa insuficiente pra contratar mensalista.`);
  }
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - custoIni,
      equipe: { ...equipe, mensalistas: (equipe.mensalistas || 0) + 1 },
    },
    `👤 Contratou 1 mensalista (1º salário pago: -R$${custoIni}).`
  );
}

function acaoDemitirMensalista(state) {
  const equipe = state.equipe || equipeVazia();
  if (!equipe.mensalistas || equipe.mensalistas <= 0) {
    return comMensagem(state, `❌ Sem mensalistas pra demitir.`);
  }
  return comMensagem(
    {
      ...state,
      equipe: { ...equipe, mensalistas: equipe.mensalistas - 1 },
    },
    `👤 Demitiu 1 mensalista.`
  );
}

function acaoContratarEncarregado(state) {
  const equipe = state.equipe || equipeVazia();
  if (equipe.encarregado) {
    return comMensagem(state, `❌ Já tem encarregado (máximo 1).`);
  }
  const custoIni = EQUIPE.encarregado.salarioMensal;
  if (!podePagar(state.caixa, custoIni)) {
    return comMensagem(state, `❌ Caixa insuficiente pra contratar encarregado.`);
  }
  return comMensagem(
    {
      ...state,
      caixa: state.caixa - custoIni,
      equipe: { ...equipe, encarregado: true },
    },
    `👔 Contratou encarregado (+15% rendimento panha). 1º salário: -R$${custoIni}.`
  );
}

function acaoDemitirEncarregado(state) {
  const equipe = state.equipe || equipeVazia();
  if (!equipe.encarregado) {
    return comMensagem(state, `❌ Sem encarregado pra demitir.`);
  }
  return comMensagem(
    { ...state, equipe: { ...equipe, encarregado: false } },
    `👔 Demitiu encarregado.`
  );
}

function acaoInstalarIrrigacao(state, { talhaoId }) {
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao) return state;
  if (talhao.irrigado) {
    return comMensagem(state, `❌ Talhão já é irrigado.`);
  }
  const custo = Math.round(
    IRRIGACAO.custoBase + IRRIGACAO.custoPorHectare * talhao.hectares
  );
  if (!podePagar(state.caixa, custo)) {
    return comMensagem(state, `❌ Caixa insuficiente pra irrigação (R$${custo.toLocaleString("pt-BR")}).`);
  }
  return comMensagem(
    {
      ...trocarTalhao(state, talhaoId, (t) => ({ ...t, irrigado: true })),
      caixa: state.caixa - custo,
    },
    `💧 Irrigação instalada (${talhao.hectares}ha): -R$${custo.toLocaleString("pt-BR")}. Mensal: R$${Math.round(talhao.hectares * IRRIGACAO.custoMensalPorHectare)}/mês.`
  );
}

function acaoAmostrar(state, { talhaoId }) {
  if (!podePagar(state.caixa, CUSTO_AMOSTRAGEM)) {
    return comMensagem(state, `❌ Caixa insuficiente pra amostragem (R$${CUSTO_AMOSTRAGEM}).`);
  }
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao) return state;
  const ativas = Object.entries(talhao.pragas || {});
  const novoState = {
    ...trocarTalhao(state, talhaoId, amostrarTalhao),
    caixa: state.caixa - CUSTO_AMOSTRAGEM,
  };
  if (ativas.length === 0) {
    return comMensagem(novoState, `🔍 Amostragem: nenhuma praga detectada (-R$${CUSTO_AMOSTRAGEM}).`);
  }
  return comMensagem(
    novoState,
    `🔍 Amostragem revelou ${ativas.length} ${ativas.length === 1 ? "praga" : "pragas"} (-R$${CUSTO_AMOSTRAGEM}).`
  );
}

function acaoCapinar(state, { talhaoId }) {
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao || !talhao.variedadeId) return state;
  if ((talhao.mato || 0) <= 0) {
    return comMensagem(state, `O talhão já está limpo de mato.`);
  }
  const custo = Math.round(talhao.hectares * CUSTO_CAPINA_POR_HECTARE);
  if (!podePagar(state.caixa, custo)) {
    return comMensagem(state, `❌ Caixa insuficiente pra capinar (R$${custo}).`);
  }
  return comMensagem(
    {
      ...trocarTalhao(state, talhaoId, (t) => ({ ...t, mato: 0 })),
      caixa: state.caixa - custo,
    },
    `🧹 Talhão capinado (${talhao.hectares}ha): -R$${custo}. Mato controlado.`
  );
}

function acaoEsqueletar(state, { talhaoId }) {
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao) return state;
  if (!podeSerEsqueletado(talhao)) {
    return comMensagem(
      state,
      `❌ Talhão não pode ser esqueletado (precisa ≥${ESQUELETAMENTO.idadeMinima} anos, fora de recuperação).`
    );
  }
  if (!podePagar(state.caixa, ESQUELETAMENTO.custo)) {
    return comMensagem(state, `❌ Caixa insuficiente (R$${ESQUELETAMENTO.custo}).`);
  }
  return comMensagem(
    {
      ...trocarTalhao(state, talhaoId, iniciarEsqueletamento),
      caixa: state.caixa - ESQUELETAMENTO.custo,
    },
    `✂️ Esqueletamento iniciado: -R$${ESQUELETAMENTO.custo}. Volta em ~1 ano.`
  );
}

function acaoRecepar(state, { talhaoId }) {
  const talhao = state.talhoes.find((t) => t.id === talhaoId);
  if (!talhao) return state;
  if (!podeSerRecepado(talhao)) {
    return comMensagem(
      state,
      `❌ Talhão não pode ser recepado (precisa ≥${RECEPA.idadeMinima} anos, fora de recuperação).`
    );
  }
  if (!podePagar(state.caixa, RECEPA.custo)) {
    return comMensagem(state, `❌ Caixa insuficiente (R$${RECEPA.custo}).`);
  }
  return comMensagem(
    {
      ...trocarTalhao(state, talhaoId, iniciarRecepa),
      caixa: state.caixa - RECEPA.custo,
    },
    `🪓 Recepa iniciada: -R$${RECEPA.custo}. Volta em ~2 anos.`
  );
}

function acaoVenderTudo(state) {
  if (state.estoqueSacas.length === 0) return state;
  // Lote F + H3 + H6: prêmio das certs + multiplicador de mercado (com floor coop)
  const merc = mercadoEfetivo(state);
  const total = state.estoqueSacas.reduce(
    (acc, l) =>
      acc +
      l.sacas *
        Math.round(
          precoComCertificacoes(l.precoPorSaca, state.certificacoes) * merc
        ),
    0
  );
  const sacas = state.estoqueSacas.reduce((acc, l) => acc + l.sacas, 0);
  // Lote G4: atualiza stats
  const stats = state.stats || {};
  const ano = state.tempo.ano;
  const porAno = { ...(stats.porAno || {}) };
  if (!porAno[ano]) porAno[ano] = { receita: 0, despesa: 0, sacas: 0 };
  porAno[ano] = { ...porAno[ano], sacas: (porAno[ano].sacas || 0) + sacas };
  // Procura o melhor lote dentre os vendidos
  let melhor = stats.melhorLote;
  for (const l of state.estoqueSacas) {
    const preco = precoComCertificacoes(l.precoPorSaca, state.certificacoes);
    const valor = l.sacas * preco;
    if (!melhor || (l.sca || 0) > (melhor.sca || 0) || valor > (melhor.valor || 0)) {
      melhor = {
        sca: l.sca || 0,
        classe: l.classeNome,
        precoPorSaca: preco,
        sacas: l.sacas,
        valor,
        variedadeId: l.variedadeId,
        ano,
      };
    }
  }
  const novosStats = {
    ...stats,
    sacasVendidasTotal: (stats.sacasVendidasTotal || 0) + sacas,
    vendasCount: (stats.vendasCount || 0) + state.estoqueSacas.length,
    melhorLote: melhor,
    porAno,
  };
  const vendido = comMensagem(
    {
      ...state,
      caixa: state.caixa + total,
      estoqueSacas: [],
      stats: novosStats,
    },
    `💰 Vendeu todo o estoque (${sacas} sacas): +R$${total.toLocaleString("pt-BR")}`
  );
  return ganharXp(vendido, xpVender(sacas));
}

/* ---------- Dispatcher ---------- */

// Ações que NÃO devem passar pelo diff de caixa de atualizarStatsCaixa:
// - AVANCAR já contabiliza por evento (via ajustarCaixa);
// - CARREGAR_SAVE / NOVA_PARTIDA / APAGAR trocam de partida (descontínuo):
//   o diff entre dois jogos diferentes geraria receita/despesa fantasma.
const ACOES_SEM_DIFF_STATS = new Set([
  "AVANCAR",
  "CARREGAR_SAVE",
  "NOVA_PARTIDA",
  "APAGAR",
]);

export function reducer(state, action) {
  const novo = reducerCore(state, action);
  // Lote G4: tracking de receita/despesa por diff antes/depois (ações pontuais).
  const comStats = ACOES_SEM_DIFF_STATS.has(action.type)
    ? novo
    : atualizarStatsCaixa(state, novo);
  // Lote G7: verifica marcos a cada ação
  const comMarcos = verificarMarcos(comStats);
  // Lote G1: avança tutorial após cada ação se condição cumprida
  return avancarTutorialSeNecessario(comMarcos, action);
}

function reducerCore(state, action) {
  switch (action.type) {
    case "NOVA_PARTIDA":
      return novaPartida(action.payload.modo, action.payload.perfil);
    case "CARREGAR_SAVE":
      return action.payload;
    case "APAGAR":
      return ESTADO_VAZIO;
    case "AVANCAR":
      return state ? acaoAvancar(state) : state;
    case "COMPRAR_INSUMO":
      return acaoComprarInsumo(state, action.payload);
    case "COMPRAR_EQUIPAMENTO":
      return acaoComprarEquipamento(state, action.payload);
    case "COMPRAR_PROPRIEDADE":
      return acaoComprarPropriedade(state, action.payload);
    case "PLANTAR":
      return acaoPlantar(state, action.payload);
    case "APLICAR_INSUMO":
      return acaoAplicarInsumo(state, action.payload);
    case "COLHER":
      return acaoColher(state, action.payload);
    case "INICIAR_POS_COLHEITA":
      return acaoIniciarPosColheita(state, action.payload);
    case "VENDER_LOTE":
      return acaoVenderLote(state, action.payload);
    case "VENDER_TUDO":
      return acaoVenderTudo(state);
    case "ESQUELETAR":
      return acaoEsqueletar(state, action.payload);
    case "RECEPAR":
      return acaoRecepar(state, action.payload);
    case "AMOSTRAR":
      return acaoAmostrar(state, action.payload);
    case "CAPINAR":
      return acaoCapinar(state, action.payload);
    case "INSTALAR_IRRIGACAO":
      return acaoInstalarIrrigacao(state, action.payload);
    case "CONTRATAR_MENSALISTA":
      return acaoContratarMensalista(state);
    case "DEMITIR_MENSALISTA":
      return acaoDemitirMensalista(state);
    case "CONTRATAR_ENCARREGADO":
      return acaoContratarEncarregado(state);
    case "DEMITIR_ENCARREGADO":
      return acaoDemitirEncarregado(state);
    case "PEDIR_EMPRESTIMO":
      return acaoPedirEmprestimo(state, action.payload);
    case "UPGRADE_TULHA":
      return acaoUpgradeTulha(state, action.payload);
    case "FILIAR_COOPERATIVA":
      return acaoFiliarCooperativa(state);
    case "ADERIR_CERTIFICACAO":
      return acaoAderirCertificacao(state, action.payload);
    case "SET_VELOCIDADE":
      return state ? { ...state, velocidade: action.payload.dias } : state;
    case "REINICIAR_TUTORIAL":
      return state ? { ...state, tutorial: { ativo: true, passo: 0, completado: false } } : state;
    case "PULAR_TUTORIAL":
      return state ? { ...state, tutorial: { ativo: false, passo: 0, completado: false } } : state;
    case "AVANCAR_TUTORIAL":
      if (!state?.tutorial?.ativo) return state;
      {
        const prox = state.tutorial.passo + 1;
        if (prox >= PASSOS_TUTORIAL.length) {
          return { ...state, tutorial: { ...state.tutorial, ativo: false, completado: true } };
        }
        return { ...state, tutorial: { ...state.tutorial, passo: prox } };
      }
    case "COMPLETAR_TUTORIAL":
      return state ? { ...state, tutorial: { ...(state.tutorial || {}), ativo: false, completado: true } } : state;
    default:
      return state;
  }
}
