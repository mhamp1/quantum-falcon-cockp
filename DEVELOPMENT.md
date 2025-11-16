# Development Guide

Complete guide for developing and contributing to Quantum Falcon Cockpit.

## Table of Contents

- [Development Environment](#development-environment)
- [Project Architecture](#project-architecture)
- [Code Style](#code-style)
- [Component Development](#component-development)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Performance](#performance)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Development Environment

### Required Tools

```bash
# Node.js (v18+)
node --version  # Should be 18.0.0 or higher

# npm (comes with Node.js)
npm --version

# Git
git --version
```

### Recommended IDE Setup

**VS Code** with extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Environment Setup

```bash
# Clone repository
git clone https://github.com/mhamp1/quantum-falcon-cockp.git
cd quantum-falcon-cockp

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

## Project Architecture

### Directory Structure

```
src/
├── components/          # React components
│   ├── dashboard/       # Dashboard-specific components
│   ├── trade/           # Trading interface components
│   ├── vault/           # BTC vault components
│   ├── community/       # Community features
│   ├── settings/        # Settings panels
│   ├── shared/          # Shared components
│   └── ui/              # UI primitives (shadcn)
├── hooks/               # Custom React hooks
│   ├── useQuests.ts     # Quest management
│   ├── useXP.ts         # XP tracking
│   └── useAuth.ts       # Authentication
├── lib/                 # Utility libraries
│   ├── api.ts           # API client
│   ├── cache.ts         # Cache management
│   ├── license-auth.ts  # License verification
│   ├── xp-sync.ts       # XP synchronization
│   └── theme.ts         # Theme utilities
├── styles/              # CSS files
│   └── globals.css      # Global styles
├── assets/              # Static assets
│   ├── images/
│   └── icons/
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Phosphor Icons
- **State**: React hooks + LocalStorage
- **API**: Fetch API with custom wrappers

## Code Style

### TypeScript

Always use TypeScript for type safety:

```typescript
// ✅ Good - Explicit types
interface User {
  id: string
  name: string
  xp: number
  level: number
}

function getUserXP(user: User): number {
  return user.xp
}

// ❌ Bad - No types
function getUserXP(user) {
  return user.xp
}
```

### React Components

Use functional components with hooks:

```tsx
// ✅ Good - Functional component with TypeScript
interface ProfileProps {
  userId: string
  onUpdate: (data: UserData) => void
}

export function Profile({ userId, onUpdate }: ProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  
  useEffect(() => {
    loadUser(userId).then(setUser)
  }, [userId])
  
  return <div>{user?.name}</div>
}

// ❌ Bad - Class component
export class Profile extends React.Component {
  // ...
}
```

### Naming Conventions

```typescript
// Components: PascalCase
export function UserProfile() {}

// Hooks: camelCase with 'use' prefix
export function useUserData() {}

// Utilities: camelCase
export function formatCurrency() {}

// Constants: UPPER_SNAKE_CASE
export const MAX_RETRY_ATTEMPTS = 3

// Types/Interfaces: PascalCase
interface UserProfile {}
type APIResponse = {}
```

### File Organization

```typescript
// Order: imports, types, component, exports

// 1. External imports
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// 2. Internal imports
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'

// 3. Types
interface ComponentProps {
  // ...
}

// 4. Component
export function Component({ }: ComponentProps) {
  // ...
}

// 5. Additional exports (if any)
export { type ComponentProps }
```

## Component Development

### Creating a New Component

```bash
# Create component file
touch src/components/dashboard/NewWidget.tsx
```

```tsx
// src/components/dashboard/NewWidget.tsx
import { useState } from 'react'

interface NewWidgetProps {
  title: string
  data: number[]
}

export function NewWidget({ title, data }: NewWidgetProps) {
  const [selected, setSelected] = useState<number | null>(null)
  
  return (
    <div className="holographic-card p-6">
      <h2 className="text-xl font-bold text-cyber-yellow mb-4">
        {title}
      </h2>
      <div className="grid gap-2">
        {data.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelected(index)}
            className={`
              p-3 rounded border cursor-pointer transition-all
              ${selected === index 
                ? 'border-cyber-cyan bg-cyber-cyan/10' 
                : 'border-neutral-7 hover:border-neutral-8'
              }
            `}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Component Best Practices

1. **Single Responsibility**: Each component should do one thing well
2. **Prop Validation**: Use TypeScript interfaces for props
3. **Controlled Components**: Manage form state properly
4. **Error Boundaries**: Wrap components in error boundaries
5. **Accessibility**: Use semantic HTML and ARIA attributes

### Styling Components

```tsx
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-neutral-2 rounded-lg">

// Custom CSS for complex effects
<div className="holographic-card">
  <style jsx>{`
    .holographic-card {
      background: linear-gradient(135deg, 
        oklch(0.10 0.06 280) 0%, 
        oklch(0.08 0.04 280) 100%);
    }
  `}</style>
</div>

// Conditional classes
<div className={`
  base-class
  ${isActive ? 'active-class' : 'inactive-class'}
  ${isError && 'error-class'}
`}>
```

## State Management

### Local State (useState)

```tsx
// Simple component state
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)
```

### Persistent State (LocalStorage)

```tsx
// Custom hook for persistent state
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  
  return [value, setValue] as const
}

// Usage
const [settings, setSettings] = useLocalStorage('app_settings', {
  theme: 'dark',
  notifications: true
})
```

### Context for Shared State

```tsx
// Create context
const AuthContext = createContext<AuthState | null>(null)

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## API Integration

### Creating API Endpoints

```typescript
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_TRADING_API_ENDPOINT

export async function fetchData<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getLicenseKey()}`,
      ...options?.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json()
}

// Specific API calls
export const api = {
  xp: {
    award: (data: XPAwardRequest) => 
      fetchData<XPAwardResponse>('/xp/award', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    get: (userId: string) =>
      fetchData<XPData>(`/xp?userId=${userId}`)
  },
  
  quests: {
    list: (userId: string) =>
      fetchData<QuestsResponse>(`/quests?userId=${userId}`),
    
    updateProgress: (data: QuestProgressUpdate) =>
      fetchData<QuestProgressResponse>('/quests/progress', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }
}
```

### Using API in Components

```tsx
// Custom hook
function useUserXP(userId: string) {
  const [xp, setXP] = useState<XPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    api.xp.get(userId)
      .then(setXP)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])
  
  const awardXP = async (amount: number, action: string) => {
    try {
      const result = await api.xp.award({
        userId,
        action,
        xpAmount: amount,
        timestamp: Date.now()
      })
      setXP(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }
  
  return { xp, loading, error, awardXP }
}

// Component usage
function XPDisplay({ userId }: { userId: string }) {
  const { xp, loading, error, awardXP } = useUserXP(userId)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <p>XP: {xp?.xp}</p>
      <p>Level: {xp?.level}</p>
      <button onClick={() => awardXP(50, 'test')}>
        Award XP
      </button>
    </div>
  )
}
```

## Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Test in browser
# 1. Open http://localhost:5173
# 2. Open DevTools (F12)
# 3. Check console for errors
# 4. Test features manually
```

### Testing API Integration

```javascript
// In browser console
fetch('http://localhost:8000/api/xp/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test_user',
    action: 'test',
    xpAmount: 50,
    timestamp: Date.now()
  })
}).then(r => r.json()).then(console.log)
```

### Testing Offline Mode

```javascript
// Simulate offline
window.dispatchEvent(new Event('offline'))

// Simulate back online
window.dispatchEvent(new Event('online'))
```

## Performance

### Optimization Tips

1. **Lazy Loading**
```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

2. **Memoization**
```tsx
import { useMemo, useCallback } from 'react'

// Expensive computation
const value = useMemo(() => 
  expensiveCalculation(data),
  [data]
)

// Callback stability
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

3. **Debouncing**
```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}
```

## Debugging

### Browser DevTools

```javascript
// View localStorage
localStorage.getItem('qf_xp_progress')

// Clear cache
localStorage.clear()

// Check sync queue
JSON.parse(localStorage.getItem('qf_pending_sync') || '[]')

// Monitor network
// DevTools → Network tab → Filter by 'api'
```

### Common Issues

**Port already in use:**
```bash
lsof -ti:5173 | xargs kill -9
```

**Stale cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

**Type errors:**
```bash
npm run build -- --noEmit
```

## Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create pull request on GitHub
```

### Commit Messages

Follow conventional commits:

```
feat: add XP tracking system
fix: resolve offline sync issue
docs: update API integration guide
style: format code with prettier
refactor: simplify auth logic
test: add XP award tests
chore: update dependencies
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Changes
- Added feature X
- Fixed bug Y
- Updated documentation

## Testing
- [ ] Tested locally
- [ ] Tested with backend
- [ ] Checked offline mode

## Screenshots
[If applicable]
```

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Happy coding!** 🚀
