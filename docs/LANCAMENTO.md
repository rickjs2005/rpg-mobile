# 🚀 Checklist de Build & Lançamento — Império do Café

Roteiro do que falta pra publicar na **Google Play** e **App Store**.
Marque `[x]` conforme for concluindo.

---

## 0. Pré-build (decisões permanentes)

- [ ] **Confirmar o identifier** `com.rickjs.imperiodocafe` (em `app.json`:
      `android.package` e `ios.bundleIdentifier`). ⚠️ É **permanente** depois
      do 1º envio à loja — não dá pra mudar sem republicar como app novo.
- [ ] Definir a **versão inicial**: `app.json` → `expo.version` (ex. `1.0.0`).
      Android usa `android.versionCode` (inteiro, sobe a cada build);
      iOS usa `ios.buildNumber`. O EAS pode auto-incrementar.

## 1. Balanceamento (validar na mão antes de congelar a 1.0)

- [ ] Jogar no **device real** (Expo Go) e sentir se o custo de manutenção
      **R$60/ha/mês** (`CUSTO_MANUTENCAO_HA_MES` em `src/data/constantes.js`)
      está apertado/frouxo demais. É um chute calibrado só em sim headless.
- [ ] Conferir a curva early-game (anos 1–3) na mão: não pode sufocar quem
      começa nem virar dinheiro grátis no late game.

## 2. Conta de desenvolvedor + ferramentas

- [ ] **Google Play Console** — conta de desenvolvedor (taxa única ~US$25).
- [ ] **Apple Developer Program** — conta (US$99/ano). iOS exige.
- [ ] Instalar/login **EAS CLI**: `npm i -g eas-cli` + `eas login`.
- [ ] `eas build:configure` (já temos `eas.json` com perfis `preview` e
      `production` — conferir se está atualizado).

## 3. Assets da loja

- [ ] **Ícone** 1024×1024 (já temos `assets/icon.png` — mascote do café). ✅
- [ ] **Feature graphic** Google Play: 1024×500.
- [ ] **Screenshots** (telefone): mínimo 2, ideal 4–8. Capturar Tela de
      Início, Fazenda (mapa), Mercado/leilão, Loja, HUD.
- [ ] (Opcional) Screenshots de **tablet** se for marcar suporte.
- [ ] **Descrição curta** (80 caracteres) + **descrição completa** da loja.
- [ ] **Vídeo de preview** (opcional, mas ajuda muito na conversão).

## 4. Conformidade legal (bloqueiam a publicação)

- [ ] **Política de privacidade** hospedada numa URL pública (Play e App
      Store exigem link, mesmo sem coletar dados — declarar que não coleta).
- [ ] **Licença do áudio** `assets/audio/menu.mp3` (StockTune "Echoes Beyond
      Horizons") — confirmar uso **comercial** e guardar comprovante.
      Ver `assets/audio/README.md` (checklist de créditos).
- [ ] **Licença das imagens de IA** (logo/mascote e arte) — confirmar direito
      de uso comercial.
- [ ] **Classificação etária** (questionário IARC na Play / Apple rating).
- [ ] **Data safety / App Privacy** — preencher o formulário de dados
      (provavelmente "não coleta dados", já que é offline com save local).

## 5. Build

- [ ] **APK de teste** (instala direto no celular, sem loja):
      `eas build -p android --profile preview`
- [ ] **AAB de produção** (Google Play exige .aab):
      `eas build -p android --profile production`
- [ ] **IPA de produção** (App Store):
      `eas build -p ios --profile production`
      (precisa de credenciais Apple — o EAS guia o processo).
- [ ] Instalar o APK num **device real** e fazer um playtest de ponta a ponta
      (nova partida → plantar → colher → vender → leilão → save/load).

## 6. Envio às lojas

- [ ] **Google Play**: criar o app no Console, subir o `.aab`, preencher
      ficha da loja, classificação, data safety, e enviar pra revisão.
      (`eas submit -p android` automatiza o upload.)
- [ ] **App Store**: criar o app no App Store Connect, subir o `.ipa`,
      preencher metadados, e enviar pra revisão.
      (`eas submit -p ios` automatiza.)
- [ ] Aguardar revisão (Play: horas a ~2 dias; Apple: ~1–3 dias).

---

## ⚠️ Lembrete sobre o splash/Expo Go

No **Expo Go** o splash nativo SEMPRE mostra o logo do Expo (▲) — isso é
limitação do Expo Go, não bug. O splash customizado (mascote do café) só
aparece num **build EAS** real. Validar o splash só no APK, não no Go.

---

_Última atualização: 2026-05-27. Estado do jogo: 22 sistemas, balanceamento
calibrado em sim headless, falta validar no device + assets/legal da loja._
