/* ============================================================
   TELA LOJA — "Loja de Elite" (design do Stitch / Hay Day).
   Painéis madeira chunky, ícones 3D em círculo, grades.
   VISUAL do Stitch + DADOS reais do jogo (data/economia, constantes).
   Estados dinâmicos: sem caixa → desabilitado; adquirido → verde.
   ============================================================ */

import { View, Text, Image, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import { tema } from "../styles/tema.js";
import {
  INSUMOS,
  EQUIPAMENTOS,
  CERTIFICACOES,
  EQUIPE,
  TULHAS,
  TULHA_PROGRESSAO,
} from "../data/economia.js";
import { FUNCAFE, COOPERATIVA } from "../data/constantes.js";
import { statusCertText } from "../logic/certificacoes.js";
import { hectaresCobertura, folhaPagamentoMensal } from "../logic/equipe.js";
import { limiteEmprestimo, calcularParcela } from "../logic/financiamento.js";

/* ---------- Ilustrações 3D baixadas do Stitch ---------- */
const IMG_INSUMO = {
  adubo: require("../../assets/loja/adubo.png"),
  calcario: require("../../assets/loja/calcario.png"),
  defensivo: require("../../assets/loja/defensivo.png"),
};
const IMG_TRATOR = require("../../assets/loja/trator.png");
const IMG_TULHA = require("../../assets/loja/tulha.png");
const IMG_FUNCAFE = require("../../assets/loja/funcafe.png");

const TERRENO_LABEL = {
  plano: "🟩 Plano",
  montanhoso: "⛰️ Ladeira",
  qualquer: "↔ Qualquer",
};

const CERT_COR = {
  rainforest: { bg: "#dcf3d3", borda: "#7fc97f", fg: "#2a691d" },
  fairtrade: { bg: "#d6e8f5", borda: "#9cc4dc", fg: "#2f5e7e" },
  organico: { bg: "#f7e6bf", borda: "#e0c277", fg: "#8a5a00" },
};

function beneficioEquip(eq) {
  const e = eq.efeitos || {};
  if (e.bonusRendimento) return `+${Math.round(e.bonusRendimento * 100)}% rendimento`;
  if (e.bonusBebida) return `+${Math.round(e.bonusBebida * 100)}% bebida`;
  if (e.secagemRapida) return "seca sem sol";
  return "";
}

function Titulo({ icone, children }) {
  return (
    <Text style={styles.h3}>
      {icone}  {children}
    </Text>
  );
}

export default function TelaLoja() {
  const { state, dispatch } = useJogo();
  const filiado = !!state.cooperativa?.filiado;

  return (
    <View style={styles.container}>
      {/* ---------- 1. COOPERATIVA ---------- */}
      {filiado ? (
        <View style={[styles.painel, styles.coopBanner]}>
          <Text style={styles.coopTitulo}>🤝 {COOPERATIVA.nome} · ✓ Cooperado</Text>
          <Text style={styles.coopSub}>
            −{Math.round(COOPERATIVA.descontoInsumos * 100)}% insumos · piso{" "}
            {Math.round(COOPERATIVA.floorMercado * 100)}% na venda · anuidade R$
            {COOPERATIVA.anuidade.toLocaleString("pt-BR")}/ano
          </Text>
        </View>
      ) : (
        <View style={styles.painel}>
          <Text style={styles.coopTitulo}>🤝 Cooperativa {COOPERATIVA.nome}</Text>
          <Text style={styles.coopSub}>
            Filie-se para ter benefícios exclusivos e proteção de preço.
          </Text>
          <View style={styles.coopChips}>
            <View style={styles.coopChip}>
              <Text style={styles.coopChipTxt}>
                ％ −{Math.round(COOPERATIVA.descontoInsumos * 100)}% Insumos
              </Text>
            </View>
            <View style={styles.coopChip}>
              <Text style={styles.coopChipTxt}>
                ✓ {Math.round(COOPERATIVA.floorMercado * 100)}% Preço Base
              </Text>
            </View>
          </View>
          <View style={styles.coopFooter}>
            <View>
              <Text style={styles.coopPreco}>
                R$ {COOPERATIVA.custoAdesao.toLocaleString("pt-BR")}{" "}
                <Text style={styles.coopPrecoSub}>adesão</Text>
              </Text>
              <Text style={styles.coopPrecoSub}>
                + R$ {COOPERATIVA.anuidade.toLocaleString("pt-BR")}/ano
              </Text>
            </View>
            <Botao
              variante={state.caixa < COOPERATIVA.custoAdesao ? "fantasma" : "primario"}
              disabled={state.caixa < COOPERATIVA.custoAdesao}
              onPress={() => dispatch({ type: "FILIAR_COOPERATIVA" })}
            >
              ⭐ Filiar-se
            </Botao>
          </View>
        </View>
      )}

      {/* ---------- 2. INSUMOS ---------- */}
      <Titulo icone="🛍️">Insumos</Titulo>
      <View style={styles.grid3}>
        {Object.entries(INSUMOS).map(([id, ins]) => {
          const semGrana = state.caixa < ins.custo;
          return (
            <View key={id} style={[styles.tile, semGrana && styles.tileDim]}>
              <View style={styles.iconeImg}>
                <Image source={IMG_INSUMO[id]} style={styles.img} resizeMode="cover" />
              </View>
              <Text style={styles.tileNome}>{ins.nome}</Text>
              <Text style={styles.tileDesc} numberOfLines={2}>
                {ins.efeito}
              </Text>
              <Text style={styles.tilePreco}>R$ {ins.custo}</Text>
              <Botao
                pequeno
                fullWidth
                variante={semGrana ? "fantasma" : "sucesso"}
                disabled={semGrana}
                onPress={() =>
                  dispatch({ type: "COMPRAR_INSUMO", payload: { insumoId: id, qtd: 1 } })
                }
              >
                Comprar
              </Botao>
            </View>
          );
        })}
      </View>

      {/* ---------- 3. EQUIPAMENTOS ---------- */}
      <Titulo icone="🚜">Equipamentos</Titulo>
      <View style={styles.grid2}>
        {Object.entries(EQUIPAMENTOS).map(([id, eq]) => {
          const possui = state.equipamentos.includes(id);
          const semGrana = state.caixa < eq.custo;
          return (
            <View
              key={id}
              style={[styles.tile, possui && styles.tileOwned, !possui && semGrana && styles.tileDim]}
            >
              <View style={styles.iconeEmoji}>
                {id === "trator" ? (
                  <Image source={IMG_TRATOR} style={styles.img} resizeMode="cover" />
                ) : (
                  <Text style={styles.emojiGrande}>{eq.icone}</Text>
                )}
              </View>
              <Text style={styles.tileNome}>{eq.nome}</Text>
              <Text style={styles.tileDesc}>{TERRENO_LABEL[eq.melhorEm]}</Text>
              <Text style={styles.tileBenef}>{beneficioEquip(eq)}</Text>
              {possui ? (
                <View style={styles.owned}>
                  <Text style={styles.ownedTxt}>✓ Adquirido</Text>
                </View>
              ) : (
                <Botao
                  pequeno
                  fullWidth
                  variante={semGrana ? "fantasma" : "primario"}
                  disabled={semGrana}
                  onPress={() =>
                    dispatch({ type: "COMPRAR_EQUIPAMENTO", payload: { equipId: id } })
                  }
                >
                  R$ {eq.custo.toLocaleString("pt-BR")}
                </Botao>
              )}
            </View>
          );
        })}
      </View>

      {/* ---------- 4. TULHA ---------- */}
      <Titulo icone="🏭">Infraestrutura — Tulha</Titulo>
      <View style={styles.grid3}>
        {TULHA_PROGRESSAO.map((tipo, i) => {
          const t = TULHAS[tipo];
          const idxAtual = TULHA_PROGRESSAO.indexOf(state.tulha || "pequena");
          const atual = i === idxAtual;
          const futuro = i > idxAtual;
          const semGrana = state.caixa < t.custoUpgrade;
          return (
            <View key={tipo} style={[styles.tile, atual && styles.tileAtual, !atual && !futuro && styles.tileDim]}>
              <View style={[styles.iconeImg, futuro && styles.imgCinza]}>
                <Image source={IMG_TULHA} style={styles.img} resizeMode="cover" />
              </View>
              <Text style={styles.tileNome}>{t.nome}</Text>
              <Text style={styles.tileDesc}>{t.capacidade} sacas</Text>
              {atual ? (
                <View style={styles.atualPill}>
                  <Text style={styles.atualTxt}>✓ ATUAL</Text>
                </View>
              ) : futuro ? (
                <Botao
                  pequeno
                  fullWidth
                  variante={semGrana ? "fantasma" : "primario"}
                  disabled={semGrana}
                  onPress={() => dispatch({ type: "UPGRADE_TULHA", payload: { tipo } })}
                >
                  R$ {t.custoUpgrade.toLocaleString("pt-BR")}
                </Botao>
              ) : (
                <Text style={styles.tileDesc}>—</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ---------- 5. FUNCAFÉ ---------- */}
      <Titulo icone="🏦">Financiamento (Funcafé)</Titulo>
      <View style={styles.funcafe}>
        <Image source={IMG_FUNCAFE} style={styles.funcafeBg} resizeMode="contain" />
        {state.emprestimo ? (
          <View style={{ gap: 4 }}>
            <Text style={styles.funcafeLabel}>EMPRÉSTIMO ATIVO</Text>
            <Text style={styles.funcafeValor}>
              R$ {state.emprestimo.principal.toLocaleString("pt-BR")}
            </Text>
            <Text style={styles.funcafeNota}>
              Restam {state.emprestimo.parcelasRestantes}/{state.emprestimo.parcelasTotais}{" "}
              parcelas de R$ {state.emprestimo.valorParcela.toLocaleString("pt-BR")}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.funcafeLabel}>LIMITE DISPONÍVEL</Text>
            <Text style={styles.funcafeValor}>
              R$ {limiteEmprestimo(state).toLocaleString("pt-BR")}
            </Text>
            <Text style={styles.funcafeNota}>Crédito para expansão (escala com hectares formados)</Text>
            <View style={styles.funcafeBtns}>
              {[10000, 25000, 50000]
                .filter((v) => v <= limiteEmprestimo(state))
                .map((valor, idx, arr) => (
                  <Botao
                    key={valor}
                    pequeno
                    variante={idx === arr.length - 1 ? "sucesso" : "secundario"}
                    onPress={() => dispatch({ type: "PEDIR_EMPRESTIMO", payload: { valor } })}
                  >
                    R$ {(valor / 1000).toFixed(0)}k · parc. {calcularParcela(valor).toLocaleString("pt-BR")}
                  </Botao>
                ))}
            </View>
          </>
        )}
      </View>

      {/* ---------- 6. EQUIPE ---------- */}
      <Titulo icone="👥">Equipe</Titulo>
      {(() => {
        const equipe = state.equipe || { mensalistas: 0, encarregado: false };
        const folha = folhaPagamentoMensal(equipe);
        const cobertura = hectaresCobertura(equipe);
        const haTot = state.talhoes.reduce((a, t) => a + (t.variedadeId ? t.hectares : 0), 0);
        return folha > 0 ? (
          <Text style={styles.equipeResumo}>
            {equipe.mensalistas} mensalista(s){equipe.encarregado ? " + encarregado" : ""} ·
            cobertura {cobertura}ha / {haTot.toFixed(1)}ha · folha R$ {folha.toLocaleString("pt-BR")}/mês
          </Text>
        ) : null;
      })()}
      <View style={styles.grid2}>
        {/* Mensalista */}
        <View style={styles.equipeCard}>
          <View style={styles.equipeAvatar}>
            <Text style={styles.emojiMed}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tileNome}>Mensalista</Text>
            <Text style={styles.tileDesc}>
              R$ {EQUIPE.mensalista.salarioMensal.toLocaleString("pt-BR")}/mês · {EQUIPE.mensalista.hectaresCobertura}ha
            </Text>
            <Text style={styles.tileDesc}>Atuais: {state.equipe?.mensalistas || 0}</Text>
          </View>
          <View style={{ gap: 6 }}>
            {(state.equipe?.mensalistas || 0) > 0 && (
              <Botao pequeno variante="perigo" onPress={() => dispatch({ type: "DEMITIR_MENSALISTA" })}>
                −
              </Botao>
            )}
            <Botao
              pequeno
              variante={state.caixa < EQUIPE.mensalista.salarioMensal ? "fantasma" : "sucesso"}
              disabled={state.caixa < EQUIPE.mensalista.salarioMensal}
              onPress={() => dispatch({ type: "CONTRATAR_MENSALISTA" })}
            >
              Contratar
            </Botao>
          </View>
        </View>
        {/* Encarregado */}
        <View style={styles.equipeCard}>
          <View style={styles.equipeAvatar}>
            <Text style={styles.emojiMed}>👔</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tileNome}>Encarregado</Text>
            <Text style={styles.tileDesc}>
              R$ {EQUIPE.encarregado.salarioMensal.toLocaleString("pt-BR")}/mês · +15% panha
            </Text>
            <Text style={styles.tileDesc}>
              {state.equipe?.encarregado ? "✓ Contratado" : "Máx 1"}
            </Text>
          </View>
          {state.equipe?.encarregado ? (
            <Botao pequeno variante="perigo" onPress={() => dispatch({ type: "DEMITIR_ENCARREGADO" })}>
              Demitir
            </Botao>
          ) : (
            <Botao
              pequeno
              variante={state.caixa < EQUIPE.encarregado.salarioMensal ? "fantasma" : "sucesso"}
              disabled={state.caixa < EQUIPE.encarregado.salarioMensal}
              onPress={() => dispatch({ type: "CONTRATAR_ENCARREGADO" })}
            >
              Contratar
            </Botao>
          )}
        </View>
      </View>

      {/* ---------- 7. CERTIFICAÇÕES ---------- */}
      <Titulo icone="🏅">Certificações</Titulo>
      <View style={styles.certLista}>
        {Object.entries(CERTIFICACOES).map(([id, cert]) => {
          const cor = CERT_COR[id] || CERT_COR.organico;
          const adquirida = !!state.certificacoes?.[id];
          const status = statusCertText(state.certificacoes, id);
          const semGrana = state.caixa < cert.custoAdesao;
          return (
            <View key={id} style={styles.certCard}>
              <View style={[styles.certIcone, { backgroundColor: cor.bg, borderColor: cor.borda }]}>
                <Text style={styles.emojiMed}>{cert.icone}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileNome}>{cert.nome}</Text>
                <Text style={[styles.certPremio, { color: cor.fg }]}>
                  +{Math.round(cert.premio * 100)}% no preço da saca · {status}
                </Text>
              </View>
              {!adquirida && (
                <Botao
                  pequeno
                  variante={semGrana ? "fantasma" : "primario"}
                  disabled={semGrana}
                  onPress={() => dispatch({ type: "ADERIR_CERTIFICACAO", payload: { certId: id } })}
                >
                  {cert.diasTransicao > 0 ? "Transição" : "Obter"}
                </Botao>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const M = tema.madeira;
const MB = tema.madeiraBase;

const styles = StyleSheet.create({
  container: { gap: 16 },

  h3: {
    color: M,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
    paddingLeft: 2,
  },

  /* Painel chunky base */
  painel: {
    backgroundColor: "#ece2c9",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: M,
    borderBottomWidth: 8,
    borderBottomColor: MB,
    padding: 16,
    gap: 8,
  },

  /* Cooperativa */
  coopBanner: { borderColor: tema.verde, borderBottomColor: tema.verdeBase },
  coopTitulo: { color: "#321203", fontSize: 16, fontWeight: "800" },
  coopSub: { color: tema.textoDim, fontSize: 13, lineHeight: 18 },
  coopChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  coopChip: {
    backgroundColor: tema.creme,
    borderWidth: 1,
    borderColor: tema.linha,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  coopChipTxt: { fontSize: 12, fontWeight: "700", color: tema.texto },
  coopFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  coopPreco: { color: tema.texto, fontSize: 18, fontWeight: "800" },
  coopPrecoSub: { color: tema.textoDim, fontSize: 12, fontWeight: "500" },

  /* Grades */
  grid3: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  /* Tile (card chunky) */
  tile: {
    backgroundColor: "#ece2c9",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: M,
    borderBottomWidth: 8,
    borderBottomColor: MB,
    padding: 12,
    alignItems: "center",
    gap: 6,
    width: "31%",
    flexGrow: 1,
  },
  tileDim: { opacity: 0.55 },
  tileOwned: { borderColor: tema.verde, borderBottomColor: tema.verdeBase },
  tileAtual: { borderColor: tema.verde, borderBottomColor: tema.verdeBase },

  iconeImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1e8cf",
    borderWidth: 3,
    borderColor: "#e3d9c1",
    overflow: "hidden",
  },
  iconeEmoji: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1e8cf",
    borderWidth: 3,
    borderColor: "#e3d9c1",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%" },
  imgCinza: { opacity: 0.55 },
  emojiGrande: { fontSize: 32 },

  tileNome: { color: "#321203", fontSize: 13, fontWeight: "800", textAlign: "center" },
  tileDesc: { color: tema.textoDim, fontSize: 11, textAlign: "center", lineHeight: 15 },
  tileBenef: { color: tema.verde, fontSize: 12, fontWeight: "700", textAlign: "center" },
  tilePreco: { color: tema.texto, fontSize: 16, fontWeight: "800" },

  owned: {
    backgroundColor: tema.verdeFixo,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  ownedTxt: { color: tema.verdeBase, fontSize: 12, fontWeight: "800" },

  atualPill: {
    backgroundColor: tema.verdeFixo,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginTop: 2,
  },
  atualTxt: { color: tema.verdeBase, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  /* Funcafé */
  funcafe: {
    backgroundColor: "#e7f0df",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#aed29e",
    padding: 16,
    gap: 4,
    overflow: "hidden",
  },
  funcafeBg: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 130,
    height: 130,
    opacity: 0.18,
  },
  funcafeLabel: {
    color: tema.textoDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  funcafeValor: { color: tema.verde, fontSize: 26, fontWeight: "800" },
  funcafeNota: { color: tema.textoDim, fontSize: 12, lineHeight: 16 },
  funcafeBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

  /* Equipe */
  equipeResumo: { color: tema.textoDim, fontSize: 12, lineHeight: 16, paddingLeft: 2 },
  equipeCard: {
    backgroundColor: "#ece2c9",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: M,
    borderBottomWidth: 8,
    borderBottomColor: MB,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  equipeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tema.secondaryFixedDim || "#f6b99d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e3a98a",
  },
  emojiMed: { fontSize: 24 },

  /* Certificações */
  certLista: { gap: 10 },
  certCard: {
    backgroundColor: "#ece2c9",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: M,
    borderBottomWidth: 8,
    borderBottomColor: MB,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  certIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  certPremio: { fontSize: 12, fontWeight: "700", marginTop: 2 },
});
