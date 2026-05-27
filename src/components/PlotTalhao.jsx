/* ============================================================
   PLOT TALHÃO — representação visual de um talhão no "mapa" da
   fazenda. Campo colorido + fileiras de café que mudam de cor
   conforme estado/estação, selos de praga/irrigação/atenção, e
   barra de sanidade. Tocar abre o CardTalhao completo (no modal).
   Presentacional: recebe `talhao` + `mes` + `onPress`.
   ============================================================ */

import { useRef, useEffect } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet } from "react-native";
import { tema } from "../styles/tema.js";
import { VARIEDADES } from "../data/cafe.js";
import { ANOS_FORMACAO } from "../data/constantes.js";
import { estaEmRecuperacao } from "../logic/talhao.js";
import { estaEpocaColheita } from "../logic/tempo.js";
import { calcularMaturacao } from "../logic/maturacao.js";

const N_DOTS = 15;

// Cores das "mudas" (dots) conforme o estado/estação do talhão.
function coresDots(talhao, mes) {
  if (!talhao.variedadeId) return Array(N_DOTS).fill("#caa97f"); // solo nu
  if (estaEmRecuperacao(talhao)) return Array(N_DOTS).fill("#7a6a52"); // tocos
  if (talhao.idadeAnos < ANOS_FORMACAO) return Array(N_DOTS).fill("#8fce7a"); // brotos
  if (estaEpocaColheita({ mes }) && !talhao.ciclo?.safraColhida) {
    const p = calcularMaturacao(talhao, mes);
    const nM = Math.round((p.maduro || 0) * N_DOTS);
    const nS = Math.round((p.seco || 0) * N_DOTS);
    const nV = Math.max(0, N_DOTS - nM - nS);
    return [
      ...Array(nM).fill("#c0392b"),
      ...Array(nV).fill("#2f7d3a"),
      ...Array(nS).fill("#7a4a1e"),
    ];
  }
  return Array(N_DOTS).fill("#2f7d3a"); // folhagem verde
}

function corCampo(talhao) {
  if (!talhao.variedadeId) return "#6b4f37"; // terra
  if (estaEmRecuperacao(talhao)) return "#4a4030";
  return "#3c5a2e"; // lavoura
}

function corSanidade(pct) {
  if (pct < 40) return tema.vermelho;
  if (pct < 70) return tema.dourado;
  return "#7bd16a";
}

export default function PlotTalhao({ talhao, mes, onPress }) {
  const variedade = talhao.variedadeId ? VARIEDADES[talhao.variedadeId] : null;
  const dots = coresDots(talhao, mes);
  const sanPct = Math.round((talhao.sanidade || 0) * 100);
  const recup = estaEmRecuperacao(talhao);
  const formado = talhao.variedadeId && talhao.idadeAnos >= ANOS_FORMACAO;
  const temPragas = Object.keys(talhao.pragas || {}).length > 0;
  const pronto = formado && !recup && estaEpocaColheita({ mes }) && !talhao.ciclo?.safraColhida;
  const atencao = talhao.variedadeId && !recup && (sanPct < 40 || pronto);
  const balanca = talhao.variedadeId && !recup; // folhagem balança ao vento
  const formando = talhao.variedadeId && talhao.idadeAnos < ANOS_FORMACAO;

  // Vento: oscilação suave das mudas.
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!balanca) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sway, balanca]);
  const swayX = sway.interpolate({ inputRange: [-1, 1], outputRange: [-3, 3] });

  const status = !talhao.variedadeId
    ? "Vazio — tocar p/ plantar"
    : recup
    ? "Em recuperação"
    : talhao.idadeAnos < ANOS_FORMACAO
    ? `Formando ${talhao.idadeAnos}/${ANOS_FORMACAO}`
    : pronto
    ? "Pronto pra colher 🍒"
    : `${talhao.idadeAnos} anos`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.plot,
        pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
      ]}
    >
      {/* Campo com as mudas */}
      <View style={[styles.campo, { backgroundColor: corCampo(talhao) }]}>
        <View style={styles.selos}>
          {temPragas && <Text style={styles.selo}>🐛</Text>}
          {talhao.irrigado && <Text style={styles.selo}>💧</Text>}
          {atencao && <Text style={styles.selo}>⚠️</Text>}
        </View>
        {formando && (
          <View style={styles.formacaoBar}>
            <View
              style={[
                styles.formacaoFill,
                { width: `${Math.round((talhao.idadeAnos / ANOS_FORMACAO) * 100)}%` },
              ]}
            />
          </View>
        )}
        <Animated.View
          style={[styles.mudas, balanca && { transform: [{ translateX: swayX }] }]}
        >
          {dots.map((c, i) => (
            <View key={i} style={[styles.muda, { backgroundColor: c }]} />
          ))}
        </Animated.View>
        {talhao.variedadeId ? (
          <View style={styles.sanBarra}>
            <View
              style={[
                styles.sanFill,
                { width: `${sanPct}%`, backgroundColor: corSanidade(sanPct) },
              ]}
            />
          </View>
        ) : null}
      </View>

      {/* Rodapé: nome + status */}
      <View style={styles.rodape}>
        <Text style={styles.nome} numberOfLines={1}>
          {variedade ? variedade.nome : "Talhão vazio"}
        </Text>
        <Text style={styles.status} numberOfLines={1}>
          📏 {talhao.hectares}ha · {status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plot: {
    width: "48%",
    backgroundColor: tema.bg2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: tema.linha,
    borderBottomWidth: 5,
    borderBottomColor: "#cdb78c",
    overflow: "hidden",
  },
  campo: {
    height: 96,
    padding: 8,
    justifyContent: "flex-end",
  },
  selos: {
    position: "absolute",
    top: 5,
    right: 6,
    flexDirection: "row",
    gap: 3,
  },
  selo: { fontSize: 13 },
  mudas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "center",
    marginBottom: 6,
  },
  muda: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.18)",
  },
  formacaoBar: {
    position: "absolute",
    top: 6,
    left: 8,
    right: 8,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  formacaoFill: { height: "100%", borderRadius: 999, backgroundColor: "#8fce7a" },
  sanBarra: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  sanFill: { height: "100%", borderRadius: 999 },
  rodape: { padding: 8, gap: 1 },
  nome: { color: tema.texto, fontSize: 13, fontWeight: "800" },
  status: { color: tema.textoDim, fontSize: 11 },
});
