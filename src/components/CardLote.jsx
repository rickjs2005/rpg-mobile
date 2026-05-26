import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema, corVariedade } from "../styles/tema.js";
import { VARIEDADES } from "../data/cafe.js";
import { formatarData } from "../logic/tempo.js";
import {
  precoComCertificacoes,
  premioCertificacoes,
} from "../logic/certificacoes.js";
import { fatorMercado } from "../logic/mercado.js";

const TIPO_LOTE_LABEL = {
  cereja: "🍒 cereja",
  boia: "🟡 boia",
  natural: "",
};

export default function CardLote({ lote }) {
  const { state, dispatch } = useJogo();
  const variedade = VARIEDADES[lote.variedadeId];
  const precoCert = precoComCertificacoes(lote.precoPorSaca, state.certificacoes);
  const merc = fatorMercado(state.mercado);
  const precoFinal = Math.round(precoCert * merc);
  const premio = premioCertificacoes(state.certificacoes);
  const valor = lote.sacas * precoFinal;
  const isMicrolote = lote.microlote;

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: variedade ? corVariedade(variedade.cor) : tema.dourado },
        isMicrolote && styles.cardMicrolote,
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerLinha}>
            <Text style={styles.sacas}>{lote.sacas} sacas</Text>
            {lote.tipoLote && lote.tipoLote !== "natural" && (
              <Text style={styles.tipoLote}>{TIPO_LOTE_LABEL[lote.tipoLote]}</Text>
            )}
          </View>
          <Text style={styles.variedade}>{variedade?.nome}</Text>
        </View>
        {isMicrolote ? (
          <View style={styles.microlote}>
            <Text style={styles.microloteTxt}>⭐ MICROLOTE</Text>
          </View>
        ) : (
          <View style={styles.classe}>
            <Text style={styles.classeTxt}>{lote.classeSca || lote.classeNome}</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SCA</Text>
          <Text style={styles.statValor}>{lote.sca || "—"} pts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tipo</Text>
          <Text style={styles.statValor}>BR {lote.tipo || "—"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Peneira</Text>
          <Text style={styles.statValor}>P{lote.peneira || "—"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>R$/saca</Text>
          <Text style={styles.statValor}>
            R$ {precoFinal.toLocaleString("pt-BR")}
            {premio > 0 && (
              <Text style={{ color: tema.verde }}> +{Math.round(premio * 100)}%</Text>
            )}
            {merc !== 1 && (
              <Text
                style={{
                  color: merc > 1 ? tema.verde : tema.vermelho,
                  fontSize: 9,
                }}
              >
                {" "}× {merc.toFixed(2)}
              </Text>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.metaLinha}>
        <Text style={styles.meta}>Colhido em {formatarData(lote.dataColheita)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.valor}>R$ {valor.toLocaleString("pt-BR")}</Text>
        <Botao
          pequeno
          variante="primario"
          onPress={() =>
            dispatch({ type: "VENDER_LOTE", payload: { loteId: lote.id } })
          }
        >
          Vender
        </Botao>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderLeftWidth: 4,
    borderRadius: tema.raio,
    padding: 12,
    gap: 8,
  },
  cardMicrolote: {
    borderColor: tema.dourado,
    backgroundColor: "#2d2218",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  headerLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sacas: {
    color: tema.texto,
    fontSize: 16,
    fontWeight: "600",
  },
  tipoLote: {
    color: tema.textoDim,
    fontSize: 11,
  },
  variedade: {
    color: tema.textoDim,
    fontSize: 12,
    marginTop: 1,
  },
  classe: {
    backgroundColor: tema.bg3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
  },
  classeTxt: {
    color: tema.dourado,
    fontSize: 10,
    fontWeight: "600",
  },
  microlote: {
    backgroundColor: tema.dourado,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
  },
  microloteTxt: {
    color: "#1a0f08",
    fontSize: 10,
    fontWeight: "700",
  },
  stats: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
    gap: 1,
  },
  statLabel: {
    color: tema.textoDim,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statValor: {
    color: tema.texto,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  metaLinha: {
    flexDirection: "row",
  },
  meta: {
    color: tema.textoDim,
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: tema.bg3,
    borderStyle: "dashed",
  },
  valor: {
    color: tema.verde,
    fontSize: 16,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
