# ☕ Império do Café — Zona da Mata

Simulador de cafeicultura mineira no estilo "Brasfoot do café": gestão por menus e telas, sem gráficos 3D. Do aperto de uma rocinha pequena ao império de fazendas certificadas.

Construído pra **iPhone / Android** com React Native + Expo. Save no AsyncStorage, jogo 100% offline.

---

## 🎯 O que é

Você é um cafeicultor da Zona da Mata de Minas Gerais. Começa com 1 talhão pequeno (rocinha pronta) ou terra nua, e precisa transformar isso numa fazenda lucrativa ao longo de muitas safras.

**Loop central**:
plantar → conduzir → colher → processar → vender na corretora → reinvestir → expandir.

Fidelidade temporal: lavoura nova leva **~3 anos** pra formar e produzir.

---

## 🧠 22 sistemas implementados

### Ciclo agronômico
- **11 variedades** com traços próprios (Catuaí, Bourbon Amarelo/Vermelho, Topázio, Acaiá, Paraíso MGS 2, Arara, Catucaí, Conilon...)
- **3 densidades de plantio** (tradicional, adensado, super-adensado) com trade-offs reais
- **Sombreamento** (sol pleno vs sombreado) — −35% produção, +bebida, −pragas
- **Florada-veranico**: precisa de 10 dias secos + chuva ≥5mm em set-out
- **Granação** dependente de chuva acumulada em jan-mar
- **Bienalidade** alta/baixa modulada por variedade
- **Curva idade-produtiva**: pico 4-6, estável 7-15, declínio depois

### Manejo
- **Adubo / Calcário / Defensivo** (calcário com efeito atrasado 90d)
- **Esqueletamento** (poda média, perde 1 safra)
- **Recepa** (poda drástica, renova lavoura)
- **Irrigação** por talhão (zera veranico)
- **Mensalistas + Encarregado** (cobertura proporcional + bonus na panha)

### Pragas e doenças
- **6 pragas** com sazonalidade: bicho-mineiro, broca, ferrugem, cigarrinha, cercospora, mancha-de-phoma
- **Amostragem** (R$50) revela qual praga está ativa
- Variedade resistente (Paraíso, Arara) reduz spawn de ferrugem
- Broca gera defeitos brocados no lote final

### Pós-colheita
- **3 métodos**: Natural / Cereja Descascado (CD) / Lavado
- **Lavador-sifão** separa cereja (denso) de boia (verde+seco) em CD/Lavado
- **Secagem dia-a-dia** com clima sorteado por seed (umidade 60% → 12%)
- **Secador mecânico** ignora chuva

### Mercado
- **Classificação multi-dimensional**: Tipo BRASIL (2-8) × Peneira (12-19) × SCA (60-95)
- **Microlote** automático quando SCA ≥ 85 (preço 2.5x a 5x)
- **Mercado dinâmico**: índice da bolsa oscila 0.65 a 1.45x diariamente
- **7 eventos macro**: geada concorrente, crise Vietnã, supersafra Colômbia, recessão EUA...
- **3 certificações** (Rainforest, Fair Trade, Orgânico) com bônus cumulativos +10/+30/+35%
- **Cooperativa Cocatrel**: −15% insumos + piso 95% no preço de venda
- **Financiamento Funcafé**: empréstimo subsidiado, 12 parcelas, 10% juros total

### Infraestrutura
- **Tulha** com capacidade limitada (50/150/500 sacas) — excedente vai pra venda forçada
- **4 equipamentos**: trator, drone DJI Agras, secador mecânico, colhedora
- **Regra dos 15% de inclinação**: trator/colhedora perdem força em montanhoso, drone brilha
- **4 propriedades à venda** (nua ou pronta)

### Eventos climáticos extremos
- **Geada negra** (jun-jul): −50% sanidade em TODOS os talhões + quebra florada
- **Granizo** (out-fev): −30% em 1 talhão random
- **Seca crítica**: veranico > 25 dias = dano gradual

