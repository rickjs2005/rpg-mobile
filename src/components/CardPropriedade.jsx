/* ============================================================
   CARD PROPRIEDADE — terra à venda (design Stitch / Hay Day).
   Painel madeira com banner 3D no topo (badge + estrela nas
   prontas), nome + preço, chips e botão "Adquirir" dourado 3D.
   ============================================================ */

import { View, Text, Image, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema, corVariedade } from "../styles/tema.js";
import { VARIEDADES } from "../data/cafe.js";
import { nivelPorXp, desbloqueado, NIVEL_PROPRIEDADE } from "../data/niveis.js";

const IMG = {
  nua: require("../../assets/terras/nua.jpg"),
  pronta: require("../../assets/terras/pronta.jpg"),
};

function Chip({ txt, cor, bg }) {
  return (
    <View style={[styles.chip, bg && { backgroundColor: bg, borderColor: cor }]}>
      <Text style={[styles.chipTxt, cor && { color: cor }]}>{txt}</Text>
    </View>
  );
}

export default function CardPropriedade({ prop }) {
  const { state, dispatch } = useJogo();
  const semGrana = state.caixa < prop.preco;
  const lib = desbloqueado(NIVEL_PROPRIEDADE, prop.id, nivelPorXp(state.xp).nivel);
  const variedade = prop.variedade ? VARIEDADES[prop.variedade] : null;
  const pronta = prop.tipo === "pronta";

  return (
    <View style={[styles.card, pronta && styles.cardPronta]}>
      <View style={[styles.banner, pronta && styles.bannerPronta]}>
        <Image source={pronta ? IMG.pronta : IMG.nua} style={styles.bannerImg} resizeMode="contain" />
        <View style={[styles.badge, pronta && styles.badgePronta]}>
          <Text style={styles.badgeTxt}>{pronta ? "☕ Lavoura Pronta" : "🌾 Terra Nua"}</Text>
        </View>
        {pronta && (
          <View style={styles.star}>
            <Text style={styles.starTxt}>⭐</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.nome}>{prop.nome}</Text>
          <Text style={styles.preco}>R$ {prop.preco.toLocaleString("pt-BR")}</Text>
        </View>

        <View style={styles.chips}>
          <Chip txt={`Área: ${prop.hectares} ha`} />
          <Chip txt={prop.terreno === "plano" ? "🟩 Plano" : "⛰️ Ladeira"} />
          {variedade && <Chip txt={variedade.nome} cor={tema.verde} bg="#dcf3d3" />}
        </View>

        <Text style={styles.desc}>{prop.desc}</Text>

        <Botao
          fullWidth
          variante={!lib || semGrana ? "fantasma" : "primario"}
          disabled={!lib || semGrana}
          onPress={() =>
            dispatch({ type: "COMPRAR_PROPRIEDADE", payload: { propId: prop.id } })
          }
        >
          {!lib
            ? `🔒 Desbloqueia no nível ${NIVEL_PROPRIEDADE[prop.id]}`
            : semGrana
            ? "Sem caixa"
            : "➕ Adquirir"}
        </Botao>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tema.bg2,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: tema.madeira,
    borderBottomWidth: 10,
    borderBottomColor: tema.madeiraBase,
    overflow: "hidden",
  },
  cardPronta: { borderColor: tema.goldBorda, borderBottomColor: tema.goldBase },

  banner: {
    height: 150,
    backgroundColor: "#fdf3da",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerPronta: { backgroundColor: "#eef3e2" },
  bannerImg: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,248,239,0.92)",
    borderWidth: 1,
    borderColor: tema.linha,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePronta: { borderColor: tema.gold },
  badgeTxt: { color: tema.texto, fontSize: 11, fontWeight: "800" },
  star: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,248,239,0.92)",
    borderRadius: 999,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  starTxt: { fontSize: 14 },

  body: { padding: 14, gap: 10 },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  nome: { color: tema.texto, fontSize: 18, fontWeight: "800", flexShrink: 1 },
  preco: { color: tema.dourado, fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: tema.bg3,
    borderWidth: 1,
    borderColor: tema.linha,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTxt: { color: tema.textoDim, fontSize: 11, fontWeight: "700" },

  desc: { color: tema.textoDim, fontSize: 13, lineHeight: 18 },
});
