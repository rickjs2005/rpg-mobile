/* ============================================================
   TELA DE INÍCIO — estilo "Hay Day" (design do Stitch).
   Hero com foto de lavoura + título inclinado, 2 cards de modo
   com ilustração/chips/botão, menu secundário e rodapé.
   Paleta Material clara (creme/verde/dourado/madeira) — diferente
   do tema escuro do resto do app, por isso definida localmente.

   Fontes do design (Plus Jakarta Sans / Be Vietnam Pro) podem ser
   adicionadas via expo-font; aqui usamos a fonte do sistema em peso
   forte como fallback fiel ao visual.
   ============================================================ */

import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useJogo } from "../hooks/useJogo.jsx";

/* ---------- Paleta exata do design (Stitch / Material) ---------- */
const C = {
  bg: "#fff8ef",
  surface: "#fff8ef",
  surfaceContainer: "#f7edd4",
  surfaceVariant: "#ece2c9",
  onSurface: "#201b0c",
  onSurfaceVariant: "#41493c",
  outlineVariant: "#c1c9b9",
  // verde (primary)
  primary: "#2a691d",
  primaryDark: "#115206",
  onPrimary: "#ffffff",
  primaryFixed: "#aef597",
  onPrimaryFixed: "#022200",
  // madeira (secondary)
  secondary: "#82533d",
  secondaryDark: "#663c27",
  secondaryFixedDim: "#f6b99d",
  // dourado (tertiary)
  gold: "#f4bf00",
  goldDark: "#594400",
  goldBorder: "#755b00",
  tertiaryFixed: "#ffdf92",
  onTertiaryFixed: "#241a00",
  // erro
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
};

/* ---------- Botão "3D" (borda inferior grossa = base) ---------- */
function Botao3D({ children, onPress, bg, color, border, base, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn3d,
        {
          backgroundColor: bg,
          borderColor: border,
          borderBottomColor: base,
          borderBottomWidth: pressed ? 2 : 6,
          marginTop: pressed ? 4 : 0,
        },
        style,
      ]}
    >
      <Text style={{ color, fontSize: 16, fontWeight: "800", letterSpacing: 0.5 }}>
        {children}
      </Text>
    </Pressable>
  );
}

/* ---------- Chip (pílula) ---------- */
function Chip({ texto, bg, color, border }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.chipTxt, { color }]}>{texto}</Text>
    </View>
  );
}

