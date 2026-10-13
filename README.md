# Império do Café — Zona da Mata

**English** · [Português](README.pt-BR.md)

A mobile coffee-farming simulator set in Minas Gerais, Brazil, in the spirit of a "Brasfoot for coffee": menu- and screen-driven management, no 3D graphics. Grow from a small starter plot to an empire of certified farms. The game itself is in Brazilian Portuguese.

> **Type:** personal project — mobile game in development (not yet published on app stores). Built with React Native + Expo; local save via AsyncStorage, fully offline.

<p align="center">
  <img src="docs/screenshots/imperio-cafe.jpg" alt="Império do Café farm screen: harvest timeline, inventory and coffee plot" width="268">
</p>

## What it is

You are a coffee grower in the Zona da Mata region of Minas Gerais. You start with one small plot (ready-to-harvest "rocinha") or bare land and have to turn it into a profitable farm over many harvests.

**Core loop:** plant → manage → harvest → process → sell → reinvest → expand. A new plantation takes about 3 years to mature and produce.

## Implemented systems

### Agronomic cycle
- **11 varieties** with their own traits (Catuaí, Bourbon Amarelo/Vermelho, Topázio, Acaiá, Paraíso MGS 2, Arara, Catucaí, Conilon...)
- **3 planting densities** (traditional, dense, super-dense) and full sun vs. shaded
- **Flowering after dry spells**, **bean filling** driven by Jan–Mar rainfall, **biennial bearing** and an age/productivity curve

### Crop management
- Fertilizer, lime (delayed effect) and pesticide
- Skeleton pruning and stumping; per-plot irrigation
- Monthly workers + foreman

### Pests and diseases
- **6 pests/diseases** with seasonality (leaf miner, berry borer, rust, leafhopper, cercospora, phoma)
- Sampling reveals the active pest; resistant varieties reduce rust

### Post-harvest
- **3 methods**: Natural, Pulped Natural (CD) and Washed; a siphon washer separates ripe cherries from floaters
- **Day-by-day drying** with seeded weather; a mechanical dryer ignores rain

### Market and economy
- **Tipo BRASIL × screen size × SCA score** grading; micro-lots when SCA ≥ 85
- Daily market index and **7 macro events**
- **Specialty coffee auction**, **3 certifications** (Rainforest, Fair Trade, Organic), cooperative and Funcafé financing
- Limited-capacity storage (50/150/500 bags), **7 pieces of equipment** and **10 properties** for sale

### Extreme events
- Black frost, hail and severe drought

### Progression and UX
- **7-step tutorial**, **glossary** with 49 terms, dashboard with revenue × expenses
- **23 milestones** in 9 categories, **12 missions**, **5 levels** with unlocks, regional festivals and extension (ATER) courses
- HUD with alerts and next event, 12-month timeline, filterable event history
- Menu music with music/sound-effect toggles under **Configurações** (Settings)

## Stack

| | |
|---|---|
| Framework | Expo SDK 54 (`expo ~54.0.0`) |
| UI | React Native 0.81.5 / React 19.1.0 |
| State | `useReducer` + Context |
| Persistence | `@react-native-async-storage/async-storage` |
| Audio | `expo-audio` |
| RNG | seedable mulberry32 |
| Language | JavaScript |
| Platforms | iOS + Android (via Expo Go or an EAS build) |

No external UI libraries — everything is built from React Native components.

## Getting started

### Prerequisites
- Node.js **20.19.4 or later** (required by React Native 0.81 / Metro)
- Expo Go on your phone (iOS/Android), with computer and phone on the same network

### Setup
```bash
git clone https://github.com/rickjs2005/rpg-mobile
cd rpg-mobile
npm ci
npx expo start --lan
```

Scan the QR code with Expo Go (on iOS, the native camera works).

No environment variables are needed.

### Available scripts
| Command | What it does |
|---|---|
| `npm start` | `expo start` |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | `expo start --web` (requires installing `react-dom` and `react-native-web`, which are not in the project) |

To check the JS bundle without a native build: `npx expo export --platform android`.

Store builds use EAS (`eas.json` with `development`, `preview` and `production` profiles); the launch checklist (in Portuguese) is in [docs/LANCAMENTO.md](docs/LANCAMENTO.md).

## Project structure

```
App.js              shell: SafeArea + HUD + screens + bottom menu
src/
├── data/           pure data (varieties, economy, weather, pests, market, milestones, glossary, tutorial...)
├── logic/          pure simulation functions (no React)
├── hooks/          reducer, Context (useJogo) and save
├── components/     screens and cards (Pressable, View, Text)
├── audio/          audio engine and sound registry
├── state/          global statistics
└── styles/tema.js  palette and visual constants
assets/             icons, splash, illustrations and menu music
docs/               game documentation, launch checklist and visual references (ref-*.html/png), in Portuguese
```

Core rule: no component contains simulation logic, and no `logic/` module imports React.

## Save data

Saved automatically to the device's AsyncStorage, with multiple farm slots (keys `imperio-cafe-save-v1-slot{n}`; an old single-key save is migrated to slot 0). To start over, delete the farm on the start screen.

## Limitations

- No automated tests, linting or type checking are configured.
- Not yet published on app stores; launch to-dos are in [docs/LANCAMENTO.md](docs/LANCAMENTO.md).
- Most sound effects do not exist yet (the engine skips missing sounds); only the menu music is included.
- The economy balance is still being tuned.

## Credits and media

- **Menu music** (`assets/audio/menu.mp3`): "Echoes Beyond Horizons" from StockTune. The license terms still need to be confirmed by the author (see [assets/audio/README.md](assets/audio/README.md)).
- **Logo, mascot and illustrations** in `assets/`: AI-generated according to the launch checklist; commercial-use rights still need to be confirmed.
- Real names (Cocatrel, Funcafé, DJI Agras, Rainforest Alliance, Fair Trade, Cup of Excellence, etc.) appear only as thematic references; the game is not affiliated with these companies or institutions.
- Inspirations: Brasfoot, Stardew Valley, Farming Simulator and real coffee farming in the Zona da Mata.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

The repository contains a [LICENSE](LICENSE) file with the MIT License text; its copyright line (650 Industries, Inc., aka Expo) comes from the Expo template. Third-party media listed under "Credits and media" follow the terms of their respective sources.
