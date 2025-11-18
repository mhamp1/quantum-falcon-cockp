# Mobile Backend API Specification

This document specifies the backend API endpoints that need to be implemented in the desktop repository to support the Flutter mobile app's XP gamification features.

## Base URL

All endpoints are relative to: `https://api.quantumfalcon.com` (or your configured base URL)

## Authentication

All requests should include authentication headers:
```
Authorization: Bearer <user_token>
```

## Content Type

All requests and responses use JSON:
```
Content-Type: application/json
Accept: application/json
```

---

## XP Endpoints

### GET /api/xp

Get current user's XP data.

**Request:**
```http
GET /api/xp HTTP/1.1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "currentXp": 150,
  "level": 3,
  "nextLevelXp": 300,
  "totalXp": 450,
  "multiplier": 1.5,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication
- `500 Internal Server Error`: Server error

---

### POST /api/xp/award

Award XP to the authenticated user.

**Request:**
```http
POST /api/xp/award HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50,
  "reason": "Completed trade",
  "actionType": "trade_execution",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "amount": 50,
  "reason": "Completed trade",
  "actionType": "trade_execution",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "leveledUp": false
}
```

**Response with Level Up (200 OK):**
```json
{
  "amount": 100,
  "reason": "Completed quest",
  "actionType": "quest_complete",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "leveledUp": true,
  "newLevel": 4
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid authentication
- `500 Internal Server Error`: Server error

---

### GET /api/xp/leaderboard

Get XP leaderboard.

**Request:**
```http
GET /api/xp/leaderboard?limit=100&period=all_time HTTP/1.1
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of entries (default: 100, max: 1000)
- `period` (optional): Time period - `all_time`, `weekly`, `monthly` (default: `all_time`)

**Response (200 OK):**
```json
{
  "leaderboard": [
    {
      "userId": "user_123",
      "username": "TradingMaster",
      "totalXp": 5000,
      "level": 15,
      "rank": 1
    },
    {
      "userId": "user_456",
      "username": "CryptoNinja",
      "totalXp": 4500,
      "level": 14,
      "rank": 2
    }
  ],
  "currentUserRank": 42,
  "totalUsers": 1000
}
```

---

## Quest Endpoints

### GET /api/quests

Get all available quests for the user.

**Request:**
```http
GET /api/quests?category=daily HTTP/1.1
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): Filter by category - `daily`, `weekly`, `monthly`, `achievement`, `special`

**Response (200 OK):**
```json
{
  "quests": [
    {
      "id": "quest_123",
      "title": "First Trade",
      "description": "Complete your first trade",
      "category": "daily",
      "xpReward": 100,
      "progress": 0,
      "target": 1,
      "isCompleted": false,
      "expiresAt": "2024-01-16T00:00:00.000Z",
      "completedAt": null
    },
    {
      "id": "quest_456",
      "title": "Win Streak",
      "description": "Win 5 trades in a row",
      "category": "achievement",
      "xpReward": 500,
      "progress": 3,
      "target": 5,
      "isCompleted": false,
      "expiresAt": null,
      "completedAt": null
    }
  ],
  "totalQuests": 10,
  "completedQuests": 3
}
```

---

### GET /api/quests/:id

Get a specific quest by ID.

**Request:**
```http
GET /api/quests/quest_123 HTTP/1.1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "quest_123",
  "title": "First Trade",
  "description": "Complete your first trade",
  "category": "daily",
  "xpReward": 100,
  "progress": 0,
  "target": 1,
  "isCompleted": false,
  "expiresAt": "2024-01-16T00:00:00.000Z",
  "completedAt": null
}
```

**Error Responses:**
- `404 Not Found`: Quest not found

---

### POST /api/quests/:id/progress

Update quest progress.

