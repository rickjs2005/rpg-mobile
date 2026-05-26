import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "./Botao.jsx";
import { useJogo } from "../hooks/useJogo.jsx";
import { tema } from "../styles/tema.js";

export default function TelaInicio() {
  const { dispatch } = useJogo();

  const iniciar = (modo) =>
    dispatch({ type: "NOVA_PARTIDA", payload: { modo } });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Império do Café</Text>
          <Text style={styles.sub}>Zona da Mata — do aperto à fazenda</Text>
        </View>

        <View style={styles.modos}>
          <View style={styles.modo}>
            <Text style={styles.modoTitulo}>☕ Rocinha pronta</Text>
            <Text style={styles.modoTexto}>
              1 talhão de Catuaí já formado (~800 pés). Caixa de R$ 5.000.
              Próxima safra está logo ali — você entra direto no loop econômico.
            </Text>
            <Botao variante="primario" fullWidth onPress={() => iniciar("rocinha_pronta")}>
              Começar
            </Botao>
          </View>

          <View style={styles.modo}>
            <Text style={styles.modoTitulo}>🌱 Terra nua</Text>
            <Text style={styles.modoTexto}>
              1 talhão vazio, caixa de R$ 3.000. Você planta no dia 1 e espera
              ~3 anos pra primeira safra. Modo paciência, mais imersivo.
            </Text>
            <Botao fullWidth onPress={() => iniciar("terra_nua")}>
              Começar
            </Botao>
          </View>
        </View>

        <Text style={styles.rodape}>
          Protótipo · save em AsyncStorage
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.bg,
  },
  content: {
    padding: 20,
    gap: 24,
    flexGrow: 1,
  },
  header: { gap: 4 },
  titulo: {
    color: tema.dourado,
    fontSize: 28,
    fontWeight: "600",
  },
  sub: {
    color: tema.textoDim,
    fontStyle: "italic",
    fontSize: 14,
  },
  modos: { gap: 14 },
  modo: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 16,
    gap: 12,
  },
  modoTitulo: {
    color: tema.dourado,
    fontSize: 17,
    fontWeight: "600",
  },
  modoTexto: {
    color: tema.texto,
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.88,
  },
  rodape: {
    marginTop: "auto",
    textAlign: "center",
    color: tema.textoFraco,
    fontSize: 12,
  },
});