export default function TelaInicio() {
  const { dispatch } = useJogo();
  const insets = useSafeAreaInsets();

  const iniciar = (modo) => dispatch({ type: "NOVA_PARTIDA", payload: { modo } });
  const emBreve = (titulo) =>
    Alert.alert(titulo, "Em breve nesta versão.", [{ text: "Ok" }]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- HERO ---------- */}
        <ImageBackground
          source={require("../../assets/inicio/hero.png")}
          resizeMode="cover"
          style={[styles.hero, { paddingTop: insets.top + 24 }]}
          imageStyle={styles.heroImg}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.tituloCard}>
            <Text style={styles.titulo}>Império{"\n"}do Café</Text>
            <Text style={styles.subtitulo}>Zona da Mata</Text>
          </View>
        </ImageBackground>

        <View style={styles.corpo}>
          {/* ---------- CARD 1: Rocinha Pronta ---------- */}
          <View style={styles.card}>
            <Image
              source={require("../../assets/inicio/rocinha.png")}
              style={styles.cardImg}
            />
            <Text style={styles.cardTitulo}>☕ Rocinha Pronta</Text>
            <Text style={styles.cardTexto}>
              Comece sua jornada com um lote estruturado e algumas fileiras
              produzindo. Ideal para iniciantes.
            </Text>
            <View style={styles.chips}>
              <Chip
                texto="DIFICULDADE: FÁCIL"
                bg={C.primaryFixed}
                color={C.onPrimaryFixed}
                border={C.primary}
              />
              <Chip
                texto="ORÇAMENTO: R$ 5.000"
                bg={C.tertiaryFixed}
                color={C.onTertiaryFixed}
                border={C.gold}
              />
            </View>
            <Botao3D
              onPress={() => iniciar("rocinha_pronta")}
              bg={C.gold}
              color={C.goldDark}
              border={C.goldBorder}
              base={C.goldDark}
            >
              INICIAR
            </Botao3D>
          </View>

          {/* ---------- CARD 2: Terra Nua ---------- */}
          <View style={styles.card}>
            <Image
              source={require("../../assets/inicio/terra.png")}
              style={styles.cardImg}
            />
            <Text style={styles.cardTitulo}>🌱 Terra Nua</Text>
            <Text style={styles.cardTexto}>
              Um terreno vazio e desafiador. Planeje cada sulco e construa seu
              império do zero absoluto.
            </Text>
            <View style={styles.chips}>
              <Chip
                texto="DIFICULDADE: DIFÍCIL"
                bg={C.errorContainer}
                color={C.onErrorContainer}
                border={C.error}
              />
              <Chip
                texto="ORÇAMENTO: R$ 3.000"
                bg={C.tertiaryFixed}
                color={C.onTertiaryFixed}
                border={C.gold}
              />
            </View>
            <Botao3D
              onPress={() => iniciar("terra_nua")}
              bg={C.secondary}
              color={C.surface}
              border={C.secondaryDark}
              base={C.secondaryDark}
            >
              INICIAR
            </Botao3D>
          </View>

          {/* ---------- MENU SECUNDÁRIO ---------- */}
          <View style={styles.menu}>
            <Pressable
              onPress={() =>
                emBreve("Continuar", "Você ainda não tem uma partida salva.")
              }
              style={({ pressed }) => [
                styles.btn3d,
                {
                  backgroundColor: C.primary,
                  borderColor: C.onPrimaryFixed,
                  borderBottomColor: C.primaryDark,
                  borderBottomWidth: pressed ? 2 : 6,
                  marginTop: pressed ? 4 : 0,
                },
              ]}
            >
              <Text style={styles.continuarTxt}>CONTINUAR</Text>
              <Text style={styles.continuarSub}>Nenhuma partida salva</Text>
            </Pressable>

            <Pressable
              onPress={() => emBreve("Configurações")}
              style={({ pressed }) => [styles.btnMenu, pressed && styles.btnMenuPressed]}
            >
              <Text style={styles.btnMenuTxt}>CONFIGURAÇÕES</Text>
            </Pressable>
            <Pressable
              onPress={() => emBreve("Sobre o projeto", "Império do Café — simulador de cafeicultura da Zona da Mata mineira.")}
              style={({ pressed }) => [styles.btnMenu, pressed && styles.btnMenuPressed]}
            >
              <Text style={styles.btnMenuTxt}>SOBRE O PROJETO</Text>
            </Pressable>
          </View>

          {/* ---------- RODAPÉ ---------- */}
          <Text style={styles.rodape}>Versão 1.0.0 • Império do Café</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* Hero */
  hero: {
    width: "100%",
    minHeight: 300,
    paddingBottom: 28,
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: C.secondary,
    overflow: "hidden",
    marginBottom: 28,
  },
  heroImg: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  tituloCard: {
    backgroundColor: "rgba(130,83,61,0.85)",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: C.secondaryFixedDim,
    paddingVertical: 14,
    paddingHorizontal: 26,
    alignItems: "center",
    transform: [{ rotate: "-2deg" }],
  },
  titulo: {
    color: C.gold,
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 42,
    textShadowColor: C.onSurface,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  subtitulo: {
    color: C.surface,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  corpo: { paddingHorizontal: 16, gap: 24 },

  /* Cards */
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: C.secondary,
    borderBottomWidth: 10,
    borderBottomColor: C.secondaryDark,
    padding: 18,
    gap: 14,
    alignItems: "center",
  },
  cardImg: {
    width: 132,
    height: 132,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: C.outlineVariant,
  },
  cardTitulo: {
    color: C.onSurface,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  cardTexto: {
    color: C.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    borderRadius: 999,
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipTxt: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  /* Botão 3D genérico */
  btn3d: {
    width: "100%",
    borderRadius: 999,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Menu secundário */
  menu: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.surfaceVariant,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  continuarTxt: {
    color: C.onPrimary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  continuarSub: {
    color: C.primaryFixed,
    fontSize: 12,
    marginTop: 2,
  },
  btnMenu: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  btnMenuPressed: { backgroundColor: C.surfaceContainer },
  btnMenuTxt: {
    color: C.onSurface,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  rodape: {
    textAlign: "center",
    color: C.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
  },
});
