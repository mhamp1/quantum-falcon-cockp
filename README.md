# 🚀 Quantum Falcon Cockpit

A cyberpunk-themed progressive web app for crypto trading with AI-powered trading agents, advanced analytics, gamification, and community features. Built with React, TypeScript, and Vite, designed with a Cyberpunk Neon HUD aesthetic.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#-setup-instructions)
- [Firebase Push Notifications](#-firebase-push-notifications)
- [Offline-First with LocalStorage](#-offline-first-with-localstorage)
- [Backend API Integration](#-backend-api-integration)
- [XP Synchronization Logic](#-xp-synchronization-logic)
- [Development Workflow](#-development-workflow)
- [Testing with Desktop Backend](#-testing-with-desktop-backend)
- [Theming & Customization](#-theming--customization)
- [API Integration Tutorial](#-api-integration-tutorial)
- [Project Structure](#-project-structure)
- [License](#-license)

## ✨ Features

- **Multi-Agent Trading System**: Three autonomous AI agents (Market Analysis, Strategy Execution, RL Optimizer)
- **Advanced Analytics**: Real-time performance metrics, PnL charts, win rates, and strategy breakdowns
- **Gamification System**: XP progression (50 levels), achievements, streaks, and visual rewards
- **Community Features**: Strategy marketplace, secure forum with comments/likes, rotating special offers
- **BTC Profit Vault**: Automated profit-taking with secure deposit/withdrawal functionality
- **Subscription Tiers**: 6-tier system (Free/Starter/Trader/Pro/Elite/Lifetime) with paper trading
- **Offline-First Architecture**: LocalStorage-based caching with automatic backend sync
- **Cyberpunk UI**: Neon HUD design with holographic cards, wireframe 3D elements, and animated effects

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- A modern browser (Chrome, Firefox, Safari, or Edge)
- (Optional) Firebase account for push notifications
- (Optional) Backend server running (see [Quantum-Falcon desktop backend](https://github.com/mhamp1/Quantum-Falcon))

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mhamp1/quantum-falcon-cockp.git
cd quantum-falcon-cockp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# License Verification API (required for tier-based features)
VITE_LICENSE_API_ENDPOINT=https://your-secure-api.com/api/verify

# LicenseAuthority Purchase URL
VITE_PURCHASE_URL=https://github.com/mhamp1/LicenseAuthority

# Backend API Endpoints (optional - defaults to demo mode)
VITE_TRADING_API_ENDPOINT=https://your-api.com/api/trading
VITE_MARKET_DATA_ENDPOINT=https://your-api.com/api/market
VITE_XP_API_ENDPOINT=https://your-api.com/api/xp
VITE_QUESTS_API_ENDPOINT=https://your-api.com/api/quests
VITE_STREAKS_API_ENDPOINT=https://your-api.com/api/streaks

# Firebase Configuration (for push notifications)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# Security Settings
VITE_ENABLE_2FA=true
VITE_SESSION_TIMEOUT=300000

# ⚠️ NEVER put your master key or private keys here!
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## 🔔 Firebase Push Notifications

### Setup Instructions

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable **Cloud Messaging** in the project settings

2. **Get Configuration Keys**
   - Navigate to Project Settings → General
   - Under "Your apps", click the web icon (</>) to create a web app
   - Copy the Firebase configuration object
   - Add these values to your `.env` file

3. **Generate VAPID Key**
   - In Firebase Console, go to Project Settings → Cloud Messaging
   - Under "Web Push certificates", generate a new key pair
   - Copy the "Key pair" value and add it as `VITE_FIREBASE_VAPID_KEY`

4. **Request Notification Permissions**
   - The app will automatically request notification permissions on first launch
   - Users can enable/disable notifications in Settings → Notifications

### Notification Types

- **Trade Execution**: Alerts when trades are executed by AI agents
- **Achievement Unlocked**: Notifications for new achievements and level-ups
- **XP Milestones**: Alerts when reaching XP thresholds
- **Quest Completion**: Notifications for completed quests and streaks
- **Price Alerts**: Custom price movement notifications
- **Agent Status**: Alerts for agent errors or status changes

### Implementation Example

```typescript
// src/lib/notifications.ts
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export async function requestNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    })
    console.log('FCM Token:', token)
    return token
  } catch (error) {
    console.error('Notification permission denied:', error)
    return null
  }
}

export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload)
    showNotification(payload.notification)
  })
}
```

## 💾 Offline-First with LocalStorage

The app uses an offline-first architecture to ensure functionality even without internet connectivity.

### Storage Strategy

- **LocalStorage**: Primary storage for user data, preferences, and cached API responses
- **Session Management**: License verification, user profile, subscription tier
- **Trade History**: Recent trades cached for offline viewing
- **XP & Achievements**: Progress stored locally and synced when online
- **Settings & Preferences**: All user settings persisted locally

### How It Works

1. **Data Reads**: 
   - First checks LocalStorage cache
   - If data is fresh (< 5 minutes old), uses cached version
   - Otherwise, fetches from backend and updates cache

2. **Data Writes**:
   - Immediately saves to LocalStorage
   - Queues API call to backend
   - Retries failed requests when connection is restored

3. **Offline Mode**:
   - Dashboard shows last-known data with "OFFLINE" indicator
   - Trading is disabled (read-only mode)
   - User actions (likes, comments, XP) queued for sync
   - Automatic sync when connection restored

### LocalStorage Keys

```javascript
// Core application data
qf_license          // Encrypted license information
qf_user_profile     // User profile data
qf_xp_progress      // XP and level progress
qf_achievements     // Unlocked achievements
qf_settings         // User preferences

// Cached API responses
qf_cache_xp         // Cached XP data
qf_cache_quests     // Cached quests
qf_cache_streaks    // Cached streaks
qf_cache_trades     // Recent trade history

// Sync queue
qf_pending_sync     // Actions waiting to sync with backend
```

### Cache Management

```typescript
// src/lib/cache.ts
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedData<T>(key: string): { data: T; timestamp: number } | null {
  const cached = localStorage.getItem(key)
  return cached ? JSON.parse(cached) : null
}

export function setCachedData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
}

export function isCacheFresh(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

export function clearCache(): void {
  const keys = Object.keys(localStorage)
  keys.filter(key => key.startsWith('qf_cache_')).forEach(key => {
    localStorage.removeItem(key)
  })
}
```

## 🔌 Backend API Integration

### Connecting to the Desktop Backend

The Quantum Falcon Cockpit integrates with the [Quantum-Falcon desktop backend](https://github.com/mhamp1/Quantum-Falcon) for real-time trading operations.

### Configuration

Set the backend URL in your `.env`:

```env
VITE_TRADING_API_ENDPOINT=http://localhost:8000/api
```

Or for production:

```env
VITE_TRADING_API_ENDPOINT=https://api.quantum-falcon.com/api
```

### Backend API Endpoints

#### 1. XP Award Endpoint

**POST** `/api/xp/award`

Award XP points to a user for completing actions.

**Request:**
```json
{
  "userId": "user_abc123",
  "action": "trade_execution",
  "xpAmount": 50,
  "timestamp": 1699999999999,
  "metadata": {
    "tradeId": "trade_xyz",
    "profit": 125.50
  }
}
```

**Response:**
```json
{
  "success": true,
  "newXP": 1550,
  "level": 5,
  "leveledUp": false,
  "nextLevelXP": 2000,
  "achievements": []
}
```

#### 2. Quests Endpoint

**GET** `/api/quests?userId={userId}`

Fetch all available and completed quests for a user.

**Response:**
```json
{
  "quests": [
    {
      "id": "quest_001",
      "title": "First Trade",
      "description": "Execute your first trade",
      "xpReward": 100,
      "progress": 1,
      "goal": 1,
      "completed": true,
      "completedAt": 1699999999999
    },
    {
      "id": "quest_002",
      "title": "Win Streak",
      "description": "Complete 5 profitable trades in a row",
      "xpReward": 500,
      "progress": 3,
      "goal": 5,
      "completed": false
    }
  ]
}
```

#### 3. Streaks Endpoint

**GET** `/api/streaks?userId={userId}`

Get user's current streaks (daily login, trading, etc.).

**Response:**
```json
{
  "streaks": {
    "dailyLogin": {
      "current": 7,
      "longest": 15,
      "lastLogin": 1699999999999
    },
    "tradingStreak": {
      "current": 3,
      "longest": 8,
      "lastTrade": 1699999999999
    },
    "profitStreak": {
      "current": 5,
      "longest": 12,
      "consecutiveProfits": 5
    }
  },
  "bonusXP": 150
}
```

#### 4. License Verification Endpoint

**POST** `/api/verify`

Verify a license key and return tier information.

**Request:**
```json
{
  "license": "QF-PRO-a1b2c3d4e5f6-1234567890",
  "timestamp": 1699999999999,
  "origin": "quantum-falcon-cockpit"
}
```

**Response:**
```json
{
  "valid": true,
  "tier": "pro",
  "expiresAt": 1702591999999,
  "userId": "user_abc123",
  "features": [
    "ai_agents_3",
    "advanced_analytics",
    "strategy_marketplace",
    "copy_trading",
    "priority_support"
  ]
}
```

### Authentication

All API requests include the following headers:

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${licenseKey}`,
  'X-User-ID': userId,
  'X-Origin': 'quantum-falcon-cockpit'
}
```

### Error Handling

```typescript
// Standard error response format
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `INVALID_LICENSE`: License key is invalid or expired
- `INSUFFICIENT_TIER`: User's subscription tier doesn't allow this action
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

## 🎯 XP Synchronization Logic

The XP system uses a smart synchronization strategy to balance offline functionality with backend consistency.

### How XP Sync Works

#### 1. **XP Award Flow**

```
User Action → Local XP Update → LocalStorage Save → Backend API Call
                    ↓
              Visual Feedback (Toast, Animation)
                    ↓
              Progress Bar Update
```

#### 2. **Online Mode**

When the app is online:
1. User performs an XP-earning action (e.g., executes trade)
2. XP immediately updated in LocalStorage
3. Visual feedback shown (toast notification, progress bar animation)
4. API call sent to backend to persist XP
5. Backend response updates local state if there's a discrepancy

#### 3. **Offline Mode**

When offline, XP awards are:
1. Immediately applied locally
2. Stored in sync queue (`qf_pending_sync`)
3. User sees instant visual feedback
4. Queued actions sync when connection restores

#### 4. **Conflict Resolution**

When syncing after offline period:
1. Fetch current XP from backend
2. Apply queued local changes
3. If conflict detected (backend > local), backend wins
4. Re-calculate level based on final XP
5. Show sync notification to user

### XP Actions & Values

```javascript
const XP_VALUES = {
  trade_execution: 10,      // Execute any trade
  profitable_trade: 50,     // Close profitable trade
  tutorial_complete: 100,   // Complete tutorial/course
  achievement_unlock: 25,   // Unlock achievement
  daily_login: 5,           // Daily login bonus
  streak_milestone: 500,    // Complete 7-day streak
  forum_post: 15,           // Create forum post
  strategy_share: 30,       // Share trading strategy
  referral: 100            // Successful referral
}
```

### Level Progression

```javascript
// XP required for each level (exponential growth)
function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Levels 1-10: 100, 150, 225, 338, 506, 759, 1139, 1708, 2562, 3843
// Levels 11-20: 5765, 8647, 12970, 19456, 29183, 43775, 65662, 98493, 147740, 221610
```

### Fallback Behavior

- **Offline for < 1 hour**: Normal sync on reconnect
- **Offline for 1-24 hours**: Full data refresh + sync queue
- **Offline for > 24 hours**: User prompted to verify data integrity
- **Sync conflict**: Backend data takes precedence, user notified of changes

### Implementation Example

```typescript
// src/lib/xp-sync.ts
export async function awardXP(userId: string, action: string, amount: number) {
  // Step 1: Update local immediately
  const currentXP = getLocalXP(userId)
  const newXP = currentXP + amount
  setLocalXP(userId, newXP)
  
  // Step 2: Show feedback
  showXPToast(amount)
  
  // Step 3: Try backend sync
  try {
    const response = await fetch('/api/xp/award', {
      method: 'POST',
      body: JSON.stringify({ userId, action, xpAmount: amount })
    })
    
    const data = await response.json()
    if (data.newXP !== newXP) {
      // Server has different value
      setLocalXP(userId, data.newXP)
    }
  } catch (error) {
    // Queue for later
    addToSyncQueue({ type: 'xp_award', userId, action, amount })
  }
}
```

## 🛠 Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

1. **Node Environment**: Use Node.js v18+ (LTS recommended)
2. **Package Manager**: npm or yarn (npm is default)
3. **IDE**: VS Code recommended with extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript and JavaScript Language Features

### Development Best Practices

1. **Hot Module Replacement**: Vite provides instant HMR - changes reflect immediately
2. **Type Safety**: Use TypeScript for all new files
3. **Component Structure**: Follow existing pattern in `/src/components`
4. **State Management**: Use React hooks and local state (no Redux)
5. **Styling**: Tailwind utility classes + custom CSS for complex effects
6. **API Calls**: Use async/await with proper error handling

### Code Style

```typescript
// ✅ Good - Type-safe, error handling, clear naming
async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch')
    return await response.json()
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// ❌ Bad - No types, no error handling
async function getData(id) {
  const res = await fetch('/api/users/' + id)
  return res.json()
}
```

### Debugging

```bash
# Check browser console for errors
# React DevTools available in Chrome/Firefox

# View localStorage data
localStorage.getItem('qf_license')
localStorage.getItem('qf_xp_progress')

# Clear all app data
localStorage.clear()

# Check sync queue
JSON.parse(localStorage.getItem('qf_pending_sync') || '[]')
```

## 🖥 Testing with Desktop Backend

### Prerequisites

1. Clone and run the [Quantum-Falcon desktop backend](https://github.com/mhamp1/Quantum-Falcon)
2. Ensure backend is running on `http://localhost:8000`
3. Configure CORS to allow `http://localhost:5173`

### Test Workflow

#### 1. **Start Backend Server**

```bash
cd ../Quantum-Falcon
python main.py
# Backend running at http://localhost:8000
```

#### 2. **Configure Mobile App**

Update `.env`:
```env
VITE_TRADING_API_ENDPOINT=http://localhost:8000/api
VITE_XP_API_ENDPOINT=http://localhost:8000/api/xp
VITE_QUESTS_API_ENDPOINT=http://localhost:8000/api/quests
```

#### 3. **Start Mobile App**

```bash
npm run dev
# App running at http://localhost:5173
```

#### 4. **Test API Integration**

Open browser console and test endpoints:

```javascript
// Test XP Award
fetch('http://localhost:8000/api/xp/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test_user',
    action: 'trade_execution',
    xpAmount: 50
  })
})

// Test Quest Fetch
fetch('http://localhost:8000/api/quests?userId=test_user', {
  headers: { 'Authorization': 'Bearer your-license-key' }
})

// Test Streak Fetch
fetch('http://localhost:8000/api/streaks?userId=test_user')
```

#### 5. **Verify Sync**

1. Make changes in mobile app (execute trade, earn XP)
2. Check backend logs for API calls
3. Verify data consistency between frontend and backend
4. Test offline mode by disconnecting network
5. Reconnect and verify sync queue processes

### Common Issues

- **CORS Errors**: Add `http://localhost:5173` to backend CORS whitelist
- **Connection Refused**: Ensure backend is running on correct port
- **Auth Failures**: Verify license key is valid and not expired
- **Sync Issues**: Clear LocalStorage and retry sync

### Backend CORS Configuration

```python
# Example: Flask backend CORS setup
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    'http://localhost:5173',
    'https://quantum-falcon-cockpit.com'
])
```

## 🎨 Theming & Customization

The app uses a **Cyberpunk Neon HUD** theme inspired by 80s/90s sci-fi interfaces.

### Color Scheme

The theme is defined in CSS custom properties (see `src/main.css`):

```css
:root {
  /* Primary Colors */
  --color-accent-9: oklch(0.75 0.18 195);    /* Electric Cyan */
  --color-accent-secondary-9: oklch(0.80 0.20 70); /* Bright Yellow */
  --color-bg: oklch(0.06 0.04 280);          /* Deep Black */
  
  /* Neon Glows */
  --glow-cyan: 0 0 20px oklch(0.75 0.18 195);
  --glow-yellow: 0 0 20px oklch(0.80 0.20 70);
  --glow-magenta: 0 0 20px oklch(0.72 0.22 330);
}
```

### Tailwind Configuration

Customize theme in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        'cyber-cyan': 'oklch(0.75 0.18 195)',
        'cyber-yellow': 'oklch(0.80 0.20 70)',
        'cyber-magenta': 'oklch(0.72 0.22 330)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px oklch(0.75 0.18 195)',
        'neon-yellow': '0 0 20px oklch(0.80 0.20 70)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan-line 3s linear infinite',
      }
    }
  }
}
```

### Custom Components

#### Holographic Cards

```tsx
<div className="holographic-card p-6">
  <div className="card-content">
    {/* Your content */}
  </div>
</div>
```

CSS:
```css
.holographic-card {
  background: linear-gradient(135deg, 
    oklch(0.10 0.06 280) 0%, 
    oklch(0.08 0.04 280) 100%);
  border: 2px solid oklch(0.75 0.18 195);
  box-shadow: 
    0 0 20px oklch(0.75 0.18 195 / 0.5),
    inset 0 0 40px oklch(0.75 0.18 195 / 0.1);
  backdrop-filter: blur(10px);
  clip-path: polygon(
    0 0, calc(100% - 12px) 0, 100% 12px, 
    100% 100%, 12px 100%, 0 calc(100% - 12px)
  );
}
```

### Gradients & Shadows

```css
/* Neon gradient text */
.neon-text {
  background: linear-gradient(90deg, 
    oklch(0.75 0.18 195), 
    oklch(0.80 0.20 70));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Multi-layer glow */
.multi-glow {
  box-shadow: 
    0 0 10px oklch(0.75 0.18 195),
    0 0 20px oklch(0.75 0.18 195),
    0 0 30px oklch(0.80 0.20 70);
}
```

### Animations

```css
@keyframes pulse-neon {
  0%, 100% { 
    box-shadow: 0 0 20px oklch(0.75 0.18 195);
  }
  50% { 
    box-shadow: 0 0 40px oklch(0.75 0.18 195);
  }
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
```

### Customization Guide

1. **Change Primary Color**: Update `--color-accent-9` in `src/main.css`
2. **Modify Card Style**: Edit `.holographic-card` in component CSS
3. **Adjust Animations**: Change animation timings in Tailwind config
4. **Update Fonts**: Modify font imports in `index.html` and Tailwind config
5. **Customize Icons**: Replace `@phosphor-icons/react` with preferred icon library

### Design Tokens

```typescript
// src/lib/theme.ts
export const theme = {
  colors: {
    primary: 'oklch(0.75 0.18 195)',
    secondary: 'oklch(0.80 0.20 70)',
    danger: 'oklch(0.72 0.22 330)',
    background: 'oklch(0.06 0.04 280)'
  },
  spacing: {
    card: '1.5rem',
    section: '2rem',
    page: '3rem'
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  }
}
```

## 📚 API Integration Tutorial

### Step-by-Step: Implementing a New API Call

#### Example: Fetching User Quests

**Step 1: Define the API endpoint**

```typescript
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_QUESTS_API_ENDPOINT || 'http://localhost:8000/api'

export async function fetchUserQuests(userId: string) {
  try {
    const response = await fetch(`${API_BASE}/quests?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getLicenseKey()}`,
        'X-User-ID': userId
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch quests:', error)
    throw error
  }
}

function getLicenseKey(): string {
  const license = localStorage.getItem('qf_license')
  if (!license) return ''
  try {
    const data = JSON.parse(atob(license))
    return data.key
  } catch {
    return ''
  }
}
```

**Step 2: Add offline caching**

```typescript
// src/lib/api.ts
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function fetchUserQuests(userId: string) {
  // Check cache first
  const cached = getCachedData('qf_cache_quests')
  if (cached && isCacheFresh(cached.timestamp)) {
    return cached.data
  }
  
  try {
    const data = await fetchUserQuestsFromAPI(userId)
    
    // Update cache
    setCachedData('qf_cache_quests', {
      data,
      timestamp: Date.now()
    })
    
    return data
  } catch (error) {
    // If offline, return cached data (even if stale)
    if (cached) {
      console.warn('Using stale cache due to network error')
      return cached.data
    }
    throw error
  }
}

function getCachedData(key: string) {
  const cached = localStorage.getItem(key)
  return cached ? JSON.parse(cached) : null
}

function setCachedData(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data))
}

function isCacheFresh(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}
```

**Step 3: Create React hook**

```typescript
// src/hooks/useQuests.ts
import { useState, useEffect } from 'react'
import { fetchUserQuests } from '@/lib/api'

export function useQuests(userId: string) {
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    async function loadQuests() {
      try {
        setLoading(true)
        const data = await fetchUserQuests(userId)
        setQuests(data.quests || [])
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    
    loadQuests()
  }, [userId])
  
  return { quests, loading, error }
}
```

**Step 4: Use in component**

```tsx
// src/components/quests/QuestList.tsx
import { useQuests } from '@/hooks/useQuests'

export function QuestList({ userId }: { userId: string }) {
  const { quests, loading, error } = useQuests(userId)
  
  if (loading) return <div className="text-center p-4">Loading quests...</div>
  if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>
  
  return (
    <div className="grid gap-4">
      {quests.map(quest => (
        <div key={quest.id} className="holographic-card p-4">
          <h3 className="text-xl font-bold text-cyber-yellow">{quest.title}</h3>
          <p className="text-neutral-11 mt-2">{quest.description}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{quest.progress}/{quest.goal}</span>
            </div>
            <div className="h-2 bg-neutral-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-yellow"
                style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
              />
            </div>
          </div>
          {quest.completed && (
            <div className="mt-2 text-green-500 font-bold">✓ Completed</div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Mobile-Backend Data Sync Workflow

#### Complete Sync Example: XP Award

```typescript
// src/lib/xp-sync.ts

interface XPAward {
  userId: string
  action: string
  xpAmount: number
  timestamp: number
  metadata?: Record<string, any>
}

export async function awardXP(award: XPAward) {
  // Step 1: Update local state immediately
  const currentXP = getLocalXP(award.userId)
  const newXP = currentXP + award.xpAmount
  setLocalXP(award.userId, newXP)
  
  // Step 2: Show visual feedback
  showXPToast(award.xpAmount)
  updateProgressBar(newXP)
  
  // Step 3: Try to sync with backend
  try {
    await syncXPToBackend(award)
  } catch (error) {
    // Step 4: Queue for later sync if offline
    addToSyncQueue('xp_award', award)
    console.warn('XP award queued for sync:', error)
  }
}

async function syncXPToBackend(award: XPAward) {
  const response = await fetch(`${API_BASE}/xp/award`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getLicenseKey()}`
    },
    body: JSON.stringify(award)
  })
  
  if (!response.ok) throw new Error('Sync failed')
  
  const result = await response.json()
  
  // Step 5: Update local state with server response
  if (result.newXP !== getLocalXP(award.userId)) {
    console.warn('XP mismatch, using server value')
    setLocalXP(award.userId, result.newXP)
  }
  
  return result
}

function getLocalXP(userId: string): number {
  const data = localStorage.getItem('qf_xp_progress')
  if (!data) return 0
  const parsed = JSON.parse(data)
  return parsed[userId] || 0
}

function setLocalXP(userId: string, xp: number): void {
  const data = localStorage.getItem('qf_xp_progress') || '{}'
  const parsed = JSON.parse(data)
  parsed[userId] = xp
  localStorage.setItem('qf_xp_progress', JSON.stringify(parsed))
}

// Background sync worker
export function startSyncWorker() {
  setInterval(async () => {
    const queue = getSyncQueue()
    if (queue.length === 0) return
    
    console.log(`Processing ${queue.length} queued items...`)
    
    for (const item of queue) {
      try {
        await processQueuedItem(item)
        removeFromSyncQueue(item.id)
      } catch (error) {
        console.error('Sync failed for item:', item, error)
      }
    }
  }, 30000) // Every 30 seconds
}

function getSyncQueue(): any[] {
  const queue = localStorage.getItem('qf_pending_sync')
  return queue ? JSON.parse(queue) : []
}

function addToSyncQueue(type: string, data: any): void {
  const queue = getSyncQueue()
  queue.push({ id: Date.now(), type, data, timestamp: Date.now() })
  localStorage.setItem('qf_pending_sync', JSON.stringify(queue))
}

function removeFromSyncQueue(id: number): void {
  const queue = getSyncQueue().filter(item => item.id !== id)
  localStorage.setItem('qf_pending_sync', JSON.stringify(queue))
}

async function processQueuedItem(item: any): Promise<void> {
  switch (item.type) {
    case 'xp_award':
      await syncXPToBackend(item.data)
      break
    // Add more sync types as needed
    default:
      console.warn('Unknown sync type:', item.type)
  }
}
```

## 📁 Project Structure

```
quantum-falcon-cockp/
├── src/
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── trade/          # Trading interface
│   │   ├── vault/          # BTC vault
│   │   ├── community/      # Community features
│   │   ├── settings/       # Settings panels
│   │   ├── shared/         # Shared components
│   │   └── ui/             # UI primitives (shadcn)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API client
│   │   ├── license-auth.ts # License verification
│   │   ├── xp-sync.ts      # XP synchronization
│   │   └── cache.ts        # Cache management
│   ├── styles/             # CSS files
│   ├── assets/             # Images, icons
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.example            # Environment template
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

## 🔗 Related Documentation

- [Backend API Example](./BACKEND_API_EXAMPLE.md) - Flask server implementation
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Feature development roadmap
- [PRD](./PRD.md) - Complete product requirements
- [Security](./SECURITY.md) - Security guidelines

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/mhamp1/quantum-falcon-cockp/issues)
- Documentation: [Full docs](./docs/)

---

**Built with ❤️ using React, TypeScript, and Vite**
