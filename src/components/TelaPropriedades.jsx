import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import CardPropriedade from "./CardPropriedade.jsx";
import { tema } from "../styles/tema.js";
import { PROPRIEDADES_VENDA } from "../data/economia.js";

export default function TelaPropriedades() {
  const { state } = useJogo();
  const disponiveis = PROPRIEDADES_VENDA.filter(
    (p) => !state.propriedadesCompradas.includes(p.id)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>Terras à venda</Text>
      <Text style={styles.dica}>
        Duas modalidades: <Text style={styles.b}>nua</Text> é barata mas precisa formar
        lavoura (~3 anos). <Text style={styles.b}>Pronta</Text> é cara mas produz já na
        próxima safra.
      </Text>

      {disponiveis.length === 0 ? (
        <Text style={styles.vazio}>Nada à venda no momento.</Text>
      ) : (
        <View style={styles.lista}>
          {disponiveis.map((p) => (
            <CardPropriedade key={p.id} prop={p} />
          ))}
        </View>
      )}

      {state.propriedadesCompradas.length > 0 && (
        <View style={styles.caixa}>
          <Text style={styles.caixaTitulo}>Propriedades adquiridas</Text>
          <View>
            {state.propriedadesCompradas.map((id) => {
              const p = PROPRIEDADES_VENDA.find((x) => x.id === id);
              return (
                <Text key={id} style={styles.comprada}>
                  ✅ {p?.nome || id}
                </Text>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  h2: {
    color: tema.dourado,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dica: {
    color: tema.textoDim,
    fontSize: 12,
    lineHeight: 17,
  },
  b: { color: tema.texto, fontWeight: "600" },
  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 28,
    fontSize: 13,
  },
  lista: { gap: 10 },
  caixa: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 6,
  },
  caixaTitulo: {
    color: tema.textoDim,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  comprada: {
    color: tema.verde,
    fontSize: 13,
    paddingVertical: 2,
  },
});
