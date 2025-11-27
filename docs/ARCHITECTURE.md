# Quantum Falcon Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         QUANTUM FALCON COCKPIT                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Dashboard     │  │  Strategy Hub   │  │   Trading Hub   │         │
│  │   • PnL Widget  │  │  • Builder      │  │  • Live Orders  │         │
│  │   • Bot Status  │  │  • Backtest     │  │  • Agent Snipe  │         │
│  │   • Analytics   │  │  • Templates    │  │  • DEX Execution│         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│  ┌────────┴────────────────────┴────────────────────┴────────┐         │
│  │                     STATE MANAGEMENT                       │         │
│  │  • usePersistentAuth (Authentication)                      │         │
│  │  • useKVSafe (Persistent Storage)                          │         │
│  │  • useMarketFeed (Real-time Data)                          │         │
│  │  • React Query (Server State)                              │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                    CORE SERVICES LAYER                       │       │
│  ├──────────────┬──────────────┬──────────────┬────────────────┤       │
│  │ Auth Service │ License Svc  │ Trading Svc  │ Analytics Svc  │       │
│  │ • Login      │ • Validation │ • Execute    │ • Track        │       │
│  │ • Register   │ • Tier Check │ • Backtest   │ • Report       │       │
│  │ • Master Key │ • Expiry     │ • Simulate   │ • Web Vitals   │       │
│  └──────────────┴──────────────┴──────────────┴────────────────┘       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                      AI AGENTS LAYER                         │       │
│  ├────────────┬────────────┬────────────┬────────────┬─────────┤       │
│  │ DCA Basic  │ Whale      │ Liquidity  │ MEV        │ Quantum │       │
│  │ (Free)     │ Shadow     │ Hunter     │ Protection │ Ensemble│       │
│  │            │ (Pro)      │ (Pro)      │ (Pro)      │ (Elite) │       │
│  └────────────┴────────────┴────────────┴────────────┴─────────┘       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                    EXTERNAL INTEGRATIONS                     │       │
│  ├──────────────┬──────────────┬──────────────┬────────────────┤       │
│  │ Solana RPC   │ CoinGecko    │ Metaplex     │ Exchange APIs  │       │
│  │ • Jupiter    │ • Prices     │ • NFT Mint   │ • Binance      │       │
│  │ • Helius     │ • Market Cap │ • Arweave    │ • Kraken       │       │
│  └──────────────┴──────────────┴──────────────┴────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
quantum-falcon-cockp/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   ├── dependabot.yml          # Security updates
│   └── CODEOWNERS              # Review requirements
├── docs/
│   ├── API.md                  # API documentation
│   ├── ARCHITECTURE.md         # This file
│   └── MOBILE_SYNC.md          # Mobile app guide
├── public/
│   ├── docs/                   # Legal documents
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── admin/              # Master admin panel
│   │   ├── agents/             # AI agent components
│   │   ├── analytics/          # Charts & reports
│   │   ├── arena/              # Battle arena
│   │   ├── auth/               # Login & license
│   │   ├── community/          # Social features
│   │   ├── dashboard/          # Main dashboard
│   │   ├── intro/              # Onboarding
│   │   ├── nft/                # NFT minting
│   │   ├── onboarding/         # Tour system
│   │   ├── quests/             # Quest board
│   │   ├── security/           # Security dashboard
│   │   ├── settings/           # User settings
│   │   ├── shared/             # Reusable components
│   │   ├── strategy/           # Strategy builder
│   │   ├── trade/              # Trading interface
│   │   ├── ui/                 # Base UI components
│   │   └── vault/              # Vault management
│   ├── hooks/
│   │   ├── useKVFallback.ts    # Persistent KV storage
│   │   ├── useMarketFeed.ts    # WebSocket market data
│   │   ├── useDexExecution.ts  # DEX trade execution
│   │   └── useMempoolSniper.ts # Mempool monitoring
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── agents/         # 15 elite AI agents
│   │   │   ├── learning/       # Adaptive learning
│   │   │   └── risk/           # Risk management
│   │   ├── auth/
│   │   │   └── usePersistentAuth.ts
│   │   ├── achievements/       # Milestone system
│   │   ├── license/            # License validation
│   │   ├── nft/                # NFT minting engine
│   │   ├── payment/            # Payment processing
│   │   ├── quests/             # Quest generation
│   │   ├── security/           # Input sanitization
│   │   └── monitoring/         # Sentry integration
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── Support.tsx
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── tests/
│   ├── hooks/                  # Hook tests
│   └── lib/                    # Library tests
├── package.json
├── vite.config.ts
├── vercel.json                 # Vercel config + CSP
└── CHANGELOG.md
```

## Data Flow

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Login   │────▶│ Validate Key │────▶│ Check Tier  │────▶│ Dashboard│
│  Page    │     │ (Local/API)  │     │ Set Perms   │     │ Access   │
└──────────┘     └──────────────┘     └─────────────┘     └──────────┘
     │                  │                    │
     │                  ▼                    │
     │          ┌──────────────┐            │
     │          │ Master Key?  │            │
     │          │ → Lifetime   │            │
     │          └──────────────┘            │
     │                                       │
     ▼                                       ▼
┌──────────┐                         ┌──────────────┐
│ localStorage                       │ usePersistent│
│ qf-persistent-auth                 │ Auth Hook    │
└──────────┘                         └──────────────┘
```

