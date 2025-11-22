# Quantum Falcon Cockpit - Pricing Configuration System

**Version:** v2025.1.0  
**Effective Date:** November 21, 2025  
**Status:** ✅ Implemented

---

## Overview

The Quantum Falcon Cockpit now uses a **centralized, canonical pricing configuration system** that eliminates hard-coded pricing throughout the application. All pricing data is controlled by a single JSON configuration file and accessed via a strongly-typed React hook.

## Key Benefits

1. **Single Source of Truth**: All pricing data lives in `config/pricing_config.json`
2. **Easy Updates**: Change prices/tiers in one place, updates everywhere instantly
3. **Type Safety**: Full TypeScript support prevents pricing errors
4. **A/B Testing Ready**: Swap configs without touching code
5. **Consistent Display**: All UIs render from the same data source

---

## Architecture

### File Structure

```
quantum-falcon-cockp/
├── config/
│   └── pricing_config.json          # Canonical pricing data
├── src/
│   ├── lib/
│   │   └── pricingTypes.ts          # TypeScript type definitions
│   ├── hooks/
│   │   └── usePricingConfig.ts      # React hook for accessing pricing
│   └── components/
│       └── settings/
│           ├── SubscriptionTiers.tsx    # Main pricing page
│           └── SubscriptionUpgrade.tsx  # Upgrade modals
```

### Components

#### 1. **`config/pricing_config.json`**
Central pricing configuration with:
- Version and effective date tracking
- 6 tiers: Free, Starter, Trader, Pro Trader, Elite Trader, Lifetime Access
- Complete feature specifications per tier
- Metadata for UI rendering (badges, colors, sort order)

#### 2. **`src/lib/pricingTypes.ts`**
TypeScript interfaces that define:
- `PricingConfig` - Root configuration object
- `PricingTier` - Individual tier structure
- `PricingNotes` - Marketing narrative metadata

#### 3. **`src/hooks/usePricingConfig.ts`**
React hook that provides:
- `config` - Full pricing configuration
- `tiers` - All tiers sorted by `sortOrder`
- `visibleTiers` - Only tiers marked visible
- `mostPopularTier` - The tier marked most popular
- `whaleTier` - First whale tier (Elite Trader)
- `lifetimeTier` - The lifetime access tier
- `getTierById(id)` - Helper to fetch specific tier

---

## Tier Structure (v2025.1.0)

| Tier ID | Name | Price | Strategies | AI Agents | Multiplier | Status |
|---------|------|-------|------------|-----------|------------|--------|
| `free` | Free | $0 | 1 | 1 | 1x | Standard |
| `starter` | Starter | $29/mo | 6 | 4 | 5x | Standard |
| `trader` | Trader | $79/mo | 18 | 8 | 15x | **Most Popular** |
| `pro-trader` | Pro Trader | $197/mo | 33 | 12 | 25x | Standard |
| `elite-trader` | Elite Trader | $497/mo | 45 | 15 | 40x | **Whale Tier** 👑 |
| `lifetime` | Lifetime Access | $8,000 once | ALL 53+ | ALL 15+ | Unlimited | **Whale Tier** 👑 |

---

## Visual Design

### Standard Tiers (Free, Starter, Trader, Pro Trader)
- **Style**: Cyan cyber-card aesthetic
- **Border**: Standard 1-2px with primary color
- **Badge**: "MOST POPULAR" ribbon for Trader tier
- **Button**: Standard cyan gradient

### Whale Tiers (Elite Trader, Lifetime Access)
- **Style**: Purple/gold gradient with dramatic effects
- **Border**: 4px violet/purple gradient with ring effects
- **Badges**: 
  - "WHALE TIER" gold ribbon with crown icon
  - "ONE-TIME · NEVER EXPIRES" for Lifetime
- **Icons**: Crown badges next to tier names
- **Button**: Gold → Purple → Pink gradient with crown icon
- **Effects**: Shadow glows, hover scale, premium feel

---

## Usage Guide

### For Developers

#### Display Pricing in Any Component

```tsx
import { usePricingConfig } from '@/hooks/usePricingConfig'

function MyComponent() {
  const { visibleTiers, mostPopularTier } = usePricingConfig()
  
  return (
    <div>
      {visibleTiers.map(tier => (
        <div key={tier.id}>
          <h3>{tier.name}</h3>
          <p>{tier.priceDisplay}</p>
          <p>{tier.strategyLibrary.label}</p>
          <p>{tier.aiAgents.label}</p>
          {tier.isMostPopular && <span>⭐ Most Popular</span>}
          {tier.isWhaleTier && <span>👑 Whale Tier</span>}
        </div>
      ))}
    </div>
  )
}
```

#### Get Specific Tier

```tsx
const { getTierById } = usePricingConfig()
const proTier = getTierById('pro-trader')

if (proTier) {
  console.log(`Pro Trader costs ${proTier.priceDisplay}`)
}
```

### For Product/Marketing Teams

#### Update Prices

