# TradingStrategies Enhanced Architecture

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Application                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Redux Provider (store)                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           DndProvider (HTML5Backend)                │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │      TradingStrategiesContent                 │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │   ParticleBackground (explode)      │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │   WebSocket Connection Status       │     │  │  │  │
│  │  │  │  │   [LIVE / OFFLINE]                  │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │   Tabs Navigation                   │     │  │  │  │
│  │  │  │  │   [Active|Strategies|DCA|News|AI]   │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │   Tab: Active Strategies            │     │  │  │  │
│  │  │  │  │  ┌──────────────────────────────┐   │     │  │  │  │
│  │  │  │  │  │   TradingChart              │   │     │  │  │  │
│  │  │  │  │  │   (SciChart Placeholder)    │   │     │  │  │  │
│  │  │  │  │  └──────────────────────────────┘   │     │  │  │  │
│  │  │  │  │  ┌──────────────────────────────┐   │     │  │  │  │
│  │  │  │  │  │   DraggableWidget           │   │     │  │  │  │
│  │  │  │  │  │   Strategy Card 1           │   │     │  │  │  │
│  │  │  │  │  │   [Pause|Stop|Settings]     │   │     │  │  │  │
│  │  │  │  │  └──────────────────────────────┘   │     │  │  │  │
│  │  │  │  │  ┌──────────────────────────────┐   │     │  │  │  │
│  │  │  │  │  │   DraggableWidget           │   │     │  │  │  │
│  │  │  │  │  │   Strategy Card 2           │   │     │  │  │  │
│  │  │  │  │  └──────────────────────────────┘   │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  │                                               │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐     │  │  │  │
│  │  │  │  │   Tab: News Feed                    │     │  │  │  │
│  │  │  │  │   - Real-time trade updates         │     │  │  │  │
│  │  │  │  │   - Last 5 trades with PnL          │     │  │  │  │
│  │  │  │  │   - WebSocket status                │     │  │  │  │
│  │  │  │  └─────────────────────────────────────┘     │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────────┐         ┌──────────────────┐
│  Backend Server  │◄────────┤  WebSocket URL   │
│  (Socket.io)     │         │  ws://host:3001  │
└────────┬─────────┘         └──────────────────┘
         │
         │ Events:
         │ - strategyUpdate
         │ - newTrade
         │ - newsUpdate
         │
         ▼
┌──────────────────────────────────────────────┐
│       useSocket Hook (JWT Auth)              │
│  - Connection management                     │
│  - Reconnection logic                        │
│  - Event handlers                            │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│         Redux Store (tradingStore)           │
│  State:                                      │
│  - strategies: Strategy[]                    │
│  - trades: Trade[]                           │
│  - isConnected: boolean                      │
│                                              │
│  Actions:                                    │
│  - UPDATE_STRATEGIES                         │
│  - ADD_TRADE                                 │
│  - SET_CONNECTION_STATUS                     │
│  - CLEAR_TRADES                              │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│      React Components (useSelector)          │
│  - TradingStrategiesContent                  │
│  - TradingChart                              │
│  - DraggableWidget                           │
│  - ParticleBackground                        │
└──────────────────────────────────────────────┘
```

## Event Flow - New Trade

```
1. Backend emits 'newTrade' event
   │
   ▼
2. useSocket hook receives event
   │
   ▼
3. Dispatch ADD_TRADE action to Redux
   │
   ├─► Redux updates state.trades
   │
   ├─► Component triggers particle explosion
   │   └─► ParticleBackground shows particles for 2s
   │
   ├─► TradingChart updates with new data
   │   └─► Chart renders new candlestick
   │
   ├─► Toast notification shows PnL
   │
   └─► If profitable, dispatch XP award event
       └─► window.dispatchEvent('tradeCompleted')
```

## Accessibility Flow

```
User Action                    System Response
───────────                    ───────────────

Press Alt+1      ──────────►   Switch to Active tab
                               Announce "Active Strategies"

Press Alt+2      ──────────►   Switch to Strategies tab
                               Announce "Strategies Library"

Press Alt+4      ──────────►   Switch to News Feed tab
                               Announce "Real-time News Feed"

Tab key          ──────────►   Focus next interactive element
                               Visual focus indicator shown

Screen reader    ──────────►   Read ARIA labels
reads page                      - "Pause Momentum Bot strategy"
                               - "Draggable widget strategy-1"
                               - "WebSocket connection: Live"
```

## Drag-and-Drop Flow

```
1. User clicks on strategy card
   │
   ▼
2. DraggableWidget captures drag start
   │  - useDrag hook activated
   │  - Item type: 'widget'
   │  - Item id: 'strategy-1'
   │
   ▼
3. Visual feedback applied
   │  - Opacity: 50%
   │  - Cursor: move
   │
   ▼
