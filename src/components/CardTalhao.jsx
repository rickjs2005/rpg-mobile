import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema, corVariedade } from "../styles/tema.js";
import { VARIEDADES } from "../data/cafe.js";
import { INSUMOS } from "../data/economia.js";
import { useState } from "react";
import {
  ANOS_FORMACAO,
  ESQUELETAMENTO,
  RECEPA,
  VERANICO_DIAS_MIN,
  GRANACAO_MM_IDEAL,
  CUSTO_AMOSTRAGEM,
  IRRIGACAO,
  DENSIDADES,
  CUSTO_PLANTIO_POR_HECTARE,
  SOMBREAMENTO,
} from "../data/constantes.js";
import { PRAGAS, nivelPraga } from "../data/pragas.js";
import { temPragaNaoRevelada } from "../logic/pragas.js";
import { estaEpocaColheita } from "../logic/tempo.js";
import {
  categoriaIdade,
  estaEmRecuperacao,
  podeSerEsqueletado,
  podeSerRecepado,
} from "../logic/talhao.js";

function statusTalhao(t) {
  if (!t.variedadeId) return { texto: "vazio", cor: "#555" };
  if (t.estado === "recuperando_esqueletamento")
    return {
      texto: `✂️ esqueletado · ${t.diasRecuperacao}d restantes`,
      cor: tema.azul,
    };
  if (t.estado === "recuperando_recepa")
    return {
      texto: `🪓 recepado · ${t.diasRecuperacao}d restantes`,
      cor: tema.azul,
    };
  if (t.idadeAnos < ANOS_FORMACAO)
    return { texto: `formando (${t.idadeAnos}/${ANOS_FORMACAO} anos)`, cor: tema.azul };
  return {
    texto: `${categoriaIdade(t.idadeAnos, t.densidade)} · ${t.idadeAnos} anos`,
    cor: tema.verde,
  };
}

