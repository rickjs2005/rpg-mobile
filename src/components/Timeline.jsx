/* ============================================================
   TIMELINE — calendário da safra (design Stitch / Hay Day).
   Scroll horizontal dos 12 meses; mês atual maior, borda dourada
   com base 3D e ponto acima. Banner de dica dourado embaixo.
   Tudo dentro da "moldura dupla" (Painel).
   ============================================================ */

import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import { tema } from "../styles/tema.js";
import Painel from "./Painel.jsx";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const EVENTOS = {
  1: "💧", 2: "💧", 3: "💧",
  5: "🍒", 6: "🍒", 7: "🍒", 8: "🍒",
  9: "🌸", 10: "🌸",
};

export default function Timeline() {
  const { state } = useJogo();
  const mes = state.tempo.mes;

  return (
    <Painel icone="📅" titulo="Timeline da Safra">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.linha}
      >
        {MESES.map((nome, i) => {
          const m = i + 1;
          const emoji = EVENTOS[m];
          const atual = m === mes;
          return (
            <View key={m} style={styles.col}>
              {atual && <View style={styles.dot} />}
              <Text style={[styles.mes, atual && styles.mesAtual]}>{nome}</Text>
              <View style={[styles.quadro, atual ? styles.quadroAtual : styles.quadroOff]}>
                <Text style={styles.emoji}>{emoji || "·"}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.banner}>
        <Text style={styles.bannerIcone}>{iconeDica(mes, state)}</Text>
        <Text style={styles.bannerTxt}>{dicaPorMes(mes, state)}</Text>
      </View>
    </Painel>
  );
}

function iconeDica(mes, state) {
  if (state.fase === "secagem") return "🌡️";
  if (state.fase === "aguardando_pos") return "📦";
  if (mes >= 1 && mes <= 3) return "💧";
  if (mes >= 5 && mes <= 8) return "🍒";
  if (mes === 9 || mes === 10) return "🌸";
  return "🌱";
}

function dicaPorMes(mes, state) {
  if (state.fase === "secagem") return "Secagem em curso (1 dia por avanço).";
  if (state.fase === "aguardando_pos") return "Escolha o método de pós-colheita em Safra.";
  if (mes >= 1 && mes <= 3) return "Granação ativa — a chuva enche o grão.";
  if (mes === 4) return "Período vegetativo. Aguarde a colheita em maio.";
  if (mes >= 5 && mes <= 8) return "Janela de colheita aberta!";
  if (mes === 9 || mes === 10) return "Florada — veranico + chuva encaminham a nova safra.";
  if (mes === 11) return "Desenvolvimento do fruto após a florada.";
  return "Desenvolvimento do fruto.";
}

const styles = StyleSheet.create({
  linha: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 4,
  },
  col: {
    alignItems: "center",
    minWidth: 52,
    position: "relative",
    paddingTop: 8,
  },
  dot: {
    position: "absolute",
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tema.gold,
    borderWidth: 2,
    borderColor: tema.goldBorda,
  },
  mes: {
    fontSize: 11,
    fontWeight: "700",
    color: tema.textoDim,
    marginBottom: 4,
  },
  mesAtual: { color: tema.madeira },
  quadro: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quadroOff: {
    backgroundColor: tema.bg3,
    borderWidth: 1,
    borderColor: tema.linha,
    opacity: 0.7,
  },
  quadroAtual: {
    width: 50,
    height: 50,
    backgroundColor: tema.creme,
    borderWidth: 2,
    borderColor: tema.gold,
    borderBottomWidth: 5,
    borderBottomColor: tema.goldBase,
  },
  emoji: { fontSize: 20, lineHeight: 24 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    backgroundColor: "#ffdf92",
    borderWidth: 1,
    borderColor: "#d3a500",
    borderRadius: 12,
    padding: 12,
  },
  bannerIcone: { fontSize: 22 },
  bannerTxt: {
    flex: 1,
    color: "#503d00",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
