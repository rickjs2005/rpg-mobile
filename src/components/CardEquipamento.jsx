import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema } from "../styles/tema.js";

const ROTULO_MELHOR_EM = {
  plano: "🟩 melhor em plano",
  montanhoso: "⛰️ melhor em montanhoso",
  qualquer: "↔ qualquer terreno",
};

export default function CardEquipamento({ equipId, equipamento }) {
  const { state, dispatch } = useJogo();
  const possui = state.equipamentos.includes(equipId);
  const semGrana = state.caixa < equipamento.custo;

  return (
    <View style={[styles.card, possui && styles.cardPossui]}>
      <View style={styles.header}>
        <Text style={styles.icone}>{equipamento.icone}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{equipamento.nome}</Text>
          <Text style={styles.terreno}>
            {ROTULO_MELHOR_EM[equipamento.melhorEm]}
          </Text>
        </View>
        {possui && <Text style={styles.flag}>✓ adquirido</Text>}
      </View>

      <Text style={styles.desc}>{equipamento.desc}</Text>

      <View style={styles.efeitos}>
        {equipamento.efeitos.eficienciaEnergia && (
          <Text style={styles.efeito}>
            ⚡ energia × {equipamento.efeitos.eficienciaEnergia}
          </Text>
        )}
        {equipamento.efeitos.bonusRendimento && (
          <Text style={styles.efeito}>
            📈 +{Math.round(equipamento.efeitos.bonusRendimento * 100)}% rendimento
          </Text>
        )}
        {equipamento.efeitos.bonusBebida && (
          <Text style={styles.efeito}>
            ☕ +{Math.round(equipamento.efeitos.bonusBebida * 100)}% bebida
          </Text>
        )}
        {equipamento.efeitos.penalidadeBebida && (
          <Text style={[styles.efeito, { color: tema.vermelho }]}>
            ⚠️ {Math.round(equipamento.efeitos.penalidadeBebida * 100)}% bebida
          </Text>
        )}
        {equipamento.efeitos.secagemRapida && (
          <Text style={styles.efeito}>🌡️ seca sem depender do sol</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.preco}>
            R$ {equipamento.custo.toLocaleString("pt-BR")}
          </Text>
          <Text style={styles.precoOp}>
            operação R$ {equipamento.custoOperacao}/uso
          </Text>
        </View>
        {!possui && (
          <Botao
            pequeno
            variante={semGrana ? "fantasma" : "primario"}
            disabled={semGrana}
            onPress={() =>
              dispatch({ type: "COMPRAR_EQUIPAMENTO", payload: { equipId } })
            }
          >
            Comprar
          </Botao>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 8,
  },
  cardPossui: {
    borderColor: tema.verde,
    opacity: 0.75,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  icone: {
    fontSize: 24,
    lineHeight: 26,
  },
  nome: {
    color: tema.texto,
    fontSize: 15,
    fontWeight: "600",
  },
  terreno: {
    color: tema.textoDim,
    fontSize: 11,
    marginTop: 2,
  },
  flag: {
    color: tema.verde,
    fontSize: 11,
    fontWeight: "600",
  },
  desc: {
    color: tema.texto,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.78,
  },
  efeitos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  efeito: {
    color: tema.texto,
    fontSize: 11,
    backgroundColor: tema.bg3,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  preco: {
    color: tema.dourado,
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  precoOp: {
    color: tema.textoDim,
    fontSize: 10,
  },
});
