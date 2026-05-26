/* ============================================================
   TIMELINE — strip horizontal do ano agrícola.
   Mostra marcos do ciclo (florada, granação, colheita) +
   posição atual do jogador. Inspirado em "estágio visual" do
   Stardew Valley — comunica sem palavras.
   ============================================================ */

import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import { tema } from "../styles/tema.js";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const EVENTOS = {
  1: { tipo: "granacao", icone: "💧", cor: tema.azul, label: "Granação" },
  2: { tipo: "granacao", icone: "💧", cor: tema.azul, label: "Granação" },
  3: { tipo: "granacao", icone: "💧", cor: tema.azul, label: "Granação" },
  5: { tipo: "colheita", icone: "🍒", cor: tema.verde, label: "Colheita" },
  6: { tipo: "colheita", icone: "🍒", cor: tema.verde, label: "Colheita" },
  7: { tipo: "colheita", icone: "🍒", cor: tema.verde, label: "Colheita" },
  8: { tipo: "colheita", icone: "🍒", cor: tema.verde, label: "Colheita" },
  9: { tipo: "florada", icone: "🌸", cor: tema.dourado, label: "Florada" },
  10: { tipo: "florada", icone: "🌸", cor: tema.dourado, label: "Florada" },
};

export default function Timeline() {
  const { state } = useJogo();
  const mes = state.tempo.mes;

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Calendário da safra</Text>
        <Text style={styles.ano}>Ano {state.tempo.ano}</Text>
      </View>

      <View style={styles.linha}>
        {MESES.map((nome, i) => {
          const m = i + 1;
          const ev = EVENTOS[m];
          const atual = m === mes;
          return (
            <View
              key={m}
              style={[
                styles.chip,
                ev && { borderColor: ev.cor, backgroundColor: ev.cor + "15" },
                atual && styles.chipAtual,
              ]}
            >
              {ev ? (
                <Text style={styles.chipIcone}>{ev.icone}</Text>
              ) : (
                <Text style={styles.chipIconeFaint}>·</Text>
              )}
              <Text style={[styles.chipMes, atual && styles.chipMesAtual]}>
                {nome[0].toUpperCase()}
              </Text>
              {atual && <View style={styles.marker} />}
            </View>
          );
        })}
      </View>

      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <Text style={styles.legendaIcone}>💧</Text>
          <Text style={styles.legendaTxt}>Granação</Text>
        </View>
        <View style={styles.legendaItem}>
          <Text style={styles.legendaIcone}>🍒</Text>
          <Text style={styles.legendaTxt}>Colheita</Text>
        </View>
        <View style={styles.legendaItem}>
          <Text style={styles.legendaIcone}>🌸</Text>
          <Text style={styles.legendaTxt}>Florada</Text>
        </View>
      </View>

      {/* Dica contextual baseada no mês */}
      <Text style={styles.dica}>
        {dicaPorMes(mes, state)}
      </Text>
    </View>
  );
}

function dicaPorMes(mes, state) {
  if (state.fase === "secagem") return "🌡️ Secagem em curso (1 dia/avanço).";
  if (state.fase === "aguardando_pos") return "📦 Escolha método pós em Safra.";
  if (mes >= 1 && mes <= 3) return "💧 Granação ativa — chuva enche o grão.";
  if (mes === 4) return "Período vegetativo. Aguarde colheita em maio.";
  if (mes >= 5 && mes <= 8) return "🍒 Janela de colheita aberta!";
  if (mes === 9 || mes === 10) return "🌸 Janela de florada — veranico + chuva = nova safra encaminhada.";
  if (mes === 11) return "Desenvolvimento do fruto após florada.";
  return "Desenvolvimento do fruto.";
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 10,
    gap: 8,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: {
    color: tema.textoDim,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  ano: {
    color: tema.dourado,
    fontSize: 12,
    fontWeight: "600",
  },
  linha: {
    flexDirection: "row",
    gap: 3,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raioPequeno,
    paddingVertical: 4,
    alignItems: "center",
    gap: 1,
    position: "relative",
    minHeight: 38,
    justifyContent: "center",
  },
  chipAtual: {
    backgroundColor: tema.bg3,
    borderColor: tema.dourado,
    borderWidth: 2,
  },
  chipIcone: {
    fontSize: 12,
    lineHeight: 14,
  },
  chipIconeFaint: {
    color: tema.textoFraco,
    fontSize: 12,
    lineHeight: 14,
  },
  chipMes: {
    color: tema.textoDim,
    fontSize: 9,
    fontWeight: "600",
  },
  chipMesAtual: {
    color: tema.dourado,
  },
  marker: {
    position: "absolute",
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tema.dourado,
  },
  legenda: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 6,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: tema.bg3,
    borderStyle: "dashed",
    marginTop: 4,
  },
  legendaItem: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  legendaIcone: {
    fontSize: 11,
  },
  legendaTxt: {
    color: tema.textoDim,
    fontSize: 10,
  },
  dica: {
    color: tema.texto,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    paddingTop: 2,
  },
});
