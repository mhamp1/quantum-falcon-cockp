# Data-Tour Attributes TODO
## Required for Interactive Onboarding Tour

---

## ⚠️ ACTION REQUIRED

The interactive onboarding tour is now fully functional, but it requires specific HTML elements to have `data-tour` attributes so it can find and highlight them.

**Without these attributes, the tour will not be able to locate targets and will appear broken.**

---

## 📍 ATTRIBUTES TO ADD

### 1. Dashboard Component (`/src/components/dashboard/EnhancedDashboard.tsx`)

#### Stat Cards (Step 2)
**Target:** All 4 stat cards showing portfolio value, active bots, total trades, and P&L

```tsx
// Find each stat card container/wrapper and add:
<div data-tour="stat-card" className="...">
  {/* Portfolio value card */}
</div>

<div data-tour="stat-card" className="...">
  {/* Active bots card */}
</div>

<div data-tour="stat-card" className="...">
  {/* Total trades card */}
</div>

<div data-tour="stat-card" className="...">
  {/* P&L card */}
</div>
```

#### Neural Forecast Confidence Bar (Step 3)
**Target:** The green confidence percentage bar in the neural forecast widget

```tsx
// Find the confidence bar element and add:
<div data-tour="confidence-bar" className="...">
  {/* Confidence percentage visualization */}
</div>
```

#### Quick Actions - Start Bot Button (Step 4)
**Target:** The "Start Bot" button (typically red or primary colored)

```tsx
// Find the Start Bot button and add:
<Button data-tour="start-bot-button" className="...">
  <Play /> Start Bot
</Button>
```

---

### 2. Strategy Builder Component (`/src/components/strategy/CreateStrategyPage.tsx`)

#### Feature Cards (Step 5)
**Target:** Feature cards showcasing Monaco editor, backtesting, sharing, etc.

```tsx
// Find each feature card and add:
<div data-tour="feature-card" className="...">
  {/* Monaco Editor feature */}
</div>

<div data-tour="feature-card" className="...">
  {/* Real-time Backtesting feature */}
</div>

<div data-tour="feature-card" className="...">
  {/* One-Click Sharing feature */}
</div>

// etc...
```

---

### 3. Trading Hub Component (`/src/components/trade/AdvancedTradingHub.tsx`)

#### Strategy Cards (Step 6)
**Target:** Pre-built strategy cards, especially "DCA Basic"

```tsx
// Find each strategy card and add:
<div data-tour="strategy-card" className="...">
  {/* DCA Basic strategy */}
</div>

<div data-tour="strategy-card" className="...">
  {/* Grid Trading strategy */}
</div>

// etc...
```

**IMPORTANT:** The "DCA Basic" card is specifically mentioned in the tour, so ensure at least one card has this attribute.

---

### 4. Vault Component (`/src/components/vault/VaultView.tsx`)

#### Deposit BTC Button (Step 7)
**Target:** The prominent "Deposit BTC" button

```tsx
// Find the Deposit BTC button and add:
<Button data-tour="deposit-btc-button" className="...">
  <Bitcoin /> Deposit BTC
</Button>
```

**If this button doesn't exist, you MUST create it:**

```tsx
<Button 
  data-tour="deposit-btc-button"
  size="lg"
  className="bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary"
  onClick={() => {
    // Open deposit modal or handle deposit action
  }}
>
  <Bitcoin size={20} weight="fill" className="mr-2" />
  Deposit BTC
</Button>
```

---

## 🔍 HOW TO VERIFY

### Manual Testing
1. Open browser DevTools (F12)
2. Open Elements/Inspector tab
3. Use Find (Ctrl+F / Cmd+F)
4. Search for: `data-tour="`
5. Verify all required attributes are present

### Console Verification
The tour will log warnings if it cannot find targets:
```
📍 Tour: Attaching click listeners to 0 elements for step "dashboard-stats"
```

If you see `0 elements`, the `data-tour` attribute is missing.

---

## ✅ COMPLETE CHECKLIST

- [ ] **Dashboard:** 4 stat cards have `data-tour="stat-card"`
- [ ] **Dashboard:** Confidence bar has `data-tour="confidence-bar"`
- [ ] **Dashboard:** Start Bot button has `data-tour="start-bot-button"`
- [ ] **Strategy Builder:** Feature cards have `data-tour="feature-card"`
- [ ] **Trading Hub:** Strategy cards have `data-tour="strategy-card"`
- [ ] **Trading Hub:** "DCA Basic" card specifically has the attribute
- [ ] **Vault:** Deposit BTC button has `data-tour="deposit-btc-button"`

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ Wrong Selector
```tsx
// Wrong - missing quotes
<div data-tour=stat-card>

// Wrong - using class selector
<div className="stat-card">

// Correct
<div data-tour="stat-card">
```

### ❌ Attribute on Wrong Element
```tsx
// Wrong - on outer wrapper that's not clickable
<div data-tour="stat-card">
  <div className="actual-clickable-card">
    ...
  </div>
</div>

// Correct - on the actual clickable element
<div className="wrapper">
  <div data-tour="stat-card" className="actual-clickable-card">
    ...
  </div>
</div>
```

