import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema, corVariedade } from "../styles/tema.js";
import { VARIEDADES } from "../data/cafe.js";

export default function CardPropriedade({ prop }) {
  const { state, dispatch } = useJogo();
  const semGrana = state.caixa < prop.preco;
  const variedade = prop.variedade ? VARIEDADES[prop.variedade] : null;
  const corBorda = prop.tipo === "pronta" ? tema.dourado : tema.bg3;

  return (
    <View style={[styles.card, { borderLeftColor: corBorda }]}>
      <View style={styles.header}>
        <Text style={styles.nome}>{prop.nome}</Text>
        <View style={styles.tipo}>
          <Text style={styles.tipoTxt}>
            {prop.tipo === "nua" ? "🌾 terra nua" : "☕ lavoura pronta"}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Área</Text>
          <Text style={styles.statValor}>{prop.hectares} ha</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Terreno</Text>
          <Text style={styles.statValor}>
            {prop.terreno === "plano" ? "🟩 plano" : "⛰️ ladeira"}
          </Text>
        </View>
        {variedade && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Variedade</Text>
            <Text style={[styles.statValor, { color: corVariedade(variedade.cor) }]}>
              {variedade.nome}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.desc}>{prop.desc}</Text>

      <View style={styles.footer}>
        <Text style={styles.preco}>R$ {prop.preco.toLocaleString("pt-BR")}</Text>
        <Botao
          pequeno
          variante={semGrana ? "fantasma" : "primario"}
          disabled={semGrana}
          onPress={() =>
            dispatch({ type: "COMPRAR_PROPRIEDADE", payload: { propId: prop.id } })
          }
        >
          {semGrana ? "Sem caixa" : "Adquirir"}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  nome: {
    color: tema.texto,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  tipo: {
    backgroundColor: tema.bg3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
  },
  tipoTxt: {
    color: tema.texto,
    fontSize: 11,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    minWidth: 70,
    gap: 1,
  },
  statLabel: {
    color: tema.textoDim,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statValor: {
    color: tema.texto,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  desc: {
    color: tema.texto,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.78,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  preco: {
    color: tema.dourado,
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