---

## 🎨 UX

- **Tutorial guiado** em 7 passos com triggers automáticos (avança quando jogador executa a ação)
- **Glossário** com 40+ termos técnicos (SCA, Tipo BRASIL, veranico, recepa...) em modal full-screen
- **Dashboard 📊** com lucro YTD, melhor lote, gráfico anual de receita × despesa
- **HUD enriquecido** com próximo evento, saúde da fazenda, alertas críticos
- **Timeline visual** dos 12 meses + marcos do ano agrícola
- **23 marcos/achievements** desbloqueáveis em 9 categorias
- **Histórico persistente** de 500 eventos com filtros por categoria

---

## 🛠️ Stack

| | |
|---|---|
| Framework | **Expo SDK 54** |
| UI | **React Native 0.81** |
| Estado | **useReducer + Context** (sem Redux/Zustand) |
| Persistência | **AsyncStorage** |
| RNG | **mulberry32** seedável |
| Linguagem | **JavaScript** (sem TypeScript por enquanto) |
| Plataforma alvo | **iOS + Android** |

**Sem dependências de UI externas** — tudo em RN puro (Pressable, View, Text, StyleSheet).

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- Expo Go instalado no iPhone/Android (App Store / Google Play)
- PC e celular na mesma rede WiFi

### Setup
```bash
git clone https://github.com/rickjs2005/rpg-mobile
cd rpg-mobile
npm install
npx expo start --lan
```

### Abrir no celular
1. Abre o **Expo Go** no celular
2. Escaneia o QR code que aparece no terminal (Câmera nativa do iOS funciona)
3. Bundle inicia (~30s na primeira vez)

---

## 📁 Estrutura

```
src/
├── data/           → dados puros (constantes, catálogos, sem lógica)
│   ├── cafe.js              variedades, métodos pós, tabela bebida
│   ├── economia.js          insumos, equipamentos, propriedades, certs, equipe, tulhas
│   ├── constantes.js        números de balanceamento centralizados
│   ├── clima.js             perfis mensais de chuva/sol/geada
│   ├── pragas.js            6 pragas com sazonalidade
│   ├── eventos_extremos.js  geada, granizo
│   ├── mercado.js           parâmetros da bolsa + eventos macro
│   ├── marcos.js            23 achievements
│   ├── glossario.js         40+ termos
│   └── tutorial.js          7 passos do onboarding
│
├── logic/          → funções puras, JS, testáveis sem React
│   ├── rng.js               mulberry32 seedável
│   ├── tempo.js             calendário + passo híbrido (semana / 1 dia em secagem)
│   ├── clima.js             sorteio diário + mm de chuva
│   ├── ciclo.js             florada-veranico, granação, reset anual
│   ├── talhao.js            criar, plantar, formar, envelhecer, podas
│   ├── maturacao.js         perfil maduro/verde/seco por mês
│   ├── panha.js             colheita com seletividade
│   ├── pos_colheita.js      secagem dia-a-dia + lavador-sifão
│   ├── bebida.js            classificação Tipo + Peneira + SCA
│   ├── economia.js          preços base
│   ├── equipamentos.js      modificadores por terreno
│   ├── propriedades.js      compra de terra
│   ├── pragas.js            spawn, dano, defensivo
│   ├── eventos_extremos.js  sorteio + aplicação
│   ├── certificacoes.js     adesão, transição, prêmio
│   ├── equipe.js            cobertura, folha, manutenção
│   ├── mercado.js           atualização diária do índice
│   ├── financiamento.js     Funcafé
│   ├── alertas.js           saúde, próximo evento (consumido pelo HUD)
│   └── save.js              AsyncStorage isolado
│
├── hooks/          → ponte React (estado + side effects)
│   ├── reducer.js           reducer puro, 30+ ações, tracking auto
│   ├── useJogo.jsx          Context + Provider + useReducer
│   └── useSave.js           load/save async
│
├── components/     → UI (Pressable, View, Text)
│   ├── Botao.jsx
│   ├── HUD.jsx              caixa, data, fase, alertas, próximo evento
│   ├── Menu.jsx             tab bar bottom 5 abas
│   ├── BalaoTutorial.jsx
│   ├── Glossario.jsx        modal full-screen
│   ├── Dashboard.jsx        modal full-screen
│   ├── HistoricoEventos.jsx modal
│   ├── Timeline.jsx         strip horizontal dos 12 meses
│   ├── TelaInicio.jsx       escolha de modo (rocinha pronta / terra nua)
│   ├── TelaFazenda.jsx
│   ├── TelaLoja.jsx
│   ├── TelaPropriedades.jsx
│   ├── TelaMercado.jsx
│   ├── TelaSafra.jsx
│   ├── CardTalhao.jsx       picker densidade + sol/sombra + ações contextuais
│   ├── CardEquipamento.jsx
│   ├── CardPropriedade.jsx
│   └── CardLote.jsx
│
├── styles/
│   └── tema.js              paleta + constantes visuais (cores, raios, fontes)
│
└── App.js          shell: SafeArea + HUD + ScrollView + Menu + 2 FABs
```