### ❌ Conditional Rendering
```tsx
// Wrong - attribute disappears when condition changes
{isLoading ? (
  <Skeleton />
) : (
  <div data-tour="stat-card">...</div>
)}

// Better - always render the attribute
<div data-tour="stat-card">
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

---

## 💡 BEST PRACTICES

### Multiple Targets (e.g., 4 stat cards)
The tour can handle multiple elements with the same attribute:
```tsx
// All 4 cards get highlighted, clicking ANY advances tour
<div data-tour="stat-card">Card 1</div>
<div data-tour="stat-card">Card 2</div>
<div data-tour="stat-card">Card 3</div>
<div data-tour="stat-card">Card 4</div>
```

### Dynamic Content
Ensure attributes persist through re-renders:
```tsx
// Correct - attribute is part of base markup
const StatCard = ({ title, value }) => (
  <div data-tour="stat-card" className="...">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
)
```

### Deeply Nested Elements
The tour uses `querySelectorAll`, so it can find deeply nested elements:
```tsx
<Layout>
  <Container>
    <Grid>
      <Column>
        <Card data-tour="stat-card">
          {/* Will be found */}
        </Card>
      </Column>
    </Grid>
  </Container>
</Layout>
```

---

## 🔧 DEBUGGING TIPS

### Tour Not Finding Target
1. Check browser console for tour logs
2. Use DevTools Elements tab to search for attribute
3. Verify element is visible (not `display: none`)
4. Verify element is in the DOM (not conditionally unmounted)

### Tour Finding But Not Clickable
1. Check z-index conflicts
2. Check if element has `pointer-events: none`
3. Check if overlay is covering element (shouldn't happen with new spotlight system)
4. Check if element is truly clickable (has onClick or is a button)

### Tour Spotlight Wrong Position
1. Element may be re-rendering during tour
2. Element may have transforms/animations affecting position
3. Check console for `updateTargetRect()` errors

---

## 📝 EXAMPLE: Complete Dashboard Stat Card

```tsx
// Full example with data-tour attribute
export function PortfolioStatCard() {
  const [portfolioValue, setPortfolioValue] = useState(12750.43)
  
  return (
    <motion.div
      data-tour="stat-card"  // ← THE CRITICAL ATTRIBUTE
      className="cyber-card p-6 hover:-translate-y-1 transition-all cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        // Handle card click
        console.log('Stat card clicked')
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
          Portfolio Value
        </h3>
        <Wallet size={20} className="text-primary" />
      </div>
      
      <p className="text-3xl font-black text-primary">
        ${portfolioValue.toLocaleString()}
      </p>
      
      <div className="flex items-center gap-2 mt-2">
        <TrendUp size={14} className="text-green-400" />
        <span className="text-xs text-green-400">+12.5% today</span>
      </div>
    </motion.div>
  )
}
```

---

## 🎯 PRIORITY ORDER

### Must-Have (Tour will break without these)
1. ✅ Dashboard stat cards (`data-tour="stat-card"`)
2. ✅ Vault Deposit BTC button (`data-tour="deposit-btc-button"`)
3. ✅ Trading strategy cards (`data-tour="strategy-card"`)

### Should-Have (Tour will skip steps without these)
4. ✅ Dashboard Start Bot button (`data-tour="start-bot-button"`)
5. ✅ Strategy builder features (`data-tour="feature-card"`)

### Nice-to-Have (Mobile skips this anyway)
6. ✅ Neural forecast confidence bar (`data-tour="confidence-bar"`)

---

## ✅ VERIFICATION SCRIPT

Run this in browser console to check attributes:

```javascript
const tourSelectors = [
  'stat-card',
  'confidence-bar',
  'start-bot-button',
  'feature-card',
  'strategy-card',
  'deposit-btc-button'
]

tourSelectors.forEach(selector => {
  const elements = document.querySelectorAll(`[data-tour="${selector}"]`)
  console.log(`${selector}: ${elements.length} element(s) found`)
  
  if (elements.length === 0) {
    console.warn(`⚠️ Missing: data-tour="${selector}"`)
  } else {
    console.log(`✅ Found: data-tour="${selector}"`)
  }
})
```

Expected output:
```
stat-card: 4 element(s) found
✅ Found: data-tour="stat-card"
confidence-bar: 1 element(s) found
✅ Found: data-tour="confidence-bar"
start-bot-button: 1 element(s) found
✅ Found: data-tour="start-bot-button"
feature-card: 3 element(s) found
✅ Found: data-tour="feature-card"
strategy-card: 5 element(s) found
✅ Found: data-tour="strategy-card"
deposit-btc-button: 1 element(s) found
✅ Found: data-tour="deposit-btc-button"
```

---

**This is the ONLY remaining step to make the tour 100% functional.**

Once these attributes are added, the tour will work perfectly on first run.

---

**Last Updated:** November 20, 2025
**Status:** 🚧 ATTRIBUTES REQUIRED
