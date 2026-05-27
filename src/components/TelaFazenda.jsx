import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useJogo } from "../hooks/useJogo.jsx";
import CardTalhao from "./CardTalhao.jsx";
import PlotTalhao from "./PlotTalhao.jsx";
import Timeline from "./Timeline.jsx";
import HistoricoEventos from "./HistoricoEventos.jsx";
import Painel from "./Painel.jsx";
import Botao from "./Botao.jsx";
import { tema } from "../styles/tema.js";
import { INSUMOS } from "../data/economia.js";
import { formatarData } from "../logic/tempo.js";
import { climaDescreve } from "../logic/clima.js";
import { resumoFazenda } from "../logic/resumoFazenda.js";
import { dicasManejo } from "../logic/dicasManejo.js";
import { estaEmRecuperacao } from "../logic/talhao.js";
import { UMIDADE_INICIAL, UMIDADE_PRONTA } from "../logic/pos_colheita.js";
import { CUSTO_AMOSTRAGEM, ANOS_FORMACAO } from "../data/constantes.js";

// Migra save antigo: state.mensagens (strings) → eventos sintéticos.
function eventosCompat(state) {
  if (state.eventos && state.eventos.length > 0) return state.eventos;
  if (Array.isArray(state.mensagens)) {
    return state.mensagens.map((m) => ({
      tempo: state.tempo,
      texto: m,
      categoria: "outros",
    }));
  }
  return [];
}

