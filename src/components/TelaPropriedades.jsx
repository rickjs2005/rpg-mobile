/* ============================================================
   TELA TERRAS — "Terras À Venda" (design Stitch / Hay Day).
   Painel intro (moldura dupla + título em pílula + 2 caixas
   rebaixadas) + cards com banner 3D. Dados/lógica reais.
   ============================================================ */

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
      {/* Intro */}
      <View style={styles.intro}>
        <View style={styles.tituloPill}>
          <Text style={styles.tituloTxt}>TERRAS À VENDA</Text>
        </View>
        <Text style={styles.introTxt}>
          Expanda seu império. Escolha entre terras nuas mais baratas ou lavouras
          prontas para colheita imediata.
        </Text>
        <View style={styles.introBoxes}>
          <View style={styles.recess}>
            <Text style={styles.recessIco}>🌱</Text>
            <Text style={styles.recessTit}>Terra Nua</Text>
            <Text style={styles.recessSub}>Barata, 3 anos p/ formar</Text>
          </View>
          <View style={styles.recess}>
            <Text style={styles.recessIco}>☕</Text>
            <Text style={[styles.recessTit, { color: tema.dourado }]}>Lavoura Pronta</Text>
            <Text style={styles.recessSub}>Cara, produção imediata</Text>
          </View>
        </View>
      </View>

      {/* Lista */}
      {disponiveis.length === 0 ? (
        <Text style={styles.vazio}>Nada à venda no momento.</Text>
      ) : (
        <View style={styles.lista}>
          {disponiveis.map((p) => (
            <CardPropriedade key={p.id} prop={p} />
          ))}
        </View>
      )}

      {/* Adquiridas */}
      {state.propriedadesCompradas.length > 0 && (
        <View style={styles.adquiridas}>
          <Text style={styles.adquiridasTit}>PROPRIEDADES ADQUIRIDAS</Text>
          {state.propriedadesCompradas.map((id) => {
            const p = PROPRIEDADES_VENDA.find((x) => x.id === id);
            return (
              <Text key={id} style={styles.adquiridaItem}>
                ✅ {p?.nome || id}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  /* Intro */
  intro: {
    backgroundColor: tema.bg2,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: tema.madeira,
    borderBottomWidth: 10,
    borderBottomColor: tema.madeiraBase,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  tituloPill: {
    backgroundColor: tema.bg3,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tituloTxt: {
    color: tema.madeira,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  introTxt: {
    color: tema.textoDim,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  introBoxes: { flexDirection: "row", gap: 12, alignSelf: "stretch" },
  recess: {
    flex: 1,
    backgroundColor: tema.bg3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tema.linha,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  recessIco: { fontSize: 22 },
  recessTit: { color: tema.texto, fontSize: 12, fontWeight: "800" },
  recessSub: { color: tema.textoFraco, fontSize: 10, textAlign: "center", lineHeight: 14 },

  lista: { gap: 16 },

  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 28,
    fontSize: 13,
  },

  /* Adquiridas */
  adquiridas: {
    backgroundColor: tema.bg2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: tema.linha,
    padding: 14,
    gap: 6,
  },
  adquiridasTit: {
    color: tema.textoDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  adquiridaItem: { color: tema.verde, fontSize: 14, fontWeight: "600" },
});
