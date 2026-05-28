/* ============================================================
   App.js — shell + roteamento.
   Layout: SafeArea topo (HUD) + ScrollView (tela ativa) +
   SafeArea bottom (Menu). Cada parte respeita notch/home indicator.
   Roteamento por useState (sem react-navigation pra manter leve).
   ============================================================ */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { JogoProvider, useJogo } from "./src/hooks/useJogo.jsx";
import {
  useCarregarSlots,
  useAutoSave,
  apagarSlot,
} from "./src/hooks/useSave.js";
import { useAudioBus } from "./src/audio/useAudio.js";
import { carregarPrefsAudio, preCarregarEfeitos } from "./src/audio/engine.js";
import {
  carregarStatsGlobais,
  registrarProgresso,
  registrarPartidaIniciada,
} from "./src/state/estatisticasGlobais.js";
import { tema } from "./src/styles/tema.js";

import TelaInicio from "./src/components/TelaInicio.jsx";
import HUD from "./src/components/HUD.jsx";
import Menu from "./src/components/Menu.jsx";
import Botao from "./src/components/Botao.jsx";

import TelaFazenda from "./src/components/TelaFazenda.jsx";
import TelaLoja from "./src/components/TelaLoja.jsx";
import TelaPropriedades from "./src/components/TelaPropriedades.jsx";
import TelaMercado from "./src/components/TelaMercado.jsx";
import TelaSafra from "./src/components/TelaSafra.jsx";
import Glossario from "./src/components/Glossario.jsx";
import BalaoTutorial from "./src/components/BalaoTutorial.jsx";
import Dashboard from "./src/components/Dashboard.jsx";

function Tela({ id, setTela }) {
  switch (id) {
    case "fazenda": return <TelaFazenda setTela={setTela} />;
    case "loja": return <TelaLoja />;
    case "propriedades": return <TelaPropriedades />;
    case "mercado": return <TelaMercado />;
    case "safra": return <TelaSafra setTela={setTela} />;
    default: return null;
  }
}

function Root({ slots, recarregar }) {
  const { state, dispatch } = useJogo();
  const [tela, setTela] = useState("fazenda");
  const [glossarioOpen, setGlossarioOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  // Menu principal aparece ao abrir; entra no jogo via Continuar/Começar.
  const [emJogo, setEmJogo] = useState(false);
  // Slot ativo: pra onde o autosave grava.
  const [slotAtivo, setSlotAtivo] = useState(null);
  useAutoSave(state, slotAtivo);
  // Barramento de áudio: música por contexto + SFX por evento (silencioso até ter arquivos).
  useAudioBus({ state, emJogo });

  // Recordes globais: registra máximos (caixa / melhor SCA) conforme o jogo evolui.
  useEffect(() => {
    if (!state) return;
    registrarProgresso({
      caixa: state.caixa,
      sca: state.stats?.melhorLote?.sca,
    });
  }, [state?.caixa, state?.stats?.melhorLote?.sca]);

  // Auto-navega pra Safra quando acabou de colher (precisa decidir pós).
  useEffect(() => {
    if (state?.fase === "aguardando_pos") setTela("safra");
  }, [state?.fase]);

  // ---- Ações do menu de slots ----
  const jogarSlot = (slot) => {
    const s = slots?.find((x) => x.slot === slot)?.estado;
    if (!s) return;
    dispatch({ type: "CARREGAR_SAVE", payload: s });
    setSlotAtivo(slot);
    setTela("fazenda");
    setEmJogo(true);
  };
  const novoNoSlot = (slot, modo, perfil) => {
    dispatch({ type: "NOVA_PARTIDA", payload: { modo, perfil } });
    registrarPartidaIniciada();
    setSlotAtivo(slot);
    setTela("fazenda");
    setEmJogo(true);
  };
  const apagarSlotMenu = async (slot) => {
    await apagarSlot(slot);
    if (slot === slotAtivo) {
      dispatch({ type: "APAGAR" });
      setSlotAtivo(null);
    }
    await recarregar();
  };
  const voltarMenu = () => {
    setEmJogo(false);
    recarregar();
  };

  // Menu enquanto não entrou no jogo — ou se não há partida em memória.
  if (!emJogo || !state) {
    return (
      <TelaInicio
        slots={slots}
        onJogarSlot={jogarSlot}
        onNovoSlot={novoNoSlot}
        onApagarSlot={apagarSlotMenu}
      />
    );
  }

  const confirmarApagar = () => {
    Alert.alert(
      "Apagar esta fazenda?",
      "Você vai apagar a partida deste slot permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => apagarSlotMenu(slotAtivo),
        },
      ]
    );
  };

  return (
    <View style={shellStyles.shell}>
      <SafeAreaView edges={["top"]} style={shellStyles.topo}>
        <HUD />
      </SafeAreaView>

      <ScrollView
        style={shellStyles.scroll}
        contentContainerStyle={shellStyles.scrollContent}
      >
        <BalaoTutorial />
        <Tela id={tela} setTela={setTela} />
        <View style={{ marginTop: 16, gap: 8 }}>
          <Botao variante="secundario" pequeno onPress={voltarMenu}>
            ≡ Menu / trocar fazenda
          </Botao>
          <Botao variante="perigo" pequeno onPress={confirmarApagar}>
            🗑️ Apagar esta fazenda
          </Botao>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={shellStyles.rodape}>
        <Menu telaAtiva={tela} setTela={setTela} />
      </SafeAreaView>

      {/* FABs flutuantes — empilhados acima do menu */}
      <Pressable
        onPress={() => setDashboardOpen(true)}
        style={({ pressed }) => [
          shellStyles.fab,
          shellStyles.fabTopo,
          pressed && shellStyles.fabPressed,
        ]}
      >
        <Text style={shellStyles.fabIcone}>📊</Text>
      </Pressable>
      <Pressable
        onPress={() => setGlossarioOpen(true)}
        style={({ pressed }) => [
          shellStyles.fab,
          pressed && shellStyles.fabPressed,
        ]}
      >
        <Text style={shellStyles.fabIcone}>📖</Text>
      </Pressable>

      <Glossario
        visible={glossarioOpen}
        onClose={() => setGlossarioOpen(false)}
      />
      <Dashboard
        visible={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
      />
    </View>
  );
}

