/* ============================================================
   TELA SAFRA — pós-colheita (design Stitch / Hay Day).
   3 estados (fase): inativo · escolha de método · secagem.
   Painéis chunky, barras de perfil com rótulo, ícone clay,
   cards de método com badge. Dados/lógica reais.
   ============================================================ */

import { View, Text, Image, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import Painel from "./Painel.jsx";
import { tema } from "../styles/tema.js";
import { METODOS_POS, VARIEDADES } from "../data/cafe.js";
import { UMIDADE_INICIAL, UMIDADE_PRONTA } from "../logic/pos_colheita.js";
import { formatarData } from "../logic/tempo.js";

const IMG_SECAGEM = require("../../assets/safra/secagem.png");
const pct = (v) => `${Math.round(v * 100)}%`;

const METODO_UI = {
  natural: { emoji: "☀️", badge: "Comum", destaque: false },
  cd: { emoji: "💧", badge: null, destaque: false },
  lavado: { emoji: "🚿", badge: "⭐ Premium", destaque: true },
};

const PERFIL_UI = {
  maduro: { emoji: "🟢", label: "Maduro", cor: tema.verde, fg: "#ffffff" },
  verde: { emoji: "🟡", label: "Verde", cor: tema.gold, fg: "#241a00" },
  seco: { emoji: "🟤", label: "Seco", cor: tema.madeira, fg: "#ffffff" },
};

export default function TelaSafra({ setTela }) {
  const { state, dispatch } = useJogo();

  /* ---------- Estado 1: inativo ---------- */
  if (state.fase === "normal") {
    return (
      <View style={styles.container}>
        <View style={styles.inativo}>
          <Image source={IMG_SECAGEM} style={styles.inativoImg} resizeMode="contain" />
          <Text style={styles.inativoTit}>Sem safra ativa.</Text>
          <Text style={styles.inativoTxt}>
            Vá para a Fazenda e colha um talhão formado no período (mai–ago).
          </Text>
          <Botao variante="sucesso" fullWidth onPress={() => setTela && setTela("fazenda")}>
            🌳 Ir para a Fazenda
          </Botao>
        </View>
      </View>
    );
  }

  /* ---------- Estado 2: escolha de método ---------- */
  if (state.fase === "aguardando_pos") {
    const ch = state.colheitaPendente;
    const variedade = VARIEDADES[ch.variedadeId];
    return (
      <View style={styles.container}>
        {/* Resumo do lote */}
        <Painel>
          <View style={styles.resumo}>
            <View style={styles.resumoEsq}>
              <View style={styles.resumoIcone}>
                <Text style={{ fontSize: 22 }}>🌿</Text>
              </View>
              <View>
                <Text style={styles.resumoLabel}>LOTE COLHIDO</Text>
                <Text style={styles.resumoNome}>{variedade.nome}</Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.resumoLabel}>TOTAL</Text>
              <Text style={styles.resumoSacas}>
                {ch.sacas} <Text style={styles.resumoSacasSub}>sacas</Text>
              </Text>
            </View>
          </View>
        </Painel>

        {/* Perfil colhido */}
        <Painel icone="📊" titulo="Perfil do que foi colhido">
          {["maduro", "verde", "seco"].map((k) => {
            const ui = PERFIL_UI[k];
            const v = ch.perfilColhido[k] || 0;
            return (
              <View key={k} style={styles.perfilRow}>
                <Text style={styles.perfilEmoji}>{ui.emoji}</Text>
                <View style={styles.perfilTrack}>
                  <View style={[styles.perfilFill, { width: `${Math.max(8, v * 100)}%`, backgroundColor: ui.cor }]}>
                    <Text style={[styles.perfilLabel, { color: ui.fg }]} numberOfLines={1}>
                      {ui.label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.perfilPct, { color: ui.cor }]}>{pct(v)}</Text>
              </View>
            );
          })}
        </Painel>

        <Text style={styles.h2center}>MÉTODO DE PÓS-COLHEITA</Text>

        {Object.entries(METODOS_POS).map(([id, m]) => {
          const ui = METODO_UI[id] || METODO_UI.natural;
          const semGrana = state.caixa < m.custo;
          return (
            <View key={id} style={[styles.metodo, ui.destaque && styles.metodoDestaque]}>
              {ui.badge && (
                <View style={[styles.badge, ui.destaque && styles.badgeDestaque]}>
                  <Text style={[styles.badgeTxt, ui.destaque && styles.badgeTxtDestaque]}>{ui.badge}</Text>
                </View>
              )}
              <View style={styles.metodoInner}>
                <Text style={styles.metodoNome}>{m.nome}</Text>
                <View style={styles.metodoIcone}>
                  <Text style={{ fontSize: 40 }}>{ui.emoji}</Text>
                </View>
                <View style={styles.statsBox}>
                  <Stat label="💰 Custo" valor={m.custo === 0 ? "Grátis" : `R$ ${m.custo.toLocaleString("pt-BR")}`} cor={m.custo === 0 ? tema.dourado : tema.texto} />
                  <Stat label="⏱️ Tempo" valor={`${m.diasSecagem} dias`} />
                  <Stat label="☕ Qualidade" valor={`+${pct(m.bonusBebida)}`} cor={m.bonusBebida > 0 ? tema.verde : tema.texto} />
                  <Stat label="🌧️ Risco chuva" valor={pct(m.riscoChuva)} cor={m.riscoChuva >= 0.9 ? tema.vermelho : m.riscoChuva >= 0.6 ? tema.dourado : tema.verde} />
                </View>
                <Botao
                  variante={semGrana ? "fantasma" : "sucesso"}
                  fullWidth
                  disabled={semGrana}
                  onPress={() => dispatch({ type: "INICIAR_POS_COLHEITA", payload: { metodoPos: id } })}
                >
                  {semGrana ? "Caixa insuficiente" : "Iniciar secagem"}
                </Botao>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  /* ---------- Estado 3: secagem ---------- */
  const lote = state.loteSecagem;
  const variedade = VARIEDADES[lote.variedadeId];
  const metodo = METODOS_POS[lote.metodoPos];
  const progresso = (UMIDADE_INICIAL - lote.umidade) / (UMIDADE_INICIAL - UMIDADE_PRONTA);

  return (
    <View style={styles.container}>
      <View style={styles.secandoPill}>
        <Text style={styles.secandoTxt}>🌡️ SECANDO</Text>
      </View>

      <Painel>
        <Image source={IMG_SECAGEM} style={styles.secagemBanner} resizeMode="contain" />
        <View style={styles.grid}>
          <Campo label="Variedade" valor={variedade.nome} />
          <Campo label="Sacas" valor={String(lote.sacas)} />
          <Campo label="Método" valor={metodo.nome} />
          <Campo label="Dias no terreiro" valor={String(lote.dias)} />
          <Campo label="Iniciado em" valor={formatarData(state.tempo)} full />
        </View>
      </Painel>

      <Painel>
        <Text style={styles.umidLabel}>
          💧 Umidade: {pct(lote.umidade)} → meta {pct(UMIDADE_PRONTA)}
        </Text>
        <View style={styles.umidBarra}>
          <View
            style={[styles.umidFill, { width: `${Math.min(100, Math.max(0, progresso * 100))}%` }]}
          />
        </View>
        <Text style={styles.dica}>
          📍 Avance os dias no botão do topo. O clima sorteado afeta a velocidade — chuva faz o
          lote absorver umidade de volta.
        </Text>
      </Painel>
    </View>
  );
}

/* ---------- Sub-componentes ---------- */
function Stat({ label, valor, cor }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValor, cor && { color: cor }]}>{valor}</Text>
    </View>
  );
}
function Campo({ label, valor, full }) {
  return (
    <View style={[styles.campo, full && { width: "100%" }]}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  /* Inativo */
  inativo: {
    backgroundColor: tema.bg2,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: tema.madeira,
    borderBottomWidth: 10,
    borderBottomColor: tema.madeiraBase,
    padding: 20,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  inativoImg: { width: 160, height: 160 },
  inativoTit: { color: tema.texto, fontSize: 20, fontWeight: "800" },
  inativoTxt: { color: tema.textoDim, fontSize: 14, lineHeight: 20, textAlign: "center" },

  /* Resumo do lote */
  resumo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resumoEsq: { flexDirection: "row", alignItems: "center", gap: 10 },
  resumoIcone: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: tema.secondaryFixedDim || "#f6b99d",
    alignItems: "center", justifyContent: "center",
  },
  resumoLabel: { color: tema.textoDim, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  resumoNome: { color: tema.texto, fontSize: 18, fontWeight: "800" },
  resumoSacas: { color: tema.verde, fontSize: 26, fontWeight: "800" },
  resumoSacasSub: { color: tema.textoDim, fontSize: 13, fontWeight: "500" },

  /* Perfil */
  perfilRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  perfilEmoji: { fontSize: 18, width: 24, textAlign: "center" },
  perfilTrack: {
    flex: 1, height: 24, borderRadius: 999,
    backgroundColor: tema.surfaceVariant || "#ece2c9", overflow: "hidden",
  },
  perfilFill: { height: "100%", borderRadius: 999, justifyContent: "center", paddingLeft: 10, minWidth: 50 },
  perfilLabel: { fontSize: 12, fontWeight: "800" },
  perfilPct: { width: 44, textAlign: "right", fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },

  h2center: {
    color: tema.madeira, fontSize: 18, fontWeight: "800",
    textAlign: "center", letterSpacing: 0.5, marginTop: 4,
  },

  /* Método */
  metodo: {
    backgroundColor: "#ece2c9",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: tema.madeira,
    borderBottomWidth: 8,
    borderBottomColor: tema.madeiraBase,
    padding: 8,
  },
  metodoDestaque: { borderColor: tema.gold, borderBottomColor: tema.goldBorda },
  metodoInner: {
    backgroundColor: tema.creme,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 10,
  },
  metodoNome: { color: tema.texto, fontSize: 18, fontWeight: "800" },
  metodoIcone: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: tema.bg3, borderWidth: 3, borderColor: tema.creme,
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", top: -2, right: 12, zIndex: 2,
    backgroundColor: tema.bg3, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 2, borderColor: tema.creme,
  },
  badgeDestaque: { backgroundColor: tema.gold, right: undefined, alignSelf: "center", left: "38%" },
  badgeTxt: { color: tema.textoDim, fontSize: 11, fontWeight: "800" },
  badgeTxtDestaque: { color: "#3d2e00" },
  statsBox: {
    alignSelf: "stretch", backgroundColor: tema.bg3, borderRadius: 12, padding: 12, gap: 8,
  },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { color: tema.textoDim, fontSize: 13 },
  statValor: { color: tema.texto, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },

  /* Secagem */
  secandoPill: {
    alignSelf: "center",
    backgroundColor: tema.madeira,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginTop: 4,
  },
  secandoTxt: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  secagemBanner: { width: "100%", height: 150, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  campo: {
    width: "47%", flexGrow: 1,
    backgroundColor: tema.bg3, borderRadius: 10,
    borderWidth: 1, borderColor: tema.linha,
    paddingVertical: 8, paddingHorizontal: 10, gap: 1,
  },
  campoLabel: { color: tema.textoDim, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  campoValor: { color: tema.texto, fontSize: 14, fontWeight: "700" },

  umidLabel: { color: tema.texto, fontSize: 14, fontWeight: "700", marginBottom: 8 },
  umidBarra: {
    backgroundColor: tema.bg3, borderRadius: 999, height: 16, overflow: "hidden",
    borderWidth: 1, borderColor: tema.linha,
  },
  umidFill: { backgroundColor: tema.azul, height: "100%", borderRadius: 999 },
  dica: { color: tema.textoDim, fontSize: 12, lineHeight: 17, marginTop: 10 },
});
