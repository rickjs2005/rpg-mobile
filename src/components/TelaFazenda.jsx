import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import CardTalhao from "./CardTalhao.jsx";
import Timeline from "./Timeline.jsx";
import HistoricoEventos from "./HistoricoEventos.jsx";
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

      <View style={styles.caixa}>
        <Text style={styles.caixaTitulo}>Inventário de insumos</Text>
        <View style={styles.inv}>
          {Object.entries(INSUMOS).map(([id, ins]) => (
            <View key={id} style={styles.invItem}>
              <Text style={styles.invTxt}>
                {ins.icone} {ins.nome}
              </Text>
              <Text style={styles.invQtd}>{state.inventario[id] || 0}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.h2}>Talhões ({state.talhoes.length})</Text>
      <View style={styles.lista}>
        {state.talhoes.map((t) => (
          <CardTalhao key={t.id} talhao={t} />
        ))}
      </View>

      {eventos.length > 0 && (
        <View style={styles.caixa}>
          <View style={styles.eventosCabecalho}>
            <Text style={styles.caixaTitulo}>
              Eventos recentes ({eventos.length})
            </Text>
            <Pressable
              onPress={() => setHistAberto(true)}
              style={styles.verTodosBtn}
            >
              <Text style={styles.verTodosTxt}>Ver tudo →</Text>
            </Pressable>
          </View>
          <View>
            {eventos.slice(0, 5).map((ev, i) => (
              <View
                key={i}
                style={[styles.eventoLinha, { opacity: 1 - i * 0.1 }]}
              >
                <Text style={styles.eventoData}>
                  {formatarData(ev.tempo)}
                </Text>
                <Text style={styles.eventoTxt}>{ev.texto}</Text>
              </View>
            ))}
          </View>
        </View>
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
  container: { gap: 14 },
  caixa: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 8,
  },
  caixaTitulo: {
    color: tema.textoDim,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inv: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  invItem: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  invTxt: {
    color: tema.texto,
    fontSize: 13,
  },
  invQtd: {
    color: tema.dourado,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  h2: {
    color: tema.dourado,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  lista: { gap: 10 },
  eventosCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verTodosBtn: {
    paddingHorizontal: 4,
  },
  verTodosTxt: {
    color: tema.dourado,
    fontSize: 11,
    fontWeight: "500",
  },
  eventoLinha: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 3,
    alignItems: "flex-start",
  },
  eventoData: {
    color: tema.textoDim,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    width: 80,
    marginTop: 2,
  },
  eventoTxt: {
    color: tema.texto,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
