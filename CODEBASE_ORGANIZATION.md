# Quantum Falcon Cockpit — Codebase Organization

**Last Updated**: November 24, 2025  
**Version**: 2025.1.0

## 📁 Directory Structure

```
src/
├── components/          # React components organized by feature
│   ├── admin/          # Master admin panel (master key only)
│   ├── agents/         # AI agent management
│   ├── analytics/      # Analytics and charts
│   ├── arena/          # Trading arena and battles
│   ├── auth/           # Authentication components
│   ├── community/      # Community features (forum, marketplace)
│   ├── dashboard/      # Dashboard widgets and views
│   ├── intro/          # Intro splash screen
│   ├── legal/          # Legal agreements and disclaimers
│   ├── navigation/     # Navigation components
│   ├── onboarding/     # Onboarding tour
│   ├── quests/         # Quest system and NFT rewards
│   ├── security/       # Security components
│   ├── settings/       # Settings tabs and sub-tabs
│   ├── shared/         # Shared/reusable components
│   ├── strategy/       # Strategy builder
│   ├── trade/          # Trading hub and execution
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── vault/          # Vault management
│
├── hooks/              # Custom React hooks
│   ├── useKVFallback.ts      # KV storage hook with fallback
│   ├── useMarketFeed.ts      # Market data WebSocket hook
│   ├── useDexExecution.ts    # DEX execution hook
│   ├── useWallet.ts           # Wallet connection hook
│   └── ...
│
├── lib/                # Core libraries and utilities
│   ├── agents/         # Agent configurations and profiles
│   ├── ai/             # AI/ML systems
│   ├── api/            # API clients
│   ├── arena/          # Arena logic
│   ├── auth/           # Authentication logic
│   ├── bot/            # Autonomous trading bot
│   ├── dex/            # DEX integration
│   ├── discord/        # Discord OAuth integration
│   ├── exchanges/      # Exchange integrations
│   ├── intelligence/   # News and market intelligence
│   ├── license/        # License management
│   ├── market/         # Market data types
│   ├── nft/            # NFT system
│   ├── payment/        # Payment processing
│   ├── security/       # Security utilities
│   ├── tax/            # Tax calculation
│   ├── webhooks/       # Webhook handlers
│   ├── websocket/      # WebSocket utilities
│   ├── logger.ts       # Centralized logging
│   ├── utils.ts        # Utility functions
│   ├── constants.ts    # Application constants
│   └── ...
│
├── pages/              # Page-level components
│   ├── LoginPage.tsx
│   └── SupportOnboarding.tsx
│
├── providers/          # React context providers
│   └── WalletProvider.tsx
│
├── store/              # State management
│   └── tradingStore.ts
│
├── workers/            # Web Workers
│   └── tradingCalculations.worker.ts
│
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🔄 Data Flow Architecture

### State Management Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Application State                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │   useKV Hook     │      │   Redux Store    │        │
│  │  (Persistent)    │      │  (Reactive)      │        │
│  │                  │      │                  │        │
│  │  - Auth state    │      │  - Live trades   │        │
│  │  - User prefs    │      │  - Market data   │        │
│  │  - Bot config    │      │  - WebSocket     │        │
│  └──────────────────┘      └──────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.tsx
├── IntroSplash (first-time users)
├── LoginPage (if not authenticated)
├── Main Layout
│   ├── Sidebar Navigation
│   ├── Active Tab Component
│   │   ├── Dashboard
│   │   ├── Bot Overview
│   │   ├── AI Agents
│   │   ├── Analytics
│   │   ├── Trading Hub
│   │   ├── Strategy Builder
│   │   ├── Vault
│   │   ├── Quests
│   │   ├── Community
│   │   ├── Support
│   │   ├── Settings
│   │   └── Master Admin (master key only)
│   └── Mobile Bottom Nav
└── Global Components
    ├── InteractiveTour
    ├── MasterSearch
    ├── RiskDisclosureBanner
    └── ErrorBoundary
```

## 🎯 Core Systems

### 1. Authentication System
- **File**: `src/lib/auth/usePersistentAuth.ts`
- **Storage**: Encrypted localStorage
- **Features**: Auto-login, license validation, master key detection

### 2. XP & Benefits System
- **Files**: 
  - `src/lib/xpBenefits.ts` — Benefit definitions
  - `src/lib/xpAutoAward.ts` — Automatic XP awarding
- **Integration**: Automatically awards XP on trade execution
- **Storage**: KV storage (`user-xp-profile`)

### 3. Challenge System
- **File**: `src/lib/dailyChallenges.ts`
- **Integration**: Automatically tracks from trades via `setChallengeUpdater`
- **Storage**: KV storage

### 4. Rental System
- **Files**:
  - `src/lib/strategyRental.ts` — Core logic
  - `src/lib/payment/rentalPayment.ts` — Payment integration
- **UI**: `src/components/shared/RentalModal.tsx`
- **Management**: `src/components/settings/RentalManagement.tsx`