### Trading Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Agent   │────▶│ Market Feed  │────▶│ Decision    │────▶│ Execute  │
│  Signal  │     │ Snapshot     │     │ Engine      │     │ Trade    │
└──────────┘     └──────────────┘     └─────────────┘     └──────────┘
                        │                    │                  │
                        ▼                    ▼                  ▼
                 ┌──────────────┐     ┌─────────────┐    ┌──────────┐
                 │ CoinGecko    │     │ Learning    │    │ Jupiter  │
                 │ Fear & Greed │     │ System      │    │ DEX      │
                 └──────────────┘     └─────────────┘    └──────────┘
```

## Component Hierarchy

```
App.tsx
├── ErrorBoundary
├── IntroSplash (first visit)
├── LoginPage (unauthenticated)
└── MainLayout (authenticated)
    ├── Sidebar
    │   └── Navigation Tabs
    ├── Header
    │   ├── LivePriceTicker
    │   ├── Search
    │   └── User Menu
    └── Content Area
        ├── Dashboard
        │   ├── CircularProfitHUD
        │   ├── BotOverview
        │   ├── TodaysPnLWidget
        │   └── QuickStats
        ├── Trading
        │   ├── TradingChart
        │   ├── StrategyCards
        │   └── AgentSnipePanel
        ├── Strategies
        │   ├── StrategyVault
        │   └── CreateStrategyPage
        ├── Agents
        │   └── MultiAgentSystem
        ├── Community
        │   ├── Forum
        │   ├── CopyTrader
        │   └── NFTGallery
        ├── Quests
        │   └── QuestBoard
        ├── Analytics
        │   └── EnhancedAnalyticsV2
        ├── Settings
        │   └── EnhancedSettings
        ├── Vault
        │   └── VaultView
        └── Support
            └── Support (FAQ, Docs)
```

## State Management

### Global State (React Context)

- `AuthContext` - User authentication state
- `ThemeContext` - UI theme preferences

### Persistent State (useKVSafe)

- `user-auth` - Encrypted auth data
- `app-settings` - User preferences
- `qf_achievements` - Earned milestones
- `qf_minted_nfts` - Minted NFT tracking
- `hasSeenOnboarding` - Tour completion

### Server State (React Query)

- Market data caching
- Strategy list caching
- Analytics data

## Security Measures

1. **CSP Headers** - Prevent XSS attacks
2. **Rate Limiting** - API abuse prevention
3. **Input Sanitization** - DOMPurify for user content
4. **Device Fingerprinting** - License binding
5. **Encrypted Storage** - Sensitive data encryption
6. **HTTPS Only** - Strict transport security

## Performance Optimizations

1. **Code Splitting** - Lazy loaded routes
2. **Bundle Optimization** - Tree shaking, minification
3. **Image Optimization** - Lazy loading, WebP
4. **Memoization** - React.memo, useMemo, useCallback
5. **Virtual Lists** - For large data sets
6. **Web Workers** - Heavy calculations offloaded

