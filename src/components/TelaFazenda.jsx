import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import CardTalhao from "./CardTalhao.jsx";
import Timeline from "./Timeline.jsx";
import HistoricoEventos from "./HistoricoEventos.jsx";
import Painel from "./Painel.jsx";
import { tema } from "../styles/tema.js";
import { INSUMOS } from "../data/economia.js";
import { formatarData } from "../logic/tempo.js";

// Migra save antigo: state.mensagens (strings) → eventos sintéticos.
function eventosCompat(state) {
  if (state.eventos && state.eventos.length > 0) return state.eventos;
  if (Array.isArray(state.mensagens)) {
    return state.mensagens.map((m) => ({
      tempo: state.tempo,
      texto: m,
      categoria: "outros",
    }));
  }
  return [];
}

export default function TelaFazenda() {
  const { state } = useJogo();
  const [histAberto, setHistAberto] = useState(false);
  const eventos = eventosCompat(state);

  return (
    <View style={styles.container}>
      <Timeline />

      {/* Inventário em grade */}
      <Painel icone="📦" titulo="Inventário">
        <View style={styles.invGrid}>
          {Object.entries(INSUMOS).map(([id, ins]) => {
            const qtd = state.inventario[id] || 0;
            const vazio = qtd === 0;
            return (
              <View key={id} style={[styles.invTile, vazio && styles.invTileVazio]}>
                <View style={styles.invIcone}>
                  <Text style={styles.invEmoji}>{ins.icone}</Text>
                </View>
                <Text style={styles.invNome} numberOfLines={1}>
                  {ins.nome}
                </Text>
                <View style={[styles.invPill, vazio && styles.invPillVazio]}>
                  <Text style={[styles.invPillTxt, vazio && styles.invPillTxtVazio]}>
                    {qtd}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Painel>

      {/* Talhões */}
      <Text style={styles.h2}>🌾 Talhões ({state.talhoes.length})</Text>
      <View style={styles.lista}>
        {state.talhoes.map((t) => (
          <CardTalhao key={t.id} talhao={t} />
        ))}
      </View>

      {/* Eventos recentes */}
      {eventos.length > 0 && (
        <Painel
          icone="🕘"
          titulo={`Eventos recentes (${eventos.length})`}
          headerRight={
            <Pressable onPress={() => setHistAberto(true)} hitSlop={8}>
              <Text style={styles.verTodos}>Ver tudo →</Text>
            </Pressable>
          }
        >
          <View style={styles.evLista}>
            {eventos.slice(0, 5).map((ev, i) => (
              <View key={i} style={styles.evRow}>
                <Text style={styles.evData}>{formatarData(ev.tempo)}</Text>
                <Text style={styles.evTxt}>{ev.texto}</Text>
              </View>
            ))}
          </View>
        </Painel>
      )}

      <HistoricoEventos
        visible={histAberto}
        onClose={() => setHistAberto(false)}
        eventos={eventos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  h2: {
    color: tema.madeira,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
    paddingLeft: 4,
  },
  lista: { gap: 12 },

  /* Inventário em grade */
  invGrid: {
    flexDirection: "row",
    gap: 10,
  },
  invTile: {
    flex: 1,
    backgroundColor: tema.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tema.linha,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 6,
  },
  invTileVazio: { opacity: 0.5 },
  invIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: tema.creme,
    borderWidth: 1,
    borderColor: tema.linha,
    alignItems: "center",
    justifyContent: "center",
  },
  invEmoji: { fontSize: 24, lineHeight: 28 },
  invNome: {
    fontSize: 11,
    fontWeight: "700",
    color: tema.textoDim,
    textAlign: "center",
  },
  invPill: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: tema.goldBorda,
    alignItems: "center",
  },
  invPillVazio: { backgroundColor: "#c1c9b9" },
  invPillTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  invPillTxtVazio: { color: tema.texto },

  /* Eventos */
  verTodos: {
    color: tema.verde,
    fontSize: 12,
    fontWeight: "700",
  },
  evLista: { gap: 8 },
  evRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: tema.bg3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tema.linha,
    padding: 10,
  },
  evData: {
    color: tema.textoDim,
    fontSize: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    minWidth: 76,
    marginTop: 1,
  },
  evTxt: {
    color: tema.texto,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
