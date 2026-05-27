/* ============================================================
   CARD LOTE — lote no Mercado (design Stitch / Hay Day).
   Painel madeira com faixa da variedade, chips "glossy",
   valor total grande e botão Vender. Preço REAL (= creditado).
   ============================================================ */

import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema, corVariedade } from "../styles/tema.js";
import { VARIEDADES } from "../data/cafe.js";
import { formatarData } from "../logic/tempo.js";
import { precoFinalSaca, valorLote } from "../logic/precos.js";

const TIPO_LOTE = { cereja: "🍒 cereja", boia: "🟡 boia", natural: "" };

export default function CardLote({ lote }) {
  const { state, dispatch } = useJogo();
  const variedade = VARIEDADES[lote.variedadeId];
  const cor = variedade ? corVariedade(variedade.cor) : tema.gold;
  const precoSaca = precoFinalSaca(state, lote);
  const total = valorLote(state, lote);

  return (
    <View style={[styles.card, lote.microlote && styles.cardMicro]}>
      <View style={[styles.stripe, { backgroundColor: cor }]} />
      <View style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{lote.tipoLote === "boia" ? "🟡" : "🍒"}</Text>
          <Text style={styles.variedade} numberOfLines={1}>
            {variedade?.nome || "Lote"}
          </Text>
          {lote.microlote ? (
            <View style={styles.microBadge}>
              <Text style={styles.microTxt}>⭐ MICROLOTE</Text>
            </View>
          ) : (
            lote.tipoLote && lote.tipoLote !== "natural" && (
              <Text style={styles.tipoLote}>{TIPO_LOTE[lote.tipoLote]}</Text>
            )
          )}
        </View>

        {/* Chips glossy */}
        <View style={styles.chips}>
          <Chip txt={`⚖️ ${lote.sacas} sacas`} />
          <Chip txt={`SCA ${lote.sca ?? "—"}`} cor={tema.verde} />
          <Chip txt={`BR ${lote.tipo ?? "—"}`} />
          <Chip txt={`P${lote.peneira ?? "—"}`} />
          <Chip txt={`R$ ${precoSaca.toLocaleString("pt-BR")}/saca`} />
        </View>

        <Text style={styles.data}>📅 Colhido em {formatarData(lote.dataColheita)}</Text>

        {/* Footer: valor + vender */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.valorLabel}>Valor Total</Text>
            <Text style={styles.valor}>R$ {total.toLocaleString("pt-BR")}</Text>
          </View>
          <Botao
            variante="sucesso"
            onPress={() => dispatch({ type: "VENDER_LOTE", payload: { loteId: lote.id } })}
          >
            Vender
          </Botao>
        </View>
      </View>
    </View>
  );
}

function Chip({ txt, cor }) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipTxt, cor && { color: cor }]}>{txt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: tema.bg2,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: tema.madeira,
    borderBottomWidth: 8,
    borderBottomColor: tema.madeiraBase,
    overflow: "hidden",
  },
  cardMicro: { borderColor: tema.gold, borderBottomColor: tema.goldBorda },
  stripe: { width: 8 },
  body: { flex: 1, padding: 12, gap: 8 },

  header: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  emoji: { fontSize: 20 },
  variedade: { color: tema.texto, fontSize: 16, fontWeight: "800", flexShrink: 1 },
  microBadge: {
    backgroundColor: tema.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  microTxt: { color: "#3d2e00", fontSize: 10, fontWeight: "800" },
  tipoLote: { color: tema.textoDim, fontSize: 12, fontWeight: "600" },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: tema.creme,
    borderWidth: 1,
    borderColor: tema.linha,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipTxt: { color: tema.texto, fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] },

  data: { color: tema.textoDim, fontSize: 11 },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tema.linha,
  },
  valorLabel: { color: tema.textoDim, fontSize: 11, fontWeight: "600" },
  valor: { color: tema.verde, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
