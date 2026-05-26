/* ============================================================
   HISTÓRICO DE EVENTOS — modal com lista completa + filtros (G6).
   Eventos vêm do state, ordenados do mais recente pro mais antigo.
   ============================================================ */

import { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tema } from "../styles/tema.js";
import { formatarData } from "../logic/tempo.js";

const CATEGORIAS = [
  { id: "todos", label: "Tudo" },
  { id: "economia", label: "💰 Economia" },
  { id: "manejo", label: "🌱 Manejo" },
  { id: "colheita", label: "🍒 Colheita" },
  { id: "secagem", label: "🌡️ Secagem" },
  { id: "ciclo", label: "🌸 Ciclo" },
  { id: "pragas", label: "🦋 Pragas" },
  { id: "podas", label: "✂️ Podas" },
  { id: "marcos", label: "🏆 Marcos" },
  { id: "erros", label: "❌ Avisos" },
];

export default function HistoricoEventos({ visible, onClose, eventos }) {
  const [filtro, setFiltro] = useState("todos");

  const filtrados = useMemo(() => {
    if (!eventos) return [];
    if (filtro === "todos") return eventos;
    return eventos.filter((e) => e.categoria === filtro);
  }, [eventos, filtro]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.titulo}>📜 Histórico</Text>
          <Pressable onPress={onClose} style={styles.fecharBtn}>
            <Text style={styles.fecharTxt}>✕</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitulo}>
          {filtrados.length} de {eventos?.length || 0} eventos
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          {CATEGORIAS.map((cat) => {
            const ativo = filtro === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setFiltro(cat.id)}
                style={[styles.filtroChip, ativo && styles.filtroChipAtivo]}
              >
                <Text
                  style={[
                    styles.filtroTxt,
                    ativo && styles.filtroTxtAtivo,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView style={styles.lista} contentContainerStyle={styles.listaContent}>
          {filtrados.length === 0 ? (
            <Text style={styles.vazio}>Nenhum evento nessa categoria.</Text>
          ) : (
            filtrados.map((ev, i) => (
              <View key={i} style={styles.eventoCard}>
                <Text style={styles.eventoData}>
                  {ev.tempo ? formatarData(ev.tempo) : "—"}
                </Text>
                <Text style={styles.eventoTxt}>{ev.texto}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
  },
  titulo: { color: tema.dourado, fontSize: 18, fontWeight: "600" },
  fecharBtn: { padding: 6, paddingHorizontal: 12 },
  fecharTxt: { color: tema.texto, fontSize: 20 },
  subtitulo: {
    color: tema.textoDim,
    fontSize: 11,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filtros: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filtroChip: {
    backgroundColor: tema.bg2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tema.bg3,
  },
  filtroChipAtivo: {
    backgroundColor: tema.dourado,
    borderColor: tema.dourado,
  },
  filtroTxt: { color: tema.textoDim, fontSize: 12 },
  filtroTxtAtivo: { color: "#1a0f08", fontWeight: "600" },

  lista: { flex: 1 },
  listaContent: { padding: 16, paddingBottom: 32, gap: 6 },
  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 40,
    fontSize: 13,
  },
  eventoCard: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },
  eventoData: {
    color: tema.textoDim,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    width: 80,
  },
  eventoTxt: {
    color: tema.texto,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
