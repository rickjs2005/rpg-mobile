import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import { tema } from "../styles/tema.js";

const ABAS = [
  { id: "fazenda", label: "Fazenda", icone: "🌳" },
  { id: "loja", label: "Loja", icone: "🛒" },
  { id: "propriedades", label: "Terras", icone: "🏡" },
  { id: "mercado", label: "Mercado", icone: "💰" },
  { id: "safra", label: "Safra", icone: "🍒" },
];

export default function Menu({ telaAtiva, setTela }) {
  const { state } = useJogo();
  const safraAtiva = state.fase !== "normal";
  const temEstoque = state.estoqueSacas.length > 0;

  return (
    <View style={styles.menu}>
      {ABAS.map((aba) => {
        const ativo = telaAtiva === aba.id;
        const badge =
          (aba.id === "safra" && safraAtiva) ||
          (aba.id === "mercado" && temEstoque);
        return (
          <Pressable
            key={aba.id}
            onPress={() => setTela(aba.id)}
            style={({ pressed }) => [
              styles.aba,
              ativo && styles.abaAtiva,
              pressed && styles.abaPressed,
            ]}
          >
            <View>
              <Text style={styles.icone}>{aba.icone}</Text>
              {badge && <View style={styles.badge} />}
            </View>
            <Text style={[styles.label, ativo && styles.labelAtivo]}>
              {aba.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    backgroundColor: tema.bg2,
    borderTopWidth: 1,
    borderTopColor: tema.bg3,
  },
  aba: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 2,
  },
  abaAtiva: {
    backgroundColor: tema.bg3,
  },
  abaPressed: {
    opacity: 0.7,
  },
  icone: {
    fontSize: 20,
    lineHeight: 22,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tema.vermelho,
    borderWidth: 2,
    borderColor: tema.bg2,
  },
  label: {
    color: tema.textoDim,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  labelAtivo: {
    color: tema.dourado,
  },
});
