# SENTINELX — Network Intelligence & Investigation Platform

An investigation platform prototype built by **Team SENTINELX** for Smart India
Hackathon 2026 (**SIH2026** — AI-Powered Criminal Network Analysis System,
Ministry of Home Affairs / NCRB, Cybersecurity & Blockchain theme).

> **Simulation only.** All data is fictional. The application performs no
> surveillance, tracking, scraping or collection of real personal information.
> It is frontend-only — no backend, no API keys, no external services.

## Run it

```bash
npm install
npm run dev
```

```bash
npm run build     # type-check + production build
npm run preview   # serve the production build
```

## Two experiences

SENTINELX is a **product** that contains a **demo** — not a demo pretending to be
a product.

**Platform mode** is the real application. It opens on a landing screen, then a
Home workspace. Nothing is pre-loaded: you open an investigation, create one, or
go to the Demo Center. A newly created investigation is genuinely empty and every
screen shows a proper empty state.

**Demo mode** is entered deliberately from the Demo Center. It plays a cinematic
intro, shows a persistent `DEMO MODE` banner so nobody mistakes sample data for
live intelligence, and offers a six-step guided walkthrough with previous/next
controls. `Exit demo` returns to the Demo Center at any time.

## Architecture

An **investigation** owns a slice of the entity pool. Every screen renders
whatever the *active* investigation contains, resolved through `useDataset()` —
no component imports the sample data directly. Swapping investigations swaps
every screen, and a backend can later replace `selectDataset()` without touching
the UI.

```
src/data/investigations.ts   investigation model + dataset selector + scenarios
src/hooks/useDataset.ts      the only way screens read data
src/store/store.tsx          phase · section · investigations · demo state
```

```
SENTINELX
├── Landing            Enter Platform / Explore Demo
└── Platform
    ├── Home           recent investigations, quick actions, alerts, high-risk
    ├── Investigations list, create, archive
    ├── Network        interactive intelligence graph
    ├── AI             link prediction triage, pattern detection, findings
    ├── Risk           distribution + explainable factor breakdown
    ├── Entities       searchable registry
    ├── Case files     dossiers
    ├── Evidence       evidence vault
    ├── Alerts         alert stream
    ├── Reports        compile / print / download
    ├── Demo Center    scenario selection → demo mode
    └── System         project, team and workspace controls
```

## Presenting to the panel

1. Open SENTINELX → **Demo Center** (top bar, always visible)
2. **Operation Nightfall** → *Start demo*
3. Cinematic intro plays (skippable), guided walkthrough opens automatically
4. Six steps, each with its own action button: focus the suspect → trace
   connections → run AI → reveal hidden links → risk breakdown → generate report

Nothing needs to be found in a menu mid-presentation. You can exit the guide and
drive manually at any point while staying in demo mode.

## Demo scenarios

| Scenario | Opens into |
| --- | --- |
| Operation Nightfall | Guided six-step walkthrough |
| Financial Network | Focused on the flagged transaction, follow the money |
| Hidden Connections | Straight into prediction triage |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` or `⌘/Ctrl + K` | Command palette & global search |
| `D` | Demo Center |
| `N` | Network graph |
| `A` | Run AI analysis |
| `H` | Trace hidden connections |
| `T` | Trace focused entity |
| `L` | Toggle timeline |
| `R` | Generate report |
| `Esc` | Close the top-most layer, then return home |

## Sample dataset

The bundled **Operation Nightfall** sample investigation contains 32 entities,
50 relationships, 17 timeline events, 9 alerts, 3 case files, 8 evidence items
and 4 link predictions — spanning persons, organizations, locations, phones,
emails, IP addresses, crypto wallets, bank accounts, transactions, social
accounts, devices and vehicles.

## Before presenting

Fill in the real team roster in `src/data/product.ts` (`TEAM_MEMBERS`) — it
renders in the **System** section.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Lucide React · d3-force
