/* ============================================================
   TELA DE INÍCIO — estilo "Hay Day" (design do Stitch).
   Hero com foto de lavoura + título inclinado, 2 cards de modo
   com ilustração/chips/botão, menu secundário e rodapé.
   Paleta Material clara (creme/verde/dourado/madeira) — diferente
   do tema escuro do resto do app, por isso definida localmente.

   Fontes do design (Plus Jakarta Sans / Be Vietnam Pro) podem ser
   adicionadas via expo-font; aqui usamos a fonte do sistema em peso
   forte como fallback fiel ao visual.
   ============================================================ */

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Pressable,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Switch,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useJogo } from "../hooks/useJogo.jsx";
import { NUM_SLOTS } from "../hooks/useSave.js";
import { rotuloEstacao } from "../logic/alertas.js";
import { MARCOS, CATEGORIAS_MARCOS } from "../data/marcos.js";
import { CURIOSIDADES } from "../data/curiosidades.js";
import { tocarEfeito } from "../audio/engine.js";
import { usePrefsAudio } from "../audio/useAudio.js";
import { setPrefsAudio } from "../audio/engine.js";
import { useStatsGlobais } from "../state/estatisticasGlobais.js";

/* ---------- Opções de velocidade de avanço ---------- */
const VELOCIDADES = [
  { dias: 7, label: "1 semana" },
  { dias: 14, label: "2 semanas" },
  { dias: 30, label: "1 mês" },
];

/* ---------- Micro-regiões cafeeiras da Zona da Mata mineira ---------- */
const REGIOES_ZM = [
  "Manhuaçu", "Viçosa", "Muriaé", "Carangola",
  "Ubá", "Cataguases", "Ponte Nova", "Juiz de Fora",
];

/* ---------- Paleta exata do design (Stitch / Material) ---------- */
const C = {
  bg: "#fff8ef",
  surface: "#fff8ef",
  surfaceContainer: "#f7edd4",
  surfaceVariant: "#ece2c9",
  onSurface: "#201b0c",
  onSurfaceVariant: "#41493c",
  outlineVariant: "#c1c9b9",
  // verde (primary)
  primary: "#2a691d",
  primaryDark: "#115206",
  onPrimary: "#ffffff",
  primaryFixed: "#aef597",
  onPrimaryFixed: "#022200",
  // madeira (secondary)
  secondary: "#82533d",
  secondaryDark: "#663c27",
  secondaryFixedDim: "#f6b99d",
  // dourado (tertiary)
  gold: "#f4bf00",
  goldDark: "#594400",
  goldBorder: "#755b00",
  tertiaryFixed: "#ffdf92",
  onTertiaryFixed: "#241a00",
  // erro
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
};

/* ---------- Botão "3D" (borda inferior grossa = base) ---------- */
function Botao3D({ children, onPress, bg, color, border, base, style }) {
  return (
    <Pressable
      onPress={(e) => {
        tocarEfeito("ui_click");
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.btn3d,
        {
          backgroundColor: bg,
          borderColor: border,
          borderBottomColor: base,
          borderBottomWidth: pressed ? 2 : 6,
          marginTop: pressed ? 4 : 0,
        },
        style,
      ]}
    >
      <Text style={{ color, fontSize: 16, fontWeight: "800", letterSpacing: 0.5 }}>
        {children}
      </Text>
    </Pressable>
  );
}

/* ---------- Chip (pílula) ---------- */
function Chip({ texto, bg, color, border }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.chipTxt, { color }]}>{texto}</Text>
    </View>
  );
}

/* ---------- Metadados de cada modo (pro modal de setup) ---------- */
const MODOS = {
  rocinha_pronta: {
    nome: "☕ Rocinha Pronta",
    orcamento: "R$ 5.000",
    dificuldade: "FÁCIL",
    corChip: C.primaryFixed,
    corChipTxt: C.onPrimaryFixed,
  },
  terra_nua: {
    nome: "🌱 Terra Nua",
    orcamento: "R$ 3.000",
    dificuldade: "DIFÍCIL",
    corChip: C.errorContainer,
    corChipTxt: C.onErrorContainer,
  },
};

