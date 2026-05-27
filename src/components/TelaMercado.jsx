/* ============================================================
   TELA MERCADO — "Mercado e Corretora" (design Stitch / Hay Day).
   Painel da tulha com barra, bento das tabelas (Tipo BR + SCA),
   abas Commodity/Microlotes, painel dourado "vender tudo", lotes.
   Preços REAIS via logic/precos (= o que será creditado).
   ============================================================ */

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import CardLote from "./CardLote.jsx";
import Painel from "./Painel.jsx";
import Botao from "./Botao.jsx";
import { tema } from "../styles/tema.js";
import { PRECO_TIPO_BRASIL, SCA_LIMIARES, LIMIAR_MICROLOTE_SCA } from "../data/constantes.js";
import { TULHAS } from "../data/economia.js";
import { valorLote } from "../logic/precos.js";
import { leilaoAberto } from "../data/leilao.js";

const SCA_COR = {
  "Exemplar (90+)": { bg: tema.gold, fg: "#3d2e00" },
  "Especial (85+)": { bg: tema.primaryFixed || "#aef597", fg: "#022200" },
  "Premium (80+)": { bg: tema.madeira, fg: "#fff" },
  "Comercial": { bg: "#c1c9b9", fg: tema.texto },
};

export default function TelaMercado() {
  const { state, dispatch } = useJogo();
  const [aba, setAba] = useState("commodity");

  const microlotes = state.estoqueSacas.filter((l) => l.microlote);
  const commodity = state.estoqueSacas.filter((l) => !l.microlote);
  const sacasTotal = state.estoqueSacas.reduce((a, l) => a + l.sacas, 0);
  const tulha = TULHAS[state.tulha || "pequena"];
  const cap = tulha.capacidade;
  const pctTulha = Math.min(100, cap ? (sacasTotal / cap) * 100 : 0);
  const cheio = sacasTotal >= cap;
  const corTulha = cheio ? tema.vermelho : pctTulha > 70 ? tema.gold : tema.verde;

  const lista = aba === "microlote" ? microlotes : commodity;
  const sacasLista = lista.reduce((a, l) => a + l.sacas, 0);
  const totalLista = lista.reduce((a, l) => a + valorLote(state, l), 0);

  const venderAba = () => {
    for (const l of lista) dispatch({ type: "VENDER_LOTE", payload: { loteId: l.id } });
  };

  return (
    <View style={styles.container}>
      {/* ---------- Capacidade da Tulha ---------- */}
      <Painel icone="🏭" titulo="Capacidade da Tulha">
        <Text style={styles.tulhaNome}>{tulha.icone} {tulha.nome}</Text>
        <View style={styles.tulhaBox}>
          <View style={styles.tulhaLinha}>
            <Text style={styles.tulhaLabel}>Armazenamento</Text>
            <Text style={[styles.tulhaVal, { color: corTulha }]}>
              {sacasTotal} / {cap} sacas
            </Text>
          </View>
          <View style={styles.barra}>
            <View style={[styles.barraFill, { width: `${pctTulha}%`, backgroundColor: corTulha }]}>
              <View style={styles.barraShine} />
            </View>
          </View>
        </View>
      </Painel>

      {/* ---------- Banner do leilão (set–nov) ---------- */}
      {leilaoAberto(state.tempo.mes) && microlotes.length > 0 && (
        <View style={styles.leilaoBanner}>
          <Text style={styles.leilaoBannerTit}>🏆 Leilão de Cafés Especiais aberto!</Text>
          <Text style={styles.leilaoBannerSub}>
            Inscreva seus microlotes (SCA ≥ 85) na aba ⭐ Microlotes e arremate por um múltiplo do valor.
          </Text>
        </View>
      )}

      {/* ---------- Bento: tabelas ---------- */}
      <View style={styles.bento}>
        <Painel icone="📊" titulo="Tipo BR" style={styles.bentoItem}>
          <View style={styles.tabInner}>
            {Object.entries(PRECO_TIPO_BRASIL).map(([tipo, preco], i, arr) => (
              <View key={tipo} style={[styles.tabRow, i === arr.length - 1 && styles.tabRowLast]}>
                <Text style={styles.tabNome}>Tipo {tipo}</Text>
                <Text style={styles.tabPreco}>R$ {preco.toLocaleString("pt-BR")}</Text>
              </View>
            ))}
          </View>
        </Painel>

        <Painel icone="⭐" titulo="SCA" style={styles.bentoItem}>
          <View style={styles.tabInner}>
            {SCA_LIMIARES.map((linha, i) => {
              const cor = SCA_COR[linha.classe] || SCA_COR["Comercial"];
              return (
                <View key={linha.classe} style={[styles.tabRow, i === SCA_LIMIARES.length - 1 && styles.tabRowLast]}>
                  <Text style={styles.tabNome} numberOfLines={1}>{linha.classe}</Text>
                  <View style={[styles.scaBadge, { backgroundColor: cor.bg }]}>
                    <Text style={[styles.scaBadgeTxt, { color: cor.fg }]}>×{linha.mult.toFixed(1)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Painel>
      </View>

      {/* ---------- Abas ---------- */}
      <View style={styles.abas}>
        <Pressable
          onPress={() => setAba("commodity")}
          style={[styles.aba, aba === "commodity" && styles.abaAtiva]}
        >
          <Text style={[styles.abaTxt, aba === "commodity" && styles.abaTxtAtivo]}>
            Commodity ({commodity.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setAba("microlote")}
          style={[styles.aba, aba === "microlote" && styles.abaAtiva]}
        >
          <Text style={[styles.abaTxt, aba === "microlote" && styles.abaTxtAtivo]}>
            ⭐ Microlotes ({microlotes.length})
          </Text>
        </Pressable>
      </View>

      {/* ---------- Vender tudo + lista ---------- */}
      {lista.length === 0 ? (
        <Text style={styles.vazio}>
          {aba === "microlote"
            ? `Sem microlotes (precisa de SCA ≥ ${LIMIAR_MICROLOTE_SCA}). Cuide bem da lavoura e use métodos pós superiores.`
            : "Sem sacas commodity. Colha e processe pra estocar aqui."}
        </Text>
      ) : (
        <>
          <View style={styles.venderTudo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.venderLabel}>VENDER TUDO DESTA ABA ({sacasLista} sacas)</Text>
              <Text style={styles.venderTotal}>R$ {totalLista.toLocaleString("pt-BR")}</Text>
            </View>
            <Botao variante="primario" onPress={venderAba}>
              💰 Vender tudo
            </Botao>
          </View>

          <View style={styles.lista}>
            {lista.map((lote) => (
              <CardLote key={lote.id} lote={lote} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  /* Tulha */
  tulhaNome: { color: tema.texto, fontSize: 14, fontWeight: "700", marginBottom: 10 },
  tulhaBox: {
    backgroundColor: tema.creme,
    borderWidth: 2,
    borderColor: tema.linha,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  tulhaLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tulhaLabel: { color: tema.texto, fontSize: 12, fontWeight: "700" },
  tulhaVal: { fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  barra: {
    backgroundColor: tema.madeiraBase,
    borderRadius: 999,
    height: 14,
    overflow: "hidden",
  },
  barraFill: { height: "100%", borderRadius: 999, justifyContent: "flex-start" },
  barraShine: {
    position: "absolute",
    top: 2,
    left: 6,
    right: 6,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  /* Leilão banner */
  leilaoBanner: {
    backgroundColor: "#fff3d2",
    borderWidth: 3,
    borderColor: tema.gold,
    borderBottomWidth: 6,
    borderBottomColor: tema.goldBorda,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  leilaoBannerTit: { color: tema.douradoEscuro, fontSize: 16, fontWeight: "800" },
  leilaoBannerSub: { color: tema.textoDim, fontSize: 12, lineHeight: 17 },

  /* Bento */
  bento: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  bentoItem: { flex: 1 },
  tabInner: {
    backgroundColor: tema.creme,
    borderWidth: 2,
    borderColor: tema.linha,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: tema.surfaceVariant || "#ece2c9",
  },
  tabRowLast: { borderBottomWidth: 0 },
  tabNome: { color: tema.texto, fontSize: 12, flexShrink: 1 },
  tabPreco: { color: tema.verde, fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
  scaBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  scaBadgeTxt: { fontSize: 11, fontWeight: "800" },

  /* Abas */
  abas: { flexDirection: "row", gap: 8 },
  aba: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: tema.bg3,
    borderWidth: 2,
    borderColor: tema.linha,
    borderBottomWidth: 4,
    borderBottomColor: tema.linha,
  },
  abaAtiva: {
    backgroundColor: tema.bg2,
    borderColor: tema.verde,
    borderBottomColor: tema.verdeBase,
  },
  abaTxt: { color: tema.textoDim, fontSize: 13, fontWeight: "700" },
  abaTxtAtivo: { color: tema.verde },

  /* Vender tudo */
  venderTudo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff3d2",
    borderWidth: 3,
    borderColor: tema.gold,
    borderBottomWidth: 6,
    borderBottomColor: tema.goldBorda,
    borderRadius: 16,
    padding: 14,
  },
  venderLabel: {
    color: tema.douradoEscuro,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  venderTotal: {
    color: tema.verde,
    fontSize: 24,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },

  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 24,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  lista: { gap: 12 },
});