**Regra arquitetural central**: nenhum componente tem lógica de simulação; nenhum módulo de `logic/` importa React. A lógica de jogo é JavaScript puro e testável.

---

## 🎮 Como jogar (5 min)

1. **Tela de início** → escolhe "Rocinha pronta" (R$5.000 + Catuaí formado)
2. **Tutorial guiado** te leva pelos primeiros passos
3. **Fazenda** → vê o talhão, inventário, eventos, timeline
4. **HUD topo**: caixa, data, próximo evento. Toca em "▶ Avançar 1 semana"
5. Quando chegar em **maio-agosto** + lavoura formada + florada OK no ciclo anterior: **colhe**
6. **Safra** → escolhe método pós (Natural / CD / Lavado) — CD/Lavado separa cereja de boia
7. **Avançar 1 dia × N** durante secagem (acompanha umidade 60% → 12%)
8. Lote vai pro **estoque** com classificação Tipo + Peneira + SCA
9. **Mercado** → aba Commodity ou ⭐ Microlote, vende quando índice está alto
10. **Loja** → adubo, equipamentos, mensalistas, Funcafé, certificações
11. **Terras** → expande comprando propriedades
12. **📊 Painel** (FAB inferior) → veja progresso, marcos, gráfico anual
13. **📖 Glossário** (FAB inferior) → consulte termos técnicos

---

## 💾 Save

Salvamento automático no `AsyncStorage` do dispositivo, chave `imperio-cafe-save-v1`. Fechou o app → reabriu → continua de onde parou.

Pra apagar e começar nova partida: botão "🗑️ Apagar save" no fim de qualquer tela.

---

## 📚 Inspirações

- **Brasfoot** (jogo de manager de futebol brasileiro): UX por menus, sem 3D
- **Stardew Valley**: comunicar visualmente o estágio sem palavras
- **Farming Simulator**: profundidade de sistemas agrícolas
- **Cafeicultura real da Zona da Mata** (Embrapa, Procafé, Cooxupé, Cocatrel)

---

## 🛣️ Roadmap futuro (ideias)

- [ ] Análise de solo (decisão informada de calagem)
- [ ] Múltiplas cooperativas (Cocatrel vs Cooxupé com vantagens diferentes)
- [ ] Concursos de microlote (vender em leilão com preço explosivo)
- [ ] Multiplayer / ranking (save atualmente é isolado pra preparar isso)
- [ ] Build APK Android publicável
- [ ] Sons + animações (polish)
- [ ] Testes unitários nos módulos de `logic/`

---

## 🤝 Contribuições

Issues e PRs são bem-vindos. O código é deliberadamente simples (sem TypeScript, sem state library, sem chart lib) pra facilitar entrada de novos contribuidores.

---

## 📜 Licença

Por definir.
