/* ============================================================
   DASHBOARD — Painel da fazenda (Lote G4).
   Modal full-screen com agregados: caixa, produção, fazenda,
   melhor lote, e mini-gráfico de receita/despesa por ano.
   ============================================================ */

import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJogo } from "../hooks/useJogo.jsx";
import { tema, corVariedade } from "../styles/tema.js";
import { VARIEDADES, METODOS_POS } from "../data/cafe.js";
import { CERTIFICACOES } from "../data/economia.js";
import { MARCOS, CATEGORIAS_MARCOS } from "../data/marcos.js";
import { saudeFazenda } from "../logic/alertas.js";
import { valorLote } from "../logic/precos.js";

const SAUDE_LABEL = { boa: "🟢 Boa", atencao: "🟡 Atenção", ruim: "🔴 Ruim" };

export default function Dashboard({ visible, onClose }) {
  const { state } = useJogo();
  if (!state) return null;
  const stats = state.stats || {};
  const lucroLiquido = (stats.receitaTotal || 0) - (stats.despesaTotal || 0);

  const talhoesAtivos = state.talhoes.filter((t) => t.variedadeId);
  const hectaresTotais = state.talhoes.reduce((acc, t) => acc + t.hectares, 0);
  const pesTotais = state.talhoes.reduce((acc, t) => acc + (t.pes || 0), 0);
  const sanidadeMedia =
    talhoesAtivos.length > 0
      ? talhoesAtivos.reduce((acc, t) => acc + t.sanidade, 0) / talhoesAtivos.length
      : 0;
  const certsAtivas = Object.entries(state.certificacoes || {})
    .filter(([, c]) => c.ativa)
    .map(([id]) => CERTIFICACOES[id]?.nome)
    .filter(Boolean);
  const certsTransicao = Object.entries(state.certificacoes || {})
    .filter(([, c]) => c.emTransicao)
    .map(([id]) => CERTIFICACOES[id]?.nome)
    .filter(Boolean);

  const sacasEstoque = state.estoqueSacas.reduce((acc, l) => acc + l.sacas, 0);
  // Mesmo preço do Mercado (cert × índice de mercado) = o que seria creditado.
  const valorEstoque = state.estoqueSacas.reduce(
    (acc, l) => acc + valorLote(state, l),
    0
  );

  const melhorLote = stats.melhorLote;
  const melhorVariedade = melhorLote ? VARIEDADES[melhorLote.variedadeId] : null;

  // Dados pro mini-gráfico de barras
  const anos = Object.keys(stats.porAno || {}).map(Number).sort((a, b) => a - b);
  const maxValor = Math.max(
    1,
    ...anos.map((a) => Math.max(stats.porAno[a].receita, stats.porAno[a].despesa))
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.titulo} numberOfLines={1}>
            📊 {state.perfil?.fazenda || "Painel da fazenda"}
          </Text>
          <Pressable onPress={onClose} style={styles.fecharBtn}>
            <Text style={styles.fecharTxt}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Visão geral */}
          <Section titulo="Visão Geral">
            {state.perfil && (
              <Row label="Produtor">
                <Text style={styles.valor}>{state.perfil.produtor}</Text>
              </Row>
            )}
            {state.perfil && (
              <Row label="Região">
                <Text style={styles.valor}>{state.perfil.regiao}</Text>
              </Row>
            )}
            <Row label="Caixa atual">
              <Text style={[styles.valor, state.caixa < 0 ? styles.vermelho : styles.verde]}>
                R$ {state.caixa.toLocaleString("pt-BR")}
              </Text>
            </Row>
            <Row label="Receita total"><Verde>R$ {(stats.receitaTotal || 0).toLocaleString("pt-BR")}</Verde></Row>
            <Row label="Despesa total"><Vermelho>R$ {(stats.despesaTotal || 0).toLocaleString("pt-BR")}</Vermelho></Row>
            <Row label="Lucro líquido" destaque>
              <Text style={[styles.valor, lucroLiquido >= 0 ? styles.verde : styles.vermelho, styles.bold]}>
                R$ {lucroLiquido.toLocaleString("pt-BR")}
              </Text>
            </Row>
            <Row label="Tempo de jogo">
              <Text style={styles.valor}>{state.tempo.ano} ano{state.tempo.ano > 1 ? "s" : ""}, mês {state.tempo.mes}</Text>
            </Row>
            <Row label="Saúde da fazenda" ultimo>
              <Text style={styles.valor}>{SAUDE_LABEL[saudeFazenda(state)]}</Text>
            </Row>
          </Section>

          {/* Produção */}
          <Section titulo="Produção">
            <Row label="Sacas vendidas (total)"><Text style={styles.valor}>{stats.sacasVendidasTotal || 0}</Text></Row>
            <Row label="Vendas realizadas"><Text style={styles.valor}>{stats.vendasCount || 0}</Text></Row>
            <Row label="Sacas em estoque"><Text style={styles.valor}>{sacasEstoque}</Text></Row>
            <Row label="Valor do estoque atual" ultimo>
              <Verde>R$ {valorEstoque.toLocaleString("pt-BR")}</Verde>
            </Row>
          </Section>

          {/* Melhor lote */}
          {melhorLote && (
            <Section titulo="🏆 Melhor lote já vendido">
              <View style={styles.melhor}>
                <Text style={[styles.melhorVar, melhorVariedade && { color: corVariedade(melhorVariedade.cor) }]}>
                  {melhorVariedade?.nome || "—"}
                </Text>
                <Text style={styles.melhorDetail}>
                  {melhorLote.sacas} sacas · {melhorLote.classe}
                </Text>
                <Text style={styles.melhorScore}>
                  SCA {melhorLote.sca} · R$ {melhorLote.precoPorSaca.toLocaleString("pt-BR")}/saca
                </Text>
                <Text style={styles.melhorValor}>
                  R$ {melhorLote.valor.toLocaleString("pt-BR")} · ano {melhorLote.ano}
                </Text>
              </View>
            </Section>
          )}

          {/* Fazenda */}
          <Section titulo="Fazenda">
            <Row label="Talhões"><Text style={styles.valor}>{state.talhoes.length}</Text></Row>
            <Row label="Hectares totais"><Text style={styles.valor}>{hectaresTotais.toFixed(1)} ha</Text></Row>
            <Row label="Pés de café"><Text style={styles.valor}>{pesTotais.toLocaleString("pt-BR")}</Text></Row>
            <Row label="Sanidade média"><Text style={styles.valor}>{Math.round(sanidadeMedia * 100)}%</Text></Row>
            <Row label="Equipamentos"><Text style={styles.valor}>{state.equipamentos.length}</Text></Row>
            <Row label="Certificações ativas" ultimo>
              <Text style={styles.valor}>{certsAtivas.length}</Text>
            </Row>
          </Section>

          {certsAtivas.length > 0 || certsTransicao.length > 0 ? (
            <Section titulo="Certificações">
              {certsAtivas.map((nome) => (
                <Row key={nome} label="✓ Ativa">
                  <Text style={[styles.valor, styles.verde]}>{nome}</Text>
                </Row>
              ))}
              {certsTransicao.map((nome) => (
                <Row key={nome} label="⏳ Em transição">
                  <Text style={[styles.valor, { color: tema.dourado }]}>{nome}</Text>
                </Row>
              ))}
            </Section>
          ) : null}

          {/* Marcos (Lote G7) */}
          <Section
            titulo={`🏆 Marcos · ${Object.keys(state.marcos || {}).length}/${MARCOS.length}`}
          >
            {CATEGORIAS_MARCOS.map((cat) => {
              const items = MARCOS.filter((m) => m.categoria === cat);
              if (items.length === 0) return null;
              return (
                <View key={cat} style={styles.marcosCat}>
                  <Text style={styles.marcosCatTitulo}>{cat}</Text>
                  {items.map((m) => {
                    const feito = !!state.marcos?.[m.id]?.completado;
                    return (
                      <View
                        key={m.id}
                        style={[
                          styles.marcoLinha,
                          feito && styles.marcoLinhaFeito,
                        ]}
                      >
                        <Text style={styles.marcoIcone}>{feito ? m.icone : "🔒"}</Text>
                        <View style={styles.marcoTextos}>
                          <Text
                            style={[
                              styles.marcoNome,
                              feito ? styles.marcoNomeFeito : styles.marcoNomeBloq,
                            ]}
                          >
                            {m.nome}
                          </Text>
                          <Text style={styles.marcoDesc}>{m.desc}</Text>
                        </View>
                        {feito && <Text style={styles.marcoCheck}>✓</Text>}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </Section>

          {/* Mini-gráfico por ano */}
          {anos.length > 0 && (
            <Section titulo="Receita × Despesa por ano">
              <View style={styles.grafico}>
                {anos.map((a) => {
                  const r = stats.porAno[a].receita;
                  const d = stats.porAno[a].despesa;
                  return (
                    <View key={a} style={styles.graficoCol}>
                      <View style={styles.barras}>
                        <View style={styles.barraWrap}>
                          <View
                            style={[
                              styles.barraVerde,
                              { height: `${(r / maxValor) * 100}%` },
                            ]}
                          />
                        </View>
                        <View style={styles.barraWrap}>
                          <View
                            style={[
                              styles.barraVermelha,
                              { height: `${(d / maxValor) * 100}%` },
                            ]}
                          />
                        </View>
                      </View>
                      <Text style={styles.graficoAno}>{a}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.graficoLegenda}>
                <Text style={[styles.legendaTxt, styles.verde]}>■ Receita</Text>
                <Text style={[styles.legendaTxt, styles.vermelho]}>■ Despesa</Text>
              </View>
            </Section>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------- Sub-componentes ---------- */

function Section({ titulo, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionTitulo}>{titulo}</Text>
        <View style={styles.sectionBody}>{children}</View>
      </View>
    </View>
  );
}

function Row({ label, children, ultimo, destaque }) {
  return (
    <View style={[styles.row, ultimo && { borderBottomWidth: 0 }, destaque && styles.rowDestaque]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View>{children}</View>
    </View>
  );
}

const Verde = ({ children }) => <Text style={[styles.valor, styles.verde]}>{children}</Text>;
const Vermelho = ({ children }) => <Text style={[styles.valor, styles.vermelho]}>{children}</Text>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
  },
  titulo: { color: tema.dourado, fontSize: 18, fontWeight: "600" },
  fecharBtn: { padding: 6, paddingHorizontal: 12 },
  fecharTxt: { color: tema.texto, fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 14 },

  section: {
    backgroundColor: tema.bg2,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: tema.madeira,
    borderBottomWidth: 10,
    borderBottomColor: tema.madeiraBase,
    padding: 4,
  },
  sectionInner: {
    backgroundColor: "#fdf3da",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tema.linha,
    overflow: "hidden",
  },
  sectionTitulo: {
    color: tema.madeira,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: tema.bg3,
    borderStyle: "dashed",
  },
  rowDestaque: {
    backgroundColor: tema.bg3 + "70",
    marginHorizontal: -12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: tema.raioPequeno,
    borderBottomWidth: 0,
  },
  rowLabel: { color: tema.textoDim, fontSize: 13 },
  valor: { color: tema.texto, fontSize: 14, fontVariant: ["tabular-nums"] },
  bold: { fontWeight: "700" },
  verde: { color: tema.verde },
  vermelho: { color: tema.vermelho },

  melhor: { gap: 4 },
  melhorVar: { color: tema.dourado, fontSize: 16, fontWeight: "700" },
  melhorDetail: { color: tema.textoDim, fontSize: 13 },
  melhorScore: { color: tema.texto, fontSize: 13, fontVariant: ["tabular-nums"] },
  melhorValor: { color: tema.verde, fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },

  grafico: {
    flexDirection: "row",
    height: 120,
    gap: 12,
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  graficoCol: { flex: 1, alignItems: "center", gap: 4 },
  barras: { flexDirection: "row", gap: 2, height: 100, alignItems: "flex-end" },
  barraWrap: { width: 14, height: "100%", justifyContent: "flex-end" },
  barraVerde: { backgroundColor: tema.verde, borderRadius: 2 },
  barraVermelha: { backgroundColor: tema.vermelho, borderRadius: 2 },
  graficoAno: { color: tema.textoDim, fontSize: 11 },
  graficoLegenda: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendaTxt: { fontSize: 11 },

  marcosCat: {
    marginTop: 6,
    marginBottom: 4,
  },
  marcosCatTitulo: {
    color: tema.textoDim,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 4,
  },
  marcoLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: tema.raioPequeno,
    opacity: 0.55,
  },
  marcoLinhaFeito: {
    backgroundColor: tema.bg3,
    opacity: 1,
  },
  marcoIcone: { fontSize: 16, width: 22, textAlign: "center" },
  marcoTextos: { flex: 1 },
  marcoNome: { fontSize: 12, fontWeight: "600" },
  marcoNomeFeito: { color: tema.dourado },
  marcoNomeBloq: { color: tema.textoDim },
  marcoDesc: { color: tema.textoDim, fontSize: 10, lineHeight: 14 },
  marcoCheck: { color: tema.verde, fontSize: 14, fontWeight: "700" },
});
