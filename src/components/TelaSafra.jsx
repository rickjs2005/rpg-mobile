import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema } from "../styles/tema.js";
import { METODOS_POS, VARIEDADES } from "../data/cafe.js";
import { UMIDADE_PRONTA, UMIDADE_INICIAL } from "../logic/pos_colheita.js";
import { formatarData } from "../logic/tempo.js";

const pct = (v) => `${Math.round(v * 100)}%`;

export default function TelaSafra() {
  const { state, dispatch } = useJogo();

  if (state.fase === "normal") {
    return (
      <Text style={styles.vazio}>
        Sem safra ativa.{"\n"}Vá pra Fazenda e colha um talhão formado no período (mai–ago).
      </Text>
    );
  }

  if (state.fase === "aguardando_pos") {
    const ch = state.colheitaPendente;
    const variedade = VARIEDADES[ch.variedadeId];
    return (
      <View style={styles.container}>
        <Text style={styles.h2}>🍒 Colheita pronta</Text>
        <View style={styles.caixa}>
          <Linha label="Variedade" valor={variedade.nome} />
          <Linha label="Sacas colhidas" valor={String(ch.sacas)} ultimo />
        </View>
        <View style={styles.caixa}>
          <Text style={styles.caixaTitulo}>Perfil do que foi colhido</Text>
          <Text style={styles.perfilTxt}>
            🟢 {pct(ch.perfilColhido.maduro)} maduro
          </Text>
          <Text style={styles.perfilTxt}>
            🟡 {pct(ch.perfilColhido.verde)} verde
          </Text>
          <Text style={styles.perfilTxt}>
            🟤 {pct(ch.perfilColhido.seco)} seco
          </Text>
        </View>

        <Text style={styles.h2}>Método de pós-colheita</Text>
        <Text style={styles.dica}>
          Mais caro = bebida melhor, secagem mais rápida, menor risco de chuva.
        </Text>

        {Object.entries(METODOS_POS).map(([id, m]) => {
          const semGrana = state.caixa < m.custo;
          return (
            <View key={id} style={styles.metodo}>
              <View style={styles.metodoHeader}>
                <Text style={styles.metodoNome}>{m.nome}</Text>
                <Text style={styles.metodoCusto}>R$ {m.custo}</Text>
              </View>
              <Text style={styles.metodoDesc}>{m.desc}</Text>
              <View style={styles.metodoStats}>
                <Text style={styles.metodoStat}>⏱️ {m.diasSecagem} dias</Text>
                <Text style={styles.metodoStat}>☕ +{pct(m.bonusBebida)} bebida</Text>
                <Text style={styles.metodoStat}>🌧️ risco {pct(m.riscoChuva)}</Text>
              </View>
              <Botao
                fullWidth
                variante={semGrana ? "fantasma" : "primario"}
                disabled={semGrana}
                onPress={() =>
                  dispatch({
                    type: "INICIAR_POS_COLHEITA",
                    payload: { metodoPos: id },
                  })
                }
              >
                {semGrana ? "Caixa insuficiente" : "Iniciar secagem"}
              </Botao>
            </View>
          );
        })}
      </View>
    );
  }

  // fase === 'secagem'
  const lote = state.loteSecagem;
  const variedade = VARIEDADES[lote.variedadeId];
  const progresso =
    (UMIDADE_INICIAL - lote.umidade) / (UMIDADE_INICIAL - UMIDADE_PRONTA);
  const metodo = METODOS_POS[lote.metodoPos];

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>🌡️ Secando</Text>
      <View style={styles.caixa}>
        <Linha label="Variedade" valor={variedade.nome} />
        <Linha label="Sacas" valor={String(lote.sacas)} />
        <Linha label="Método" valor={metodo.nome} />
        <Linha label="Dias no terreiro" valor={String(lote.dias)} />
        <Linha label="Iniciado em" valor={formatarData(state.tempo)} ultimo />
      </View>

      <View style={styles.caixa}>
        <Text style={styles.caixaTitulo}>
          Umidade: {pct(lote.umidade)} → precisa chegar a {pct(UMIDADE_PRONTA)}
        </Text>
        <View style={styles.barra}>
          <View
            style={[
              styles.barraFill,
              { width: `${Math.min(100, Math.max(0, progresso * 100))}%` },
            ]}
          />
        </View>
        <Text style={styles.dica}>
          Avance os dias no botão do topo. O clima sorteado afeta a velocidade —
          chuva faz o lote absorver umidade de volta.
        </Text>
      </View>
    </View>
  );
}

function Linha({ label, valor, ultimo }) {
  return (
    <View style={[linhaStyles.row, ultimo && { borderBottomWidth: 0 }]}>
      <Text style={linhaStyles.label}>{label}</Text>
      <Text style={linhaStyles.valor}>{valor}</Text>
    </View>
  );
}

const linhaStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
    borderStyle: "dashed",
    gap: 8,
  },
  label: {
    color: tema.textoDim,
    fontSize: 13,
  },
  valor: {
    color: tema.texto,
    fontSize: 13,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
    flexShrink: 1,
  },
});

const styles = StyleSheet.create({
  container: { gap: 12 },
  h2: {
    color: tema.dourado,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  caixa: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 4,
  },
  caixaTitulo: {
    color: tema.textoDim,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  perfilTxt: {
    color: tema.texto,
    fontSize: 13,
    paddingVertical: 2,
  },
  vazio: {
    textAlign: "center",
    color: tema.textoFraco,
    paddingVertical: 50,
    fontSize: 13,
    lineHeight: 22,
  },
  dica: {
    color: tema.textoDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  metodo: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 8,
  },
  metodoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metodoNome: {
    color: tema.texto,
    fontSize: 14,
    fontWeight: "600",
  },
  metodoCusto: {
    color: tema.dourado,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  metodoDesc: {
    color: tema.texto,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.78,
  },
  metodoStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metodoStat: {
    color: tema.texto,
    fontSize: 11,
    opacity: 0.85,
  },
  barra: {
    backgroundColor: tema.bg3,
    borderRadius: 4,
    height: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  barraFill: {
    backgroundColor: tema.azul,
    height: "100%",
  },
});