function Boot() {
  const { slots, carregando, recarregar } = useCarregarSlots();
  if (carregando) {
    return (
      <View style={shellStyles.splash}>
        <Image source={require("./assets/icon.png")} style={shellStyles.splashLogo} />
        <Text style={shellStyles.splashTitulo}>Império do Café</Text>
        <ActivityIndicator size="large" color={tema.dourado} />
        <Text style={shellStyles.splashTxt}>Carregando…</Text>
      </View>
    );
  }
  // O reducer começa vazio; o slot escolhido é carregado sob demanda.
  return (
    <JogoProvider estadoInicial={null}>
      <Root slots={slots} recarregar={recarregar} />
    </JogoProvider>
  );
}

export default function App() {
  // Carrega preferências de áudio (globais) e pré-aquece os SFX de UI
  // (os primeiros que o usuário toca — evita latência no 1º clique).
  useEffect(() => {
    carregarPrefsAudio();
    preCarregarEfeitos(["ui_click", "ui_modal"]);
    carregarStatsGlobais();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Boot />
    </SafeAreaProvider>
  );
}

const shellStyles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: tema.bg,
  },
  topo: {
    backgroundColor: tema.bg2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    flexGrow: 1,
  },
  rodape: {
    backgroundColor: tema.bg2,
  },
  splash: {
    flex: 1,
    backgroundColor: tema.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  splashLogo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: tema.gold,
  },
  splashTitulo: {
    color: tema.madeira,
    fontSize: 22,
    fontWeight: "800",
  },
  splashTxt: {
    color: tema.dourado,
    opacity: 0.8,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: tema.gold,
    borderWidth: 2,
    borderColor: tema.goldBorda,
    borderBottomWidth: 5,
    borderBottomColor: tema.goldBase,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  fabTopo: {
    bottom: 140, // acima do FAB do glossário
    backgroundColor: tema.bg2,
    borderWidth: 2,
    borderColor: tema.goldBorda,
    borderBottomWidth: 5,
    borderBottomColor: tema.goldBase,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  fabIcone: {
    fontSize: 22,
  },
});
