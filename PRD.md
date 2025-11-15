# Quantum Falcon Cockpit - Product Requirements Document

A mobile-first progressive web app for cyberpunk-themed crypto trading, Solana accumulation, and BTC profit management with multi-agent AI system.

**Experience Qualities**:
1. **Futuristic & Immersive** - Users should feel like they're piloting a sophisticated spacecraft console with holographic interfaces and neon data streams
2. **Powerful Yet Accessible** - Complex trading agents and real-time data presented through intuitive touch-friendly controls that work seamlessly on mobile
3. **Community-Connected** - Social features like XP progression, trading chat, and forum discussions create an engaging ecosystem around trading success

**Complexity Level**: Complex Application (advanced functionality, accounts)
This requires multi-agent trading logic, real-time data streams, user authentication, persistent state for portfolios and strategies, community features with XP systems, and integration with crypto APIs—making it a sophisticated trading platform rather than a simple tool.

## Essential Features

### 1. Cyberpunk Dashboard
- **Functionality**: Real-time portfolio overview with holographic card UI showing Solana balance, BTC profits, total portfolio value, 24h changes, and active agent status
- **Purpose**: Instant situational awareness of trading performance and bot health at a glance
- **Trigger**: App launch (default landing screen)
- **Progression**: Launch app → Animated neon splash → Dashboard materializes with staggered card animations → Live data streams pulse in → User scans metrics → Taps card for details
- **Success criteria**: Dashboard loads <2s, all metrics visible without scrolling on mobile, live updates every 5s, smooth 60fps animations

### 2. Multi-Agent Trading System
- **Functionality**: Three autonomous agents (Market Analysis, Strategy Execution, RL Optimizer) with individual status displays, toggle controls, and performance metrics
- **Purpose**: Automated trading intelligence that learns and adapts while giving users transparency and control
- **Trigger**: Navigate to "Agents" tab or dashboard agent cards
- **Progression**: Tap Agents → View 3 agent cards with status LEDs → Review each agent's metrics (confidence, actions taken, profit contribution) → Toggle agent on/off → Configure thresholds in settings → Agents execute trades → Toast notifications on key actions
- **Success criteria**: Each agent independently processes, real-time status updates, <100ms toggle response, clear profit attribution per agent

### 3. Solana Trading Hub (DCA/Sniping)
- **Functionality**: Configure and monitor DCA (Dollar Cost Averaging) schedules and token sniping parameters for Solana ecosystem tokens
- **Purpose**: Systematic accumulation strategy with opportunistic sniping for new token launches
- **Trigger**: Navigate to "Trade" tab or tap dashboard trading card
- **Progression**: Open Trade → Choose DCA or Snipe mode → DCA: Set amount/interval/tokens → Snipe: Set token criteria/buy limits → Review strategy summary → Activate → Live orders display in timeline → Executed trades show profit/loss → Profits auto-convert to BTC
- **Success criteria**: DCA executes on schedule (±5s accuracy), snipe detects new tokens <1s after launch, order history persists, slippage controls work

### 4. BTC Profit Vault
- **Functionality**: Automated profit-taking that converts winning Solana trades to BTC with vault visualization and withdrawal controls
- **Purpose**: Lock in gains to stable store-of-value asset, reducing portfolio volatility
- **Trigger**: Automatic on profitable trade close, manual from "Vault" tab
- **Progression**: Profitable trade closes → Agent triggers conversion → Solana amount swaps to BTC → BTC deposited to vault → Vault balance increments with animation → User receives notification → Can view history or withdraw to external wallet
- **Success criteria**: Conversion executes <30s after trade close, vault shows accurate BTC balance, withdrawal to external address works, transaction history persists

### 5. Community & XP System
- **Functionality**: User profile with XP progression, level badges, trading chat room, and forum for strategy discussion
- **Purpose**: Gamification increases engagement, community knowledge-sharing improves trading outcomes
- **Trigger**: Navigate to "Community" tab, earn XP from trades/referrals
- **Progression**: Complete action (trade, referral, forum post) → XP awarded with toast → Progress bar fills → Level up triggers neon animation → Unlock badges/perks → View leaderboard → Chat with other traders → Post strategies in forum → React/comment on posts
- **Success criteria**: XP awards immediately, leaderboard updates real-time, chat messages send <500ms, forum posts persist, badge system unlocks 5+ tiers

### 6. Settings & Security
- **Functionality**: Trading parameters, notification preferences, biometric authentication, API key management, theme customization
- **Purpose**: Personalization and security controls tailored to user's risk tolerance and preferences
- **Trigger**: Navigate to "Settings" tab or gear icon
- **Progression**: Open Settings → View organized sections (Trading/Security/Notifications/Appearance) → Modify parameters → Changes auto-save → Security section: Enable biometrics → Add API keys (masked) → Set trading limits → Notification section: Toggle types → Appearance: Adjust neon intensity
- **Success criteria**: Settings persist across sessions, biometrics work on supported devices, API keys encrypted in storage, limits enforced on trades

## Edge Case Handling