1. Open `config/pricing_config.json`
2. Modify the `price` or `priceDisplay` fields
3. Update `effectiveDate` and `version`
4. Commit and deploy

**Example: Change Trader tier to $89/month:**

```json
{
  "id": "trader",
  "name": "Trader",
  "price": 89,
  "priceDisplay": "$89/month",
  // ... rest of tier config
}
```

#### Add New Tier

1. Add new tier object to `tiers` array in `pricing_config.json`
2. Set appropriate `sortOrder` (determines display order)
3. Set `isVisibleOnPricingPage: true` to show it
4. No code changes required!

---

## Configuration Reference

### PricingTier Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "elite-trader") |
| `name` | string | Display name (e.g., "Elite Trader") |
| `price` | number | Numeric price value |
| `billingPeriod` | "month" \| "once" | Billing frequency |
| `priceDisplay` | string | Exact UI string (e.g., "$497/month") |
| `strategyLibrary` | object | { count, label } for strategies |
| `aiAgents` | object | { count, label } for AI agents |
| `multiplier` | object | { value, label } for XP multiplier |
| `keyPerks` | string[] | Array of key features |
| `totalPower` | object | { value, label } for power metric |
| `isMostPopular` | boolean | Show "Most Popular" badge |
| `isWhaleTier` | boolean | Apply whale tier styling |
| `isLifetime` | boolean | Is this the lifetime tier |
| `isVisibleOnPricingPage` | boolean | Show on public pricing page |
| `sortOrder` | number | Display order (ascending) |

---

## Migration Notes

### Old Approach (Deprecated)
```tsx
// ❌ DON'T DO THIS ANYMORE
const tiers = [
  { id: 'pro', name: 'Pro', price: 90, features: [...] },
  { id: 'elite', name: 'Elite', price: 145, features: [...] },
  // ...
]
```

### New Approach (Current)
```tsx
// ✅ DO THIS
import { usePricingConfig } from '@/hooks/usePricingConfig'

function Component() {
  const { tiers } = usePricingConfig()
  // All pricing data comes from config
}
```

---

## Testing

### Manual Verification Checklist

- [ ] All 6 tiers display on settings page
- [ ] Trader tier shows "MOST POPULAR" badge
- [ ] Elite and Lifetime have purple/gold whale styling
- [ ] Lifetime shows "$8,000 once" and crown icon
- [ ] All prices match `pricing_config.json` exactly
- [ ] Upgrade modals show correct tier details
- [ ] Mobile view displays pricing correctly

### Future: Automated Tests

When test infrastructure is added:

```typescript
import pricingConfig from '@/config/pricing_config.json'

test('pricing config has exactly 6 tiers', () => {
  expect(pricingConfig.tiers).toHaveLength(6)
})

test('tier IDs are correct', () => {
  const ids = pricingConfig.tiers.map(t => t.id)
  expect(ids).toEqual([
    'free', 'starter', 'trader', 
    'pro-trader', 'elite-trader', 'lifetime'
  ])
})

test('most popular tier is trader', () => {
  const popular = pricingConfig.tiers.find(t => t.isMostPopular)
  expect(popular?.id).toBe('trader')
})
```

---

## Maintenance

### When to Update

1. **Price Changes**: Edit `price` and `priceDisplay` in config
2. **New Features**: Add to `keyPerks` array
3. **Strategy/Agent Count Updates**: Modify `strategyLibrary` or `aiAgents`
4. **New Tier**: Add to `tiers` array with unique `id` and `sortOrder`
5. **Hide Tier**: Set `isVisibleOnPricingPage: false`

### Version Tracking

Always update these fields when modifying pricing:
- `version` - Increment version number (e.g., "v2025.1.1")
- `effectiveDate` - Date when changes take effect (YYYY-MM-DD)
- `notes` - Update narrative if marketing strategy changes

---

## Support

### Questions?
- **Technical Issues**: Check `src/hooks/usePricingConfig.ts` implementation
- **Design Issues**: See whale tier styling in `SubscriptionTiers.tsx`
- **Config Questions**: Refer to `src/lib/pricingTypes.ts` for type definitions

### Common Issues

**Issue**: Tier not showing up  
**Solution**: Check `isVisibleOnPricingPage` is `true`

**Issue**: Wrong display order  
**Solution**: Adjust `sortOrder` values (lower numbers show first)

**Issue**: TypeScript errors importing config  
**Solution**: Ensure `resolveJsonModule: true` in `tsconfig.json`

---

## Changelog

### v2025.1.0 (November 21, 2025)
- ✅ Initial implementation of pricing config system
- ✅ Migrated SubscriptionTiers component to use config
- ✅ Migrated SubscriptionUpgrade component to use config
- ✅ Added whale tier styling for Elite Trader and Lifetime
- ✅ Implemented 6-tier final structure
- ✅ Removed all hard-coded pricing from components

---

**Last Updated:** November 21, 2025  
**Maintained By:** Quantum Falcon Team  
**Status:** Production Ready ✅
