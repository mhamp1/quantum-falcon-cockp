// Import Organization Standard
// November 24, 2025 — Quantum Falcon Cockpit
// Ensures consistent import ordering across the codebase

/**
 * Standard import order:
 * 1. React and React-related
 * 2. Third-party libraries
 * 3. UI components
 * 4. Hooks
 * 5. Utilities
 * 6. Types
 * 7. Constants
 */

export const IMPORT_ORDER = [
  // 1. React
  'react',
  'react-dom',
  'react-router',
  
  // 2. Third-party
  '@phosphor-icons',
  'framer-motion',
  'sonner',
  'canvas-confetti',
  '@github/spark',
  
  // 3. UI Components
  '@/components/ui',
  '@/components/shared',
  
  // 4. Hooks
  '@/hooks',
  
  // 5. Utilities
  '@/lib',
  
  // 6. Types
  '@/types',
  
  // 7. Constants
  '@/constants'
] as const

/**
 * Sort imports according to standard order
 * This is a reference for manual organization
 */
export function getImportOrder(importPath: string): number {
  for (let i = 0; i < IMPORT_ORDER.length; i++) {
    if (importPath.startsWith(IMPORT_ORDER[i])) {
      return i
    }
  }
  return IMPORT_ORDER.length
}