export default function CardTalhao({ talhao }) {
  const { state, dispatch } = useJogo();
  const [densidadeEscolhida, setDensidadeEscolhida] = useState("tradicional");
  const [sombreadoEscolhido, setSombreadoEscolhido] = useState(false);
  const variedade = talhao.variedadeId ? VARIEDADES[talhao.variedadeId] : null;
  const status = statusTalhao(talhao);
  const sanidadePct = Math.round(talhao.sanidade * 100);
  const emRecuperacao = estaEmRecuperacao(talhao);
  const podeColher =
    talhao.variedadeId &&
    talhao.idadeAnos >= ANOS_FORMACAO &&
    state.fase === "normal" &&
    estaEpocaColheita(state.tempo) &&
    !emRecuperacao;
  const ehVazio = !talhao.variedadeId;
  const podeEsq = podeSerEsqueletado(talhao);
  const podeRec = podeSerRecepado(talhao);
  const insumosNoInv = Object.keys(INSUMOS).filter(
    (k) => (state.inventario[k] || 0) > 0
  );

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: variedade ? corVariedade(variedade.cor) : "#555" },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>
            {variedade ? variedade.nome : "Talhão sem cultura"}
          </Text>
          <Text style={styles.status}>
            {status.texto}   {talhao.terreno === "plano" ? "🟩 Plano" : "⛰️ Montanhoso"}
          </Text>
        </View>
        {!ehVazio && (
          <View style={styles.sanidadeBox}>
            <Text style={styles.sanidadeLabel}>Sanidade</Text>
            <Text
              style={[
                styles.sanidadeValor,
                sanidadePct < 40 && { color: tema.vermelho },
              ]}
            >
              {sanidadePct}%
            </Text>
          </View>
        )}
      </View>

      {!ehVazio && (
        <View style={styles.statsBar}>
          <Text style={styles.statTxt}>📏 {talhao.hectares} ha</Text>
          <Text style={styles.statTxt}>
            🌳 {talhao.pes.toLocaleString("pt-BR")} pés
          </Text>
        </View>
      )}

      {!ehVazio && (
        <View style={styles.barra}>
          <View
            style={[
              styles.barraFill,
              { width: `${sanidadePct}%`, backgroundColor: corBarra(sanidadePct) },
            ]}
          >
            <View style={styles.barraShine} />
          </View>
        </View>
      )}

      {!ehVazio && (
        <View style={styles.chips}>
          <View
            style={[
              styles.chip,
              talhao.cicloBienal === "alta" ? styles.chipAlta : styles.chipBaixa,
            ]}
          >
            <Text style={styles.chipTxt}>
              📊 Próx. safra: {talhao.cicloBienal === "alta" ? "alta" : "baixa"}
            </Text>
          </View>
          {(talhao.efeitosPendentes || []).map((e, i) => (
            <View key={i} style={[styles.chip, styles.chipPendente]}>
              <Text style={styles.chipTxt}>
                🪨 Calcário em {e.diasRestantes}d
              </Text>
            </View>
          ))}
          {/* Lote C: status do ciclo fenológico */}
          {talhao.ciclo?.floradaPrincipalOk ? (
            <View style={[styles.chip, styles.chipAlta]}>
              <Text style={styles.chipTxt}>
                🌸 Florada OK{talhao.ciclo.numFloradas > 1 ? ` (×${talhao.ciclo.numFloradas})` : ""}
              </Text>
            </View>
          ) : (
            <View style={[styles.chip, styles.chipFalha]}>
              <Text style={styles.chipTxt}>❌ Sem florada</Text>
            </View>
          )}
          {(talhao.ciclo?.chuvaGranacao || 0) > 0 && (
            <View
              style={[
                styles.chip,
                (talhao.ciclo?.chuvaGranacao || 0) >= GRANACAO_MM_IDEAL * 0.7
                  ? styles.chipAlta
                  : styles.chipBaixa,
              ]}
            >
              <Text style={styles.chipTxt}>
                💧 Granação: {Math.round(talhao.ciclo?.chuvaGranacao || 0)}mm
              </Text>
            </View>
          )}
          {(talhao.ciclo?.diasSemChuva || 0) >= VERANICO_DIAS_MIN && (
            <View style={[styles.chip, styles.chipPendente]}>
              <Text style={styles.chipTxt}>
                ⚠️ Veranico {talhao.ciclo.diasSemChuva}d
              </Text>
            </View>
          )}
          {/* Lote H5: chip irrigação */}
          {talhao.irrigado && (
            <View style={[styles.chip, styles.chipPendente]}>
              <Text style={styles.chipTxt}>💧 Irrigado</Text>
            </View>
          )}
          {/* Lote H8: chip densidade (só se não tradicional) */}
          {talhao.densidade && talhao.densidade !== "tradicional" && (
            <View style={styles.chip}>
              <Text style={styles.chipTxt}>
                {DENSIDADES[talhao.densidade].icone} {DENSIDADES[talhao.densidade].nome}
              </Text>
            </View>
          )}
          {/* Lote H9: chip sombreamento */}
          {talhao.sombreado && (
            <View style={[styles.chip, styles.chipAlta]}>
              <Text style={styles.chipTxt}>🌳 Sombreado</Text>
            </View>
          )}
          {/* Lote D: pragas */}
          {Object.entries(talhao.pragas || {}).map(([pragaId, dados]) => {
            const praga = PRAGAS[pragaId];
            if (!praga) return null;
            const revelada = (talhao.amostragem || {})[pragaId];
            const nivel = nivelPraga(dados.diasAtivos);
            return (
              <View key={pragaId} style={[styles.chip, styles.chipFalha]}>
                <Text style={styles.chipTxt}>
                  {praga.icone} {revelada ? `${praga.nome} N${nivel}` : "Sintomas estranhos"}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.acoes}>
        {ehVazio && (
          <View style={styles.plantioBlock}>
            <Text style={styles.plantioLabel}>Densidade:</Text>
            <View style={styles.densPicker}>
              {Object.entries(DENSIDADES).map(([id, d]) => {
                const ativo = densidadeEscolhida === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setDensidadeEscolhida(id)}
                    style={[styles.densChip, ativo && styles.densChipAtivo]}
                  >
                    <Text
                      style={[styles.densChipTxt, ativo && styles.densChipTxtAtivo]}
                    >
                      {d.icone} {d.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.densDesc}>{DENSIDADES[densidadeEscolhida].desc}</Text>

            <Text style={styles.plantioLabel}>Sistema:</Text>
            <View style={styles.densPicker}>
              <Pressable
                onPress={() => setSombreadoEscolhido(false)}
                style={[styles.densChip, !sombreadoEscolhido && styles.densChipAtivo]}
              >
                <Text
                  style={[styles.densChipTxt, !sombreadoEscolhido && styles.densChipTxtAtivo]}
                >
                  ☀️ Sol pleno
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSombreadoEscolhido(true)}
                style={[styles.densChip, sombreadoEscolhido && styles.densChipAtivo]}
              >
                <Text
                  style={[styles.densChipTxt, sombreadoEscolhido && styles.densChipTxtAtivo]}
                >
                  🌳 Sombreado
                </Text>
              </Pressable>
            </View>
            {sombreadoEscolhido && (
              <Text style={styles.densDesc}>
                ☕ +{Math.round(SOMBREAMENTO.bonusBebida * 100)} bebida · 🦋 −{Math.round((1 - SOMBREAMENTO.reducaoPragas) * 100)}% pragas · ❄️ −{Math.round((1 - SOMBREAMENTO.reducaoDanoGeada) * 100)}% dano geada · −{Math.round((1 - SOMBREAMENTO.multiplicadorProducao) * 100)}% produção
              </Text>
            )}

            <Text style={[styles.densDesc, { color: tema.dourado }]}>
              Custo plantio: R$
              {Math.round(
                talhao.hectares *
                  CUSTO_PLANTIO_POR_HECTARE *
                  DENSIDADES[densidadeEscolhida].multiplicadorCusto *
                  (sombreadoEscolhido ? SOMBREAMENTO.multiplicadorCusto : 1)
              ).toLocaleString("pt-BR")}
            </Text>

            {Object.entries(VARIEDADES).map(([id, v]) => (
              <Botao
                key={id}
                pequeno
                onPress={() =>
                  dispatch({
                    type: "PLANTAR",
                    payload: {
                      talhaoId: talhao.id,
                      variedadeId: id,
                      densidade: densidadeEscolhida,
                      sombreado: sombreadoEscolhido,
                    },
                  })
                }
              >
                🌱 Plantar {v.nome}
              </Botao>
            ))}
          </View>
        )}

        {!ehVazio &&
          !emRecuperacao &&
          insumosNoInv.map((id) => (
            <Botao
              key={id}
              pequeno
              onPress={() =>
                dispatch({
                  type: "APLICAR_INSUMO",
                  payload: { talhaoId: talhao.id, insumoId: id },
                })
              }
            >
              {INSUMOS[id].icone} Aplicar {INSUMOS[id].nome}
            </Botao>
          ))}

        {podeColher && (
          <>
            <Botao
              pequeno
              variante="primario"
              onPress={() =>
                dispatch({
                  type: "COLHER",
                  payload: { talhaoId: talhao.id, metodo: "manual" },
                })
              }
            >
              ⚒️ Manual
            </Botao>
            <Botao
              pequeno
              onPress={() =>
                dispatch({
                  type: "COLHER",
                  payload: { talhaoId: talhao.id, metodo: "derrica" },
                })
              }
            >
              🌾 Derriça
            </Botao>
            {state.equipamentos.includes("colhedora") &&
              talhao.terreno === "plano" && (
                <Botao
                  pequeno
                  onPress={() =>
                    dispatch({
                      type: "COLHER",
                      payload: { talhaoId: talhao.id, metodo: "colhedora" },
                    })
                  }
                >
                  🚜 Mecânico
                </Botao>
              )}
          </>
        )}

        {!ehVazio &&
          talhao.idadeAnos >= ANOS_FORMACAO &&
          state.fase === "normal" &&
          !estaEpocaColheita(state.tempo) &&
          !emRecuperacao && (
            <Text style={styles.aguarda}>
              ⏳ Aguardando época de colheita (mai–ago)
            </Text>
          )}

        {/* Lote D: amostragem (revela pragas) */}
        {!ehVazio && !emRecuperacao && (
          <Botao
            pequeno
            variante="fantasma"
            onPress={() =>
              dispatch({ type: "AMOSTRAR", payload: { talhaoId: talhao.id } })
            }
          >
            🔍 Amostrar (R${CUSTO_AMOSTRAGEM})
          </Botao>
        )}

        {/* Lote H5: instalar irrigação */}
        {!ehVazio && !talhao.irrigado && !emRecuperacao && (
          <Botao
            pequeno
            onPress={() =>
              dispatch({ type: "INSTALAR_IRRIGACAO", payload: { talhaoId: talhao.id } })
            }
          >
            💧 Irrigar (R${Math.round(IRRIGACAO.custoBase + IRRIGACAO.custoPorHectare * talhao.hectares).toLocaleString("pt-BR")})
          </Botao>
        )}

        {/* Lote B: podas de renovação */}
        {podeEsq && (
          <Botao
            pequeno
            onPress={() =>
              dispatch({ type: "ESQUELETAR", payload: { talhaoId: talhao.id } })
            }
          >
            ✂️ Esqueletar (R${ESQUELETAMENTO.custo}, −1 safra)
          </Botao>
        )}
        {podeRec && (
          <Botao
            pequeno
            variante="perigo"
            onPress={() =>
              dispatch({ type: "RECEPAR", payload: { talhaoId: talhao.id } })
            }
          >
            🪓 Recepar (R${RECEPA.custo}, −2 safras)
          </Botao>
        )}

        {emRecuperacao && (
          <Text style={styles.aguarda}>
            🛌 Lavoura em recuperação — sem colheita, sem aplicação por enquanto.
          </Text>
        )}
      </View>
    </View>
  );
}

function corBarra(pct) {
  if (pct < 40) return tema.vermelho;
  if (pct < 70) return tema.dourado;
  return tema.verde;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tema.bg2,
    borderWidth: 2,
    borderColor: tema.linha,
    borderLeftWidth: 5,
    borderBottomWidth: 6,
    borderBottomColor: "#cdb78c",
    borderRadius: tema.raioGrande,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  nome: {
    color: tema.texto,
    fontSize: 20,
    fontWeight: "800",
  },
  status: {
    color: tema.textoDim,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  sanidadeBox: {
    backgroundColor: tema.bg3,
    borderWidth: 1,
    borderColor: tema.linha,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sanidadeLabel: {
    color: tema.textoDim,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sanidadeValor: {
    color: tema.verde,
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  statsBar: {
    flexDirection: "row",
    gap: 18,
    backgroundColor: tema.bg3,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statTxt: {
    color: tema.texto,
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  barra: {
    backgroundColor: tema.madeiraBase,
    borderRadius: 999,
    height: 14,
    overflow: "hidden",
  },
  barraFill: {
    height: "100%",
    borderRadius: 999,
    justifyContent: "flex-start",
  },
  barraShine: {
    position: "absolute",
    top: 2,
    left: 6,
    right: 6,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: tema.creme,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tema.linha,
  },
  chipAlta: {
    borderColor: tema.verde,
  },
  chipBaixa: {
    borderColor: tema.dourado,
  },
  chipPendente: {
    borderColor: tema.azul,
  },
  chipFalha: {
    borderColor: tema.vermelho,
  },
  chipTxt: {
    color: tema.texto,
    fontSize: 10,
    fontWeight: "500",
  },
  acoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  aguarda: {
    color: tema.textoDim,
    fontSize: 12,
    paddingVertical: 4,
  },
  plantioBlock: {
    width: "100%",
    gap: 6,
  },
  plantioLabel: {
    color: tema.textoDim,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  densPicker: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  densChip: {
    backgroundColor: tema.bg3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
    borderWidth: 1,
    borderColor: tema.bg3,
  },
  densChipAtivo: {
    borderColor: tema.dourado,
    backgroundColor: tema.bg2,
  },
  densChipTxt: {
    color: tema.textoDim,
    fontSize: 11,
  },
  densChipTxtAtivo: {
    color: tema.dourado,
    fontWeight: "600",
  },
  densDesc: {
    color: tema.texto,
    fontSize: 11,
    fontStyle: "italic",
    opacity: 0.85,
    lineHeight: 16,
  },
});
