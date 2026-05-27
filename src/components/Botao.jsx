import { Pressable, Text, StyleSheet } from "react-native";
import { tema } from "../styles/tema.js";
import { tocarEfeito } from "../audio/engine.js";

/* Botão estilo Hay Day: pílula com "base" 3D (borda inferior grossa
   na cor escura). No toque, afunda — reduz a base e desce alguns px. */

const VARIANTES = {
  primario:   { bg: tema.gold,    fg: tema.onGold,   border: tema.goldBorda,   base: tema.goldBase },
  secundario: { bg: tema.bg2,     fg: tema.texto,    border: tema.linha,       base: "#c9a86f" },
  perigo:     { bg: tema.erroBg,  fg: tema.onErro,   border: tema.vermelho,    base: tema.onErro },
  sucesso:    { bg: tema.verdeBtn,fg: tema.onVerde,  border: tema.verdeBase,   base: tema.verdeBase },
  fantasma:   { bg: "transparent",fg: tema.textoDim, border: "transparent",    base: "transparent" },
};

export default function Botao({
  children,
  onPress,
  variante = "secundario",
  disabled = false,
  fullWidth = false,
  pequeno = false,
}) {
  const v = VARIANTES[variante] || VARIANTES.secundario;
  const chato = variante === "fantasma";

  return (
    <Pressable
      onPress={(e) => {
        tocarEfeito("ui_click");
        onPress?.(e);
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderBottomColor: v.base,
          borderBottomWidth: chato ? 1 : pressed && !disabled ? 2 : 5,
        },
        pequeno && styles.pequeno,
        fullWidth && styles.full,
        disabled && styles.disabled,
        pressed && !disabled && !chato && { transform: [{ translateY: 3 }] },
        pressed && !disabled && chato && styles.pressedFantasma,
      ]}
    >
      <Text
        style={[
          styles.texto,
          { color: v.fg },
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
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pequeno: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  full: { alignSelf: "stretch" },
  disabled: { opacity: 0.45 },
  pressedFantasma: { opacity: 0.6 },
  texto: {
    fontSize: tema.fonteCorpo,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  textoPequeno: {
    fontSize: tema.fontePequeno,
    fontWeight: "700",
  },
});