- **No Network / Offline Mode**: Cached dashboard shows last-known data with "OFFLINE" indicator, trading disabled, chat/forum enter read-only mode with queue for pending messages
- **Missing API Keys**: Demo mode activates with simulated data, prominent banner explains demo status, all features functional but trades don't execute, easy path to add real keys
- **Agent Failure / Error**: Failed agent shows red status LED, error message in agent card, other agents continue operating, user can restart failed agent, logs stored for debugging
- **Insufficient Balance**: Trade buttons disable with clear reason, suggested actions (deposit/reduce size) appear, pending orders can be cancelled
- **Rapid Price Movement**: Slippage warnings appear before trade execution, user confirms acceptance, executed price vs expected shown in order history
- **Session Expiration**: Graceful re-authentication without data loss, biometric quick-login if enabled, trading positions remain active server-side
- **Invalid Wallet Address**: Validation with error state on input field, suggestion for correct format, prevents withdrawal submission until valid

## Design Direction

The design should evoke the feeling of piloting a high-tech spacecraft in a neon-lit cyberpunk cityscape—powerful, futuristic, and dangerous. Think Blade Runner holographic interfaces meets Tron energy grids with aggressive HUD overlays inspired by sci-fi targeting systems. The interface features sharp, jagged edges with zero border radius, creating an angular, military-grade aesthetic. Holographic cards float above a dark void with intense neon glows, animated scan lines, and data streams. All elements use sharp clip-path cuts for corners, aggressive neon box-shadows with multiple layers, and high-contrast borders. The aesthetic is unapologetically cyberpunk with no softness—every element feels like a hardened, glowing hologram projected in 3D space.

## Color Selection

**Custom Palette** - Intense cyberpunk neon theme with electric cyan and orange accents on deep black backgrounds to create aggressive holographic depth and high-tech atmosphere.

- **Primary Color**: Electric Cyan `oklch(0.70 0.20 195)` - Main holographic UI elements, primary buttons, active agent indicators, borders. Communicates cutting-edge technology and digital energy with intense multi-layer glow effects.
- **Secondary Colors**: 
  - Deep Black Void `oklch(0.08 0.05 280)` - Main backgrounds, creating the absolute "void" for neon elements to float in
  - Neon Orange `oklch(0.65 0.25 45)` - Secondary accents, profit indicators, warm contrast to cyan
  - Hot Magenta `oklch(0.70 0.25 330)` - Urgent alerts, destructive actions, loss indicators
- **Accent Color**: Electric Cyan (same as primary) - Used for success states, profit gains, active trading signals. Creates unified holographic appearance.
- **Foreground/Background Pairings**:
  - Background (Deep Black `oklch(0.08 0.05 280)`): Bright Cyan text `oklch(0.95 0.05 195)` - Ratio 15.8:1 ✓
  - Card (Dark Slate `oklch(0.12 0.08 280)`): Bright Cyan text `oklch(0.95 0.05 195)` - Ratio 14.2:1 ✓
  - Primary (Electric Cyan `oklch(0.70 0.20 195)`): Deep Black text `oklch(0.08 0.05 280)` - Ratio 10.2:1 ✓
  - Secondary (Neon Orange `oklch(0.65 0.25 45)`): Deep Black text `oklch(0.08 0.05 280)` - Ratio 8.8:1 ✓
  - Destructive (Hot Magenta `oklch(0.70 0.25 330)`): Bright text `oklch(0.95 0.05 195)` - Ratio 6.8:1 ✓
  - Muted (Dark Panel `oklch(0.22 0.08 280)`): Dim Cyan text `oklch(0.60 0.10 195)` - Ratio 4.9:1 ✓

## Font Selection

Typefaces should feel technological and precise like a military HUD, with crisp readability for dense data displays and futuristic character that reinforces the cyberpunk aesthetic.

**Fonts**: Orbitron (headings - geometric, space-age) and Rajdhani (body - technical, condensed for data density)

- **Typographic Hierarchy**:
  - H1 (Screen Titles): Orbitron Bold / 32px / wide letter-spacing (0.1em) / uppercase
  - H2 (Section Headers): Orbitron SemiBold / 24px / normal spacing / uppercase
  - H3 (Card Titles): Rajdhani Bold / 20px / tight leading
  - Body (Data/Content): Rajdhani Medium / 16px / 1.5 line height
  - Small (Labels/Captions): Rajdhani Regular / 14px / 1.4 line height / slight transparency
  - Code/Numbers (Prices/Balances): Rajdhani Bold / 18px / tabular-nums for alignment

## Animations

Animations should feel like holographic projections materializing in 3D space—elements slide in along geometric paths with subtle bounce, glow effects pulse with data activity, and transitions have a slight lag as if light is traveling through circuits. Keep durations snappy (200-400ms) so the UI feels responsive, not sluggish.

