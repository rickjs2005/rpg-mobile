/* ============================================================
   CICLO FENOLÓGICO — Lote C.
   Tudo que orbita florada/granação/safra-anual mora aqui.

   Regras chave:
   - Florada principal: precisa de VERANICO_DIAS_MIN dias secos
     seguidos de chuva ≥ CHUVA_FLORADA_MM_MIN, na janela set-out.
     Sem florada principal = safra colapsa a 10%.
   - Floradas extras: cada veranico+chuva adicional no ciclo gera
     mais 1 florada → maturação desuniforme (mais verde no saco).
   - Granação: chuva acumulada em jan-mar enche o grão. Pouca
     chuva = sacas leves, fator linear (mínimo 30%).
   - Reset anual: em 1/set, o ciclo da safra que passou é zerado
     pra começar a próxima janela de florada.
   ============================================================ */

import {
  VERANICO_DIAS_MIN,
  CHUVA_FLORADA_MM_MIN,
  FLORADA_JANELA,
  GRANACAO_MESES,
  GRANACAO_MM_IDEAL,
  NUTRICAO_FLORADA,
} from "../data/constantes.js";

export function cicloVazio() {
  return {
    diasSemChuva: 0,
    floradaPrincipalOk: false,
    numFloradas: 0,
    chuvaGranacao: 0,
    safraColhida: false, // trava: 1 colheita por ano-safra (reset em 1/set)
    nutrido: false, // adubação de florada feita? (set-nov) — afeta produção
  };
}

// Ciclo "como se a safra anterior tivesse rolado normalmente".
// Usado pra inicializar talhões já formados no início da partida
// (rocinha pronta, lavoura pronta comprada).
export function cicloProduzindoSafra() {
  return {
    diasSemChuva: 0,
    floradaPrincipalOk: true,
    numFloradas: 1,
    chuvaGranacao: 400, // boa granação (escala p/ ideal 550)
    safraColhida: false,
    nutrido: true, // já produzindo normalmente
  };
}

// Avança 1 dia no ciclo fenológico do talhão.
// Retorna { talhao, eventos }. Talhão em formação ou recuperação não acumula.
export function avancarCicloFenologicoDia(talhao, mmDia, tempo, podeAcumular) {
  if (!podeAcumular) return { talhao, eventos: [] };

  const ciclo = talhao.ciclo || cicloVazio();
  const eventos = [];
  const naJanela =
    tempo.mes >= FLORADA_JANELA.inicioMes && tempo.mes <= FLORADA_JANELA.fimMes;

  let diasSemChuva = ciclo.diasSemChuva;
  let floradaPrincipalOk = ciclo.floradaPrincipalOk;
  let numFloradas = ciclo.numFloradas;

  if (mmDia >= CHUVA_FLORADA_MM_MIN) {
    // Chuva — verifica se dispara florada
    if (naJanela && diasSemChuva >= VERANICO_DIAS_MIN) {
      if (!floradaPrincipalOk) {
        eventos.push(`🌸 Florada principal aberta! Safra do ano que vem encaminhada.`);
        floradaPrincipalOk = true;
        numFloradas = 1;
      } else {
        eventos.push(`🌼 Mais uma florada — risco de maturação desuniforme.`);
        numFloradas = numFloradas + 1;
      }
    }
    diasSemChuva = 0;
  } else {
    diasSemChuva = diasSemChuva + 1;
    // Avisa quando completa um veranico longo dentro da janela
    if (diasSemChuva === VERANICO_DIAS_MIN && naJanela) {
      eventos.push(`⚠️ Veranico de ${VERANICO_DIAS_MIN}d — café no ponto de florar com a próxima chuva.`);
    }
  }

  // Acumula chuva de granação (jan-mar)
  let chuvaGranacao = ciclo.chuvaGranacao;
  if (GRANACAO_MESES.includes(tempo.mes)) {
    chuvaGranacao = chuvaGranacao + mmDia;
  }

  return {
    talhao: {
      ...talhao,
      ciclo: {
        diasSemChuva,
        floradaPrincipalOk,
        numFloradas,
        chuvaGranacao,
        safraColhida: ciclo.safraColhida || false,
        nutrido: ciclo.nutrido || false,
      },
    },
    eventos,
  };
}

// Reset anual: em 1/set, antes da nova janela de florada começar.
// Retorna { talhao, eventos } pra avisar se a safra anterior falhou.
export function resetarCicloAnual(talhao) {
  const ciclo = talhao.ciclo || cicloVazio();
  const eventos = [];
  if (!ciclo.floradaPrincipalOk && talhao.variedadeId) {
    eventos.push(`💔 Janela de florada fechou sem florada principal — safra perdida.`);
  }
  // Bienalidade: ao virar a temporada (1/set), alterna alta ↔ baixa.
  const proximo = talhao.cicloBienal === "alta" ? "baixa" : "alta";
  eventos.push(
    `📊 Nova temporada começou — safra ${proximo === "alta" ? "ALTA" : "baixa"} esperada este ano.`
  );
  return {
    talhao: { ...talhao, ciclo: cicloVazio(), cicloBienal: proximo },
    eventos,
  };
}

/* ---------- Multipliers consumidos pela panha ---------- */

// Multiplier de PRODUÇÃO (sacas) baseado em florada + granação.
export function fatorCicloProducao(talhao) {
  const ciclo = talhao.ciclo || cicloVazio();
  const floradaFator = ciclo.floradaPrincipalOk ? 1.0 : 0.1;
  const granacaoFator = Math.max(
    0.3,
    Math.min(1.0, ciclo.chuvaGranacao / GRANACAO_MM_IDEAL)
  );
  // Nutrição de florada: sem a adubação de choque, a safra rende menos.
  const nutricaoFator = ciclo.nutrido ? 1.0 : NUTRICAO_FLORADA.fatorSemNutricao;
  return floradaFator * granacaoFator * nutricaoFator;
}

// Ajusta o perfil de maturação por número de floradas:
// mais floradas escalonadas → mais frutos verdes no momento da panha.
export function ajustarMaturacaoPorFloradas(perfil, numFloradas) {
  const extras = Math.max(0, (numFloradas || 1) - 1);
  if (extras === 0) return perfil;
  const ajuste = Math.min(0.30, extras * 0.15);
  const maduro = Math.max(0, perfil.maduro - ajuste * 0.7);
  const verde = perfil.verde + ajuste;
  const seco = Math.max(0, perfil.seco - ajuste * 0.3);
  const soma = maduro + verde + seco || 1;
  return { maduro: maduro / soma, verde: verde / soma, seco: seco / soma };
}
