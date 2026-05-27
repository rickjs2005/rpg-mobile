import { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GLOSSARIO, CATEGORIAS } from "../data/glossario.js";
import { tema } from "../styles/tema.js";

export default function Glossario({ visible, onClose }) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);

  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return GLOSSARIO.filter((g) => {
      if (categoriaAtiva && g.categoria !== categoriaAtiva) return false;
      if (!b) return true;
      return (
        g.termo.toLowerCase().includes(b) ||
        g.definicao.toLowerCase().includes(b)
      );
    });
  }, [busca, categoriaAtiva]);

  // Agrupa por categoria
  const agrupado = useMemo(() => {
    const grupos = {};
    for (const item of filtrados) {
      if (!grupos[item.categoria]) grupos[item.categoria] = [];
      grupos[item.categoria].push(item);
    }
    return grupos;
  }, [filtrados]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.titulo}>📖 Glossário</Text>
          <Pressable onPress={onClose} style={styles.fecharBtn}>
            <Text style={styles.fecharTxt}>✕</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.busca}
          placeholder="Buscar termo..."
          placeholderTextColor={tema.textoFraco}
          value={busca}
          onChangeText={setBusca}
        />

        {/* Filtro de categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasRow}
        >
          <Pressable
            onPress={() => setCategoriaAtiva(null)}
            style={[
              styles.catChip,
              categoriaAtiva === null && styles.catChipAtivo,
            ]}
          >
            <Text
              style={[
                styles.catChipTxt,
                categoriaAtiva === null && styles.catChipTxtAtivo,
              ]}
            >
              Tudo
            </Text>
          </Pressable>
          {CATEGORIAS.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategoriaAtiva(cat === categoriaAtiva ? null : cat)}
              style={[
                styles.catChip,
                categoriaAtiva === cat && styles.catChipAtivo,
              ]}
            >
              <Text
                style={[
                  styles.catChipTxt,
                  categoriaAtiva === cat && styles.catChipTxtAtivo,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.lista}
          contentContainerStyle={styles.listaContent}
        >
          {Object.keys(agrupado).length === 0 ? (
            <Text style={styles.vazio}>Nenhum termo encontrado.</Text>
          ) : (
            Object.entries(agrupado).map(([cat, items]) => (
              <View key={cat} style={styles.grupo}>
                <Text style={styles.grupoTitulo}>{cat}</Text>
                {items.map((g) => (
                  <View key={g.termo} style={styles.item}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemIcone}>{g.icone}</Text>
                      <Text style={styles.itemTermo}>{g.termo}</Text>
                    </View>
                    <Text style={styles.itemDef}>{g.definicao}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
  },
  titulo: {
    color: tema.dourado,
    fontSize: 18,
    fontWeight: "600",
  },
  fecharBtn: {
    padding: 6,
    paddingHorizontal: 12,
  },
  fecharTxt: {
    color: tema.texto,
    fontSize: 20,
  },
  busca: {
    backgroundColor: tema.bg2,
    color: tema.texto,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: tema.raio,
    borderWidth: 1,
    borderColor: tema.bg3,
  },
  categoriasRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  catChip: {
    backgroundColor: tema.bg2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tema.bg3,
  },
  catChipAtivo: {
    backgroundColor: tema.gold,
    borderColor: tema.goldBorda,
  },
  catChipTxt: {
    color: tema.textoDim,
    fontSize: 12,
  },
  catChipTxtAtivo: {
    color: "#1a0f08",
    fontWeight: "600",
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 18,
  },
  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 40,
    fontSize: 13,
  },
  grupo: {
    gap: 8,
  },
  grupoTitulo: {
    color: tema.dourado,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  item: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 6,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemIcone: {
    fontSize: 16,
  },
  itemTermo: {
    color: tema.texto,
    fontSize: 14,
    fontWeight: "600",
  },
  itemDef: {
    color: tema.texto,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.88,
  },
});
