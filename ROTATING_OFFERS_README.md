# 🔄 Rotating Offers System - Developer Guide

## Overview
The Rotating Offers system provides 50 unique special offers that automatically rotate every 3 days, keeping the community tab fresh and engaging. Each offer provides temporary boosts, upgrades, or perks across 6 distinct categories.

## System Architecture

### Core Files
```
/src/lib/rotatingOffers.ts          # Core rotation logic + 50 offer definitions
/src/components/community/SocialCommunity.tsx  # UI implementation
```

### Key Functions

#### `getRotatingOffers(count: number): RotatingOffer[]`
Returns a deterministic set of offers based on current 3-day rotation cycle.
```typescript
const offers = getRotatingOffers(6) // Get 6 offers for display
```

#### `getTimeUntilNextRotation(): { days, hours, minutes }`
Calculates remaining time until offers rotate.
```typescript
const { days, hours, minutes } = getTimeUntilNextRotation()
```

#### `getNextRotationTime(): Date`
Returns exact timestamp of next rotation.

## Offer Categories

### ⚡ Trading (10 offers)
High-performance trading tools and execution enhancements
- Price range: $3.99 - $15.99
- Duration: 72h - 336h
- Examples: Sniper Mode Pro, Whale Radar, DCA Optimizer Plus

### 📊 Analytics (10 offers)
Advanced market intelligence and data visualization
- Price range: $5.99 - $19.99
- Duration: 168h - 336h
- Examples: Market Intel Pro, Sentiment Scanner, Risk Index Dashboard

### 🎨 Cosmetic (10 offers)
Visual themes and UI enhancements
- Price range: $2.99 - $5.99
- Duration: 72h - 168h
- Examples: Neon Cockpit Theme, Holographic Frames, Cyberpunk Background

### 👥 Community (10 offers)
Social features and collaboration tools
- Price range: $5.99 - $24.99
- Duration: 72h - 336h (some permanent)
- Examples: Community Spotlight, Mentor Pairing, Poll Boost

### 🔐 Security (5 offers)
Account protection and vault enhancements
- Price range: Free - $9.99
- Duration: 24h - 168h (some one-time)
- Examples: Vault Backup, Security Audit, Encrypted Messages

### 🎮 Gamification (5 offers)
Fun challenges and rewards
- Price range: Free - $5.99
- Duration: Varies
- Examples: Mystery Loot Box, Daily Challenge Unlock, Trivia Challenge

## Rotation Logic

### How It Works
1. **Deterministic Shuffling**: Uses current Unix timestamp divided by 3-day intervals as seed
2. **All Users See Same Offers**: Same rotation for everyone on the same 3-day cycle
3. **No Repeats**: Full deck of 50 cycles before reshuffling
4. **Smooth Transitions**: Timer updates every minute

### Timeline Example
```
Day 0-3:   Offers #1-6 from shuffled deck
Day 3-6:   Offers #7-12 from shuffled deck
Day 6-9:   Offers #13-18 from shuffled deck
Day 9-12:  Offers #19-24 from shuffled deck
...
Day 24-27: Offers #49-50, #1-4 (reshuffle after full cycle)
```

### Code Example
```typescript
// The rotation seed changes every 3 days
const rotationSeed = Math.floor(Date.now() / (3 * 24 * 60 * 60 * 1000))

// Same seed = same shuffle order for all users
const shuffled = ALL_ROTATING_OFFERS.sort((a, b) => {
  const hashA = simpleHash(a.id + rotationSeed)
  const hashB = simpleHash(b.id + rotationSeed)
  return hashA - hashB
})
```

## Offer Data Structure

```typescript
interface RotatingOffer {
  id: string                    // Unique identifier
  title: string                 // Display name (uppercase)
  subtitle?: string             // Optional tagline
  description: string           // Full description
  price: number                 // USD price (0 for free)
  icon: Icon                    // Phosphor icon component
  category: Category            // One of 6 categories
  duration?: number             // Hours active (optional)
  benefit1?: string             // Key benefit 1
  benefit2?: string             // Key benefit 2
  benefit3?: string             // Key benefit 3
  tier?: 'boost' | 'pro' | 'elite'  // Difficulty tier
}
```

## UI Implementation

### Display Count
Currently showing 6 offers per rotation. Adjust in component:
```typescript
setRotatingOffers(getRotatingOffers(6)) // Change 6 to any number
```

### Purchase Flow
1. User clicks "ACTIVATE_NOW" button
2. `purchaseOffer()` function called
3. Check if already purchased
4. Show success toast
5. Add to purchased list via `useKV`
6. Mark card as "OWNED"

### Tooltips
Every offer card has a comprehensive tooltip showing:
- Full description
- Key benefits breakdown
- Category and tier
- Duration if applicable
- User instruction hint

Tooltip trigger: Hover over card for 150ms

## Real-Time Integration

### API Endpoint Structure (To Implement)

#### GET /api/offers/current
Returns current rotation of offers
```json
{
  "offers": [...],
  "rotationEndsAt": "2024-01-15T00:00:00Z",
  "rotationNumber": 42
}
```

#### POST /api/offers/purchase
Purchase an offer
```json
{
  "offerId": "sniper-mode-pro",
  "userId": "user_123",
  "paymentMethod": "stripe_xyz"
}
```

