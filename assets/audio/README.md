# Áudio do Império do Café

A fiação de áudio já está pronta (modo **silencioso**). Pra ativar um som,
solte o arquivo aqui e troque o `null` correspondente em
`src/audio/sons.js` pelo `require`. Exemplo:

```js
// src/audio/sons.js
vender: require("../../assets/audio/vender.m4a"),
```

O motor (`src/audio/engine.js`) ignora qualquer som ainda `null`, então o
jogo roda normalmente sem nenhum arquivo presente.

## Formatos
- **SFX:** `.m4a`/`.aac`, curtos (< 1s), volume moderado.
- **Músicas:** `.m4a`, loop limpo (~1–2 min).

> Esta tabela é também o **CREDITS** pré-formatado: ao baixar um arquivo,
> troque ⏳ por ✅ e preencha Fonte/Licença/Atribuição. Lotes sugeridos por
> impacto: **1** UI (ui_click, ui_modal, erro) → **2** ações (vender, comprar,
> plantar, colher) → **3** música (menu, jogo) → **4** especiais (marco,
> geada_negra, granizo) → **5** polimento (resto).

## Efeitos (SFX)
| Chave | Arquivo sugerido | Quando toca | Lote | Status | Fonte | Licença | Atribuição |
|---|---|---|:---:|:---:|---|---|---|
| ui_click | ui_click.m4a | toque em botão | 1 | ⏳ | - | - | - |
| ui_modal | ui_modal.m4a | abrir/fechar modal | 1 | ⏳ | - | - | - |
| erro | erro.m4a | ação inválida / caixa insuficiente | 1 | ⏳ | - | - | - |
| vender | vender.m4a | venda (ka-ching) | 2 | ⏳ | - | - | - |
| comprar | comprar.m4a | compra/aquisição | 2 | ⏳ | - | - | - |
| plantar | plantar.m4a | plantio | 2 | ⏳ | - | - | - |
| colher | colher.m4a | colheita | 2 | ⏳ | - | - | - |
| marco | marco.m4a | conquista (fanfarra) | 4 | ⏳ | - | - | - |
| geada_negra | geada_negra.m4a | evento extremo | 4 | ⏳ | - | - | - |
| granizo | granizo.m4a | evento extremo | 4 | ⏳ | - | - | - |
| avancar | avancar.m4a | passar o tempo | 5 | ⏳ | - | - | - |
| secagem | secagem.m4a | terreiro / lote pronto | 5 | ⏳ | - | - | - |
| insumo | insumo.m4a | adubo/calcário/defensivo | 5 | ⏳ | - | - | - |
| praga | praga.m4a | praga detectada | 5 | ⏳ | - | - | - |
| poda | poda.m4a | esqueletar/recepar | 5 | ⏳ | - | - | - |
| florada | florada.m4a | florada | 5 | ⏳ | - | - | - |
| alerta | alerta.m4a | alerta crítico | 5 | ⏳ | - | - | - |

## Músicas
| Chave | Arquivo sugerido | Quando toca | Lote | Status | Fonte | Licença | Atribuição |
|---|---|---|:---:|:---:|---|---|---|
| menu | menu.mp3 | tela de início | 3 | ✅ | StockTune — "Echoes Beyond Horizons" | (verificar termos StockTune) | - |
| jogo | jogo.m4a | dentro do jogo | 3 | ⏳ | - | - | - |
| secagem | musica_secagem.m4a | durante a secagem | 5 | ⏳ | - | - | - |

## Preferências
Música e Efeitos podem ser ligados/desligados em **Configurações** (no menu).
A preferência é global (vale no menu também) e persiste no AsyncStorage.