4. User drags to new position
   │
   ▼
5. Drop zone accepts item
   │  - HTML5Backend handles drop
   │  - Position can be saved to backend
   │
   ▼
6. Card moves to new position
   └─► Animation shows smooth transition
```

## State Management Flow

```
┌─────────────────────────────────────┐
│         Component Mount              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Connect to WebSocket              │
│    useSocket(wsUrl)                  │
└──────────────┬──────────────────────┘
               │
               ├─► Success: dispatch SET_CONNECTION_STATUS(true)
               │
               └─► Error: dispatch SET_CONNECTION_STATUS(false)
                         Show offline indicator
               
┌─────────────────────────────────────┐
│    Listen for WebSocket Events       │
└──────────────┬──────────────────────┘
               │
               ├─► strategyUpdate
               │   └─► dispatch UPDATE_STRATEGIES(data)
               │
               ├─► newTrade
               │   ├─► dispatch ADD_TRADE(trade)
               │   ├─► setExplodeParticles(true)
               │   └─► dispatchEvent('tradeCompleted')
               │
               └─► newsUpdate
                   └─► toast.info(news.title)

┌─────────────────────────────────────┐
│    Components Re-render              │
│    (only affected components)        │
└─────────────────────────────────────┘
```

## Component Hierarchy

```
TradingStrategies (export)
└── Provider (Redux store)
    └── DndProvider (HTML5Backend)
        └── TradingStrategiesContent
            ├── ParticleBackground
            ├── WebSocket Status Indicator
            └── Tabs
                ├── Active Tab
                │   ├── TradingChart
                │   └── DraggableWidget (strategies)
                ├── Strategies Tab
                │   └── Strategy Cards
                ├── DCA Tab
                │   └── Recurring Buy Cards
                ├── News Tab
                │   └── DraggableWidget (news feed)
                └── AI Tab
                    └── Chat Interface
```

## Security Architecture

```
┌─────────────────────────────────────┐
│        Frontend Application          │
│  - JWT Token in localStorage         │
└──────────────┬──────────────────────┘
               │
               │ Authorization: Bearer <token>
               │
               ▼
┌─────────────────────────────────────┐
│      WebSocket Connection            │
│  auth: { token: localStorage.jwt }  │
└──────────────┬──────────────────────┘
               │
               │ Validate Token
               │
               ▼
┌─────────────────────────────────────┐
│        Backend Server                │
│  - JWT Verification Middleware       │
│  - CORS Configuration                │
│  - Rate Limiting                     │
└─────────────────────────────────────┘
```

## Performance Optimizations

```
Optimization Layer              Benefit
─────────────────              ───────

Redux Store          ───────►  Prevents unnecessary re-renders
                               Only subscribed components update

useSelector          ───────►  Granular subscriptions
                               Component gets only needed data

WebSocket            ───────►  Efficient real-time updates
                               No polling overhead

Particle Effects     ───────►  CSS animations (GPU-accelerated)
                               Lightweight, no canvas overhead

React DnD            ───────►  Virtual DOM diffing
                               Minimal DOM updates

Framer Motion        ───────►  Hardware-accelerated animations
                               Smooth 60 FPS transitions
```

## File Structure

```
quantum-falcon-cockp/
├── src/
│   ├── store/
│   │   └── tradingStore.ts          # Redux store
│   ├── hooks/
│   │   └── useSocket.ts             # WebSocket hook
│   ├── components/
│   │   ├── shared/
│   │   │   └── ParticleBackground.tsx
│   │   └── trade/
│   │       ├── TradingStrategies.tsx  # Main component
│   │       ├── TradingChart.tsx       # Chart component
│   │       └── DraggableWidget.tsx    # DnD wrapper
│   └── ...
├── TRADING_STRATEGIES_ENHANCEMENT.md  # Setup guide
├── IMPLEMENTATION_SUMMARY_TRADING.md  # Summary
└── ARCHITECTURE_DIAGRAM.md            # This file
```

## Integration Points

```
Component                 Integration Point
─────────                ─────────────────

TradingStrategies    ◄─►  App.tsx (lazy loaded)
                         AdvancedTradingHub imports it

useSocket Hook       ◄─►  Backend WebSocket Server
                         Socket.io at ws://host:3001

Redux Store          ◄─►  React Components
                         useSelector, useDispatch

XP Award System      ◄─►  Bot Leveling System
                         Custom event 'tradeCompleted'

TradingChart         ◄─►  SciChart Library
                         Placeholder ready for integration
```

---

This architecture follows modern React best practices:
- ✅ Unidirectional data flow
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Type safety with TypeScript
- ✅ Performance optimizations
- ✅ Security considerations
- ✅ Accessibility support
