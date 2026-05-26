import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import { tema } from "../styles/tema.js";
import { PASSOS_TUTORIAL } from "../data/tutorial.js";

export default function BalaoTutorial() {
  const { state, dispatch } = useJogo();
  if (!state?.tutorial?.ativo) return null;
  const passo = PASSOS_TUTORIAL[state.tutorial.passo];
  if (!passo) return null;

  return (
    <View style={styles.balao}>
      <View style={styles.cabecalho}>
        <Text style={styles.passo}>
          📚 Tutorial · passo {state.tutorial.passo + 1}/{PASSOS_TUTORIAL.length}
        </Text>
        <Pressable
          onPress={() => dispatch({ type: "PULAR_TUTORIAL" })}
          style={styles.pularBtn}
        >
          <Text style={styles.pularTxt}>Pular</Text>
        </Pressable>
      </View>
      <Text style={styles.texto}>{passo.texto}</Text>
      <View style={styles.botoes}>
        {passo.final ? (
          <Pressable
            onPress={() => dispatch({ type: "COMPLETAR_TUTORIAL" })}
            style={({ pressed }) => [
              styles.btnPrimario,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.btnPrimarioTxt}>Concluir tutorial</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => dispatch({ type: "AVANCAR_TUTORIAL" })}
            style={({ pressed }) => [
              styles.btnSecundario,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.btnSecundarioTxt}>Entendi, próximo →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balao: {
    backgroundColor: "#2d2218",
    borderWidth: 2,
    borderColor: tema.dourado,
    borderRadius: tema.raio,
    padding: 12,
    gap: 8,
    marginBottom: 4,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passo: {
    color: tema.dourado,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pularBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pularTxt: {
    color: tema.textoDim,
    fontSize: 11,
    textDecorationLine: "underline",
  },
  texto: {
    color: tema.texto,
    fontSize: 13,
    lineHeight: 19,
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btnSecundario: {
    backgroundColor: tema.bg3,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: tema.raioPequeno,
    borderWidth: 1,
    borderColor: tema.dourado,
  },
  btnSecundarioTxt: {
    color: tema.dourado,
    fontSize: 12,
    fontWeight: "600",
  },
  btnPrimario: {
    backgroundColor: tema.dourado,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: tema.raioPequeno,
  },
  btnPrimarioTxt: {
    color: "#1a0f08",
    fontSize: 12,
    fontWeight: "700",
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
