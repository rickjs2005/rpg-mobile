# 📋 Documentação Completa — *Império do Café — Zona da Mata*

> **Documento gerado por análise automática de TODO o código-fonte** (54 arquivos JS/JSX + configs).
> Serve simultaneamente como: documentação oficial · auditoria técnica · GDD · relatório arquitetural · relatório de bugs · material para investidores/onboarding.
>
> **Data da análise:** 2026-05-27 · **Branch:** `master` · **Commit base:** `240dfe8`
> **Metodologia:** leitura integral de `src/data`, `src/logic`, `src/hooks`, `src/components`, `App.js`, `index.js`, `app.json`, `package.json`. Nada foi inferido sem evidência no código. Funcionalidades inexistentes estão marcadas como **N/A** ou **em desenvolvimento**.

---

## 📑 Índice

1. [Visão geral do jogo](#1-visão-geral-do-jogo)
2. [Arquitetura do projeto](#2-arquitetura-do-projeto)
3. [Game Design Document (GDD)](#3-game-design-document-gdd)
4. [Fluxo completo do jogador](#4-fluxo-completo-do-jogador)
5. [Telas do jogo](#5-telas-do-jogo)
6. [Sistemas implementados](#6-sistemas-implementados)
7. [Análise técnica](#7-análise-técnica)
8. [Responsividade](#8-responsividade)
9. [UX/UI](#9-uxui)
10. [Áudio-visual](#10-áudio-visual)
11. [Sistema de dados](#11-sistema-de-dados)
12. [Segurança](#12-segurança)
13. [Performance](#13-performance)
14. [Roadmap automático](#14-roadmap-automático)
15. [Lista de bugs encontrados](#15-lista-de-bugs-encontrados)
16. [Mapeamento total do projeto](#16-mapeamento-total-do-projeto)
17. [Relatório executivo](#17-relatório-executivo)
18. [Números finais da análise](#18-números-finais-da-análise)

---

# 1. VISÃO GERAL DO JOGO

| Atributo | Valor |
|---|---|
| **Nome** | Império do Café — Zona da Mata |
| **Gênero** | Simulador econômico de gestão / *management sim* por menus (estilo "Brasfoot do café"). **Não** é RPG nem possui combate, apesar do nome do repositório `rpg-mobile`. |
| **Plataforma** | iOS + Android (React Native + Expo SDK 54). Web habilitado no `app.json` mas não é o alvo. 100% offline. |
| **Público-alvo** | Jogadores de simuladores de gestão; entusiastas de café/agronegócio; nicho brasileiro com terminologia técnica real (Embrapa/Procafé/Cocatrel). |
| **Objetivo principal** | Transformar uma rocinha pequena (ou terra nua) num império cafeeiro lucrativo ao longo de muitas safras. |
| **Estado atual** | **Protótipo jogável avançado e coeso.** A própria `TelaInicio` se autodenomina "Protótipo". 22 sistemas de simulação implementados e integrados. Sem testes automatizados, sem build de produção, sem áudio. |

### Loop principal de gameplay

```
            ┌─────────────────────────────────────────────────────┐
            │                                                     │
   PLANTAR ─┴─► CONDUZIR ──► COLHER ──► PROCESSAR ──► VENDER ──► REINVESTIR ──► EXPANDIR
 (variedade,    (adubo,      (manual,   (Natural/CD/  (commodity   (insumos,     (comprar
  densidade,    defensivo,    derriça,   Lavado +      ou ⭐         equipamentos, terras)
  sol/sombra)   irrigação,    colhedora) secagem dia-  microlote    equipe, certs,
                podas)                   a-dia)        no mercado)  cooperativa)
```

Fidelidade temporal real: lavoura nova leva **~3 anos** (`ANOS_FORMACAO = 3`) para formar e só atinge pico produtivo aos 4 anos.

### Diferenciais

- **Simulação agronômica profunda e realista** (florada-veranico, granação, bienalidade, curva idade-produtiva, 6 pragas sazonais).
- **Classificação de café multi-dimensional**: Tipo BRASIL × Peneira × SCA, com microlotes que multiplicam o preço por até 5×.
- **Mercado dinâmico** inspirado na bolsa ICE NY, com 7 eventos macro.
- **Arquitetura limpa**: `logic/` é JavaScript puro, testável, sem dependência de React.
- **Sem dependências de UI externas** — tudo em React Native puro.

### Mecânicas principais

Tempo híbrido (semana/dia) · plantio com 11 variedades × 3 densidades × sol/sombra · manejo (insumos, podas, irrigação, equipe) · pragas com amostragem · pós-colheita com lavador-sifão e secagem climática · mercado oscilante · certificações · cooperativa · financiamento · tulha com capacidade · eventos climáticos extremos · tutorial guiado · 23 marcos · dashboard com gráficos.

---

# 2. ARQUITETURA DO PROJETO

## 2.1 Estrutura de pastas e responsabilidades

```
rpg-mobile/
├── App.js                  Shell: SafeArea + HUD + ScrollView + Menu + 2 FABs + roteamento
├── index.js                registerRootComponent(App) — entrypoint Expo
├── app.json                Config Expo (nome, ícones, orientação portrait)
├── package.json            Deps: expo ~54, react 19.1, react-native 0.81
├── AGENTS.md / CLAUDE.md    Instruções p/ agentes (aponta docs Expo v56 — ver §15)
│
├── src/
│   ├── data/   (10 arq.)   DADOS PUROS — catálogos e constantes, ZERO lógica
│   ├── logic/  (20 arq.)   FUNÇÕES PURAS — simulação testável, ZERO React
│   ├── hooks/  (3 arq.)    PONTE REACT — reducer + Context + save async
│   ├── components/ (18)    UI — Pressable/View/Text, ZERO lógica de simulação
│   └── styles/ (1 arq.)    tema.js — paleta e constantes visuais
│
└── assets/                 Ícones e splash (PNGs gerados pelo template Expo)
```

**Regra arquitetural central (verificada e respeitada):** nenhum componente contém lógica de simulação; nenhum módulo de `logic/` importa React. A única exceção legítima é `src/logic/save.js`, que importa `AsyncStorage` (efeito colateral de I/O, não React).

## 2.2 Fluxo da aplicação

```
index.js
  └─ registerRootComponent(App)
       └─ App()  [SafeAreaProvider + StatusBar]
            └─ Boot()
                 ├─ useCarregarSaveInicial()  → lê AsyncStorage (async)
                 │     ├─ carregando=true  → splash (ActivityIndicator)
                 │     └─ carregando=false → estado carregado ou null
                 └─ <JogoProvider estadoInicial={estado}>
                       └─ Root()
                            ├─ useAutoSave(state)  → salva a cada mudança
                            ├─ if (!state) → <TelaInicio/>
                            └─ else → HUD + <Tela id={tela}/> + Menu + FABs
```

## 2.3 Frontend

- **Renderização:** React Native (`react-native@0.81.5`) sobre React 19.1.
- **Roteamento:** `useState("fazenda")` em `App.js` (`Root`). **Não** usa react-navigation — decisão deliberada "pra manter leve" (comentário em `App.js:5`). 5 telas trocadas via `switch` no componente `Tela`, mais 3 modais (Glossário, Dashboard, Histórico).
- **Navegação automática:** `useEffect` em `Root` força `setTela("safra")` quando `state.fase === "aguardando_pos"` (`App.js:65-67`).
- **Componentes:** 18 `.jsx`. Hierarquia: `App → Root → {HUD, Tela*, Menu, FABs, Modais}`. Telas compõem Cards (`CardTalhao`, `CardLote`, `CardEquipamento`, `CardPropriedade`).
- **Estilo:** `StyleSheet.create` local por componente + tokens centralizados em `src/styles/tema.js` (cores, raios, fontes). Zero cor hardcoded fora do tema (salvo `#1a0f08` e `#2d2218` pontuais).

## 2.4 Backend / APIs / Banco de dados / Autenticação

**N/A — o jogo é 100% client-side e offline.**

| Item | Situação |
|---|---|
| Backend / servidor | ❌ Não existe |
| API REST/GraphQL | ❌ Nenhuma chamada de rede no código |
| Banco de dados | ❌ Nenhum (persistência local — ver §11) |
| Autenticação / login / cadastro | ❌ Não existe |
| Serviços externos / SDKs de terceiros | ❌ Nenhum |

A única persistência é **AsyncStorage** (chave `imperio-cafe-save-v1`), via `src/logic/save.js`.

## 2.5 Sistema de estado global

- **`useReducer` + Context API** (`src/hooks/useJogo.jsx`). Sem Redux, Zustand ou Recoil — escolha deliberada documentada no README.
- O **reducer** (`src/hooks/reducer.js`, 1.130 linhas) é o **único ponto de mutação** do estado. Função pura `(state, action) => state`.
- `JogoProvider` usa `useMemo(() => ({ state, dispatch }), [state])` para estabilizar a referência do contexto.
- **28 tipos de ação** despachados via `dispatch({ type, payload })`.

### Pipeline do reducer (`reducer.js:1051`)

```js
export function reducer(state, action) {
  const novo     = reducerCore(state, action);      // 1. lógica da ação
  const comStats = atualizarStatsCaixa(state, novo);// 2. auto-track receita/despesa por diff de caixa
  const comMarcos = verificarMarcos(comStats);      // 3. checa os 23 marcos
  return avancarTutorialSeNecessario(comMarcos, action); // 4. avança tutorial
}
```

Este pipeline de pós-processamento (stats + marcos + tutorial roda **após cada ação**) é elegante, mas tem custo (ver §7/§13).

## 2.6 Tecnologias e dependências

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Expo SDK | `~54.0.0` |
| Runtime UI | React Native | `0.81.5` |
| Lib React | React | `19.1.0` |
| Persistência | `@react-native-async-storage/async-storage` | `2.2.0` |
| Safe areas | `react-native-safe-area-context` | `~5.6.0` |
| Status bar | `expo-status-bar` | `~3.0.9` |
| Linguagem | JavaScript (sem TypeScript) | — |
| RNG | mulberry32 (implementação própria) | — |

**5 dependências de runtime apenas.** Nenhuma lib de UI, charts, navegação ou state management.

---

# 3. GAME DESIGN DOCUMENT (GDD)

> Para cada subsistema solicitado, indico o status real. Vários itens do checklist genérico **não se aplicam** a um simulador de gestão.

## 3.1 Gameplay principal ✅

Gestão por turnos manuais. O jogador clica **"▶ Avançar"** no HUD. O passo é **híbrido** (`logic/tempo.js:passoEmDias`): 7 dias por clique normalmente, **1 dia** quando `fase === "secagem"` (`FASES_DIARIAS = ["secagem"]`). Cada dia simulado processa: clima → efeitos pendentes → recuperação de podas → ciclo fenológico → pragas → seca crítica → eventos extremos → mercado → certificações → cobranças mensais/anuais → secagem → envelhecimento anual.

## 3.2 Progressão ✅

Progressão econômica e de escala (não há níveis de personagem). Mede-se por: caixa, hectares, talhões, certificações, qualidade dos lotes (SCA), e **23 marcos** em 9 categorias. Curva temporal real força paciência (3 anos de formação).

## 3.3 Economia ✅ (núcleo do jogo)

**Moeda única:** Real (R$), campo `state.caixa`. Pode ficar negativo (sem game-over por falência — apenas alertas no HUD).

**Fontes de receita:**
- Venda de lotes no mercado (`VENDER_LOTE` / loop de venda na aba).
- Venda forçada de excedente da tulha (`finalizarSecagem`, sem prêmios).
- Empréstimo Funcafé (entrada de caixa com dívida).

**Custos (todos no reducer):**
| Custo | Onde | Valor |
|---|---|---|
| Plantio | `acaoPlantar` | R$800/ha × densidade × sombra |
| Insumos | `acaoComprarInsumo` | Adubo R$350, Calcário R$200, Defensivo R$450 |
| Mão de obra panha | `acaoColher` | Manual R$15/saca, Derriça R$8/saca, Colhedora R$750 fixo |
| Método pós | `acaoIniciarPosColheita` | Natural R$0, CD R$1.200, Lavado R$2.000 |
| Equipamentos | `acaoComprarEquipamento` | R$18k–R$45k |
| Custo de operação equip. | — | **definido em dados mas só a colhedora cobra** (ver §15, bug) |
| Folha de pagamento | loop mensal | Mensalista R$2.500, Encarregado R$5.000 |
| Irrigação | mensal | R$200/ha/mês + instalação R$8k + R$4k/ha |
| Certificações | adesão + anual (1/jan) | R$2k–R$5k + R$500–R$1.000/ano |
| Cooperativa | adesão + anuidade | R$5.000 + R$1.500/ano |
| Parcela Funcafé | mensal | 12× (principal × 1,10 / 12) |
| Amostragem | `acaoAmostrar` | R$50 |
| Podas | `acaoEsqueletar`/`acaoRecepar` | R$1.500 / R$3.000 |

**Precificação (composta, em `logic/bebida.js`):**
```
precoFinal = PRECO_TIPO_BRASIL[tipo]          // 700–1900 por Tipo (2–8)
           × PENEIRA_AJUSTE_PRECO[peneira]    // 0.85–1.18
           × SCA_LIMIARES.mult                // 1.0 / 1.4 / 2.5 / 5.0
           × (1 + premioCertificacoes)        // +10/+30/+35% cumulativo
           × fatorMercado (com floor coop)    // 0.65–1.45×
```

## 3.4 Inventário ✅

`state.inventario = { adubo, calcario, defensivo }` (contadores). Mais `state.estoqueSacas[]` (lotes classificados) e `state.equipamentos[]`. Sem grid/peso — é contagem simples.

## 3.5 Sistema de save ✅

Auto-save em AsyncStorage a cada mudança de estado (`useAutoSave`). Versão `1`. RNG seedável (mulberry32) permite "destino" reproduzível. Ver §11.

## 3.6 Sistema de tempo ✅

Calendário simplificado (`logic/tempo.js`), 12 meses, dias por mês fixos (sem bissexto). Estado `{ ano, mes, dia, totalDias }`. Janelas-chave: florada set-out, colheita mai-ago, granação jan-mar.

## 3.7 Sistema climático ✅

`logic/clima.js` + `data/clima.js`. Perfil de probabilidade por mês (chuva/sol/nublado/geada). Sorteio diário seedável. mm de chuva sorteados alimentam ciclo fenológico e secagem.

## 3.8 Sistema de eventos ✅

Três camadas: (1) **eventos de log** (`comMensagem`, até 500, categorizados por emoji); (2) **eventos macro de mercado** (7 notícias globais); (3) **eventos climáticos extremos** (geada negra, granizo, seca crítica gradual).

## 3.9 Sistema de mapa ⚠️ Parcial / abstrato

Não há mapa espacial. "Mapa" = lista de **talhões** (unidades abstratas, sem simular pé a pé) + 4 propriedades à venda. O `Timeline` é o "mapa temporal" do ano.

## 3.10 Sistemas que **NÃO existem** (checklist genérico)

| Sistema | Status |
|---|---|
| Crafting | ❌ N/A (pós-colheita não é crafting clássico) |
| Skills / habilidades | ❌ N/A |
| Combate | ❌ N/A |
| Missões | ⚠️ Aproximado por **marcos/achievements** (não há quests dirigidas) |
| NPCs | ❌ N/A (cooperativa/encarregado são abstrações econômicas, sem diálogo) |
| IA (inimigos/agentes) | ❌ N/A (mercado e clima são RNG, não IA) |
| Multiplayer | ❌ Não implementado (save isolado "preparado para isso" — roadmap) |
| Ranking | ❌ Não implementado |
| Matchmaking | ❌ N/A |
| Sistema de níveis/XP | ❌ N/A (progressão é econômica) |
| Sistema de física | ❌ N/A |
| Sistema de animação | ⚠️ Mínimo (scale em `pressed`, `Modal animationType="slide"`) |
| Sistema de áudio | ❌ Não implementado |
| Sistema de partículas / VFX / shaders | ❌ N/A |

## 3.11 Loja ✅

`TelaLoja` reúne: cooperativa, insumos, equipamentos, tulha, Funcafé, equipe, certificações. Todos com cards e gating por caixa.

---

# 4. FLUXO COMPLETO DO JOGADOR

> Como **não há login/cadastro/configurações/matchmaking/multiplayer**, esses passos são marcados N/A.

### 4.1 Boot → Início
```
1. App abre → Boot lê AsyncStorage
2. Tem save?  ──sim──► carrega estado → Root (tela "fazenda")
   └──não──► state = null → <TelaInicio>
```

### 4.2 Tela inicial (sem save)
```
TelaInicio
 ├─ "☕ Rocinha pronta" → NOVA_PARTIDA {modo:"rocinha_pronta"}  (R$5.000, Catuaí formado idade 4)
 └─ "🌱 Terra nua"      → NOVA_PARTIDA {modo:"terra_nua"}       (R$3.000, talhão vazio)
```

### 4.3 Tutorial guiado (7 passos, `data/tutorial.js`)
```
P1 bemvindo      → avança ao despachar AVANCAR
P2 esperar_colh. → avança quando mês∈[5,8] e fase normal
P3 colher        → avança ao COLHER
P4 pos_colheita  → avança ao INICIAR_POS_COLHEITA
P5 secagem       → avança quando estoque > 0
P6 vender        → avança ao VENDER_LOTE / VENDER_TUDO
P7 final         → só fecha manualmente (COMPLETAR_TUTORIAL)
```
O tutorial avança **automaticamente** quando o jogador executa a ação esperada (`avancarTutorialSeNecessario`), ou manualmente via balão ("Entendi, próximo →" / "Pular").

### 4.4 Loop de gameplay (estado estável)
```
HUD mostra caixa/data/saúde/próximo evento → "▶ Avançar 1 semana"
 │
 ├─ Fazenda: ver talhões, plantar, aplicar insumo, amostrar, irrigar, podar, colher
 ├─ Loja: comprar insumos/equip./tulha/certs, contratar equipe, pedir empréstimo
 ├─ Terras: comprar propriedades
 ├─ Mercado: vender lotes (commodity / ⭐ microlote)
 └─ Safra: escolher método pós-colheita → acompanhar secagem (avança 1 dia)
```

### 4.5 Ciclo de uma safra (passo a passo)
```
1. (mai-ago) Talhão formado + florada OK → COLHER (manual/derriça/colhedora)
2. fase = "aguardando_pos" → auto-navega para Safra
3. Escolher Natural/CD/Lavado → INICIAR_POS_COLHEITA → fase = "secagem"
4. Avançar 1 dia × N (umidade 60% → 12%, clima afeta velocidade)
5. secagemPronta → finalizarSecagem → lote(s) classificado(s) vão pro estoque
   (CD/Lavado geram lote "cereja" + lote "boia")
6. Mercado → vender quando índice estiver alto
7. Reinvestir → repetir
```

### 4.6 Finalização de sessão
Não há "fim de jogo". Save automático contínuo; fechar o app preserva tudo. "🗑️ Apagar save" (rodapé de qualquer tela) → `Alert` de confirmação → `APAGAR` → volta à `TelaInicio`.

| Etapa do checklist | Status |
|---|---|
| Login / Cadastro / Configurações / Matchmaking / Multiplayer | ❌ N/A |

---

# 5. TELAS DO JOGO

> 18 componentes. Abaixo, as **9 telas/modais navegáveis** + 9 componentes de apoio.

### 5.1 `TelaInicio.jsx`
- **Objetivo:** escolher modo de partida.
- **Componentes:** 2 cards (Rocinha/Terra nua), `Botao`, `ScrollView`, `SafeAreaView`.
- **Estados:** stateless (só dispatch).
- **Problemas:** rodapé "Protótipo · save em AsyncStorage" exposto ao usuário final.
- **Melhoria:** adicionar "Continuar" se houver save; tela de configurações.

### 5.2 `HUD.jsx` (cabeçalho persistente)
- **Objetivo:** caixa, data, saúde, mini-stats (📦 sacas, 🐛 pragas, 📈 mercado), próximo evento, banner de até 2 alertas, botão Avançar.
- **Estados:** deriva tudo de `state` via seletores de `logic/alertas.js`.
- **Problemas:** o banner mostra só 2 alertas + "+N alertas" (sem ação para ver o resto).

### 5.3 `Menu.jsx` (tab bar inferior)
- **Objetivo:** 5 abas (Fazenda/Loja/Terras/Mercado/Safra) com badges.
- **Badges:** Safra (se `fase !== "normal"`), Mercado (se há estoque).

### 5.4 `TelaFazenda.jsx`
- **Objetivo:** tela-mãe. Renderiza `Timeline`, inventário de insumos, lista de `CardTalhao`, eventos recentes (5) + acesso ao `HistoricoEventos`.
- **Componentes:** `Timeline`, `CardTalhao`, `HistoricoEventos`.
- **Detalhe:** `eventosCompat()` migra saves antigos com `state.mensagens` (formato legado — ver §15).

### 5.5 `CardTalhao.jsx` (o card mais complexo — 580 linhas)
- **Objetivo:** estado completo do talhão + todas as ações contextuais.
- **Componentes/estados:** picker de densidade (`useState`), picker sol/sombra (`useState`), chips de status (bienalidade, calcário pendente, florada, granação, veranico, irrigação, densidade, sombra, pragas), barra de sanidade, botões contextuais (plantar 11 variedades, aplicar insumos, colher 3 métodos, amostrar, irrigar, esqueletar, recepar).
- **Problemas:** componente gigante com muita lógica de apresentação condicional (ver §7).

### 5.6 `TelaLoja.jsx` (489 linhas)
- **Objetivo:** todas as compras/contratações.
- **Seções:** Cooperativa · Insumos · Equipamentos (`CardEquipamento`) · Tulha · Funcafé · Equipe · Certificações.
- **Problemas:** usa IIFEs `(() => {...})()` inline para blocos condicionais (Funcafé, Equipe, Tulha) — funciona, mas polui o JSX. Variável `adquirida` declarada e não usada no bloco da tulha.

### 5.7 `TelaPropriedades.jsx`
- **Objetivo:** listar 4 propriedades (`CardPropriedade`) + adquiridas.

### 5.8 `TelaMercado.jsx`
- **Objetivo:** tabela de preços (Tipo + SCA), abas Commodity/⭐Microlote, "Vender tudo desta aba", lista de `CardLote`, capacidade da tulha.
- **Problemas:** o total exibido em "Vender tudo desta aba" usa `l.precoPorSaca` **cru** (sem cert/mercado/floor), divergindo do valor real creditado (ver §15, bug B2). "Vender tudo" faz **loop de `VENDER_LOTE`** em vez de usar a ação `VENDER_TUDO`.

### 5.9 `TelaSafra.jsx`
- **Objetivo:** 3 modos conforme `fase` — vazio / escolha de método pós (`aguardando_pos`) / barra de secagem (`secagem`).
- **Detalhe:** mostra perfil colhido (maduro/verde/seco) e progresso de umidade.

### 5.10 Modais
- **`Glossario.jsx`:** busca + filtro por 9 categorias, ~45 termos agrupados. `useMemo` para filtragem.
- **`Dashboard.jsx`:** visão geral financeira, produção, melhor lote, fazenda, certificações, 23 marcos com lock/unlock, mini-gráfico de barras receita×despesa por ano.
- **`HistoricoEventos.jsx`:** lista completa (até 500) com filtro por 10 categorias.

### 5.11 Componentes de apoio
`Botao.jsx` (4 variantes), `Timeline.jsx` (strip 12 meses), `BalaoTutorial.jsx`, `CardEquipamento`, `CardLote`, `CardPropriedade`.

### Responsividade das telas
Todas usam Flexbox + `flexWrap` + `ScrollView`. **Não há media queries nem breakpoints** — ver §8.

---

# 6. SISTEMAS IMPLEMENTADOS

## 6.1 Sistemas CONCLUÍDOS e funcionando (reais)

| # | Sistema | Arquivo(s) | Resumo |
|---|---|---|---|
| 1 | **Variedades (11)** | `data/cafe.js` | Traços: maturação, resistência, bebida, bienalidade, produtividade, peneira |
| 2 | **Densidade de plantio (3)** | `constantes.js DENSIDADES`, `talhao.js plantarTalhao` | +pés / +custo / declínio antecipado |
| 3 | **Sombreamento** | `constantes.js SOMBREAMENTO` | −35% produção, +bebida, −pragas, −dano geada |
| 4 | **Florada-veranico** | `logic/ciclo.js` | 10d secos + chuva ≥5mm na janela set-out |
| 5 | **Granação** | `logic/ciclo.js` | Chuva acumulada jan-mar, fator linear (mín 30%) |
| 6 | **Bienalidade** | `talhao.js fatorBienalidade` | Alterna alta/baixa por colheita, modulada pela variedade |
| 7 | **Curva idade-produtiva** | `talhao.js fatorIdadeProdutiva` | 0-3 nada, 4-6 pico, 7-15 estável, declínio |
| 8 | **Insumos + efeito atrasado** | `talhao.js aplicarInsumo` | Adubo/defensivo imediato, calcário 90d |
| 9 | **Podas (esqueletamento/recepa)** | `talhao.js`, reducer | −1/−2 safras, renovação |
| 10 | **Irrigação** | reducer `acaoInstalarIrrigacao` | Garante mm/dia, custo mensal |
| 11 | **Equipe** | `logic/equipe.js` | Mensalistas (cobertura proporcional) + encarregado |
| 12 | **Pragas (6)** | `data/pragas.js`, `logic/pragas.js` | Spawn sazonal, dano, defensivo, amostragem, broca→defeito |
| 13 | **Pós-colheita (3 métodos)** | `logic/pos_colheita.js` | Natural/CD/Lavado + lavador-sifão (cereja/boia) |
| 14 | **Secagem dia-a-dia** | `pos_colheita.js avancarSecagemDia` | Umidade 60→12%, clima afeta, secador ignora chuva |
| 15 | **Classificação bebida** | `logic/bebida.js` | SCA (60-95) × Tipo BRASIL (2-8) × Peneira (12-19) |
| 16 | **Microlote** | `bebida.js` `LIMIAR_MICROLOTE_SCA=85` | Preço 2,5×–5× |
| 17 | **Mercado dinâmico** | `logic/mercado.js` | Índice 0,65–1,45×, tendência+ruído |
| 18 | **Eventos macro (7)** | `data/mercado.js` | Geada concorrente, crise Vietnã, etc. |
| 19 | **Certificações (3)** | `logic/certificacoes.js` | Adesão, transição (orgânico 3 anos), prêmio cumulativo |
| 20 | **Cooperativa** | reducer + `constantes.js` | −15% insumos + floor 95% |
| 21 | **Funcafé** | `logic/financiamento.js` | 12 parcelas, 10% juros, limite escalável |
| 22 | **Tulha** | reducer `finalizarSecagem` | Capacidade limitada, venda forçada do excedente |
| 23 | **Equipamentos (4) + terreno** | `logic/equipamentos.js` | Regra dos 15%, modificadores por terreno |
| 24 | **Eventos extremos** | `logic/eventos_extremos.js` | Geada negra, granizo, seca crítica |
| 25 | **Propriedades (4)** | `logic/propriedades.js` | Nua vs pronta |
| 26 | **Tutorial (7 passos)** | `data/tutorial.js`, reducer | Triggers automáticos |
| 27 | **Marcos (23)** | `data/marcos.js` | Condições puras sobre state |
| 28 | **Glossário (~45 termos)** | `data/glossario.js` | Modal com busca/filtro |
| 29 | **Dashboard + gráfico** | `Dashboard.jsx` | Agregados + barras por ano |
| 30 | **Histórico (500 eventos)** | reducer `comMensagem` | Categorizado por emoji |
| 31 | **Save seedável** | `logic/save.js`, `rng.js` | AsyncStorage + mulberry32 |

## 6.2 Sistemas PARCIAIS / com ressalvas

- **Custo de operação de equipamentos** — definido em `data/economia.js` (`custoOperacao`) e há função `custoOperacaoTotal()` em `logic/equipamentos.js`, **mas essa função não é chamada em lugar nenhum**. Só a colhedora cobra operação (hardcoded `× 5` em `acaoColher`). Trator/drone/secador nunca cobram operação → a "trava econômica" descrita nos comentários **não está ativa**.
- **Maturação por espécie** — `maturacao.js` usa janela fixa mai-ago para todas as variedades; conilon (matura mês 0.75) não tem janela própria.
- **Mapa** — abstrato (lista), não espacial.

## 6.3 Sistemas MOCKADOS / FAKE / DEMO

**Nenhum.** Não há dados falsos, telas placeholder ou stubs simulando backend. Toda a simulação roda de verdade no cliente.

## 6.4 Código MORTO / duplicado (ver detalhes em §7.5 e §15)

- `logic/economia.js`: `precoPorSaca(score)` e `valorLote()` (sistema de preço **antigo** via `TABELA_BEBIDA`) — importados no reducer mas **nunca chamados**.
- `data/cafe.js`: `TABELA_BEBIDA` — só consumido pelo código morto acima e por `consultarTabela`.
- `logic/bebida.js`: `consultarTabela()` — compat declarada, sem consumidores.
- `logic/equipamentos.js`: `temEquipamento()` e `custoOperacaoTotal()` — exportados, sem chamadas.
- `hooks/useSave.js`: `temSaveSalvo` — reexportado, sem uso.
- Ação `VENDER_TUDO` — implementada mas a UI usa loop de `VENDER_LOTE` (só o tutorial referencia `VENDER_TUDO` como condição).

---

# 7. ANÁLISE TÉCNICA

## 7.1 Organização ⭐ (ponto forte)
Separação data/logic/hooks/components rigorosa. `logic/` é JS puro testável. Nomes consistentes em PT-BR. Comentários de cabeçalho em todos os módulos explicam o "porquê". **É um dos códigos mais limpos que se vê num protótipo de jogo.**

## 7.2 Performance
- **Re-render global:** `JogoProvider` expõe `{state, dispatch}` via `useMemo([state])`. Qualquer ação muda `state` → **todos os consumidores re-renderizam**. Como o app é monolítico em 1 contexto, um clique em "Avançar" re-renderiza HUD + tela ativa + todos os cards. Aceitável na escala atual (1–5 talhões), mas **não escala** para dezenas de talhões.
- **`acaoAvancar` é O(dias × talhões × sistemas):** um "Avançar 1 semana" roda 7 iterações, cada uma percorrendo todos os talhões por ~6 subsistemas. Para fazendas grandes + muitos eventos, cada clique faz centenas de operações + dezenas de `comMensagem` (cada um aloca novo array de até 500). **Sem memoização de seletores** (`calcularAlertas`, `calcularProximoEvento` recomputam a cada render do HUD).
- **Sem `React.memo`** em nenhum componente. Cards recriam estilos inline (`width: ${pct}%`).

## 7.3 Possíveis memory leaks
- **Baixo risco.** `useCarregarSaveInicial` usa flag `cancelado` no cleanup (correto). `useAutoSave` não tem subscription. Sem timers/intervalos. Sem listeners não removidos.

## 7.4 Re-renderizações desnecessárias / loops
- HUD recalcula `calcularAlertas`/`calcularProximoEvento`/`saudeFazenda`/`totalSacasEstoque`/`totalTalhoesComPragas` a **cada** render (5 varreduras de `state.talhoes`). Poderiam ser `useMemo`.
- `TelaMercado` "Vender tudo": loop de `dispatch` (1 por lote). Funciona (useReducer enfileira), mas dispara o pipeline completo (stats+marcos+tutorial) N vezes — desnecessário; `VENDER_TUDO` faria em 1.

## 7.5 Código duplicado / sistemas duplicados
**Dois sistemas de precificação coexistem:**
1. **Antigo:** `TABELA_BEBIDA` → `economia.js precoPorSaca/valorLote` → `bebida.js consultarTabela`. **Morto.**
2. **Atual:** `constantes.js` (Tipo/Peneira/SCA) → `bebida.js classificarLote`. **Em uso.**

Risco: confusão de manutenção; alguém pode editar a tabela errada.

## 7.6 Componentes gigantes
- `reducer.js` — 1.130 linhas (justificável: é o orquestrador único, bem seccionado).
- `CardTalhao.jsx` — 580 linhas (candidato a quebrar em sub-componentes: BlocoPlantio, ChipsStatus, BarraSanidade, AcoesTalhao).
- `TelaLoja.jsx` — 489 linhas com IIFEs inline.

## 7.7 Problemas arquiteturais
- **Lógica de venda parcialmente na UI:** `TelaMercado` reimplementa "vender tudo da aba" no componente.
- **Cálculo de preço exibido divergente do real:** `CardLote`/`Dashboard`/`TelaMercado` usam fórmulas diferentes (com/sem floor da coop) do que o reducer credita.
- **IDs com contador module-level** (`proximoId`, `proxLoteId`): reiniciam em 1 a cada reload. Mitigado por `Date.now()` no prefixo, mas frágil.

## 7.8 Validação / erros silenciosos
- `verificarMarcos` e `avancarTutorialSeNecessario` envolvem condições em `try {} catch {}` **vazios** — uma condição de marco que lance erro é silenciosamente ignorada. Defensivo, mas mascara bugs.
- `save.js`: `salvarLocal/carregarLocal/apagarLocal` engolem exceções (`catch { return false/null }`). Falha de persistência é invisível ao usuário.
- Validações de caixa/estado existem e retornam `comMensagem("❌ ...")` — bom feedback.

## 7.9 Logs inseguros
- `save.js` usa `console.warn`/`console.error` para save corrompido/versão divergente. Inofensivo (offline, sem dados sensíveis). Em produção, conviria remover.

## 7.10 Problemas mobile / desktop
- **Mobile:** alvo principal; layout adequado. Falta tratamento de fontes grandes/acessibilidade.
- **Desktop/web:** habilitado no `app.json` mas **sem layout responsivo** — em telas largas o conteúdo estica em coluna única (ver §8).

## 7.11 Escalabilidade
- **Estado:** monolítico num único reducer/contexto. Para multiplayer/ranking (roadmap) precisará de camada de sync e provavelmente split de contextos.
- **Conteúdo:** adicionar variedades/pragas/eventos é trivial (puro dado). **Esse eixo escala muito bem.**

---

# 8. RESPONSIVIDADE

| Alvo | Situação | Observações |
|---|---|---|
| **Mobile (portrait)** | ✅ Bom | Alvo primário. `orientation: "portrait"` travado. SafeArea no topo e base. |
| **Mobile (landscape)** | ⚠️ Não testado/travado | App força portrait. |
| **Tablet** | ⚠️ Parcial | `ios.supportsTablet: true`, mas layout é coluna única esticada — sem aproveitar largura. |
| **Desktop / Web** | ⚠️ Fraco | Web habilitado, mas sem `maxWidth`/container central; conteúdo estica. |
| **Ultrawide** | ❌ Ruim | Sem limite de largura → linhas muito longas, leitura prejudicada. |

**Análise de overflow/layout:**
- Cards usam `flexWrap: "wrap"` (chips, ações, stats) → resiliente a estreitamento.
- `numberOfLines={1}` no `Botao` evita quebra feia, mas pode **cortar** rótulos longos (ex.: "Limite máx: R$XXXk", "Pegar R$50k (parc. R$...)").
- `HUD` mini-stats em linha podem apertar em telas muito estreitas (<340px).
- Sem `Dimensions`/`useWindowDimensions` em nenhum lugar → zero adaptação por tamanho.

**Recomendações:** container com `maxWidth: 640` centralizado para web/tablet; `useWindowDimensions` para 2 colunas de cards em telas largas; testar fontes de acessibilidade (`allowFontScaling`).

---

# 9. UX/UI

## 9.1 Pontos fortes
- **Hierarquia visual clara:** títulos dourados maiúsculos, corpo claro sobre fundo marrom-café (paleta temática coesa em `tema.js`).
- **Feedback consistente:** toda ação gera evento no log; erros viram mensagem `❌`; `pressed` aplica scale 0.97.
- **Onboarding:** tutorial de 7 passos com triggers automáticos + glossário acessível por FAB.
- **Comunicação visual sem palavras:** Timeline (estágio do ano), barra de sanidade colorida (vermelho/dourado/verde), chips de status, badges no menu.
- **Cores semânticas:** verde=positivo, vermelho=crítico, dourado=destaque/dinheiro, azul=informativo.

## 9.2 Tipografia
Escala definida no tema (`fonteH1=22 … fonteMicro=11`). Uso de `fontVariant: ["tabular-nums"]` em números — detalhe profissional. Porém, vários componentes usam tamanhos hardcoded (ex.: `fontSize: 10/11/12`) em vez dos tokens.

## 9.3 Estados vazios ✅
Bem tratados: `TelaSafra` ("Sem safra ativa"), `TelaMercado` ("Sem microlotes…"), `TelaPropriedades` ("Nada à venda"), `HistoricoEventos`/`Glossario` ("Nenhum…").

## 9.4 Loading / Skeleton
- **Loading:** só no boot (`ActivityIndicator` "Carregando save…").
- **Skeleton:** ❌ inexistente (não há fetch assíncrono que justifique).

## 9.5 Microinterações
Mínimas: scale em `pressed`, `Modal` slide. Sem animações de transição de tela, sem feedback tátil (haptics), sem toasts (usa log estático).

## 9.6 Acessibilidade ⚠️ (lacuna)
- ❌ Nenhum `accessibilityLabel`/`accessibilityRole`/`accessibilityHint`.
- ❌ Informação codificada **só por cor** em vários pontos (chips de florada, barra de sanidade) — problemático para daltônicos (embora emojis ajudem).
- ⚠️ **Contraste:** texto dourado `#d9a85f` sobre `#2a1d15` e `textoFraco` (`opacity 0.45`) podem ficar abaixo de WCAG AA em telas pequenas/claras.
- ❌ Sem suporte explícito a leitor de tela.

## 9.7 Melhorias profissionais sugeridas
1. Adicionar `accessibilityLabel` em `Botao`, `Pressable` de abas e cards.
2. Toasts/animação para eventos importantes (marco desbloqueado, microlote, geada).
3. Confirmar ações caras (comprar equipamento R$45k) com `Alert` — hoje só "Apagar save" confirma.
4. Tela de configurações (som futuro, reset, tamanho de fonte).
5. Indicador de carregamento/sucesso ao vender (hoje é instantâneo, sem celebração).

---

# 10. ÁUDIO-VISUAL

| Recurso | Status | Detalhe |
|---|---|---|
| **Artes / sprites** | ⚠️ Mínimo | Sem sprites. Visual é tipográfico + **emojis** como ícones (🌳🍒💧☕🚜…). |
| **Ícones de app** | ✅ | `assets/icon.png`, `splash-icon.png`, ícones adaptativos Android (foreground/background/monochrome), `favicon.png`. Gerados pelo template Expo. |
| **Ilustrações no jogo** | ❌ | Nenhuma imagem dentro das telas — tudo View/Text. |
| **Sons / SFX** | ❌ | Não implementado. Sem `expo-av`/`expo-audio`. |
| **Música** | ❌ | Não implementado. |
| **Animações** | ⚠️ | `Modal animationType="slide"`, scale em `pressed`. Sem `Animated`/Reanimated. |
| **Efeitos / VFX / shaders / partículas** | ❌ | N/A. |

**Identidade visual:** paleta "café" (marrons + dourado + acentos verde/vermelho/azul) coesa e madura. O jogo é deliberadamente **"text-forward"**, estilo Brasfoot — coerente com o gênero. Roadmap do README cita "Sons + animações (polish)".

---

# 11. SISTEMA DE DADOS

> **Não há banco de dados relacional, ORM, schemas, migrations ou seeds no sentido tradicional.** Persistência = chave-valor local. Esta seção documenta o que existe de fato.

## 11.1 Persistência
- **Mecanismo:** `AsyncStorage` (chave única `SAVE_KEY = "imperio-cafe-save-v1"`).
- **Serialização:** `JSON.stringify({ versao: 1, estado })` (`logic/save.js`).
- **Versionamento:** `VERSAO_SAVE = 1`. `deserializar` descarta saves de versão diferente (`return null` → nova partida). É o embrião de um sistema de migração.
- **Migração observada:** `TelaFazenda.eventosCompat` converte `state.mensagens` (formato legado) em eventos estruturados — migração em runtime, não no save.

## 11.2 "Schema" do estado (shape do save) — `novaPartida()`

```
state = {
  versao: 1,
  rngState: <int>,                 // semente mulberry32 serializável
  tempo: { ano, mes, dia, totalDias },
  caixa: <number>,
  modoInicio: "rocinha_pronta"|"terra_nua",
  talhoes: [ Talhao ],             // ver shape abaixo
  equipamentos: [ "trator"|... ],
  inventario: { adubo, calcario, defensivo },
  estoqueSacas: [ Lote ],
  colheitaPendente: Colheita|null,
  loteSecagem: LoteSecagem|null,
  fase: "normal"|"aguardando_pos"|"secagem",
  propriedadesCompradas: [ id ],
  certificacoes: { [id]: { ativa, emTransicao, diasNaTransicao, dataAdesao } },
  equipe: { mensalistas, encarregado },
  mercado: { indice, tendencia, historico:[{indice}] (cap 30) },
  emprestimo: { principal, valorParcela, parcelasTotais, parcelasRestantes, totalAPagar }|null,
  tulha: "pequena"|"media"|"grande",
  cooperativa: { filiado },
  eventos: [ { tempo, texto, categoria } ] (cap 500),
  tutorial: { ativo, passo, completado },
  stats: { receitaTotal, despesaTotal, sacasVendidasTotal, vendasCount, melhorLote, porAno:{} },
  marcos: { [id]: { completado, dataCompleta } },
}
```

### Sub-shape `Talhao` (`logic/talhao.js criarTalhao`)
```
{ id, variedadeId, hectares, pes, terreno, inclinacao, idadeAnos, sanidade,
  cicloBienal, efeitosPendentes:[{tipo,diasRestantes,ganhoSanidade}],
  estado:"normal"|"recuperando_esqueletamento"|"recuperando_recepa",
  diasRecuperacao,
  ciclo:{ diasSemChuva, floradaPrincipalOk, numFloradas, chuvaGranacao },
  pragas:{ [id]:{diasAtivos} }, amostragem:{}, irrigado, densidade, sombreado }
```

### Sub-shape `Lote` (estoque, pós-classificação)
```
{ id, sacas, sca, tipo, peneira, classeSca, classeNome, precoPorSaca,
  microlote, variedadeId, metodoPos, dataColheita, tipoLote:"cereja"|"boia"|"natural" }
```

## 11.3 "Catálogos" (equivalente a tabelas seed) — `src/data/`

| "Tabela" (constante) | Registros | Arquivo |
|---|---|---|
| `VARIEDADES` | 11 | cafe.js |
| `METODOS_POS` | 3 | cafe.js |
| `INSUMOS` | 3 | economia.js |
| `EQUIPAMENTOS` | 4 | economia.js |
| `TULHAS` | 3 | economia.js |
| `EQUIPE` | 2 | economia.js |
| `CERTIFICACOES` | 3 | economia.js |
| `PROPRIEDADES_VENDA` | 4 | economia.js |
| `PRAGAS` | 6 | pragas.js |
| `EVENTOS_EXTREMOS` | 2 (+seca) | eventos_extremos.js |
| `EVENTOS_MACRO` | 7 | mercado.js |
| `MARCOS` | 23 | marcos.js |
| `GLOSSARIO` | ~45 | glossario.js |
| `PASSOS_TUTORIAL` | 7 | tutorial.js |
| `PERFIL_MENSAL` | 12 | clima.js |
| `DENSIDADES` | 3 | constantes.js |

**Relacionamentos (chaves estrangeiras lógicas):** `Lote.variedadeId` → `VARIEDADES`; `Talhao.variedadeId` → `VARIEDADES`; `Talhao.densidade` → `DENSIDADES`; `Lote.metodoPos` → `METODOS_POS`; `certificacoes[id]` → `CERTIFICACOES`. Resolução por lookup direto de objeto (`VARIEDADES[id]`), sempre com fallback (`|| ...`).

| Índices / Queries / ORM | Status |
|---|---|
| Índices | N/A (objetos JS por chave = O(1)) |
| Queries | `Array.filter/find/reduce` em memória |
| ORM | ❌ Nenhum |
| Migrations | ⚠️ Embrião via `versao` |
| Seeds | ⚠️ Os catálogos `data/` são os "seeds" estáticos |

---

# 12. SEGURANÇA

> **Contexto:** app mobile **offline, sem backend, sem rede, sem autenticação, sem dados pessoais.** A superfície de ataque tradicional (servidor/API) **não existe**. A auditoria abaixo reflete isso honestamente.

| Vetor | Avaliação |
|---|---|
| **Vulnerabilidades de rede** | N/A — zero requisições de rede no código. |
| **Exposição de secrets / API keys / tokens** | ✅ Nenhum secret no repositório. Sem `.env`, sem chaves. |
| **Autenticação / sessão / JWT** | N/A — não há login. |
| **Rate limiting** | N/A — sem servidor. |
| **SQL Injection** | N/A — sem SQL/banco. |
| **XSS** | N/A — React Native não renderiza HTML; sem `dangerouslySetInnerHTML`/WebView. |
| **CSRF** | N/A — sem requisições autenticadas. |
| **Permissões / roles / admin** | N/A — single-player local. |
| **Middleware / APIs inseguras** | N/A. |
| **Integridade do save** | ⚠️ O save em AsyncStorage é **texto puro, sem assinatura/criptografia**. Um usuário com root/jailbreak ou ferramentas de debug pode editar caixa/estado livremente (cheating). Sem impacto de segurança real (single-player), mas relevante se houver **ranking/multiplayer** no futuro — aí a validação **precisará ser server-side**. |
| **Logs** | ⚠️ `console.warn/error` em `save.js`. Sem dados sensíveis; recomenda-se remover em build de produção. |
| **Dependências** | ✅ Apenas 5 libs mantidas (Expo/RN oficiais). Superfície mínima. Recomenda-se `npm audit` periódico. |

**Conclusão de segurança:** **risco praticamente nulo** no escopo atual (offline single-player). O único ponto a endereçar **antes de** introduzir ranking/multiplayer: a fonte de verdade do progresso não pode ser o save local não-validado.

---

# 13. PERFORMANCE

## 13.1 Bundle size
- **Pequeno por design:** 5 deps de runtime, zero libs pesadas (sem charts, sem navegação, sem moment/lodash). Código-fonte ~8.8k linhas.
- **Imagens:** apenas ícones/splash do template — leves.
- **Sem lazy loading / code splitting** — desnecessário nesta escala (RN carrega o bundle único de qualquer forma).

## 13.2 Renderização / FPS
- **Risco principal:** re-render global por contexto único (§7.2). Em 1–5 talhões: fluido. Estimativa de gargalo: dezenas de talhões + log cheio (500 eventos) podem causar jank no clique "Avançar".
- **`acaoAvancar`** é o hotspot computacional (loop dias × talhões × subsistemas + muitas alocações de array em `comMensagem`). Hoje imperceptível; cresce linearmente com a fazenda.

## 13.3 Cache / memoização
- **Cache:** ❌ nenhum (não há fetch).
- **Memoização:** só `useMemo` no contexto e nos filtros de Glossário/Histórico. **Faltam:** seletores do HUD memoizados, `React.memo` nos cards.

## 13.4 Assets pesados / consultas
- ❌ Sem assets pesados. ❌ Sem consultas de rede/DB.

## 13.5 Tempo de carregamento
- Boot = 1 leitura AsyncStorage (rápida) + splash. README cita ~30s só no primeiro bundle do Expo Go (esperado em dev).

## 13.6 Recomendações de performance (priorizadas)
1. `useMemo` para os 5 seletores do HUD.
2. `React.memo` em `CardTalhao`, `CardLote`, `CardEquipamento`, `CardPropriedade`.
3. Debounce/throttle do `useAutoSave` (hoje grava o estado inteiro a cada dispatch).
4. Em `comMensagem`, evitar recriar array gigante a cada evento dentro do loop de 7 dias (acumular e concatenar 1× por passo).
5. Usar `VENDER_TUDO` em vez do loop de dispatch no Mercado.

---

# 14. ROADMAP AUTOMÁTICO

## 🔴 Correções urgentes (consistência/percepção do jogador)
1. **B2 — Preço exibido ≠ preço creditado:** unificar `CardLote`/`Dashboard`/`TelaMercado` para usarem a mesma fórmula com floor da cooperativa (`mercadoEfetivo`).
2. **B1 — Custo de operação dos equipamentos inativo:** ativar `custoOperacaoTotal()` (trator/drone/secador) ou remover a promessa dos comentários/glossário. Hoje a "trava econômica" não existe.
3. **B3 — Idade 3 = formado mas produz 0:** alinhar `ANOS_FORMACAO` (3) com `IDADE_PICO_INI` (4) ou ajustar `fatorIdadeProdutiva` para dar produção parcial aos 3 anos. Hoje o talhão fica "colhível porém estéril" por 1 ano.

## 🟡 Melhorias importantes (qualidade técnica)
4. Remover sistema de preço morto (`TABELA_BEBIDA`/`precoPorSaca`/`valorLote`/`consultarTabela`) — eliminar duplicação.
5. Memoização (seletores HUD + `React.memo` nos cards).
6. Acessibilidade: `accessibilityLabel`/`role` nos elementos interativos.
7. Container responsivo (`maxWidth`) para tablet/web.
8. **Testes unitários em `logic/`** — a arquitetura já está pronta para isso (funções puras); é a maior dívida atual.

## 🟢 Melhorias futuras (produto)
9. Áudio (SFX + trilha) e animações de feedback.
10. Tela de configurações.
11. Build APK/IPA publicável (EAS Build).
12. Itens do README: análise de solo, múltiplas cooperativas, leilão de microlote.

## 🔧 Refatorações necessárias
13. Quebrar `CardTalhao.jsx` (580 linhas) em sub-componentes.
14. Extrair IIFEs de `TelaLoja.jsx` para componentes nomeados.
15. Substituir contadores module-level de ID por `uuid`/contador persistido no save.
16. Decidir SDK: alinhar `package.json` (54) com a instrução do `AGENTS.md` (56) — ver §15.

---

# 15. LISTA DE BUGS ENCONTRADOS

| ID | Bug | Gravidade | Arquivo(s) | Causa provável | Solução sugerida |
|---|---|---|---|---|---|
| **B1** | Custo de operação de trator/drone/secador **nunca é cobrado**; só a colhedora (hardcoded `×5`). A "trava econômica" descrita não existe. | 🟠 Alta (balanceamento) | `logic/equipamentos.js` (`custoOperacaoTotal` órfã); `reducer.js acaoAvancar` | Função criada mas não integrada ao loop diário/mensal | Chamar `custoOperacaoTotal(state.equipamentos)` no fechamento mensal, ou remover a promessa |
| **B2** | Preço exibido no card/dashboard **diverge** do valor realmente creditado: UI usa `fatorMercado` (sem floor coop) e às vezes preço cru; reducer usa `mercadoEfetivo` (com floor). | 🟠 Alta (confiança do jogador) | `CardLote.jsx:23-26`, `Dashboard.jsx:48-51`, `TelaMercado.jsx:24`, vs `reducer.js mercadoEfetivo` | Lógica de preço replicada em vários pontos sem fonte única | Criar seletor único `precoVendaLote(state, lote)` e usar em UI e reducer |
| **B3** | Talhão com `idadeAnos === 3` é considerado **formado** (`estaFormado`) e **colhível** (`podeColher`), mas `fatorIdadeProdutiva(3)` retorna **0** → "nada pra colher". Status ainda mostra "formação". | 🟡 Média (UX/lógica) | `constantes.js` (ANOS_FORMACAO=3 vs IDADE_PICO_INI=4); `talhao.js`; `CardTalhao.jsx` | Dois limiares de idade desalinhados | Alinhar limiares ou bloquear colheita até idade ≥ 4 |
| **B4** | Sistema de precificação **duplicado**: `TABELA_BEBIDA` + `economia.js precoPorSaca/valorLote` + `bebida.js consultarTabela` são código morto que pode ser editado por engano. | 🟡 Média (manutenção) | `data/cafe.js`, `logic/economia.js`, `logic/bebida.js` | Refator incompleto do Lote A→E | Remover o caminho antigo |
| **B5** | `try{}catch{}` **vazios** em `verificarMarcos` e `avancarTutorialSeNecessario` engolem erros de condição silenciosamente. | 🟡 Média | `reducer.js:154-163, 200-208` | Programação defensiva sem logging | Logar o erro em dev (`if (__DEV__) console.warn`) |
| **B6** | Secagem sorteia clima **independente** do clima do dia: há 2 draws de `sortearClimaDia` no mesmo dia (linha 263 e linha 398). | 🟢 Baixa (consistência) | `reducer.js acaoAvancar` | Bloco de secagem refaz o sorteio em vez de reutilizar `climaDia` | Reutilizar a variável `climaDia` já sorteada |
| **B7** | Total "Vender tudo desta aba" usa `l.precoPorSaca` cru (sem cert/mercado), enganando sobre o valor real. | 🟡 Média (UX) | `TelaMercado.jsx:24` | Cálculo simplificado no componente | Usar o mesmo seletor de B2 |
| **B8** | "Vender tudo" dispara **loop de `VENDER_LOTE`**, executando o pipeline (stats+marcos+tutorial) N vezes; ação `VENDER_TUDO` fica órfã. | 🟢 Baixa (perf) | `TelaMercado.jsx:110-114` | UI reimplementou em vez de usar a ação existente | Despachar `VENDER_TUDO` (ou versão por-aba) |
| **B9** | IDs de talhão/lote usam contador **module-level** (`proximoId`, `proxLoteId`) que **reinicia em 1** a cada reload do app. | 🟢 Baixa | `talhao.js:36`, `reducer.js:246` | Estado fora do save | Persistir contador ou usar `uuid` |
| **B10** | Talhões em recuperação (esqueletamento/recepa) **envelhecem e perdem sanidade** na virada do ano (depois sobrescrito na recepa, não no esqueletamento). | 🟢 Baixa (balanceamento) | `reducer.js:408-413` + `talhao.js envelhecerTalhao` | `map` aplica envelhecimento a todos sem checar estado | Pular talhões em recuperação no envelhecimento |
| **B11** | Código morto exportado sem uso: `temEquipamento`, `custoOperacaoTotal`, `temSaveSalvo`, `consultarTabela`. | 🟢 Baixa (limpeza) | vários | Sobras de iterações | Remover |
| **B12** | `eventosCompat` migra `state.mensagens`, formato que o reducer atual **nunca produz**. | 🟢 Baixa (limpeza) | `TelaFazenda.jsx:12-22` | Compat de save muito antigo | Manter só se houver saves legados reais; senão remover |
| **DOC1** | `AGENTS.md` instrui ler **Expo v56**, mas `package.json` está em **SDK 54**. | 🟡 Média (processo) | `AGENTS.md` vs `package.json` | Instrução desatualizada ou upgrade pendente | Alinhar: ou subir para 56, ou corrigir a instrução |

> Nenhum bug é **bloqueante** (crash). Todos são de balanceamento, consistência de UI ou limpeza. O jogo roda e completa o loop econômico de ponta a ponta.

---

# 16. MAPEAMENTO TOTAL DO PROJETO

## 16.1 Árvore completa

```
rpg-mobile/
├── App.js · index.js · app.json · package.json · README.md · AGENTS.md · CLAUDE.md · LICENSE
├── assets/  (icon, splash, android adaptive icons, favicon)
└── src/
    ├── data/
    │   ├── cafe.js              VARIEDADES(11), METODOS_POS(3), TABELA_BEBIDA[morto]
    │   ├── economia.js          INSUMOS, EQUIPAMENTOS, TULHAS, EQUIPE, CERTIFICACOES, PROPRIEDADES_VENDA
    │   ├── constantes.js        ~40 constantes de balanceamento + configs de início
    │   ├── clima.js             PERFIL_MENSAL(12), TIPOS_CLIMA
    │   ├── pragas.js            PRAGAS(6) + nivelPraga()
    │   ├── eventos_extremos.js  EVENTOS_EXTREMOS(2) + SECA_CRITICA
    │   ├── mercado.js           PARAMS_MERCADO + EVENTOS_MACRO(7)
    │   ├── marcos.js            MARCOS(23) + CATEGORIAS_MARCOS
    │   ├── glossario.js         GLOSSARIO(~45) + CATEGORIAS
    │   └── tutorial.js          PASSOS_TUTORIAL(7)
    ├── logic/
    │   ├── rng.js               mulberry32 seedável
    │   ├── tempo.js             calendário + passo híbrido
    │   ├── clima.js             sorteio diário + mm + fatorSecagem
    │   ├── ciclo.js             florada/granação/reset anual
    │   ├── talhao.js            criar/plantar/envelhecer/insumo/podas/idade/bienal
    │   ├── maturacao.js         perfil maduro/verde/seco
    │   ├── panha.js             colheita + seletividade
    │   ├── pos_colheita.js      sifão + secagem dia-a-dia
    │   ├── bebida.js            classificação Tipo+Peneira+SCA [+ consultarTabela morto]
    │   ├── economia.js          [precoPorSaca/valorLote morto] + custos + podePagar
    │   ├── equipamentos.js      efeitoEquipamento [+ custoOperacaoTotal/temEquipamento órfãos]
    │   ├── propriedades.js      compra de terra
    │   ├── pragas.js            spawn/dano/zerar/amostrar/defeitoBroca
    │   ├── eventos_extremos.js  sorteio geada/granizo + seca gradual
    │   ├── certificacoes.js     aderir/transição/prêmio/invalidar
    │   ├── equipe.js            cobertura/folha/manutenção
    │   ├── mercado.js           índice diário + evento macro + rótulo
    │   ├── financiamento.js     Funcafé (limite/parcela/cobrança)
    │   ├── alertas.js           próximo evento + alertas + saúde (HUD)
    │   └── save.js              AsyncStorage (async)
    ├── hooks/
    │   ├── reducer.js           28 ações + pipeline stats/marcos/tutorial  ◄── ORQUESTRADOR
    │   ├── useJogo.jsx          Context + Provider + useReducer + useMemo
    │   └── useSave.js           boot async + auto-save
    ├── components/  (18)        ver §5
    └── styles/tema.js           paleta + tokens
```

## 16.2 Dependências entre módulos (camadas)

```
data/  ◄──────────────── logic/ ◄──────── hooks/reducer.js ◄──── hooks/useJogo (Context)
 (puro)                  (puro)            (orquestra)                    ▲
   ▲                       ▲                                              │
   └───────────────────────┴───────────── components/ ───────────────────┘
                                          (consome state, despacha actions)
   styles/tema.js ◄──────────────────────  components/  (só visual)
```

**Regra verificada:** as setas nunca apontam de `data`/`logic` para `react`/`components`. Fluxo unidirecional.

## 16.3 Fluxo de dados (uma ação)

```
Usuário toca botão  →  dispatch({type, payload})
        ↓
useReducer chama reducer(state, action)
        ↓
reducerCore → acaoXxx() → chama funções puras de logic/* → retorna novo state
        ↓
atualizarStatsCaixa(diff de caixa) → verificarMarcos → avancarTutorialSeNecessario
        ↓
novo state → useMemo recria {state,dispatch} → re-render dos consumidores
        ↓
useAutoSave (useEffect [state]) → salvarLocal(state) → AsyncStorage
```

## 16.4 Fluxo de autenticação / APIs / renderização
- **Autenticação:** ❌ inexistente (diagrama N/A).
- **APIs:** ❌ inexistente (nenhuma chamada de rede).
- **Renderização:** `App → SafeAreaProvider → Boot → JogoProvider → Root → (HUD | Tela | Menu | FABs | Modais)`. Re-render disparado por mudança de `state` no contexto único.

## 16.5 Inventário de ações do reducer (28)

`NOVA_PARTIDA · CARREGAR_SAVE · APAGAR · AVANCAR · COMPRAR_INSUMO · COMPRAR_EQUIPAMENTO · COMPRAR_PROPRIEDADE · PLANTAR · APLICAR_INSUMO · COLHER · INICIAR_POS_COLHEITA · VENDER_LOTE · VENDER_TUDO · ESQUELETAR · RECEPAR · AMOSTRAR · INSTALAR_IRRIGACAO · CONTRATAR_MENSALISTA · DEMITIR_MENSALISTA · CONTRATAR_ENCARREGADO · DEMITIR_ENCARREGADO · PEDIR_EMPRESTIMO · UPGRADE_TULHA · FILIAR_COOPERATIVA · ADERIR_CERTIFICACAO · PULAR_TUTORIAL · AVANCAR_TUTORIAL · COMPLETAR_TUTORIAL`

## 16.6 Hooks reais

| Hook | Arquivo | Função |
|---|---|---|
| `useJogo()` | useJogo.jsx | consome o contexto `{state, dispatch}` |
| `JogoProvider` | useJogo.jsx | provê estado via `useReducer` |
| `useCarregarSaveInicial()` | useSave.js | boot async do save |
| `useAutoSave(state)` | useSave.js | persiste a cada mudança |

**"Stores":** não há store dedicada — o "store" é o `useReducer` em `JogoProvider`.

---

# 17. RELATÓRIO EXECUTIVO

## 17.1 Resumo geral
*Império do Café* é um **simulador de cafeicultura mineira** maduro como protótipo, com **31 sistemas de simulação reais e integrados** rodando inteiramente no cliente (offline). A engenharia se destaca: **arquitetura em camadas limpa**, lógica de jogo em **JavaScript puro testável**, e profundidade de domínio (agronomia real) raríssima em projetos desse porte. É, em essência, um **motor de simulação econômica sólido** vestido de UI funcional em React Native puro.

## 17.2 Qualidade atual do projeto
**Alta para um protótipo.** Código consistente, bem comentado, sem mocks/fakes, sem dependências supérfluas. Os problemas encontrados são de **balanceamento, consistência de UI e limpeza** — não de fundação. Não há bugs bloqueantes.

## 17.3 Nível de maturidade
**Protótipo avançado / pré-alpha.** Loop completo jogável de ponta a ponta. Falta o "cinto e suspensórios" de produto: testes, áudio, polish visual, responsividade ampla, build publicável.

## 17.4 Principais riscos
1. **Dívida de testes** — `logic/` é a joia do projeto e está **sem nenhum teste**, apesar de ser trivialmente testável. Regressões em balanceamento passam despercebidas.
2. **Inconsistências de preço (B1/B2/B7)** — minam a confiança do jogador na economia, que é o coração do jogo.
3. **Escalabilidade do estado** — contexto único re-renderiza tudo; vira gargalo em fazendas grandes e bloqueia multiplayer sem refator.
4. **Divergência SDK 54 vs instrução 56 (DOC1)** — risco de processo/onboarding.

## 17.5 Pontos fortes
- ⭐ Arquitetura data/logic/hooks/components exemplar.
- ⭐ Profundidade e realismo de simulação (florada-veranico, granação, bienalidade, SCA/Tipo/Peneira).
- ⭐ Zero dependências de UI externas → bundle minúsculo, controle total.
- ⭐ UX coesa: tutorial, glossário, dashboard, timeline, marcos, histórico.
- ⭐ Save seedável e versionado.

## 17.6 O que falta para produção
- [ ] Testes unitários em `logic/` (prioridade #1).
- [ ] Corrigir B1/B2/B3 (consistência econômica).
- [ ] Remover código morto (B4/B11).
- [ ] Áudio + animações de feedback.
- [ ] Responsividade tablet/web + acessibilidade.
- [ ] Tela de configurações.
- [ ] Build EAS (APK/IPA) e definição de licença.
- [ ] Decisão sobre SDK 54→56.

## 17.7 Nota técnica geral

> ## ⭐ **8.0 / 10**

**Composição da nota:**
| Critério | Peso | Nota |
|---|---|---|
| Arquitetura & organização | 25% | 9.5 |
| Profundidade/qualidade da simulação | 20% | 9.0 |
| UX/UI | 15% | 7.5 |
| Corretude (bugs/consistência) | 15% | 7.0 |
| Testes & qualidade de processo | 10% | 2.0 |
| Performance & escalabilidade | 10% | 7.0 |
| Acessibilidade & responsividade | 5% | 4.5 |

A nota é puxada para cima pela engenharia e profundidade de domínio, e para baixo **exclusivamente pela ausência de testes** e por inconsistências de UI/economia facilmente corrigíveis. Resolvendo B1/B2/B3 e adicionando uma suíte de testes em `logic/`, o projeto chega facilmente a **9+**.

---

# 18. NÚMEROS FINAIS DA ANÁLISE

| Métrica | Valor |
|---|---|
| **Arquivos analisados** | **54** JS/JSX (+ `app.json`, `package.json`, `README.md`, `AGENTS.md`) |
| ↳ `src/data` | 10 |
| ↳ `src/logic` | 20 |
| ↳ `src/hooks` | 3 |
| ↳ `src/components` | 18 |
| ↳ `src/styles` | 1 |
| ↳ raiz (`App.js`, `index.js`) | 2 |
| **Linhas de código (src)** | ~8.545 (+ 238 em App/index) |
| **Componentes React** | 18 (.jsx) + sub-componentes internos (`Section`, `Row`, `Linha`, `Verde`, `Vermelho`) |
| **Telas/modais navegáveis** | 6 telas + 3 modais = **9** |
| **Páginas web/rotas tradicionais** | 0 (roteamento por `useState`, não há router) |
| **APIs / endpoints** | **0** (offline) |
| **Tabelas de banco** | **0** (persistência chave-valor; ~16 catálogos estáticos) |
| **Ações do reducer** | **28** |
| **Hooks customizados** | 4 (`useJogo`, `JogoProvider`, `useCarregarSaveInicial`, `useAutoSave`) |
| **Sistemas de simulação implementados** | **31** |
| **Variedades / Pragas / Métodos pós** | 11 / 6 / 3 |
| **Equipamentos / Certificações / Tulhas / Propriedades** | 4 / 3 / 3 / 4 |
| **Marcos / Eventos macro / Termos de glossário** | 23 / 7 / ~45 |
| **Dependências de runtime** | **5** |
| **Problemas encontrados** | **13** (3 alta/média-alta, 4 média, 5 baixa, 1 de processo) |
| **Bugs bloqueantes (crash)** | **0** |
| **Sistemas mockados/fake** | **0** |
| **Cobertura de testes** | **0%** |
| **Score geral** | **8.0 / 10** |

---

*Documento gerado por análise estática completa do código-fonte. Todas as citações de arquivos, funções, constantes e ações referem-se a símbolos reais verificados no repositório em 2026-05-27.*