export default function TelaFazenda({ setTela }) {
  const { state, dispatch } = useJogo();
  const insets = useSafeAreaInsets();
  const [histAberto, setHistAberto] = useState(false);
  const [vista, setVista] = useState("mapa"); // "mapa" | "lista"
  const [ordem, setOrdem] = useState("atencao"); // "atencao" | "sanidade" | "idade"
  const [talhaoModalId, setTalhaoModalId] = useState(null);
  const [dicasExpand, setDicasExpand] = useState(false);
  const eventos = eventosCompat(state);
  const resumo = resumoFazenda(state);
  const dicas = dicasManejo(state);
  const talhaoModal = state.talhoes.find((t) => t.id === talhaoModalId) || null;

  // ---- Ordenação dos talhões ----
  const naEpoca = state.tempo.mes >= 5 && state.tempo.mes <= 8;
  const score = (t) => {
    if (!t.variedadeId) return -1; // vazios por último
    let s = 0;
    if (naEpoca && t.idadeAnos >= ANOS_FORMACAO && t.estado === "normal" && !t.ciclo?.safraColhida) s += 5;
    if (Object.keys(t.pragas || {}).length) s += 3;
    if (t.sanidade < 0.4) s += 4;
    return s;
  };
  const talhoesOrd = [...state.talhoes].sort((a, b) => {
    if (ordem === "sanidade") return (a.sanidade || 0) - (b.sanidade || 0);
    if (ordem === "idade") return (b.idadeAnos || 0) - (a.idadeAnos || 0);
    return score(b) - score(a) || (a.sanidade || 0) - (b.sanidade || 0);
  });

  // ---- Ações em massa ----
  const aduboQtd = state.inventario?.adubo || 0;
  const fracos = state.talhoes
    .filter((t) => t.variedadeId && !estaEmRecuperacao(t) && t.sanidade < 0.7)
    .sort((a, b) => a.sanidade - b.sanidade);
  const adubarN = Math.min(aduboQtd, fracos.length);
  const amostraveis = state.talhoes.filter((t) => t.variedadeId && !estaEmRecuperacao(t));
  const amostrarN = Math.min(amostraveis.length, Math.floor((state.caixa || 0) / CUSTO_AMOSTRAGEM));
  const adubarFracos = () => {
    for (let i = 0; i < adubarN; i++)
      dispatch({ type: "APLICAR_INSUMO", payload: { talhaoId: fracos[i].id, insumoId: "adubo" } });
  };
  const amostrarTodos = () => {
    for (let i = 0; i < amostrarN; i++)
      dispatch({ type: "AMOSTRAR", payload: { talhaoId: amostraveis[i].id } });
  };

  // ---- Mini-terreiro (secagem em curso) ----
  const secando = state.fase === "secagem" && state.loteSecagem;
  const progSecagem = secando
    ? Math.min(100, Math.max(0, ((UMIDADE_INICIAL - state.loteSecagem.umidade) / (UMIDADE_INICIAL - UMIDADE_PRONTA)) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <Timeline />

      {/* Clima de hoje + resumo + atenção */}
      <Painel icone="🌤️" titulo="Sua fazenda">
        {state.climaHoje && (
          <View style={styles.climaRow}>
            <Text style={styles.climaTxt}>{climaDescreve(state.climaHoje.tipo)}</Text>
            <Text style={styles.climaMm}>
              {state.climaHoje.mm > 0 ? `${state.climaHoje.mm} mm` : "sem chuva"}
            </Text>
          </View>
        )}
        <View style={styles.resumoGrid}>
          <Mini label="Talhões" valor={`${resumo.ativos}/${resumo.talhoes}`} />
          <Mini label="Pés" valor={resumo.pes.toLocaleString("pt-BR")} />
          <Mini label="Hectares" valor={resumo.hectares.toFixed(1)} />
          {resumo.sacasEstimadas != null && (
            <Mini label="Safra estim." valor={`~${resumo.sacasEstimadas} sc`} destaque />
          )}
        </View>
        {resumo.atencao.length > 0 && (
          <View style={styles.atencaoBox}>
            <Text style={styles.atencaoTit}>⚠️ Precisa de atenção</Text>
            {resumo.atencao.map((a, i) => (
              <View key={i} style={styles.atencaoRow}>
                <Text style={styles.atencaoIcone}>{a.icone}</Text>
                <Text
                  style={[
                    styles.atencaoTxt,
                    a.nivel === "critico" && { color: tema.vermelho },
                    a.nivel === "acao" && { color: tema.verde, fontWeight: "700" },
                  ]}
                >
                  {a.texto}
                </Text>
              </View>
            ))}
          </View>
        )}
        {(adubarN > 0 || amostrarN > 0) && (
          <View style={styles.quickRow}>
            {adubarN > 0 && (
              <Botao pequeno onPress={adubarFracos}>
                🌱 Adubar fracos ({adubarN})
              </Botao>
            )}
            {amostrarN > 0 && (
              <Botao pequeno variante="fantasma" onPress={amostrarTodos}>
                🔍 Amostrar todos ({amostrarN})
              </Botao>
            )}
          </View>
        )}
      </Painel>

      {/* Manejo recomendado — agrônomo virtual (educativo) */}
      <Painel icone="👨‍🌾" titulo="Manejo recomendado">
        <View style={styles.dicasLista}>
          {(dicasExpand ? dicas : dicas.slice(0, 3)).map((d, i) => (
            <View key={i} style={styles.dicaItem}>
              <Text style={styles.dicaIcone}>{d.icone}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dicaTitulo}>{d.titulo}</Text>
                <Text style={styles.dicaTexto}>{d.texto}</Text>
              </View>
            </View>
          ))}
        </View>
        {dicas.length > 3 && (
          <Pressable onPress={() => setDicasExpand((v) => !v)} hitSlop={6} style={styles.dicaVerMais}>
            <Text style={styles.dicaVerMaisTxt}>
              {dicasExpand ? "Ver menos ▲" : `Ver mais ${dicas.length - 3} ▼`}
            </Text>
          </Pressable>
        )}
      </Painel>

      {/* Mini-terreiro: secagem em curso (atalho pra Safra) */}
      {secando && (
        <Pressable
          onPress={() => setTela && setTela("safra")}
          style={({ pressed }) => [styles.terreiroCard, pressed && { opacity: 0.85 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.terreiroTit}>🌡️ Secando no terreiro</Text>
            <Text style={styles.terreiroSub}>
              {Math.round(state.loteSecagem.umidade * 100)}% → {Math.round(UMIDADE_PRONTA * 100)}% · {state.loteSecagem.dias} dias
            </Text>
            <View style={styles.terreiroBar}>
              <View style={[styles.terreiroFill, { width: `${progSecagem}%` }]} />
            </View>
          </View>
          <Text style={styles.terreiroLink}>Safra →</Text>
        </Pressable>
      )}

      {/* Inventário em grade */}
      <Painel icone="📦" titulo="Inventário">
        <View style={styles.invGrid}>
          {Object.entries(INSUMOS).map(([id, ins]) => {
            const qtd = state.inventario[id] || 0;
            const vazio = qtd === 0;
            return (
              <View key={id} style={[styles.invTile, vazio && styles.invTileVazio]}>
                <View style={styles.invIcone}>
                  <Text style={styles.invEmoji}>{ins.icone}</Text>
                </View>
                <Text style={styles.invNome} numberOfLines={1}>
                  {ins.nome}
                </Text>
                <View style={[styles.invPill, vazio && styles.invPillVazio]}>
                  <Text style={[styles.invPillTxt, vazio && styles.invPillTxtVazio]}>
                    {qtd}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Painel>

      {/* Talhões — toggle Mapa / Lista */}
      <View style={styles.talhoesHeader}>
        <Text style={styles.h2}>🌾 Talhões ({state.talhoes.length})</Text>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => setVista("mapa")}
            style={[styles.toggleBtn, vista === "mapa" && styles.toggleAtivo]}
          >
            <Text style={[styles.toggleTxt, vista === "mapa" && styles.toggleTxtAtivo]}>
              🗺️ Mapa
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVista("lista")}
            style={[styles.toggleBtn, vista === "lista" && styles.toggleAtivo]}
          >
            <Text style={[styles.toggleTxt, vista === "lista" && styles.toggleTxtAtivo]}>
              📋 Lista
            </Text>
          </Pressable>
        </View>
      </View>

      {state.talhoes.length > 1 && (
        <View style={styles.ordenarRow}>
          <Text style={styles.ordenarLabel}>Ordenar:</Text>
          {[
            ["atencao", "Atenção"],
            ["sanidade", "Sanidade"],
            ["idade", "Idade"],
          ].map(([id, lbl]) => (
            <Pressable
              key={id}
              onPress={() => setOrdem(id)}
              style={[styles.ordChip, ordem === id && styles.ordChipAtivo]}
            >
              <Text style={[styles.ordChipTxt, ordem === id && styles.ordChipTxtAtivo]}>
                {lbl}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {vista === "mapa" ? (
        <View style={styles.mapaGrid}>
          {talhoesOrd.map((t) => (
            <PlotTalhao
              key={t.id}
              talhao={t}
              mes={state.tempo.mes}
              onPress={() => setTalhaoModalId(t.id)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.lista}>
          {talhoesOrd.map((t) => (
            <CardTalhao key={t.id} talhao={t} />
          ))}
        </View>
      )}

      {/* Eventos recentes */}
      {eventos.length > 0 && (
        <Painel
          icone="🕘"
          titulo={`Eventos recentes (${eventos.length})`}
          headerRight={
            <Pressable onPress={() => setHistAberto(true)} hitSlop={8}>
              <Text style={styles.verTodos}>Ver tudo →</Text>
            </Pressable>
          }
        >
          <View style={styles.evLista}>
            {eventos.slice(0, 5).map((ev, i) => (
              <View key={i} style={styles.evRow}>
                <Text style={styles.evData}>{formatarData(ev.tempo)}</Text>
                <Text style={styles.evTxt}>{ev.texto}</Text>
              </View>
            ))}
          </View>
        </Painel>
      )}

      <HistoricoEventos
        visible={histAberto}
        onClose={() => setHistAberto(false)}
        eventos={eventos}
      />

      {/* Detalhe do talhão (a partir do mapa) — CardTalhao completo */}
      <Modal
        visible={!!talhaoModal}
        animationType="slide"
        onRequestClose={() => setTalhaoModalId(null)}
      >
        <View style={[styles.modalRoot, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTit}>🌾 Detalhe do talhão</Text>
            <Pressable onPress={() => setTalhaoModalId(null)} hitSlop={8} style={styles.modalFechar}>
              <Text style={styles.modalFecharTxt}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
            {talhaoModal && <CardTalhao talhao={talhaoModal} />}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function Mini({ label, valor, destaque }) {
  return (
    <View style={[styles.miniBox, destaque && styles.miniBoxDestaque]}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={[styles.miniVal, destaque && { color: tema.verde }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  /* Clima + resumo + atenção */
  climaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: tema.bg3,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  climaTxt: { color: tema.texto, fontSize: 15, fontWeight: "700" },
  climaMm: { color: tema.azul, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  resumoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  miniBox: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: tema.bg3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tema.linha,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 2,
  },
  miniBoxDestaque: { borderColor: tema.verde },
  miniLabel: { color: tema.textoDim, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  miniVal: { color: tema.texto, fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  atencaoBox: {
    marginTop: 10,
    backgroundColor: tema.creme,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tema.linha,
    padding: 10,
    gap: 5,
  },
  atencaoTit: { color: tema.madeira, fontSize: 12, fontWeight: "800", marginBottom: 2 },
  atencaoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  atencaoIcone: { fontSize: 14, width: 20, textAlign: "center" },
  atencaoTxt: { color: tema.texto, fontSize: 13, flex: 1 },

  h2: {
    color: tema.madeira,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
    paddingLeft: 4,
  },
  lista: { gap: 12 },

  /* Toggle Mapa / Lista */
  talhoesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: tema.bg3,
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: tema.linha,
  },
  toggleBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
  toggleAtivo: { backgroundColor: tema.bg2, borderWidth: 1, borderColor: tema.dourado },
  toggleTxt: { color: tema.textoDim, fontSize: 12, fontWeight: "700" },
  toggleTxtAtivo: { color: tema.dourado },

  /* Manejo recomendado (dicas educativas) */
  dicasLista: { gap: 10 },
  dicaItem: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: tema.bg3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tema.linha,
    borderLeftWidth: 4,
    borderLeftColor: tema.verde,
    padding: 10,
  },
  dicaIcone: { fontSize: 20, width: 26, textAlign: "center" },
  dicaTitulo: { color: tema.texto, fontSize: 14, fontWeight: "800" },
  dicaTexto: { color: tema.textoDim, fontSize: 12, lineHeight: 17, marginTop: 2 },
  dicaVerMais: { alignSelf: "center", paddingVertical: 8, marginTop: 4 },
  dicaVerMaisTxt: { color: tema.verde, fontSize: 12, fontWeight: "700" },

  /* Ações em massa */
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

  /* Mini-terreiro */
  terreiroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: tema.bg2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: tema.azul,
    borderBottomWidth: 5,
    borderBottomColor: "#2c5468",
    padding: 12,
  },
  terreiroTit: { color: tema.texto, fontSize: 14, fontWeight: "800" },
  terreiroSub: { color: tema.textoDim, fontSize: 12, marginTop: 1, fontVariant: ["tabular-nums"] },
  terreiroBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: tema.bg3,
    overflow: "hidden",
    marginTop: 6,
  },
  terreiroFill: { height: "100%", borderRadius: 999, backgroundColor: tema.azul },
  terreiroLink: { color: tema.azul, fontSize: 13, fontWeight: "800" },

  /* Ordenar */
  ordenarRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  ordenarLabel: { color: tema.textoDim, fontSize: 11, fontWeight: "700" },
  ordChip: {
    backgroundColor: tema.bg3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tema.linha,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  ordChipAtivo: { backgroundColor: tema.bg2, borderColor: tema.dourado },
  ordChipTxt: { color: tema.textoDim, fontSize: 11, fontWeight: "700" },
  ordChipTxtAtivo: { color: tema.dourado },

  /* Grid do mapa */
  mapaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },

  /* Modal de detalhe */
  modalRoot: { flex: 1, backgroundColor: tema.bg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
    backgroundColor: tema.bg2,
  },
  modalTit: { color: tema.madeira, fontSize: 16, fontWeight: "800" },
  modalFechar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tema.bg3,
  },
  modalFecharTxt: { color: tema.texto, fontSize: 18, fontWeight: "700" },

  /* Inventário em grade */
  invGrid: {
    flexDirection: "row",
    gap: 10,
  },
  invTile: {
    flex: 1,
    backgroundColor: tema.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tema.linha,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 6,
  },
  invTileVazio: { opacity: 0.5 },
  invIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: tema.creme,
    borderWidth: 1,
    borderColor: tema.linha,
    alignItems: "center",
    justifyContent: "center",
  },
  invEmoji: { fontSize: 24, lineHeight: 28 },
  invNome: {
    fontSize: 11,
    fontWeight: "700",
    color: tema.textoDim,
    textAlign: "center",
  },
  invPill: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: tema.goldBorda,
    alignItems: "center",
  },
  invPillVazio: { backgroundColor: "#c1c9b9" },
  invPillTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  invPillTxtVazio: { color: tema.texto },

  /* Eventos */
  verTodos: {
    color: tema.verde,
    fontSize: 12,
    fontWeight: "700",
  },
  evLista: { gap: 8 },
  evRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: tema.bg3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tema.linha,
    padding: 10,
  },
  evData: {
    color: tema.textoDim,
    fontSize: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    minWidth: 76,
    marginTop: 1,
  },
  evTxt: {
    color: tema.texto,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