**Request:**
```http
POST /api/quests/quest_123/progress HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 1,
  "increment": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Request Body:**
- `progress`: Number to add/set
- `increment`: If true, adds to current progress; if false, sets progress to value
- `timestamp`: When the progress was made

**Response (200 OK):**
```json
{
  "id": "quest_123",
  "title": "First Trade",
  "description": "Complete your first trade",
  "category": "daily",
  "xpReward": 100,
  "progress": 1,
  "target": 1,
  "isCompleted": true,
  "expiresAt": "2024-01-16T00:00:00.000Z",
  "completedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note:** If quest is completed (progress >= target), automatically awards XP and sets `isCompleted` to true.

---

### POST /api/quests/:id/complete

Manually mark a quest as completed.

**Request:**
```http
POST /api/quests/quest_123/complete HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "completedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "xpAwarded": 100,
  "quest": {
    "id": "quest_123",
    "isCompleted": true,
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Streak Endpoints

### GET /api/streaks

Get all user streaks.

**Request:**
```http
GET /api/streaks HTTP/1.1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "streaks": [
    {
      "currentStreak": 5,
      "longestStreak": 10,
      "streakStartDate": "2024-01-10T00:00:00.000Z",
      "lastActivityDate": "2024-01-15T10:30:00.000Z",
      "type": "daily_login",
      "xpBonusPerMilestone": 500,
      "nextMilestone": 7,
      "isActive": true
    },
    {
      "currentStreak": 3,
      "longestStreak": 8,
      "streakStartDate": "2024-01-13T00:00:00.000Z",
      "lastActivityDate": "2024-01-15T10:30:00.000Z",
      "type": "trading",
      "xpBonusPerMilestone": 500,
      "nextMilestone": 7,
      "isActive": true
    }
  ],
  "totalActiveStreaks": 2,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /api/streaks/:type

Get a specific streak by type.

**Request:**
```http
GET /api/streaks/daily_login HTTP/1.1
Authorization: Bearer <token>
```

**Types:**
- `daily_login`: Daily login streak
- `trading`: Trading activity streak
- `learning`: Learning/tutorial completion streak
- `community`: Community engagement streak

**Response (200 OK):**
```json
{
  "currentStreak": 5,
  "longestStreak": 10,
  "streakStartDate": "2024-01-10T00:00:00.000Z",
  "lastActivityDate": "2024-01-15T10:30:00.000Z",
  "type": "daily_login",
  "xpBonusPerMilestone": 500,
  "nextMilestone": 7,
  "isActive": true
}
```

**Error Responses:**
- `404 Not Found`: Streak type not found or not started

---

### POST /api/streaks/:type/activity

Record streak activity.

**Request:**
```http
POST /api/streaks/daily_login/activity HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "currentStreak": 6,
  "longestStreak": 10,
  "streakStartDate": "2024-01-10T00:00:00.000Z",
  "lastActivityDate": "2024-01-15T10:30:00.000Z",
  "type": "daily_login",
  "xpBonusPerMilestone": 500,
  "nextMilestone": 7,
  "isActive": true,
  "milestoneReached": false
}
```

**Response with Milestone (200 OK):**
```json
{
  "currentStreak": 7,
  "longestStreak": 10,
  "streakStartDate": "2024-01-10T00:00:00.000Z",
  "lastActivityDate": "2024-01-15T10:30:00.000Z",
  "type": "daily_login",
  "xpBonusPerMilestone": 500,
  "nextMilestone": 14,
  "isActive": true,
  "milestoneReached": true,
  "bonusXpAwarded": 500
}
```

**Note:** If a milestone is reached (currentStreak % nextMilestone === 0), automatically awards bonus XP.

---

## Error Handling

All endpoints follow standard HTTP error codes:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Missing required field: amount",
  "code": "INVALID_REQUEST"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token",
  "code": "UNAUTHORIZED"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Quest with id 'quest_123' not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:
- **Standard endpoints**: 100 requests per minute per user
- **Award XP endpoint**: 60 requests per minute per user
- **Leaderboard endpoint**: 10 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642251600
```

---

## WebSocket Support (Optional)

For real-time updates, implement WebSocket connection:

**Connection:**
```
wss://api.quantumfalcon.com/ws?token=<user_token>
```

**Events:**
- `xp:awarded` - XP was awarded
- `quest:updated` - Quest progress updated
- `quest:completed` - Quest completed
- `streak:updated` - Streak activity recorded
- `level:up` - User leveled up

**Example Event:**
```json
{
  "event": "xp:awarded",
  "data": {
    "amount": 50,
    "reason": "Trade completed",
    "newTotal": 500
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Implementation Checklist

- [ ] Set up API routes in backend
- [ ] Implement authentication middleware
- [ ] Create database schema for XP, quests, streaks
- [ ] Implement XP calculation logic
- [ ] Implement quest progress tracking
- [ ] Implement streak calculation logic
- [ ] Add rate limiting
- [ ] Add logging and monitoring
- [ ] Write backend tests
- [ ] Set up CORS for mobile app
- [ ] Deploy to production
- [ ] Update mobile app .env with production URL

---

## Testing

Use the following curl commands to test endpoints:

**Test XP endpoint:**
```bash
curl -X GET https://api.quantumfalcon.com/api/xp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Test award XP:**
```bash
curl -X POST https://api.quantumfalcon.com/api/xp/award \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Test award",
    "actionType": "test",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }'
```

**Test quest progress:**
```bash
curl -X POST https://api.quantumfalcon.com/api/quests/quest_123/progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 1,
    "increment": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }'
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Rate Limiting**: Prevent abuse with rate limits
3. **Input Validation**: Validate all inputs server-side
4. **SQL Injection**: Use parameterized queries
5. **XSS Prevention**: Sanitize all outputs
6. **HTTPS Only**: Never allow HTTP in production
7. **CORS**: Configure CORS to allow only mobile app origin

---

## Support

For questions about this API specification:
- GitHub Issues: https://github.com/mhamp1/quantum-falcon-cockp/issues
- Email: backend@quantumfalcon.com
