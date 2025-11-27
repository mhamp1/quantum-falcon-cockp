// ═══════════════════════════════════════════════════════════════
// THEME SYSTEM v2 — COMPLETELY REBUILT FROM SCRATCH
// November 27, 2025 — INSTANT THEME CHANGES — NO DELAYS
// ═══════════════════════════════════════════════════════════════

export type ThemeStyle = 'cyberpunk' | 'matrix-green' | 'blood-mode' | 'arctic' | 'matrix' | 'synthwave';

export interface ThemeSettings {
  darkMode: boolean;
  animations: boolean;
  glassEffect: boolean;
  neonGlow: boolean;
  themeStyle: ThemeStyle;
}

// Storage key for theme settings
const THEME_STORAGE_KEY = 'qf-theme-settings';

// Default theme
export const DEFAULT_THEME: ThemeSettings = {
  darkMode: true,
  animations: true,
  glassEffect: true,
  neonGlow: true,
  themeStyle: 'cyberpunk',
};

// Theme color definitions
const THEME_COLORS: Record<ThemeStyle, { primary: string; secondary: string; accent: string; glow: string }> = {
  'cyberpunk': {
    primary: '188 100% 50%',      // Cyan
    secondary: '280 80% 60%',     // Purple
    accent: '188 100% 50%',       // Cyan
    glow: '#00d4ff',
  },
  'matrix-green': {
    primary: '120 100% 50%',      // Bright green
    secondary: '120 80% 40%',     // Dark green
    accent: '120 100% 60%',       // Light green
    glow: '#00ff41',
  },
  'blood-mode': {
    primary: '0 100% 50%',        // Red
    secondary: '0 80% 40%',       // Dark red
    accent: '0 100% 60%',         // Light red
    glow: '#ff0000',
  },
  'arctic': {
    primary: '195 100% 50%',      // Ice blue
    secondary: '195 80% 40%',     // Dark ice
    accent: '195 100% 70%',       // Light ice
    glow: '#00d4ff',
  },
  'matrix': {
    primary: '120 100% 40%',      // Matrix green
    secondary: '120 60% 25%',     // Dark matrix
    accent: '120 80% 50%',        // Bright matrix
    glow: '#00ff00',
  },
  'synthwave': {
    primary: '300 100% 50%',      // Magenta
    secondary: '270 80% 50%',     // Purple
    accent: '330 100% 60%',       // Pink
    glow: '#ff00ff',
  },
};

/**
 * Get current theme from localStorage
 */
export function getStoredTheme(): ThemeSettings {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_THEME, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('[Theme] Failed to parse stored theme:', e);
  }
  return DEFAULT_THEME;
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: ThemeSettings): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn('[Theme] Failed to save theme:', e);
  }
}

/**
 * APPLY THEME TO DOM — THE CORE FUNCTION
 * This directly manipulates the DOM for INSTANT changes
 */
export function applyTheme(theme: ThemeSettings): void {
  const root = document.documentElement;
  const colors = THEME_COLORS[theme.themeStyle] || THEME_COLORS['cyberpunk'];
  
  console.log('[Theme] Applying:', theme.themeStyle, '| Dark:', theme.darkMode, '| Glow:', theme.neonGlow);
  
  // ═══════════════════════════════════════════════════════════════
  // 1. THEME STYLE — Apply color scheme
  // ═══════════════════════════════════════════════════════════════
  
  // Remove all theme classes
  root.classList.remove('cyberpunk', 'matrix-green', 'blood-mode', 'arctic', 'matrix', 'synthwave');
  
  // Add current theme class
  root.classList.add(theme.themeStyle);
  root.setAttribute('data-theme', theme.themeStyle);
  
  // Apply CSS custom properties for colors (HSL format for Tailwind)
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--theme-glow', colors.glow);
  
  // ═══════════════════════════════════════════════════════════════
  // 2. DARK MODE — Background colors
  // ═══════════════════════════════════════════════════════════════
  if (theme.darkMode) {
    root.classList.add('dark');
    root.style.setProperty('--background', '220 20% 6%');
    root.style.setProperty('--foreground', '188 80% 80%');
    root.style.setProperty('--card', '220 25% 10%');
    root.style.setProperty('--card-foreground', '188 80% 80%');
    document.body.style.backgroundColor = 'hsl(220, 20%, 6%)';
    document.body.style.color = 'hsl(188, 80%, 80%)';
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--background', '0 0% 98%');
    root.style.setProperty('--foreground', '220 20% 10%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '220 20% 10%');
    document.body.style.backgroundColor = 'hsl(0, 0%, 98%)';
    document.body.style.color = 'hsl(220, 20%, 10%)';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 3. ANIMATIONS — Enable/disable all motion
  // ═══════════════════════════════════════════════════════════════
  if (theme.animations) {
    root.classList.remove('no-motion');
    root.style.removeProperty('--motion-duration');
  } else {
    root.classList.add('no-motion');
    root.style.setProperty('--motion-duration', '0s');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 4. GLASS EFFECT — Backdrop blur
  // ═══════════════════════════════════════════════════════════════
  if (theme.glassEffect) {
    root.classList.add('glass-on');
    root.classList.remove('glass-off');
  } else {
    root.classList.remove('glass-on');
    root.classList.add('glass-off');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 5. NEON GLOW — CSS glow effects
  // ═══════════════════════════════════════════════════════════════
  if (theme.neonGlow) {
    root.classList.add('neon-on');
    root.classList.remove('neon-off');
    root.style.setProperty('--glow-color', colors.glow);
    root.style.setProperty('--glow-intensity', '1');
  } else {
    root.classList.remove('neon-on');
    root.classList.add('neon-off');
    root.style.setProperty('--glow-intensity', '0');
  }
  
  // Force repaint to ensure changes are visible
  void root.offsetHeight;
}

/**
 * Update a single theme property
 */
export function updateThemeSetting<K extends keyof ThemeSettings>(
  key: K, 
  value: ThemeSettings[K]
): ThemeSettings {
  const current = getStoredTheme();
  const updated = { ...current, [key]: value };
  saveTheme(updated);
  applyTheme(updated);
  return updated;
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const theme = getStoredTheme();
  applyTheme(theme);
  console.log('[Theme] Initialized:', theme.themeStyle);
}

/**
 * React hook for theme management
 */
import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeSettings>(getStoredTheme);
  
  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);
  
  // Update handler
  const setTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setThemeState(current => {
      const updated = { ...current, ...updates };
      saveTheme(updated);
      applyTheme(updated);
      return updated;
    });
  }, []);
  
  // Individual setters for convenience
  const setDarkMode = useCallback((value: boolean) => setTheme({ darkMode: value }), [setTheme]);
  const setAnimations = useCallback((value: boolean) => setTheme({ animations: value }), [setTheme]);
  const setGlassEffect = useCallback((value: boolean) => setTheme({ glassEffect: value }), [setTheme]);
  const setNeonGlow = useCallback((value: boolean) => setTheme({ neonGlow: value }), [setTheme]);
  const setThemeStyle = useCallback((value: ThemeStyle) => setTheme({ themeStyle: value }), [setTheme]);
  
  return {
    theme,
    setTheme,
    setDarkMode,
    setAnimations,
    setGlassEffect,
    setNeonGlow,
    setThemeStyle,
  };
}
