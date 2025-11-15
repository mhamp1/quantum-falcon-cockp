# Quick Start Guide

Get started with Quantum Falcon Cockpit in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Modern web browser

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/mhamp1/quantum-falcon-cockp.git
cd quantum-falcon-cockp

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Basic Configuration

### Minimal Setup (Demo Mode)

No configuration needed! The app runs in demo mode with simulated data.

### With Backend Integration

Edit `.env`:

```env
# For local development with Quantum-Falcon backend
VITE_TRADING_API_ENDPOINT=http://localhost:8000/api
VITE_XP_API_ENDPOINT=http://localhost:8000/api/xp
VITE_QUESTS_API_ENDPOINT=http://localhost:8000/api/quests
```

### With Firebase Notifications

Edit `.env`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
# ... other Firebase config
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint             # Run linter
npm run build            # Build for production
npm run preview          # Preview production build

# Troubleshooting
rm -rf node_modules      # Clean dependencies
npm install              # Reinstall
```

## Next Steps

1. **Setup Backend**: Follow [Testing with Desktop Backend](./README.md#testing-with-desktop-backend)
2. **Configure Firebase**: Follow [Firebase Push Notifications](./README.md#firebase-push-notifications)
3. **Customize Theme**: Follow [Theming & Customization](./README.md#theming--customization)
4. **Learn API Integration**: Read [API_INTEGRATION.md](./API_INTEGRATION.md)

## Troubleshooting

### Port 5173 already in use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### CORS errors with backend

Add to backend CORS configuration:

```python
# Python/Flask example
CORS(app, origins=['http://localhost:5173'])
```

### Build errors

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Resources

- [Full Documentation](./README.md)
- [API Integration Guide](./API_INTEGRATION.md)
- [Product Requirements](./PRD.md)
- [Backend API Example](./BACKEND_API_EXAMPLE.md)

## Support

- **Issues**: [GitHub Issues](https://github.com/mhamp1/quantum-falcon-cockp/issues)
- **Backend**: [Quantum-Falcon Repository](https://github.com/mhamp1/Quantum-Falcon)

---

**Ready to build? Start exploring the app!** 🚀