#### WebSocket: /ws/offers
Real-time offer updates
```json
{
  "type": "OFFER_PURCHASED",
  "offerId": "whale-radar",
  "userId": "user_123",
  "timestamp": 1705276800000
}
```

### Integration Steps

1. **Replace Static Data**
```typescript
// Before
const offers = getRotatingOffers(6)

// After
const [offers, setOffers] = useState<RotatingOffer[]>([])

useEffect(() => {
  fetch('/api/offers/current')
    .then(res => res.json())
    .then(data => setOffers(data.offers))
}, [])
```

2. **Add Purchase Handler**
```typescript
const purchaseOffer = async (offer: RotatingOffer) => {
  const response = await fetch('/api/offers/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerId: offer.id,
      price: offer.price
    })
  })
  
  if (response.ok) {
    toast.success('Purchase successful!')
    setPurchasedOffers(prev => [...prev, offer.id])
  }
}
```

3. **Connect WebSocket**
```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.quantumfalcon.ai/ws/offers')
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'ROTATION_UPDATE') {
      setRotatingOffers(data.offers)
    }
  }
  
  return () => ws.close()
}, [])
```

## Testing

### Manual Testing Checklist
- [ ] Offers display correctly (6 cards)
- [ ] Hover tooltip shows full details
- [ ] Timer counts down accurately
- [ ] Purchase marks card as "OWNED"
- [ ] Owned state persists after refresh
- [ ] Mobile layout works (responsive grid)
- [ ] Cards style properly by category
- [ ] All 50 offers have valid data

### Rotation Testing
```typescript
// Test rotation in console
import { getRotatingOffers, getTimeUntilNextRotation } from '@/lib/rotatingOffers'

// See current offers
console.log(getRotatingOffers(10))

// Check timer
console.log(getTimeUntilNextRotation())

// Test at different timestamps
const futureDate = new Date('2024-02-01')
console.log(getRotatingOffersAtTime(futureDate, 10))
```

## Performance Considerations

### Optimizations Implemented
- ✅ Memoized rotation calculation
- ✅ Icon components lazy loaded
- ✅ Timer updates only every 60 seconds
- ✅ Purchase state persisted with useKV

### Future Optimizations
- [ ] Virtual scrolling for large offer counts
- [ ] Image lazy loading for cosmetic previews
- [ ] Debounced search/filter
- [ ] Service worker for offline mode

## Customization

### Adding New Offers
1. Add to `ALL_ROTATING_OFFERS` array in `/src/lib/rotatingOffers.ts`
2. Import required icon from `@phosphor-icons/react`
3. Assign category, tier, price, duration
4. Write compelling copy (title, description, benefits)
5. Test that total count remains balanced

### Changing Rotation Frequency
```typescript
// In rotatingOffers.ts, change interval:
const threeDays = 3 * 24 * 60 * 60 * 1000  // Change 3 to desired days
```

### Adjusting Display Count
```typescript
// In SocialCommunity.tsx:
setRotatingOffers(getRotatingOffers(8))  // Show 8 instead of 6
```

## Analytics Events (To Implement)

Track these events for insights:
```typescript
// Offer viewed
analytics.track('offer_viewed', { offerId, category, rotationNumber })

// Offer purchased
analytics.track('offer_purchased', { offerId, price, category })

// Tooltip opened
analytics.track('offer_tooltip_viewed', { offerId })

// Rotation changed
analytics.track('rotation_changed', { rotationNumber, timestamp })
```

## Troubleshooting

### Timer Not Updating
Check that `setInterval` is clearing properly:
```typescript
useEffect(() => {
  const interval = setInterval(updateTimer, 60000)
  return () => clearInterval(interval)  // Must cleanup
}, [])
```

### Offers Not Shuffling
Verify timestamp calculation:
```typescript
const seed = Math.floor(Date.now() / (3 * 24 * 60 * 60 * 1000))
console.log('Current seed:', seed)
```

### Purchase Not Persisting
Check `useKV` hook usage:
```typescript
const [purchased, setPurchased] = useKV<string[]>('purchased-offers', [])
// Must use functional update
setPurchased(prev => [...prev, newId])
```

## Best Practices

### DO ✅
- Show tooltips on all cards for discoverability
- Keep descriptions concise but informative
- Balance offer pricing across categories
- Test rotation logic at edge cases (day boundaries)
- Persist purchase state for user convenience

### DON'T ❌
- Don't show too many offers at once (6-8 is optimal)
- Don't rotate more frequently than 1 day (users need time to evaluate)
- Don't make tooltips too slow or too fast (150ms is ideal)
- Don't forget to clear intervals on unmount
- Don't expose pricing logic in client code (use API)

## Future Enhancements

### Planned Features
- [ ] Offer search and filtering
- [ ] Category tabs for browsing all 50
- [ ] Wishlist to get notified when specific offer rotates
- [ ] Purchase history with usage tracking
- [ ] Gift offers to other users
- [ ] Bundle discounts (buy 3, get 1 free)
- [ ] Seasonal special offers
- [ ] Limited quantity offers (first 100 users)

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: Quantum Falcon Team
