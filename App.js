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
  useCarregarSaveInicial,
  useAutoSave,
  apagarLocal,
} from "./src/hooks/useSave.js";
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

function Tela({ id }) {
  switch (id) {
    case "fazenda": return <TelaFazenda />;
    case "loja": return <TelaLoja />;
    case "propriedades": return <TelaPropriedades />;
    case "mercado": return <TelaMercado />;
    case "safra": return <TelaSafra />;
    default: return null;
  }
}

function Root() {
  const { state, dispatch } = useJogo();
  useAutoSave(state);
  const [tela, setTela] = useState("fazenda");
  const [glossarioOpen, setGlossarioOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  // Auto-navega pra Safra quando acabou de colher (precisa decidir pós).
  useEffect(() => {
    if (state?.fase === "aguardando_pos") setTela("safra");
  }, [state?.fase]);

  if (!state) return <TelaInicio />;

  const confirmarApagar = () => {
    Alert.alert(
      "Apagar save?",
      "Você vai perder a partida atual e voltar à tela de início.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            await apagarLocal();
            dispatch({ type: "APAGAR" });
          },
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
        <Tela id={tela} />
        <View style={{ marginTop: 16 }}>
          <Botao variante="perigo" pequeno onPress={confirmarApagar}>
            🗑️ Apagar save
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
  const { estado, carregando } = useCarregarSaveInicial();
  if (carregando) {
    return (
      <View style={shellStyles.splash}>
        <ActivityIndicator size="large" color={tema.dourado} />
        <Text style={shellStyles.splashTxt}>Carregando save…</Text>
      </View>
    );
  }
  return (
    <JogoProvider estadoInicial={estado}>
      <Root />
    </JogoProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
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
  splashTxt: {
    color: tema.dourado,
    opacity: 0.8,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tema.dourado,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  fabTopo: {
    bottom: 138, // acima do FAB do glossário (48 + 6 gap + 84 base)
    backgroundColor: tema.bg3,
    borderWidth: 2,
    borderColor: tema.dourado,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  fabIcone: {
    fontSize: 22,
  },
});
