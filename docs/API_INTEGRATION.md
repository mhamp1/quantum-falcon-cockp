# API Integration Guide

Complete guide for integrating the Quantum Falcon Cockpit mobile app with the Quantum-Falcon desktop backend.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Request & Response Formats](#request--response-formats)
- [Offline-First Strategy](#offline-first-strategy)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The Quantum Falcon Cockpit uses a RESTful API architecture to communicate with the backend. All data synchronization follows an offline-first approach with automatic retry mechanisms.

### Architecture

```
┌─────────────────────────────────────────┐
│   Quantum Falcon Cockpit (Frontend)    │
│   - React + TypeScript                  │
│   - LocalStorage Cache                  │
│   - Sync Queue                          │
└──────────────┬──────────────────────────┘
               │ HTTPS/HTTP
               │ REST API
               ▼
┌─────────────────────────────────────────┐
│   Quantum-Falcon Backend (Python)      │
│   - Flask/FastAPI Server                │
│   - Database (PostgreSQL)               │
│   - Redis Cache                         │
└─────────────────────────────────────────┘
```

### Base URLs

Development:
```
http://localhost:8000/api
```

Production:
```
https://api.quantum-falcon.com/api
```

## API Endpoints

### 1. License Verification

Verify a user's license key and retrieve subscription tier information.

**Endpoint:** `POST /api/verify`

**Request:**
```json
{
  "license": "QF-PRO-a1b2c3d4e5f6-1234567890",
  "timestamp": 1699999999999,
  "origin": "quantum-falcon-cockpit"
}
```

**Response (Success):**
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

**Response (Failure):**
```json
{
  "valid": false,
  "error": "License expired"
}
```

**Status Codes:**
- `200 OK` - Valid license
- `401 Unauthorized` - Invalid or expired license
- `400 Bad Request` - Missing or malformed request
- `500 Internal Server Error` - Server error

---

### 2. XP Award

Award XP points to a user for completing actions.

**Endpoint:** `POST /api/xp/award`

**Request:**
```json
{
  "userId": "user_abc123",
  "action": "trade_execution",
  "xpAmount": 50,
  "timestamp": 1699999999999,
  "metadata": {
    "tradeId": "trade_xyz",
    "profit": 125.50,
    "asset": "SOL/USDT"
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

**Response (Level Up):**
```json
{
  "success": true,
  "newXP": 2050,
  "level": 6,
  "leveledUp": true,
  "previousLevel": 5,
  "nextLevelXP": 3000,
  "achievements": [
    {
      "id": "level_6",
      "title": "Rising Trader",
      "description": "Reached level 6",
      "xpReward": 100,
      "icon": "trophy"
    }
  ]
}
```

**XP Action Types:**
```typescript
type XPAction = 
  | "trade_execution"      // +10 XP
  | "profitable_trade"     // +50 XP
  | "tutorial_complete"    // +100 XP
  | "achievement_unlock"   // +25 XP
  | "daily_login"          // +5 XP
  | "streak_milestone"     // +500 XP
  | "forum_post"           // +15 XP
  | "strategy_share"       // +30 XP
  | "referral"             // +100 XP
```

**Status Codes:**
- `200 OK` - XP awarded successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid authentication
- `500 Internal Server Error` - Server error

---

### 3. Get User XP

Retrieve current XP and level information for a user.

**Endpoint:** `GET /api/xp?userId={userId}`

**Response:**
```json
{
  "userId": "user_abc123",
  "xp": 1550,
  "level": 5,
  "nextLevelXP": 2000,
  "progressToNextLevel": 0.775,
  "totalAchievements": 12,
  "unlockedAchievements": 8
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 4. Get Quests

Fetch all available and completed quests for a user.

**Endpoint:** `GET /api/quests?userId={userId}`

**Response:**
```json
{
  "quests": [
    {
      "id": "quest_001",
      "title": "First Trade",
      "description": "Execute your first trade",
      "category": "trading",
      "xpReward": 100,
      "progress": 1,
      "goal": 1,
      "completed": true,
      "completedAt": 1699999999999,
      "icon": "chart-line"
    },
    {
      "id": "quest_002",
      "title": "Win Streak",
      "description": "Complete 5 profitable trades in a row",
      "category": "trading",
      "xpReward": 500,
      "progress": 3,
      "goal": 5,
      "completed": false,
      "icon": "fire"
    },
    {
      "id": "quest_003",
      "title": "Community Member",
      "description": "Create 10 forum posts",
      "category": "community",
      "xpReward": 200,
      "progress": 7,
      "goal": 10,
      "completed": false,
      "icon": "users"
    }
  ],
  "dailyQuests": [
    {
      "id": "daily_001",
      "title": "Daily Login",
      "description": "Log in today",
      "xpReward": 5,
      "completed": true,
      "expiresAt": 1699999999999
    }
  ]
}
```

**Quest Categories:**
- `trading` - Trading-related quests
- `community` - Community engagement
- `education` - Tutorial completion
- `achievement` - Achievement milestones

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 5. Update Quest Progress

Update progress on a specific quest.

**Endpoint:** `POST /api/quests/progress`

**Request:**
```json
{
  "userId": "user_abc123",
  "questId": "quest_002",
  "progress": 4,
  "timestamp": 1699999999999
}
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "id": "quest_002",
    "progress": 4,
    "goal": 5,
    "completed": false
  },
  "xpAwarded": 0
}
```

**Response (Quest Completed):**
```json
{
  "success": true,
  "quest": {
    "id": "quest_002",
    "progress": 5,
    "goal": 5,
    "completed": true,
    "completedAt": 1699999999999
  },
  "xpAwarded": 500
}
```

**Status Codes:**
- `200 OK` - Progress updated
- `400 Bad Request` - Invalid data
- `404 Not Found` - Quest not found
- `500 Internal Server Error` - Server error

---

### 6. Get Streaks

Retrieve user's current streaks (daily login, trading, profit).

**Endpoint:** `GET /api/streaks?userId={userId}`

**Response:**
```json
{
  "streaks": {
    "dailyLogin": {
      "current": 7,
      "longest": 15,
      "lastLogin": 1699999999999,
      "nextMilestone": 10,
      "bonusXP": 50
    },
    "tradingStreak": {
      "current": 3,
      "longest": 8,
      "lastTrade": 1699999999999,
      "nextMilestone": 5,
      "bonusXP": 0
    },
    "profitStreak": {
      "current": 5,
      "longest": 12,
      "consecutiveProfits": 5,
      "lastProfitTrade": 1699999999999,
      "nextMilestone": 7,
      "bonusXP": 100
    }
  },
  "totalBonusXP": 150,
  "milestones": [
    {
      "type": "dailyLogin",
      "value": 10,
      "reward": 100,
      "reached": false
    },
    {
      "type": "profitStreak",
      "value": 7,
      "reward": 200,
      "reached": false
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 7. Update Streak

Update a user's streak progress.

**Endpoint:** `POST /api/streaks/update`

**Request:**
```json
{
  "userId": "user_abc123",
  "streakType": "dailyLogin",
  "timestamp": 1699999999999
}
```

**Response:**
```json
{
  "success": true,
  "streakType": "dailyLogin",
  "current": 8,
  "longest": 15,
  "milestoneReached": false,
  "bonusXP": 0
}
```

**Response (Milestone Reached):**
```json
{
  "success": true,
  "streakType": "dailyLogin",
  "current": 10,
  "longest": 15,
  "milestoneReached": true,
  "milestone": 10,
  "bonusXP": 100
}
```

**Streak Types:**
- `dailyLogin` - Daily login streak
- `tradingStreak` - Consecutive trading days
- `profitStreak` - Consecutive profitable trades

**Status Codes:**
- `200 OK` - Streak updated
- `400 Bad Request` - Invalid data
- `500 Internal Server Error` - Server error

---

### 8. Get Achievements

Fetch all achievements and their unlock status.

**Endpoint:** `GET /api/achievements?userId={userId}`

**Response:**
```json
{
  "achievements": [
    {
      "id": "first_trade",
      "title": "First Trade",
      "description": "Execute your first trade",
      "category": "trading",
      "icon": "chart-line",
      "xpReward": 50,
      "unlocked": true,
      "unlockedAt": 1699999999999,
      "rarity": "common"
    },
    {
      "id": "profit_100",
      "title": "Profit Maker",
      "description": "Earn $100 in profits",
      "category": "trading",
      "icon": "dollar-sign",
      "xpReward": 200,
      "unlocked": true,
      "unlockedAt": 1700000000000,
      "rarity": "uncommon"
    },
    {
      "id": "level_10",
      "title": "Veteran Trader",
      "description": "Reach level 10",
      "category": "progression",
      "icon": "trophy",
      "xpReward": 500,
      "unlocked": false,
      "rarity": "rare"
    }
  ],
  "totalAchievements": 50,
  "unlockedAchievements": 12,
  "totalXPFromAchievements": 2500
}
```

**Achievement Categories:**
- `trading` - Trading milestones
- `progression` - Level and XP milestones
- `community` - Community engagement
- `streak` - Streak achievements
- `special` - Limited-time or unique achievements

**Rarity Levels:**
- `common` - Easy to unlock
- `uncommon` - Moderate difficulty
- `rare` - Challenging
- `epic` - Very difficult
- `legendary` - Extremely rare

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## Authentication

All API requests (except `/api/verify`) require authentication using a valid license key.

### Headers

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer QF-PRO-a1b2c3d4e5f6-1234567890',
  'X-User-ID': 'user_abc123',
  'X-Origin': 'quantum-falcon-cockpit',
  'X-Request-ID': 'req_xyz123'  // Optional, for tracking
}
```

### Example Authentication Flow

```typescript
// 1. Verify license on app startup
const licenseKey = 'QF-PRO-a1b2c3d4e5f6-1234567890'
const verification = await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({ license: licenseKey })
})

// 2. Store license data locally
const licenseData = await verification.json()
localStorage.setItem('qf_license', btoa(JSON.stringify(licenseData)))

// 3. Use license in subsequent requests
function makeAuthenticatedRequest(endpoint: string, options: RequestInit) {
  const license = getLicenseFromStorage()
  
  return fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${license.key}`,
      'X-User-ID': license.userId
    }
  })
}
```

## Request & Response Formats

### Standard Request Format

All POST requests should include:

```typescript
interface BaseRequest {
  userId: string           // User identifier
  timestamp: number        // Unix timestamp in milliseconds
  metadata?: Record<string, any>  // Optional additional data
}
```

### Standard Response Format

#### Success Response

```typescript
interface SuccessResponse<T> {
  success: true
  data?: T
  message?: string
  timestamp: number
}
```

#### Error Response

```typescript
interface ErrorResponse {
  success: false
  error: string           // Human-readable error message
  code: string           // Error code for programmatic handling
  details?: any          // Additional error details
  timestamp: number
}
```

### Common Error Codes

```typescript
enum ErrorCode {
  INVALID_LICENSE = 'INVALID_LICENSE',
  LICENSE_EXPIRED = 'LICENSE_EXPIRED',
  INSUFFICIENT_TIER = 'INSUFFICIENT_TIER',
  INVALID_REQUEST = 'INVALID_REQUEST',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

## Offline-First Strategy

The app implements an offline-first approach with automatic synchronization.

### Cache Strategy

```typescript
// 1. Check cache first
async function fetchData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Check LocalStorage cache
  const cached = getCachedData<T>(key)
  
  if (cached && isCacheFresh(cached.timestamp)) {
    return cached.data
  }
  
  try {
    // Fetch from API
    const data = await fetcher()
    
    // Update cache
    setCachedData(key, data)
    
    return data
  } catch (error) {
    // If offline, return stale cache
    if (cached) {
      console.warn('Using stale cache:', key)
      return cached.data
    }
    throw error
  }
}
```

### Sync Queue

```typescript
interface SyncQueueItem {
  id: number
  type: string
  data: any
  timestamp: number
  retries: number
}

// Add to sync queue when offline
function addToSyncQueue(type: string, data: any) {
  const queue = getSyncQueue()
  queue.push({
    id: Date.now(),
    type,
    data,
    timestamp: Date.now(),
    retries: 0
  })
  localStorage.setItem('qf_pending_sync', JSON.stringify(queue))
}

// Process sync queue when back online
async function processSyncQueue() {
  const queue = getSyncQueue()
  
  for (const item of queue) {
    try {
      await syncItem(item)
      removeFromQueue(item.id)
    } catch (error) {
      item.retries++
      if (item.retries >= 3) {
        // Move to failed queue
        addToFailedQueue(item)
        removeFromQueue(item.id)
      }
    }
  }
}
```

### Network Status Detection

```typescript
// Monitor network status
window.addEventListener('online', () => {
  console.log('Back online, processing sync queue')
  processSyncQueue()
})

window.addEventListener('offline', () => {
  console.log('Offline mode activated')
  showOfflineIndicator()
})
```

## Error Handling

### Client-Side Error Handling

```typescript
async function makeAPICall<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, options)
    
    if (!response.ok) {
      const error = await response.json()
      throw new APIError(error.message, error.code, response.status)
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      // Handle API errors
      handleAPIError(error)
    } else if (error instanceof TypeError) {
      // Network error
      handleNetworkError()
    } else {
      // Unknown error
      handleUnknownError(error)
    }
    throw error
  }
}

class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}
```

### Retry Logic

```typescript
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetcher()
    } catch (error) {
      if (i === retries - 1) throw error
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw new Error('Max retries exceeded')
}
```

## Best Practices

### 1. Always Use TypeScript

```typescript
// ✅ Good
interface XPAwardRequest {
  userId: string
  action: string
  xpAmount: number
  timestamp: number
}

async function awardXP(request: XPAwardRequest): Promise<XPAwardResponse> {
  // ...
}

// ❌ Bad
async function awardXP(data: any): Promise<any> {
  // ...
}
```

### 2. Implement Proper Error Handling

```typescript
// ✅ Good
try {
  const result = await fetchData()
  return result
} catch (error) {
  if (error instanceof APIError) {
    showErrorToast(error.message)
  }
  // Queue for retry if offline
  if (!navigator.onLine) {
    addToSyncQueue('fetch_data', {})
  }
  throw error
}

// ❌ Bad
const result = await fetchData()
return result
```

### 3. Use Cache Effectively

```typescript
// ✅ Good
const CACHE_DURATION = {
  xp: 5 * 60 * 1000,      // 5 minutes
  quests: 10 * 60 * 1000,  // 10 minutes
  achievements: 60 * 60 * 1000  // 1 hour
}

// ❌ Bad
const CACHE_DURATION = 300000  // Magic number
```

### 4. Validate Data

```typescript
// ✅ Good
function validateXPAward(data: any): XPAwardRequest {
  if (!data.userId || typeof data.userId !== 'string') {
    throw new Error('Invalid userId')
  }
  if (!data.xpAmount || data.xpAmount <= 0) {
    throw new Error('Invalid xpAmount')
  }
  return data as XPAwardRequest
}

// ❌ Bad
function processXPAward(data: any) {
  // No validation
  awardXP(data)
}
```

### 5. Use Request IDs for Debugging

```typescript
// ✅ Good
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function makeRequest(endpoint: string) {
  const requestId = generateRequestId()
  console.log(`[${requestId}] Starting request to ${endpoint}`)
  
  try {
    const result = await fetch(endpoint, {
      headers: { 'X-Request-ID': requestId }
    })
    console.log(`[${requestId}] Success`)
    return result
  } catch (error) {
    console.error(`[${requestId}] Failed:`, error)
    throw error
  }
}
```

## Examples

### Complete XP Award Flow

```typescript
// src/lib/xp.ts
export async function awardXPForTrade(
  userId: string,
  tradeId: string,
  profit: number
) {
  // Determine XP amount
  const xpAmount = profit > 0 ? 50 : 10
  const action = profit > 0 ? 'profitable_trade' : 'trade_execution'
  
  // Update local state immediately
  const currentXP = getLocalXP(userId)
  const newXP = currentXP + xpAmount
  setLocalXP(userId, newXP)
  
  // Show toast
  showXPToast(xpAmount, action)
  
  // Try to sync with backend
  try {
    const response = await fetch('/api/xp/award', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getLicenseKey()}`,
        'X-User-ID': userId
      },
      body: JSON.stringify({
        userId,
        action,
        xpAmount,
        timestamp: Date.now(),
        metadata: { tradeId, profit }
      })
    })
    
    const result = await response.json()
    
    // Handle level up
    if (result.leveledUp) {
      showLevelUpAnimation(result.level)
      
      // Show achievement unlocks
      result.achievements?.forEach(achievement => {
        showAchievementUnlock(achievement)
      })
    }
    
    // Sync local state with server
    if (result.newXP !== newXP) {
      setLocalXP(userId, result.newXP)
    }
    
    return result
  } catch (error) {
    console.error('Failed to sync XP:', error)
    
    // Queue for later sync
    addToSyncQueue('xp_award', {
      userId,
      action,
      xpAmount,
      timestamp: Date.now(),
      metadata: { tradeId, profit }
    })
    
    // Return local data
    return {
      success: true,
      newXP,
      level: calculateLevel(newXP),
      leveledUp: false
    }
  }
}
```

### Quest Progress Tracking

```typescript
// src/lib/quests.ts
export async function updateQuestProgress(
  userId: string,
  questId: string,
  increment: number = 1
) {
  // Get current progress from cache
  const quests = getCachedQuests(userId)
  const quest = quests.find(q => q.id === questId)
  
  if (!quest || quest.completed) return
  
  // Update local progress
  const newProgress = Math.min(quest.progress + increment, quest.goal)
  quest.progress = newProgress
  
  // Check completion
  const completed = newProgress >= quest.goal
  if (completed) {
    quest.completed = true
    quest.completedAt = Date.now()
    
    // Award XP
    await awardXP(userId, 'quest_complete', quest.xpReward)
    
    // Show completion notification
    showQuestCompleteToast(quest)
  }
  
  // Update cache
  setCachedQuests(userId, quests)
  
  // Sync with backend
  try {
    await fetch('/api/quests/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getLicenseKey()}`,
        'X-User-ID': userId
      },
      body: JSON.stringify({
        userId,
        questId,
        progress: newProgress,
        timestamp: Date.now()
      })
    })
  } catch (error) {
    // Queue for sync
    addToSyncQueue('quest_progress', {
      userId,
      questId,
      progress: newProgress
    })
  }
}
```

---

## Summary

This API integration guide provides:

1. **Complete API endpoint documentation** with request/response formats
2. **Authentication flows** using license keys
3. **Offline-first strategies** with caching and sync queues
4. **Error handling patterns** for robust applications
5. **Best practices** for clean, maintainable code
6. **Real-world examples** for common use cases

For additional help:
- [Main README](./README.md) - Full project documentation
- [Backend API Example](./BACKEND_API_EXAMPLE.md) - Server implementation
- [PRD](./PRD.md) - Product requirements

---

**Last Updated:** November 2024
