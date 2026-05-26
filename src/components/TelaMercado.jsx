import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import CardLote from "./CardLote.jsx";
import { tema } from "../styles/tema.js";
import {
  PRECO_TIPO_BRASIL,
  SCA_LIMIARES,
  LIMIAR_MICROLOTE_SCA,
} from "../data/constantes.js";
import { TULHAS } from "../data/economia.js";

export default function TelaMercado() {
  const { state, dispatch } = useJogo();
  const [aba, setAba] = useState("commodity"); // 'commodity' | 'microlote'

  const microlotes = state.estoqueSacas.filter((l) => l.microlote);
  const commodity = state.estoqueSacas.filter((l) => !l.microlote);
  const sacasTotal = state.estoqueSacas.reduce((a, l) => a + l.sacas, 0);
  const tulha = TULHAS[state.tulha || "pequena"];

  const lista = aba === "microlote" ? microlotes : commodity;
  const totalLista = lista.reduce((acc, l) => acc + l.sacas * l.precoPorSaca, 0);
  const sacasLista = lista.reduce((acc, l) => acc + l.sacas, 0);

  return (
    <View style={styles.container}>
      {/* Capacidade da tulha */}
      <View style={styles.caixa}>
        <Text style={styles.subTitulo}>
          {tulha.icone} {tulha.nome}
        </Text>
        <Text style={[styles.tabPreco, { color: sacasTotal >= tulha.capacidade ? tema.vermelho : tema.dourado }]}>
          {sacasTotal} / {tulha.capacidade} sacas armazenadas
        </Text>
      </View>

      {/* Tabela de preços */}
      <Text style={styles.h2}>Tabela de preços</Text>
      <View style={styles.caixa}>
        <Text style={styles.subTitulo}>Por Tipo BRASIL</Text>
        {Object.entries(PRECO_TIPO_BRASIL).map(([tipo, preco], i, arr) => (
          <View
            key={tipo}
            style={[styles.tabLinha, i === arr.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.tabNome}>Tipo {tipo}</Text>
            <Text style={styles.tabPreco}>R$ {preco.toLocaleString("pt-BR")}</Text>
          </View>
        ))}
      </View>

      <View style={styles.caixa}>
        <Text style={styles.subTitulo}>Multiplicador SCA</Text>
        {SCA_LIMIARES.map((linha, i) => (
          <View
            key={linha.classe}
            style={[
              styles.tabLinha,
              i === SCA_LIMIARES.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={styles.tabNome}>{linha.classe}</Text>
            <Text style={styles.tabPreco}>× {linha.mult.toFixed(1)}</Text>
          </View>
        ))}
      </View>

      {/* Abas */}
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

      {/* Lista */}
      {lista.length === 0 ? (
        <Text style={styles.vazio}>
          {aba === "microlote"
            ? `Sem microlotes (precisa de score SCA ≥ ${LIMIAR_MICROLOTE_SCA}). Cuide bem da lavoura e use métodos pós superiores.`
            : "Sem sacas commodity. Colha e processe pra estocar aqui."}
        </Text>
      ) : (
        <>
          <View style={styles.caixa}>
            <Text style={styles.subTitulo}>
              Vender tudo desta aba ({sacasLista} sacas)
            </Text>
            <View style={styles.totalLinha}>
              <Text style={styles.totalValor}>
                R$ {totalLista.toLocaleString("pt-BR")}
              </Text>
              <Botao
                variante="primario"
                onPress={() => {
                  // Vender todos os lotes desta aba (1 por 1 — manda VENDER_LOTE)
                  for (const l of lista) {
                    dispatch({ type: "VENDER_LOTE", payload: { loteId: l.id } });
                  }
                }}
              >
                Vender tudo
              </Botao>
            </View>
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
  container: { gap: 12 },
  h2: {
    color: tema.dourado,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  subTitulo: {
    color: tema.textoDim,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  caixa: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 4,
  },
  tabLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
    borderStyle: "dashed",
  },
  tabNome: { color: tema.texto, fontSize: 12 },
  tabPreco: {
    color: tema.dourado,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    fontSize: 12,
  },
  abas: {
    flexDirection: "row",
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 4,
    gap: 4,
  },
  aba: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
    alignItems: "center",
  },
  abaAtiva: {
    backgroundColor: tema.bg3,
  },
  abaTxt: {
    color: tema.textoDim,
    fontSize: 12,
    fontWeight: "500",
  },
  abaTxtAtivo: {
    color: tema.dourado,
  },
  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 24,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  totalLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  totalValor: {
    color: tema.verde,
    fontSize: 18,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  lista: { gap: 8 },
});