### 5. Autonomous Trading Bot
- **File**: `src/lib/bot/AutonomousTradingLoop.ts`
- **Features**: Continuous trading, goal tracking, aggression profiles
- **Integration**: XP awards, challenge tracking

### 6. Master Admin Panel
- **File**: `src/components/admin/MasterAdminPanel.tsx`
- **Access**: Master key only (conditional tab in App.tsx)
- **Features**: Error tracking, performance metrics, system logs

## 📦 Import Organization Standards

### Standard Import Order:
1. React and React-related
2. Third-party libraries
3. UI components
4. Hooks
5. Utilities
6. Types
7. Constants

### Example:
```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. Third-party
import { motion } from 'framer-motion'
import { toast } from 'sonner'

// 3. UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Hooks
import { useKV } from '@github/spark/hooks'
import { useKVSafe } from '@/hooks/useKVFallback'

// 5. Utilities
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

// 6. Types
import type { UserAuth } from '@/lib/auth'

// 7. Constants
import { STORAGE_KEYS } from '@/lib/constants'
```

## 🔧 Utility Functions

### Core Utilities (`src/lib/utils.ts`)
- `cn()` — Class name merger (clsx + tailwind-merge)

### Logging (`src/lib/logger.ts`)
- `logger.debug()` — Debug messages (dev only)
- `logger.info()` — Info messages
- `logger.warn()` — Warnings
- `logger.error()` — Errors with stack traces

### Constants (`src/lib/constants.ts`)
- `STORAGE_KEYS` — All localStorage keys
- `FEATURE_FLAGS` — Feature unlock flags
- `TRADING_CONSTANTS` — Trading defaults
- `XP_CONSTANTS` — XP system constants
- `API_ENDPOINTS` — API routes
- `ERROR_MESSAGES` — Standard error messages
- `SUCCESS_MESSAGES` — Standard success messages

## 🛡️ Error Handling Pattern

### Standard Error Handling:
```typescript
try {
  // Operation
} catch (error) {
  logger.error('Operation failed', 'ComponentName', error)
  toast.error(ERROR_MESSAGES.GENERIC_ERROR)
}
```

### Non-Critical Errors:
```typescript
try {
  // Operation
} catch (error) {
  logger.debug('Non-critical operation failed', 'ComponentName', error)
  // Silent fail or fallback
}
```

## 🎨 Styling Standards

### Component Classes:
- `cyber-card` — Base card styling
- `cyber-card-accent` — Accent card styling
- `glass-morph-card` — Glassmorphism effect
- `neon-glow` — Neon glow effect
- `neon-glow-primary` — Primary color glow
- `jagged-corner-small` — Jagged corner effect
- `diagonal-stripes` — Diagonal stripe pattern
- `technical-grid` — Technical grid background

### Color System:
- `primary` — Main brand color (cyan)
- `accent` — Accent color (pink)
- `secondary` — Secondary color
- `destructive` — Error/danger color
- `muted-foreground` — Muted text

## 🔐 Security Patterns

### Master Key Detection:
- **File**: `src/lib/godMode.ts`
- **Function**: `isGodMode(auth)`
- **Usage**: Conditional rendering of master features

### License Validation:
- **File**: `src/lib/license/enhancedLicenseService.ts`
- **Pattern**: Validate → Cache → Check features

### Secure Storage:
- **File**: `src/lib/auth/usePersistentAuth.ts`
- **Method**: AES-256-GCM encryption
- **Key**: Derived from user password + device fingerprint

## 📊 Performance Optimization

### Lazy Loading:
- **File**: `src/lib/lazyLoad.tsx`
- **Function**: `createRobustLazy()`
- **Features**: Retry logic, timeout protection, prefetching

### Code Splitting:
- Main tabs loaded on-demand
- Heavy components lazy-loaded
- Prefetching for common tabs

### State Optimization:
- Functional updates to avoid stale closures
- Memoization for expensive calculations
- Debouncing for user input

## 🧪 Testing Patterns

### Component Testing:
- Test user interactions
- Test state updates
- Test error boundaries

### Integration Testing:
- Test data flow
- Test API integrations
- Test state persistence

## 📝 Code Quality Standards

### TypeScript:
- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` if needed)
- ✅ Proper type definitions
- ✅ Interface over type for objects

### React:
- ✅ Functional components only
- ✅ Hooks for state management
- ✅ Proper cleanup in useEffect
- ✅ Memoization where needed

### Error Handling:
- ✅ Try-catch for async operations
- ✅ Error boundaries for components
- ✅ User-friendly error messages
- ✅ Logging for debugging

### Performance:
- ✅ Lazy loading for heavy components
- ✅ Memoization for expensive operations
- ✅ Debouncing for user input
- ✅ Code splitting

## 🚀 Deployment Checklist

- [ ] All console.log statements replaced with logger
- [ ] All TODOs addressed or documented
- [ ] Error boundaries in place
- [ ] Type safety verified
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation updated

