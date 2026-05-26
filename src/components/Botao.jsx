import { Pressable, Text, StyleSheet } from "react-native";
import { tema } from "../styles/tema.js";

export default function Botao({
  children,
  onPress,
  variante = "secundario",
  disabled = false,
  fullWidth = false,
  pequeno = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[`var_${variante}`],
        fullWidth && styles.full,
        pequeno && styles.pequeno,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.texto,
          variante === "primario" && styles.textoPrimario,
          variante === "fantasma" && styles.textoFantasma,
          pequeno && styles.textoPequeno,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: tema.raio,
    borderWidth: 1,
    borderColor: tema.linha,
    backgroundColor: tema.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  var_primario: {
    backgroundColor: tema.dourado,
    borderColor: tema.dourado,
  },
  var_secundario: {},
  var_perigo: {
    borderColor: tema.vermelhoEscuro,
  },
  var_fantasma: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  full: { alignSelf: "stretch" },
  pequeno: {
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  disabled: { opacity: 0.4 },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  texto: {
    color: tema.texto,
    fontSize: tema.fonteCorpo,
    fontWeight: "500",
  },
  textoPrimario: {
    color: "#1a0f08",
    fontWeight: "600",
  },
  textoFantasma: {
    color: tema.textoDim,
  },
  textoPequeno: {
    fontSize: tema.fontePequeno,
  },
});
