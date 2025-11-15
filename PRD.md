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

The design should evoke the feeling of piloting a high-tech spacecraft in a neon-lit cyberpunk cityscape—powerful, futuristic, and slightly dangerous. Think Blade Runner holographic interfaces meets Tron energy grids. The interface should feel alive with pulsing glows, data streams, and holographic cards that float above a dark void. Balance rich visual effects with functional clarity: neon accents draw attention to critical data without overwhelming, while generous dark space creates calm focus zones. The aesthetic is unapologetically cyberpunk but restrained enough for hours of comfortable use.

## Color Selection

**Custom Palette** - Cyberpunk neon theme with electric accents on deep space backgrounds to create holographic depth and high-tech atmosphere.

- **Primary Color**: Electric Cyan `oklch(0.75 0.15 195)` - Main holographic UI elements, primary buttons, active agent indicators. Communicates cutting-edge technology and digital energy.
- **Secondary Colors**: 
  - Deep Void `oklch(0.12 0.02 265)` - Main backgrounds, creating the "space" for neon elements to float in
  - Neon Purple `oklch(0.65 0.25 300)` - Secondary buttons, accent panels, profit indicators
  - Hot Magenta `oklch(0.70 0.28 330)` - Urgent alerts, destructive actions, loss indicators
- **Accent Color**: Laser Green `oklch(0.80 0.20 140)` - Success states, profit gains, active trading signals, "online" status. Creates strong contrast against cyan/purple for key CTAs.
- **Foreground/Background Pairings**:
  - Background (Deep Void `oklch(0.12 0.02 265)`): Bright Cyan text `oklch(0.95 0.05 195)` - Ratio 13.2:1 ✓
  - Card (Dark Slate `oklch(0.18 0.03 265)`): Bright Cyan text `oklch(0.95 0.05 195)` - Ratio 11.8:1 ✓
  - Primary (Electric Cyan `oklch(0.75 0.15 195)`): Deep Space text `oklch(0.10 0.02 265)` - Ratio 9.5:1 ✓
  - Secondary (Neon Purple `oklch(0.65 0.25 300)`): White text `oklch(0.98 0 0)` - Ratio 6.2:1 ✓
  - Accent (Laser Green `oklch(0.80 0.20 140)`): Deep Space text `oklch(0.10 0.02 265)` - Ratio 11.1:1 ✓
  - Muted (Dark Panel `oklch(0.22 0.03 265)`): Dim Cyan text `oklch(0.70 0.08 195)` - Ratio 5.8:1 ✓

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
  - **Cards** (shadcn Card) - Primary container for dashboard metrics, agent status, trade panels. Add `backdrop-blur-md bg-card/50` for glassmorphic effect, neon border with `border-primary/30`, subtle box-shadow glow
  - **Tabs** (shadcn Tabs) - Main navigation between Dashboard/Agents/Trade/Vault/Community/Settings. Customize with neon underline indicator, icon+label layout
  - **Buttons** (shadcn Button) - All CTAs. Variants: primary (neon glow), secondary (outlined neon), destructive (red glow), ghost (transparent hover glow)
  - **Dialog/Sheet** (shadcn Dialog for desktop, Sheet for mobile) - Trade configuration, agent settings, vault withdrawal. Add dark overlay with neon border
  - **Progress** (shadcn Progress) - XP bars, DCA schedule timers, loading states. Animate with neon glow trail
  - **Avatar** (shadcn Avatar) - User profile, leaderboard. Add neon ring border for active status
  - **Badge** (shadcn Badge) - XP levels, agent status, token tags. Neon variants matching agent/status type
  - **Switch/Checkbox** (shadcn Switch) - Agent enable/disable, setting toggles. Neon glow on active state
  - **Input/Textarea** (shadcn Input) - Trade amounts, chat messages. Neon focus ring, monospace for numbers
  - **ScrollArea** (shadcn ScrollArea) - Chat messages, transaction history. Custom neon scrollbar
  - **Tooltip** (shadcn Tooltip) - Contextual help for trading terms, agent metrics. Dark with neon accent border
  - **Toast** (sonner) - Notifications for trades, XP gains, agent actions. Neon border matching type (success=green, error=red, info=cyan)

- **Customizations**: 
  - **Holographic Cards** - Custom component wrapping Card with animated gradient border, floating shadow, and hover lift effect
  - **Agent Status LED** - Custom animated SVG showing pulsing glow circle (green=active, red=error, yellow=processing)
  - **Neon Data Display** - Custom number component with count-up animation, neon glow, and +/- color coding
  - **Trade Timeline** - Custom vertical timeline component with connected dots and neon connector lines
  - **Particle Background** - Custom canvas component with drifting particles and grid overlay for depth

- **States**: 
  - Buttons: Default (neon outline), Hover (glow intensifies + slight scale), Active (inner glow), Disabled (dim + reduced opacity)
  - Inputs: Default (subtle border), Focus (neon border glow + ring), Error (red glow + shake animation), Success (green glow)
  - Cards: Default (static), Hover (lift + glow increase), Loading (pulsing skeleton with neon shimmer)
  - Agents: Online (green LED pulse), Offline (dark), Processing (yellow LED spin), Error (red LED rapid pulse)

- **Icon Selection**: 
  - @phosphor-icons/react with `weight="duotone"` for depth
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