- **Purposeful Meaning**: Every pulse, glow, and slide reinforces the "living system" metaphor—the app is an active AI cockpit, not a static dashboard. Motion patterns follow data flow direction (left to right for time, bottom-up for value increases).
- **Hierarchy of Movement**: 
  1. Critical alerts (trade executions, agent errors) use bold scale + glow animations
  2. Value changes (profits, balances) use color shifts + number count-ups
  3. Navigation transitions use slide + fade with slight perspective tilt
  4. Background ambient effects (grid pulse, particle drift) stay subtle and slow

## Component Selection

- **Components**: 
  - **Holographic Cards** (Custom) - Primary container for dashboard metrics, agent status, trade panels. Features aggressive clip-path corners (12px jagged cuts), multi-layer neon box-shadows, backdrop-blur with gradient overlays, animated holographic shimmer effects, and scan-line animations
  - **Tabs** (shadcn Tabs) - Main navigation with sharp-edged tabs, 2px borders, jagged corners, intense neon glow on active state
  - **Buttons** (shadcn Button) - All CTAs with zero border radius, 2px borders, jagged corners. Variants: primary (intense cyan glow), secondary (orange neon), destructive (magenta glow)
  - **Dialog/Sheet** (shadcn Dialog for desktop, Sheet for mobile) - Sharp-edged modals with neon borders, holographic backgrounds
  - **Progress** (shadcn Progress) - Sharp rectangular bars with neon glow trail and animated data stream effects
  - **Avatar** (shadcn Avatar) - User profile with jagged-corner frames and neon ring borders
  - **Badge** (shadcn Badge) - Sharp rectangular badges with jagged corners, 2px borders, uppercase text with wide tracking
  - **Switch/Checkbox** (shadcn Switch) - Sharp geometric toggle with intense glow on active state
  - **Input/Textarea** (shadcn Input) - Sharp-edged inputs with 2px neon borders on focus, animated glow rings
  - **ScrollArea** (shadcn ScrollArea) - Custom sharp scrollbar with neon accent
  - **Tooltip** (shadcn Tooltip) - Sharp-edged tooltips with 2px neon borders
  - **Toast** (sonner) - Sharp rectangular notifications with intense border glows

- **Customizations**: 
  - **Holographic Cards** - Custom CSS class with clip-path jagged corners, multi-layer box-shadow neon glows, backdrop-blur with gradient overlays, animated holographic shimmer overlays, scan-line effects
  - **Circular HUD Elements** - Custom SVG components inspired by sci-fi targeting systems with rotating segmented rings, crosshairs, and animated elements
  - **Agent Status LED** - Custom pulsing glow circles with intense neon effects (cyan=active, magenta=error, orange=processing)
  - **Neon Data Display** - Large numbers with intense text-shadow glows, uppercase tracking, and +/- color coding
  - **Corner Notches** - Decorative sharp corner brackets on key UI elements to reinforce angular HUD aesthetic
  - **Data Stream Effects** - Animated flowing light effects that sweep across elements

- **States**: 
  - Buttons: Default (sharp 2px neon border), Hover (intense multi-layer glow + subtle scale), Active (inner glow pulse), Disabled (dim + 50% opacity)
  - Inputs: Default (2px border), Focus (intense neon border glow + ring + scan-line), Error (magenta glow + shake animation), Success (cyan glow)
  - Cards: Default (holographic shimmer), Hover (scale transform + intensified glow), Loading (pulsing skeleton with neon shimmer)
  - Agents: Online (cyan LED pulse with glow), Offline (dark), Processing (orange LED pulse), Error (magenta LED rapid pulse)

- **Icon Selection**: 
  - @phosphor-icons/react with `weight="duotone"` for layered depth effect
  - Navigation: House (dashboard), Robot (agents), TrendUp (trade), Vault (vault), Users (community), Gear (settings)
  - Actions: Play/Pause (agent toggle), ArrowsClockwise (refresh), Bell (notifications), SignOut (logout)
  - Status: CheckCircle (success), Warning (alerts), XCircle (error), Lightning (fast action)
  - Trading: CaretUp/Down (price change), ChartLine (analytics), Coins (balance), Swap (conversion)

- **Spacing**: 
  - Container padding: `p-4` mobile, `p-6` tablet+
  - Card internal spacing: `p-4` mobile, `p-6` desktop
  - Section gaps: `gap-4` (16px) for tight groups, `gap-6` (24px) for major sections
  - Button padding: `px-6 py-3` for primary CTAs, `px-4 py-2` for secondary
  - Grid gaps: `gap-4` for dashboard card grid

- **Mobile**: 
  - Stack dashboard cards vertically on mobile (<768px), 2-column grid on tablet, 3-column on desktop
  - Tabs convert to bottom navigation bar on mobile with icons only, expand to icon+label on tablet+
  - Sheets (slide-up panels) replace Dialogs for mobile interactions (trade config, settings)
  - Touch targets minimum 44×44px, increase tap areas beyond visual button size
  - Reduce animation complexity on mobile for performance (simpler glows, fewer particles)
  - Single column layout for all detail views (agent details, trade history)
  - Sticky header with key metrics bar on scroll
  - Swipe gestures: left/right on dashboard cards for quick actions, down-to-refresh on timeline views
