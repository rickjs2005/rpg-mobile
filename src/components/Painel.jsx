/* ============================================================
   PAINEL — "moldura dupla" estilo Hay Day (design do Stitch).
   Frame externo de madeira com base 3D + interior rebaixado claro.
   Título de seção em madeira com ícone (emoji). Reutilizável.
   ============================================================ */

import { View, Text, StyleSheet } from "react-native";
import { tema } from "../styles/tema.js";

export default function Painel({ icone, titulo, headerRight, children, style }) {
  return (
    <View style={[styles.outer, style]}>
      <View style={styles.inner}>
        {titulo ? (
          <View style={styles.head}>
            <Text style={styles.titulo}>
              {icone ? icone + "  " : ""}
              {titulo}
            </Text>
            {headerRight}
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: tema.bg2,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: tema.madeira,
    borderBottomWidth: 10,
    borderBottomColor: tema.madeiraBase,
    padding: 4,
  },
  inner: {
    backgroundColor: "#fdf3da",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tema.linha,
    padding: 14,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titulo: {
    color: tema.madeira,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
