import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import { formatarData, rotuloPasso } from "../logic/tempo.js";
import {
  calcularProximoEvento,
  calcularAlertas,
  saudeFazenda,
  totalSacasEstoque,
  totalTalhoesComPragas,
} from "../logic/alertas.js";
import { rotuloMercado } from "../logic/mercado.js";
import { tema } from "../styles/tema.js";
import Botao from "./Botao.jsx";

const NIVEL_COR = {
  critico: tema.vermelho,
  aviso: tema.dourado,
  info: tema.azul,
  acao: tema.verde,
};

const SAUDE_ICONE = {
  boa: "🟢",
  atencao: "🟡",
  ruim: "🔴",
};

export default function HUD() {
  const { state, dispatch } = useJogo();
  const passoLabel = rotuloPasso(state.fase, state.velocidade);

  const proximo = calcularProximoEvento(state);
  const alertas = calcularAlertas(state);
  const saude = saudeFazenda(state);
  const sacas = totalSacasEstoque(state);
  const pragasN = totalTalhoesComPragas(state);

  return (
    <View style={styles.hud}>
      {/* Linha 0: identidade da fazenda (personalização da tela de início) */}
      {state.perfil && (
        <View style={styles.fazendaLinha}>
          <Text style={styles.fazendaNome} numberOfLines={1}>
            🏡 {state.perfil.fazenda}
          </Text>
          <Text style={styles.fazendaProd} numberOfLines={1}>
            {state.perfil.produtor}
          </Text>
        </View>
      )}

      {/* Linha 1: Caixa + Data + Saúde */}
      <View style={styles.linhaInfo}>
        <View style={styles.bloco}>
          <Text style={styles.label}>caixa</Text>
          <Text
            style={[
              styles.valor,
              state.caixa >= 0 ? styles.valorVerde : styles.valorVermelho,
            ]}
          >
            R$ {state.caixa.toLocaleString("pt-BR")}
          </Text>
        </View>
        <View style={styles.bloco}>
          <Text style={styles.label}>data</Text>
          <Text style={styles.valor}>{formatarData(state.tempo)}</Text>
        </View>
        <View style={styles.blocoSaude}>
          <Text style={styles.saude}>{SAUDE_ICONE[saude]}</Text>
        </View>
      </View>

      {/* Linha 2: Mini-stats */}
      <View style={styles.miniStats}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatTxt}>📦 {sacas}</Text>
        </View>
        {pragasN > 0 && (
          <View style={[styles.miniStat, styles.miniStatAlerta]}>
            <Text style={styles.miniStatTxt}>🐛 {pragasN}</Text>
          </View>
        )}
        <View style={styles.miniStat}>
          <Text
            style={[
              styles.miniStatTxt,
              state.mercado?.indice > 1.05
                ? { color: tema.verde }
                : state.mercado?.indice < 0.95
                ? { color: tema.vermelho }
                : null,
            ]}
          >
            📈 {rotuloMercado(state.mercado)}
          </Text>
        </View>
        <View style={styles.miniStatExpand}>
          {proximo && (
            <View style={styles.proximo}>
              <Text style={styles.proximoIcone}>{proximo.icone}</Text>
              <Text style={styles.proximoTxt} numberOfLines={1}>
                {proximo.texto}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Banner de alertas críticos (só quando há) */}
      {alertas.length > 0 && (
        <View style={styles.alertas}>
          {alertas.slice(0, 2).map((a, i) => (
            <View
              key={i}
              style={[
                styles.alerta,
                { borderLeftColor: NIVEL_COR[a.nivel] || tema.dourado },
              ]}
            >
              <Text style={styles.alertaTxt}>{a.texto}</Text>
            </View>
          ))}
          {alertas.length > 2 && (
            <Text style={styles.alertaMais}>+{alertas.length - 2} alertas</Text>
          )}
        </View>
      )}

      <Botao
        variante="primario"
        fullWidth
        onPress={() => dispatch({ type: "AVANCAR" })}
      >
        ▶ Avançar {passoLabel}
      </Botao>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    backgroundColor: tema.bg2,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
    padding: 10,
    gap: 8,
  },
  fazendaLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  fazendaNome: {
    color: tema.madeira,
    fontSize: 14,
    fontWeight: "800",
    flexShrink: 1,
  },
  fazendaProd: {
    color: tema.textoDim,
    fontSize: 12,
    fontWeight: "600",
  },
  linhaInfo: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  bloco: {
    flex: 1,
    gap: 1,
  },
  blocoSaude: {
    alignItems: "center",
    justifyContent: "center",
  },
  saude: { fontSize: 22, lineHeight: 24 },
  label: {
    color: tema.textoDim,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  valor: {
    color: tema.texto,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  valorVerde: { color: tema.verde },
  valorVermelho: { color: tema.vermelho },

  miniStats: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  miniStat: {
    backgroundColor: tema.bg3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
  },
  miniStatAlerta: {
    borderWidth: 1,
    borderColor: tema.vermelho,
  },
  miniStatTxt: {
    color: tema.texto,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  miniStatExpand: {
    flex: 1,
  },
  proximo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tema.bg3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
  },
  proximoIcone: { fontSize: 12, lineHeight: 14 },
  proximoTxt: {
    color: tema.texto,
    fontSize: 11,
    flex: 1,
  },

  alertas: {
    gap: 4,
  },
  alerta: {
    backgroundColor: tema.bg3,
    borderLeftWidth: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: tema.raioPequeno,
  },
  alertaTxt: {
    color: tema.texto,
    fontSize: 11,
  },
  alertaMais: {
    color: tema.textoDim,
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "right",
  },
});