/* ---------- Conteúdo dos modais informativos ---------- */
const GUIA_COMO_JOGAR = [
  { icone: "🌱", titulo: "1. Plante", texto: "Escolha uma variedade, a densidade (tradicional, adensado ou super) e sol pleno ou sombreado. Cada combinação equilibra produção, qualidade da bebida e custo." },
  { icone: "🩺", titulo: "2. Cuide da lavoura", texto: "Adubo e calcário recuperam a sanidade; o defensivo elimina pragas (mas invalida a certificação orgânica). Use a amostragem pra revelar pragas escondidas." },
  { icone: "⏳", titulo: "3. Espere formar", texto: "A lavoura leva ~3 anos pra produzir. A florada (set–out, precisa de veranico seguido de chuva) e a granação (jan–mar, precisa de chuva) definem o tamanho da safra." },
  { icone: "🍒", titulo: "4. Colha (mai–ago)", texto: "Manual paga mais e é seletiva (só o maduro); derriça é barata e pega tudo; colhedora é rápida, mas só no plano. É uma colheita por safra." },
  { icone: "🌡️", titulo: "5. Pós-colheita", texto: "Escolha Natural, CD ou Lavado e seque dia a dia — sol acelera, chuva atrasa. CD e Lavado separam o cereja do boia e melhoram a bebida." },
  { icone: "💰", titulo: "6. Venda no Mercado", texto: "O preço oscila com a bolsa. Certificações e microlotes (SCA ≥ 85) valorizam muito. A tulha limita o estoque — o excedente é vendido às pressas, sem prêmios." },
  { icone: "📈", titulo: "7. Reinvista", texto: "Equipamentos, novas terras, equipe fixa, irrigação, tulha maior, financiamento Funcafé e cooperativa expandem o seu império do café." },
  { icone: "⚠️", titulo: "Fique atento", texto: "Geada negra e granizo destroem safras; a bienalidade alterna anos fortes e fracos; lavoura velha pode ser esqueletada ou recepada pra renovar." },
  { icone: "📖", titulo: "Dica", texto: "Dentro do jogo, toque no 📖 sempre que ver um termo novo — o glossário explica tudo." },
];

const GUIA_SOBRE = [
  { icone: "☕", titulo: "O jogo", texto: "Império do Café é um simulador de cafeicultura ambientado na Zona da Mata mineira. Você gerencia uma fazenda de café, do plantio à venda." },
  { icone: "🎯", titulo: "A proposta", texto: "Mais de 20 sistemas interligados — clima, ciclo fenológico, pragas, pós-colheita, classificação SCA/Tipo Brasil, mercado, certificações e mais — num jogo leve de celular." },
  { icone: "🌎", titulo: "A região", texto: "Inspirado na realidade da Zona da Mata mineira: relevo de montanha, variedades arábica, manejo manual e desafios climáticos de verdade." },
  { icone: "ℹ️", titulo: "Versão", texto: "1.0.0 — Império do Café." },
];

/* ---------- Polimento: tint do hero pela hora do dia ---------- */
function tintHero() {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return "rgba(255,176,74,0.26)"; // amanhecer dourado
  if (h >= 8 && h < 17) return "rgba(0,0,0,0.22)"; // dia (neutro p/ contraste)
  if (h >= 17 && h < 20) return "rgba(255,120,40,0.30)"; // entardecer alaranjado
  return "rgba(18,28,66,0.46)"; // noite azulada
}

/* ---------- Polimento: folhas de café caindo (sutil) ---------- */
const ALTURA_TELA = Dimensions.get("window").height;
function Folha({ x, delay, dur, tam }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: dur,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [t, dur, delay]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-40, ALTURA_TELA + 40] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 22, 0] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        top: 0,
        fontSize: tam,
        opacity: 0.45,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    >
      🍃
    </Animated.Text>
  );
}
function FolhasCaindo() {
  const folhas = useRef([
    { x: "8%", delay: 0, dur: 15000, tam: 20 },
    { x: "27%", delay: 4200, dur: 18000, tam: 15 },
    { x: "49%", delay: 9000, dur: 16000, tam: 22 },
    { x: "68%", delay: 2000, dur: 20000, tam: 17 },
    { x: "86%", delay: 6500, dur: 14000, tam: 16 },
  ]).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {folhas.map((f, i) => (
        <Folha key={i} {...f} />
      ))}
    </View>
  );
}

