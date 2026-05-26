import { View, Text, StyleSheet } from "react-native";
import { useJogo } from "../hooks/useJogo.jsx";
import Botao from "./Botao.jsx";
import CardEquipamento from "./CardEquipamento.jsx";
import { tema } from "../styles/tema.js";
import { INSUMOS, EQUIPAMENTOS, CERTIFICACOES, EQUIPE, TULHAS, TULHA_PROGRESSAO } from "../data/economia.js";
import { FUNCAFE, COOPERATIVA } from "../data/constantes.js";
import { statusCertText } from "../logic/certificacoes.js";
import { hectaresCobertura, folhaPagamentoMensal } from "../logic/equipe.js";
import { limiteEmprestimo, calcularParcela } from "../logic/financiamento.js";

export default function TelaLoja() {
  const { state, dispatch } = useJogo();

  return (
    <View style={styles.container}>
      {/* Cooperativa: aparece no topo se ainda não filiado, ou como banner se filiado */}
      {state.cooperativa?.filiado ? (
        <View style={[styles.cardInsumo, styles.cardAdquirida]}>
          <View style={styles.cardHeader}>
            <Text style={styles.icone}>{COOPERATIVA.icone}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{COOPERATIVA.nome} ✓ Cooperado</Text>
              <Text style={styles.efeito}>
                −{Math.round(COOPERATIVA.descontoInsumos * 100)}% em insumos · piso{" "}
                {Math.round(COOPERATIVA.floorMercado * 100)}% no preço de venda · anuidade R${COOPERATIVA.anuidade}/ano
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.h2}>🏢 Cooperativa</Text>
          <Text style={styles.dica}>
            Filie-se à cooperativa: desconto em insumos + garantia de preço mínimo na venda (proteção contra mercado em queda).
          </Text>
          <View style={styles.cardInsumo}>
            <View style={styles.cardHeader}>
              <Text style={styles.icone}>{COOPERATIVA.icone}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{COOPERATIVA.nome}</Text>
                <Text style={styles.efeito}>
                  −{Math.round(COOPERATIVA.descontoInsumos * 100)}% insumos · piso{" "}
                  {Math.round(COOPERATIVA.floorMercado * 100)}% no mercado
                </Text>
              </View>
            </View>
            <Text style={styles.desc}>{COOPERATIVA.desc}</Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.preco}>
                  R$ {COOPERATIVA.custoAdesao.toLocaleString("pt-BR")}
                </Text>
                <Text style={styles.precoAnual}>
                  + anuidade R${COOPERATIVA.anuidade}/ano
                </Text>
              </View>
              <Botao
                pequeno
                variante={state.caixa < COOPERATIVA.custoAdesao ? "fantasma" : "primario"}
                disabled={state.caixa < COOPERATIVA.custoAdesao}
                onPress={() => dispatch({ type: "FILIAR_COOPERATIVA" })}
              >
                Filiar-se
              </Botao>
            </View>
          </View>
        </>
      )}

      <Text style={styles.h2}>🌱 Insumos (consumíveis)</Text>
      <Text style={styles.dica}>
        Aplique nos talhões pra restaurar/manter a sanidade. Cada compra adiciona 1
        unidade ao inventário.
      </Text>

      <View style={styles.grid}>
        {Object.entries(INSUMOS).map(([id, ins]) => {
          const semGrana = state.caixa < ins.custo;
          return (
            <View key={id} style={styles.cardInsumo}>
              <View style={styles.cardHeader}>
                <Text style={styles.icone}>{ins.icone}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{ins.nome}</Text>
                  <Text style={styles.efeito}>{ins.efeito}</Text>
                </View>
              </View>
              <Text style={styles.desc}>{ins.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.preco}>R$ {ins.custo}</Text>
                <Botao
                  pequeno
                  variante={semGrana ? "fantasma" : "primario"}
                  disabled={semGrana}
                  onPress={() =>
                    dispatch({
                      type: "COMPRAR_INSUMO",
                      payload: { insumoId: id, qtd: 1 },
                    })
                  }
                >
                  Comprar
                </Botao>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.h2}>🚜 Equipamentos</Text>
      <Text style={styles.dica}>
        Compra única. Reduzem energia e/ou aumentam rendimento/bebida. Cuidado: a regra
        dos 15% manda — trator e colhedora sofrem no montanhoso; drone brilha lá.
      </Text>

      <View style={styles.grid}>
        {Object.entries(EQUIPAMENTOS).map(([id, eq]) => (
          <CardEquipamento key={id} equipId={id} equipamento={eq} />
        ))}
      </View>

      <Text style={styles.h2}>🏗️ Infraestrutura — Tulha</Text>
      <Text style={styles.dica}>
        Limita quantas sacas você pode estocar. Sacas excedentes ao secar vão pra venda forçada SEM prêmios de certificação/mercado.
      </Text>

      {(() => {
        const tulhaAtual = state.tulha || "pequena";
        const idxAtual = TULHA_PROGRESSAO.indexOf(tulhaAtual);
        return (
          <View style={styles.grid}>
            {TULHA_PROGRESSAO.map((tipo, i) => {
              const t = TULHAS[tipo];
              const adquirida = i <= idxAtual;
              const isAtual = i === idxAtual;
              const semGrana = state.caixa < t.custoUpgrade;
              const podeUpgrade = i > idxAtual;
              return (
                <View
                  key={tipo}
                  style={[
                    styles.cardInsumo,
                    isAtual && styles.cardAdquirida,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.icone}>{t.icone}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nome}>
                        {t.nome} {isAtual && "✓"}
                      </Text>
                      <Text style={styles.efeito}>{t.capacidade} sacas</Text>
                    </View>
                  </View>
                  <Text style={styles.desc}>{t.desc}</Text>
                  {podeUpgrade && (
                    <View style={styles.cardFooter}>
                      <Text style={styles.preco}>
                        R$ {t.custoUpgrade.toLocaleString("pt-BR")}
                      </Text>
                      <Botao
                        pequeno
                        variante={semGrana ? "fantasma" : "primario"}
                        disabled={semGrana}
                        onPress={() =>
                          dispatch({
                            type: "UPGRADE_TULHA",
                            payload: { tipo },
                          })
                        }
                      >
                        Construir
                      </Botao>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })()}

      <Text style={styles.h2}>🏦 Funcafé (Financiamento)</Text>
      <Text style={styles.dica}>
        Crédito subsidiado do governo. {FUNCAFE.prazoMeses} parcelas, juros total de {Math.round(FUNCAFE.jurosTotal * 100)}%. 1 empréstimo ativo por vez. Libera expansão sem caixa.
      </Text>

      {(() => {
        const limite = limiteEmprestimo(state);
        const ativo = state.emprestimo;
        if (ativo) {
          return (
            <View style={styles.cardInsumo}>
              <Text style={styles.equipeStatus}>
                Empréstimo ativo: R$ {ativo.principal.toLocaleString("pt-BR")}
              </Text>
              <Text style={styles.equipeSub}>
                Restam {ativo.parcelasRestantes}/{ativo.parcelasTotais} parcelas de R$ {ativo.valorParcela.toLocaleString("pt-BR")}
              </Text>
              <Text style={styles.equipeSub}>
                Total a pagar: R$ {(ativo.valorParcela * ativo.parcelasRestantes).toLocaleString("pt-BR")}
              </Text>
            </View>
          );
        }
        return (
          <View style={styles.cardInsumo}>
            <Text style={styles.equipeStatus}>
              Limite disponível: R$ {limite.toLocaleString("pt-BR")}
            </Text>
            <Text style={styles.equipeSub}>
              (Aumenta com hectares formados na fazenda)
            </Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {[10000, 25000, 50000].filter((v) => v <= limite).map((valor) => (
                <Botao
                  key={valor}
                  pequeno
                  variante="primario"
                  onPress={() =>
                    dispatch({ type: "PEDIR_EMPRESTIMO", payload: { valor } })
                  }
                >
                  Pegar R${(valor / 1000).toFixed(0)}k (parc. R${calcularParcela(valor).toLocaleString("pt-BR")})
                </Botao>
              ))}
              {limite > 50000 && (
                <Botao
                  pequeno
                  variante="primario"
                  onPress={() =>
                    dispatch({ type: "PEDIR_EMPRESTIMO", payload: { valor: limite } })
                  }
                >
                  Limite máx: R${(limite / 1000).toFixed(0)}k
                </Botao>
              )}
            </View>
          </View>
        );
      })()}

      <Text style={styles.h2}>👥 Equipe</Text>
      <Text style={styles.dica}>
        Mensalistas mantêm a lavoura saudável continuamente. Encarregado coordena a turma e dá +15% rendimento na panha. Folha cobrada todo 1º dia do mês.
      </Text>

      {/* Resumo da equipe atual */}
      {(() => {
        const equipe = state.equipe || { mensalistas: 0, encarregado: false };
        const cobertura = hectaresCobertura(equipe);
        const folha = folhaPagamentoMensal(equipe);
        const hectaresTot = state.talhoes.reduce(
          (a, t) => a + (t.variedadeId ? t.hectares : 0),
          0
        );
        if (folha === 0) return null;
        return (
          <View style={styles.cardInsumo}>
            <Text style={styles.equipeStatus}>
              Equipe atual: {equipe.mensalistas} mensalista{equipe.mensalistas !== 1 ? "s" : ""}
              {equipe.encarregado ? " + 1 encarregado" : ""}
            </Text>
            <Text style={styles.equipeSub}>
              Cobertura: {cobertura}ha / {hectaresTot.toFixed(1)}ha lavoura · Folha mensal: R$ {folha.toLocaleString("pt-BR")}
            </Text>
          </View>
        );
      })()}

      <View style={styles.grid}>
        {/* Mensalista */}
        <View style={styles.cardInsumo}>
          <View style={styles.cardHeader}>
            <Text style={styles.icone}>{EQUIPE.mensalista.icone}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{EQUIPE.mensalista.nome}</Text>
              <Text style={styles.efeito}>
                R$ {EQUIPE.mensalista.salarioMensal}/mês · cobre {EQUIPE.mensalista.hectaresCobertura}ha
              </Text>
            </View>
          </View>
          <Text style={styles.desc}>{EQUIPE.mensalista.desc}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.preco}>
              Atual: {state.equipe?.mensalistas || 0}
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {(state.equipe?.mensalistas || 0) > 0 && (
                <Botao
                  pequeno
                  variante="perigo"
                  onPress={() => dispatch({ type: "DEMITIR_MENSALISTA" })}
                >
                  Demitir
                </Botao>
              )}
              <Botao
                pequeno
                variante={state.caixa < EQUIPE.mensalista.salarioMensal ? "fantasma" : "primario"}
                disabled={state.caixa < EQUIPE.mensalista.salarioMensal}
                onPress={() => dispatch({ type: "CONTRATAR_MENSALISTA" })}
              >
                Contratar
              </Botao>
            </View>
          </View>
        </View>

        {/* Encarregado */}
        <View style={styles.cardInsumo}>
          <View style={styles.cardHeader}>
            <Text style={styles.icone}>{EQUIPE.encarregado.icone}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{EQUIPE.encarregado.nome}</Text>
              <Text style={styles.efeito}>
                R$ {EQUIPE.encarregado.salarioMensal}/mês · cobre {EQUIPE.encarregado.hectaresCobertura}ha · +15% panha
              </Text>
            </View>
          </View>
          <Text style={styles.desc}>{EQUIPE.encarregado.desc}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.preco}>
              {state.equipe?.encarregado ? "✓ Contratado" : "Não contratado"}
            </Text>
            {state.equipe?.encarregado ? (
              <Botao
                pequeno
                variante="perigo"
                onPress={() => dispatch({ type: "DEMITIR_ENCARREGADO" })}
              >
                Demitir
              </Botao>
            ) : (
              <Botao
                pequeno
                variante={state.caixa < EQUIPE.encarregado.salarioMensal ? "fantasma" : "primario"}
                disabled={state.caixa < EQUIPE.encarregado.salarioMensal}
                onPress={() => dispatch({ type: "CONTRATAR_ENCARREGADO" })}
              >
                Contratar
              </Botao>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.h2}>🏅 Certificações</Text>
      <Text style={styles.dica}>
        Selos que agregam valor à saca. Custo de adesão único + custo anual de auditoria.
        Orgânico exige 3 anos sem defensivo.
      </Text>

      <View style={styles.grid}>
        {Object.entries(CERTIFICACOES).map(([id, cert]) => {
          const status = statusCertText(state.certificacoes, id);
          const adquirida = !!state.certificacoes?.[id];
          const semGrana = state.caixa < cert.custoAdesao;
          return (
            <View key={id} style={[styles.cardInsumo, adquirida && styles.cardAdquirida]}>
              <View style={styles.cardHeader}>
                <Text style={styles.icone}>{cert.icone}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{cert.nome}</Text>
                  <Text style={styles.efeito}>
                    +{Math.round(cert.premio * 100)}% sobre o preço da saca · {status}
                  </Text>
                </View>
              </View>
              <Text style={styles.desc}>{cert.desc}</Text>
              <Text style={styles.requisito}>📋 {cert.requisitoTexto}</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.preco}>
                    R$ {cert.custoAdesao.toLocaleString("pt-BR")}
                  </Text>
                  <Text style={styles.precoAnual}>
                    + R${cert.custoAnual}/ano
                  </Text>
                </View>
                {!adquirida && (
                  <Botao
                    pequeno
                    variante={semGrana ? "fantasma" : "primario"}
                    disabled={semGrana}
                    onPress={() =>
                      dispatch({
                        type: "ADERIR_CERTIFICACAO",
                        payload: { certId: id },
                      })
                    }
                  >
                    {cert.diasTransicao > 0 ? "Iniciar transição" : "Aderir"}
                  </Botao>
                )}
              </View>
            </View>
          );
        })}
      </View>
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
    marginTop: 6,
  },
  dica: {
    color: tema.textoDim,
    fontSize: 12,
    lineHeight: 17,
  },
  grid: { gap: 8 },
  cardInsumo: {
    backgroundColor: tema.bg2,
    borderWidth: 1,
    borderColor: tema.bg3,
    borderRadius: tema.raio,
    padding: 12,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  icone: {
    fontSize: 22,
    lineHeight: 24,
  },
  nome: {
    color: tema.texto,
    fontSize: 14,
    fontWeight: "600",
  },
  efeito: {
    color: tema.textoDim,
    fontSize: 11,
    marginTop: 1,
  },
  desc: {
    color: tema.texto,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.78,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  preco: {
    color: tema.dourado,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  precoAnual: {
    color: tema.textoDim,
    fontSize: 10,
    marginTop: 1,
  },
  requisito: {
    color: tema.azul,
    fontSize: 11,
    fontStyle: "italic",
  },
  cardAdquirida: {
    borderColor: tema.verde,
    opacity: 0.8,
  },
  equipeStatus: {
    color: tema.dourado,
    fontSize: 13,
    fontWeight: "600",
  },
  equipeSub: {
    color: tema.textoDim,
    fontSize: 11,
    marginTop: 2,
  },
});