export default function TelaInicio({ slots, onJogarSlot, onNovoSlot, onApagarSlot }) {
  const { state, dispatch } = useJogo();
  const insets = useSafeAreaInsets();
  const prefsAudio = usePrefsAudio();
  const statsGlobais = useStatsGlobais();

  // Slots carregados no boot. Garante uma lista do tamanho esperado.
  const listaSlots = slots || [];
  const estadoDoSlot = (slot) => listaSlots.find((x) => x.slot === slot)?.estado || null;
  const primeiroVazio = () => {
    for (let s = 0; s < NUM_SLOTS; s++) if (!estadoDoSlot(s)) return s;
    return 0; // todos cheios → 1º (vai pedir confirmação de sobrescrita)
  };
  const resumoDe = (estado) =>
    estado
      ? `Ano ${estado.tempo?.ano ?? 1} · R$ ${(estado.caixa ?? 0).toLocaleString("pt-BR")} · ${rotuloEstacao(estado)}`
      : "vazia";
  const nomeDe = (estado) => estado?.perfil?.fazenda || "Fazenda";

  // "Tem save em memória" = jogo ativo carregado (pro Config velocidade/tutorial).
  const temSave = !!state;

  // Setup da nova partida: modo (null = modal fechado) + slot alvo + campos.
  const [modoSel, setModoSel] = useState(null);
  const [slotAlvo, setSlotAlvo] = useState(0);
  const [fazenda, setFazenda] = useState("");
  const [produtor, setProdutor] = useState("");
  const [regiao, setRegiao] = useState("Manhuaçu");
  const [regiaoOutra, setRegiaoOutra] = useState(false); // "Outra" → texto livre

  // Modal informativo: null | "comojogar" | "sobre".
  const [infoModal, setInfoModal] = useState(null);
  // Modal de configurações + troféus.
  const [configOpen, setConfigOpen] = useState(false);
  const [trofeusOpen, setTrofeusOpen] = useState(false);

  // Neblina matinal: opacidade pulsante sobre o hero (sem asset novo).
  const neblina = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(neblina, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(neblina, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [neblina]);
  const neblinaOpacity = neblina.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.22] });

  // Animação de entrada do corpo (fade + slide).
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrada]);
  const entradaY = entrada.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  // Curiosidade rotativa (índice inicial aleatório; toque cicla).
  const [dicaIdx, setDicaIdx] = useState(() =>
    Math.floor(Math.random() * CURIOSIDADES.length)
  );

  const velocidade = state?.velocidade || 7;
  const tutorialAtivo = !!state?.tutorial?.ativo;

  const abrirSetup = (modo) => {
    setSlotAlvo(primeiroVazio());
    setModoSel(modo);
  };
  const fecharSetup = () => setModoSel(null);
  const comecar = () => {
    const criar = () => {
      onNovoSlot?.(slotAlvo, modoSel, { fazenda, produtor, regiao });
      setModoSel(null);
    };
    // Slot ocupado → confirma sobrescrita.
    if (estadoDoSlot(slotAlvo)) {
      Alert.alert(
        "Sobrescrever fazenda?",
        `A Fazenda ${slotAlvo + 1} já tem uma partida. Começar aqui vai substituí-la.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sobrescrever", style: "destructive", onPress: criar },
        ]
      );
    } else {
      criar();
    }
  };

  const confirmarApagarSlot = (slot) => {
    Alert.alert(
      "Apagar fazenda?",
      `Isso apaga a partida da Fazenda ${slot + 1} permanentemente.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => onApagarSlot?.(slot) },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- HERO ---------- */}
        <ImageBackground
          source={require("../../assets/inicio/hero.png")}
          resizeMode="cover"
          style={[styles.hero, { paddingTop: insets.top + 24 }]}
          imageStyle={styles.heroImg}
        >
          <View style={[styles.heroOverlay, { backgroundColor: tintHero() }]} />
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.neblina, { opacity: neblinaOpacity }]}
          />
          <View style={styles.tituloCard}>
            <Text style={styles.titulo}>Império{"\n"}do Café</Text>
            <Text style={styles.subtitulo}>Zona da Mata</Text>
          </View>
        </ImageBackground>

        <Animated.View
          style={[styles.corpo, { opacity: entrada, transform: [{ translateY: entradaY }] }]}
        >
          {/* ---------- CARD 1: Rocinha Pronta ---------- */}
          <View style={styles.card}>
            <Image
              source={require("../../assets/inicio/rocinha.png")}
              style={styles.cardImg}
            />
            <Text style={styles.cardTitulo}>☕ Rocinha Pronta</Text>
            <Text style={styles.cardTexto}>
              Comece sua jornada com um lote estruturado e algumas fileiras
              produzindo. Ideal para iniciantes.
            </Text>
            <View style={styles.chips}>
              <Chip
                texto="DIFICULDADE: FÁCIL"
                bg={C.primaryFixed}
                color={C.onPrimaryFixed}
                border={C.primary}
              />
              <Chip
                texto="ORÇAMENTO: R$ 5.000"
                bg={C.tertiaryFixed}
                color={C.onTertiaryFixed}
                border={C.gold}
              />
            </View>
            <Botao3D
              onPress={() => abrirSetup("rocinha_pronta")}
              bg={C.gold}
              color={C.goldDark}
              border={C.goldBorder}
              base={C.goldDark}
            >
              INICIAR
            </Botao3D>
          </View>

          {/* ---------- CARD 2: Terra Nua ---------- */}
          <View style={styles.card}>
            <Image
              source={require("../../assets/inicio/terra.png")}
              style={styles.cardImg}
            />
            <Text style={styles.cardTitulo}>🌱 Terra Nua</Text>
            <Text style={styles.cardTexto}>
              Um terreno vazio e desafiador. Planeje cada sulco e construa seu
              império do zero absoluto.
            </Text>
            <View style={styles.chips}>
              <Chip
                texto="DIFICULDADE: DIFÍCIL"
                bg={C.errorContainer}
                color={C.onErrorContainer}
                border={C.error}
              />
              <Chip
                texto="ORÇAMENTO: R$ 3.000"
                bg={C.tertiaryFixed}
                color={C.onTertiaryFixed}
                border={C.gold}
              />
            </View>
            <Botao3D
              onPress={() => abrirSetup("terra_nua")}
              bg={C.secondary}
              color={C.surface}
              border={C.secondaryDark}
              base={C.secondaryDark}
            >
              INICIAR
            </Botao3D>
          </View>

          {/* ---------- SUAS FAZENDAS (slots de save) ---------- */}
          <View style={styles.slotsSec}>
            <Text style={styles.slotsTit}>🚜 SUAS FAZENDAS</Text>
            {Array.from({ length: NUM_SLOTS }).map((_, slot) => {
              const est = estadoDoSlot(slot);
              return (
                <View key={slot} style={[styles.slotCard, !est && styles.slotCardVazio]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotNome} numberOfLines={1}>
                      Fazenda {slot + 1}
                      {est ? ` · ${nomeDe(est)}` : ""}
                    </Text>
                    <Text style={styles.slotSub} numberOfLines={1}>
                      {resumoDe(est)}
                    </Text>
                  </View>
                  {est ? (
                    <View style={styles.slotBtns}>
                      <Pressable
                        onPress={() => onJogarSlot?.(slot)}
                        style={({ pressed }) => [styles.slotJogar, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={styles.slotJogarTxt}>▶ Jogar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => confirmarApagarSlot(slot)}
                        hitSlop={6}
                        style={({ pressed }) => [styles.slotApagar, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={styles.slotApagarTxt}>🗑️</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={styles.slotVazioHint}>use um card acima</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* ---------- MENU SECUNDÁRIO ---------- */}
          <View style={styles.menu}>
            <Pressable
              onPress={() => setInfoModal("comojogar")}
              style={({ pressed }) => [styles.btnMenu, pressed && styles.btnMenuPressed]}
            >
              <Text style={styles.btnMenuTxt}>📋 COMO JOGAR</Text>
            </Pressable>
            <Pressable
              onPress={() => setTrofeusOpen(true)}
              style={({ pressed }) => [styles.btnMenu, pressed && styles.btnMenuPressed]}
            >
              <Text style={styles.btnMenuTxt}>
                🏆 TROFÉUS ({Object.keys(state?.marcos || {}).length}/{MARCOS.length})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setConfigOpen(true)}
              style={({ pressed }) => [styles.btnMenu, pressed && styles.btnMenuPressed]}
            >
              <Text style={styles.btnMenuTxt}>⚙️ CONFIGURAÇÕES</Text>
            </Pressable>
            <Pressable
              onPress={() => setInfoModal("sobre")}
              style={({ pressed }) => [styles.btnMenu, pressed && styles.btnMenuPressed]}
            >
              <Text style={styles.btnMenuTxt}>SOBRE O PROJETO</Text>
            </Pressable>
          </View>

          {/* ---------- CURIOSIDADE ROTATIVA ---------- */}
          <Pressable
            onPress={() => setDicaIdx((i) => (i + 1) % CURIOSIDADES.length)}
            style={({ pressed }) => [styles.dicaCard, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.dicaTit}>💡 Você sabia?</Text>
            <Text style={styles.dicaTxt}>{CURIOSIDADES[dicaIdx]}</Text>
            <Text style={styles.dicaHint}>toque para outra ↻</Text>
          </Pressable>

          {/* ---------- RODAPÉ ---------- */}
          <Text style={styles.rodape}>Versão 1.0.0 • Império do Café</Text>
        </Animated.View>
      </ScrollView>

      {/* Folhas caindo (sutil, sobre tudo, sem capturar toque) */}
      <FolhasCaindo />

      {/* ---------- MODAL: personalizar nova partida ---------- */}
      <Modal
        visible={modoSel !== null}
        transparent
        animationType="fade"
        onRequestClose={fecharSetup}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Sua jornada começa</Text>

            {modoSel && (
              <View style={styles.modalChips}>
                <Chip
                  texto={MODOS[modoSel].nome}
                  bg={C.surfaceContainer}
                  color={C.onSurface}
                  border={C.outlineVariant}
                />
                <Chip
                  texto={`DIFICULDADE: ${MODOS[modoSel].dificuldade}`}
                  bg={MODOS[modoSel].corChip}
                  color={MODOS[modoSel].corChipTxt}
                  border={C.outlineVariant}
                />
                <Chip
                  texto={`ORÇAMENTO: ${MODOS[modoSel].orcamento}`}
                  bg={C.tertiaryFixed}
                  color={C.onTertiaryFixed}
                  border={C.gold}
                />
              </View>
            )}

            <View style={styles.campo}>
              <Text style={styles.campoLabel}>🗂️ Em qual fazenda salvar?</Text>
              <View style={styles.cfgChips}>
                {Array.from({ length: NUM_SLOTS }).map((_, slot) => {
                  const ativo = slotAlvo === slot;
                  const ocupado = !!estadoDoSlot(slot);
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setSlotAlvo(slot)}
                      style={[styles.cfgChip, ativo && styles.cfgChipAtivo]}
                    >
                      <Text style={[styles.cfgChipTxt, ativo && styles.cfgChipTxtAtivo]}>
                        Fazenda {slot + 1}
                        {ocupado ? " ⚠️" : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {estadoDoSlot(slotAlvo) && (
                <Text style={styles.slotAviso}>
                  ⚠️ Já existe partida aqui — começar vai sobrescrevê-la.
                </Text>
              )}
            </View>

            <Campo
              label="🏡 Nome da fazenda"
              value={fazenda}
              onChangeText={setFazenda}
              placeholder="Ex: Sítio Boa Vista"
              maxLength={28}
            />
            <Campo
              label="👤 Seu nome (produtor)"
              value={produtor}
              onChangeText={setProdutor}
              placeholder="Ex: Dona Maria"
              maxLength={24}
            />
            <View style={styles.campo}>
              <Text style={styles.campoLabel}>📍 Região (Zona da Mata)</Text>
              <View style={styles.cfgChips}>
                {REGIOES_ZM.map((r) => {
                  const ativo = !regiaoOutra && regiao === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => {
                        setRegiaoOutra(false);
                        setRegiao(r);
                      }}
                      style={[styles.cfgChip, ativo && styles.cfgChipAtivo]}
                    >
                      <Text style={[styles.cfgChipTxt, ativo && styles.cfgChipTxtAtivo]}>{r}</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => {
                    setRegiaoOutra(true);
                    setRegiao("");
                  }}
                  style={[styles.cfgChip, regiaoOutra && styles.cfgChipAtivo]}
                >
                  <Text style={[styles.cfgChipTxt, regiaoOutra && styles.cfgChipTxtAtivo]}>
                    Outra…
                  </Text>
                </Pressable>
              </View>
              {regiaoOutra && (
                <TextInput
                  style={[styles.campoInput, { marginTop: 8 }]}
                  placeholderTextColor={C.onSurfaceVariant}
                  value={regiao}
                  onChangeText={setRegiao}
                  placeholder="Digite sua região"
                  maxLength={28}
                />
              )}
            </View>

            <Text style={styles.modalDica}>
              Pode deixar em branco — usamos nomes padrão.
            </Text>

            <View style={styles.modalBotoes}>
              <Pressable
                onPress={fecharSetup}
                style={({ pressed }) => [styles.modalBtnGhost, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.modalBtnGhostTxt}>Cancelar</Text>
              </Pressable>
              <Botao3D
                onPress={comecar}
                bg={C.gold}
                color={C.goldDark}
                border={C.goldBorder}
                base={C.goldDark}
                style={styles.modalBtnComecar}
              >
                COMEÇAR
              </Botao3D>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------- MODAIS: Como jogar / Sobre ---------- */}
      <InfoModal
        visible={infoModal === "comojogar"}
        onClose={() => setInfoModal(null)}
        titulo="📋 Como jogar"
        secoes={GUIA_COMO_JOGAR}
        insets={insets}
      />
      <InfoModal
        visible={infoModal === "sobre"}
        onClose={() => setInfoModal(null)}
        titulo="ℹ️ Sobre o projeto"
        secoes={GUIA_SOBRE}
        insets={insets}
      />

      {/* ---------- MODAL: Configurações ---------- */}
      <Modal
        visible={configOpen}
        animationType="slide"
        onRequestClose={() => setConfigOpen(false)}
      >
        <View style={[styles.infoContainer, { paddingTop: insets.top }]}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitulo}>⚙️ Configurações</Text>
            <Pressable onPress={() => setConfigOpen(false)} hitSlop={8} style={styles.infoFechar}>
              <Text style={styles.infoFecharTxt}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[styles.infoScroll, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Áudio — preferência global, vale mesmo sem partida */}
            <View style={styles.infoSecao}>
              <Text style={styles.infoSecaoTit}>🔊  Áudio</Text>
              <View style={styles.cfgToggleRow}>
                <Text style={styles.cfgStatus}>Música</Text>
                <Switch
                  value={!!prefsAudio.musica}
                  onValueChange={(v) => setPrefsAudio({ musica: v })}
                  trackColor={{ true: C.primaryFixed, false: C.outlineVariant }}
                  thumbColor={C.surface}
                />
              </View>
              <View style={styles.cfgToggleRow}>
                <Text style={styles.cfgStatus}>Efeitos sonoros</Text>
                <Switch
                  value={!!prefsAudio.efeitos}
                  onValueChange={(v) => setPrefsAudio({ efeitos: v })}
                  trackColor={{ true: C.primaryFixed, false: C.outlineVariant }}
                  thumbColor={C.surface}
                />
              </View>
              <Text style={styles.cfgInfo}>
                Os arquivos de áudio entram aos poucos — os controles já ficam prontos.
              </Text>
            </View>

            {!temSave ? (
              <View style={styles.infoSecao}>
                <Text style={styles.infoSecaoTxt}>
                  Inicie ou continue uma partida para ajustar estas opções.
                </Text>
              </View>
            ) : (
              <>
                {/* Velocidade de avanço */}
                <View style={styles.infoSecao}>
                  <Text style={styles.infoSecaoTit}>⏩  Velocidade de avanço</Text>
                  <Text style={styles.cfgInfo}>
                    Quantos dias cada "Avançar" pula. A secagem continua sempre dia a dia.
                  </Text>
                  <View style={styles.cfgChips}>
                    {VELOCIDADES.map((v) => {
                      const ativo = velocidade === v.dias;
                      return (
                        <Pressable
                          key={v.dias}
                          onPress={() => dispatch({ type: "SET_VELOCIDADE", payload: { dias: v.dias } })}
                          style={[styles.cfgChip, ativo && styles.cfgChipAtivo]}
                        >
                          <Text style={[styles.cfgChipTxt, ativo && styles.cfgChipTxtAtivo]}>
                            {v.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Tutorial */}
                <View style={styles.infoSecao}>
                  <Text style={styles.infoSecaoTit}>🎓  Tutorial</Text>
                  <Text style={styles.cfgStatus}>
                    Status: {tutorialAtivo ? `ativo (passo ${(state.tutorial?.passo || 0) + 1})` : "desligado"}
                  </Text>
                  {tutorialAtivo ? (
                    <Pressable onPress={() => dispatch({ type: "PULAR_TUTORIAL" })} style={styles.cfgBtn}>
                      <Text style={styles.cfgBtnTxt}>Pular tutorial</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => dispatch({ type: "REINICIAR_TUTORIAL" })} style={styles.cfgBtn}>
                      <Text style={styles.cfgBtnTxt}>Reativar tutorial (do início)</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.cfgInfo}>
                  Para apagar uma fazenda, use o 🗑️ na lista "Suas Fazendas" do menu.
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ---------- MODAL: Troféus / Marcos ---------- */}
      <TrofeusModal
        visible={trofeusOpen}
        onClose={() => setTrofeusOpen(false)}
        marcos={state?.marcos || {}}
        stats={statsGlobais}
        insets={insets}
      />
    </View>
  );
}

/* ---------- Modal de troféus (marcos do jogo) ---------- */
function TrofeusModal({ visible, onClose, marcos, stats, insets }) {
  const total = MARCOS.length;
  const feitos = Object.keys(marcos).filter((id) => marcos[id]?.completado).length;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.infoContainer, { paddingTop: insets.top }]}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitulo}>🏆 Troféus · {feitos}/{total}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.infoFechar}>
            <Text style={styles.infoFecharTxt}>✕</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[styles.infoScroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Recordes globais — sobrevivem a apagar o save */}
          <View style={styles.infoSecao}>
            <Text style={styles.trofeuCat}>Recordes · todas as partidas</Text>
            <View style={styles.recRow}>
              <Text style={styles.recLabel}>Partidas jogadas</Text>
              <Text style={styles.recVal}>{stats?.partidasJogadas || 0}</Text>
            </View>
            <View style={styles.recRow}>
              <Text style={styles.recLabel}>Maior caixa atingida</Text>
              <Text style={styles.recVal}>R$ {(stats?.maiorCaixa || 0).toLocaleString("pt-BR")}</Text>
            </View>
            <View style={styles.recRow}>
              <Text style={styles.recLabel}>Melhor nota SCA</Text>
              <Text style={styles.recVal}>{stats?.melhorSca || 0}</Text>
            </View>
          </View>
          {CATEGORIAS_MARCOS.map((cat) => {
            const itens = MARCOS.filter((m) => m.categoria === cat);
            if (itens.length === 0) return null;
            return (
              <View key={cat} style={styles.infoSecao}>
                <Text style={styles.trofeuCat}>{cat}</Text>
                {itens.map((m) => {
                  const feito = !!marcos[m.id]?.completado;
                  return (
                    <View key={m.id} style={[styles.trofeuLinha, !feito && { opacity: 0.55 }]}>
                      <Text style={styles.trofeuIcone}>{feito ? m.icone : "🔒"}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.trofeuNome, feito && { color: C.primaryDark }]}>
                          {m.nome}
                        </Text>
                        <Text style={styles.trofeuDesc}>{m.desc}</Text>
                      </View>
                      {feito && <Text style={styles.trofeuCheck}>✓</Text>}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------- Modal informativo (Como jogar / Sobre) ---------- */
function InfoModal({ visible, onClose, titulo, secoes, insets }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.infoContainer, { paddingTop: insets.top }]}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitulo}>{titulo}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.infoFechar}>
            <Text style={styles.infoFecharTxt}>✕</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.infoScroll,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {secoes.map((s, i) => (
            <View key={i} style={styles.infoSecao}>
              <Text style={styles.infoSecaoTit}>
                {s.icone}  {s.titulo}
              </Text>
              <Text style={styles.infoSecaoTxt}>{s.texto}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------- Campo de texto do modal ---------- */
function Campo({ label, ...props }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={styles.campoInput}
        placeholderTextColor={C.onSurfaceVariant}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* Hero */
  hero: {
    width: "100%",
    minHeight: 300,
    paddingBottom: 28,
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: C.secondary,
    overflow: "hidden",
    marginBottom: 28,
  },
  heroImg: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  tituloCard: {
    backgroundColor: "rgba(130,83,61,0.85)",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: C.secondaryFixedDim,
    paddingVertical: 14,
    paddingHorizontal: 26,
    alignItems: "center",
    transform: [{ rotate: "-2deg" }],
  },
  titulo: {
    color: C.gold,
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 42,
    textShadowColor: C.onSurface,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  subtitulo: {
    color: C.surface,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  corpo: { paddingHorizontal: 16, gap: 24 },

  /* Cards */
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: C.secondary,
    borderBottomWidth: 10,
    borderBottomColor: C.secondaryDark,
    padding: 18,
    gap: 14,
    alignItems: "center",
  },
  cardImg: {
    width: 132,
    height: 132,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: C.outlineVariant,
  },
  cardTitulo: {
    color: C.onSurface,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  cardTexto: {
    color: C.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    borderRadius: 999,
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipTxt: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  /* Botão 3D genérico */
  btn3d: {
    width: "100%",
    borderRadius: 999,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Menu secundário */
  menu: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.surfaceVariant,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  btnMenu: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  btnMenuPressed: { backgroundColor: C.surfaceContainer },
  btnMenuTxt: {
    color: C.onSurface,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  rodape: {
    textAlign: "center",
    color: C.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
  },

  /* ---------- Modal nova partida ---------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(32,27,12,0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: C.secondary,
    borderBottomWidth: 10,
    borderBottomColor: C.secondaryDark,
    padding: 20,
    gap: 12,
  },
  modalTitulo: {
    color: C.onSurface,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  modalChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginBottom: 4,
  },
  modalDica: {
    color: C.onSurfaceVariant,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  modalBotoes: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 4,
  },
  modalBtnGhost: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  modalBtnGhostTxt: {
    color: C.onSurfaceVariant,
    fontSize: 15,
    fontWeight: "700",
  },
  modalBtnComecar: {
    flex: 1,
  },

  /* ---------- Modal informativo ---------- */
  infoContainer: { flex: 1, backgroundColor: C.bg },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: C.outlineVariant,
    backgroundColor: C.surfaceContainer,
  },
  infoTitulo: { color: C.onSurface, fontSize: 20, fontWeight: "800", flexShrink: 1 },
  infoFechar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceVariant,
  },
  infoFecharTxt: { color: C.onSurface, fontSize: 18, fontWeight: "700" },
  infoScroll: { padding: 20, gap: 14 },
  infoSecao: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    borderBottomWidth: 5,
    borderBottomColor: C.outlineVariant,
    padding: 14,
    gap: 6,
  },
  infoSecaoTit: { color: C.primaryDark, fontSize: 15, fontWeight: "800" },
  infoSecaoTxt: { color: C.onSurfaceVariant, fontSize: 14, lineHeight: 20 },

  /* ---------- Configurações ---------- */
  cfgInfo: { color: C.onSurfaceVariant, fontSize: 13, lineHeight: 18 },
  cfgStatus: { color: C.onSurface, fontSize: 13, fontWeight: "700" },
  cfgToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  cfgChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  cfgChip: {
    backgroundColor: C.surfaceContainer,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  cfgChipAtivo: { backgroundColor: C.primaryFixed, borderColor: C.primary },
  cfgChipTxt: { color: C.onSurfaceVariant, fontSize: 13, fontWeight: "700" },
  cfgChipTxtAtivo: { color: C.onPrimaryFixed },
  cfgBtn: {
    backgroundColor: C.surfaceContainer,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  cfgBtnTxt: { color: C.onSurface, fontSize: 14, fontWeight: "800" },
  cfgBtnPerigo: {
    backgroundColor: C.errorContainer,
    borderWidth: 2,
    borderColor: C.error,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  cfgBtnPerigoTxt: { color: C.onErrorContainer, fontSize: 14, fontWeight: "800" },

  /* ---------- Neblina do hero ---------- */
  neblina: { backgroundColor: "#f1f4ee" },

  /* ---------- Troféus ---------- */
  trofeuCat: {
    color: C.secondary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  trofeuLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  trofeuIcone: { fontSize: 18, width: 24, textAlign: "center" },
  trofeuNome: { color: C.onSurface, fontSize: 14, fontWeight: "800" },
  trofeuDesc: { color: C.onSurfaceVariant, fontSize: 11, lineHeight: 15 },
  trofeuCheck: { color: C.primary, fontSize: 15, fontWeight: "800" },

  /* Recordes (no modal de troféus) */
  recRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  recLabel: { color: C.onSurfaceVariant, fontSize: 13 },
  recVal: { color: C.onSurface, fontSize: 14, fontWeight: "800" },

  /* ---------- Curiosidade rotativa ---------- */
  dicaCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.tertiaryFixed,
    borderLeftWidth: 5,
    borderLeftColor: C.gold,
    padding: 14,
    gap: 4,
    marginTop: 4,
  },
  dicaTit: { color: C.goldDark, fontSize: 13, fontWeight: "800", letterSpacing: 0.3 },
  dicaTxt: { color: C.onSurfaceVariant, fontSize: 13, lineHeight: 19 },
  dicaHint: {
    color: C.onSurfaceVariant,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "right",
    opacity: 0.7,
  },

  /* ---------- Slots / Suas Fazendas ---------- */
  slotsSec: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.surfaceVariant,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  slotsTit: {
    color: C.secondary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  slotCardVazio: { opacity: 0.7, borderStyle: "dashed" },
  slotNome: { color: C.onSurface, fontSize: 14, fontWeight: "800" },
  slotSub: { color: C.onSurfaceVariant, fontSize: 12, marginTop: 1 },
  slotBtns: { flexDirection: "row", alignItems: "center", gap: 8 },
  slotJogar: {
    backgroundColor: C.primary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  slotJogarTxt: { color: C.onPrimary, fontSize: 13, fontWeight: "800" },
  slotApagar: {
    backgroundColor: C.errorContainer,
    borderRadius: 999,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  slotApagarTxt: { fontSize: 15 },
  slotVazioHint: { color: C.onSurfaceVariant, fontSize: 11, fontStyle: "italic" },
  slotAviso: { color: C.onErrorContainer, fontSize: 11, marginTop: 6 },

  /* Campo de texto */
  campo: { gap: 6 },
  campoLabel: {
    color: C.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  campoInput: {
    backgroundColor: C.surfaceContainer,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: "600",
    color: C.onSurface,
  },
});
