// ═══════════════════════════════════════════════════════════════
// THEME HOOK — Reads from 'app-settings' to match EnhancedSettings
// November 27, 2025 — ALL TOGGLES WORKING
// ═══════════════════════════════════════════════════════════════
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { useEffect, useCallback } from 'react';

export type ThemeStyle = 'cyberpunk' | 'matrix-green' | 'blood-mode' | 'arctic' | 'matrix' | 'synthwave';

export interface ThemeSettings {
  darkMode: boolean
  colorScheme: string
  animations: boolean
  glassEffect: boolean
  neonGlow: boolean
  themeStyle: ThemeStyle
  highContrast: boolean
}

interface AppSettings {
  theme: ThemeSettings
  [key: string]: unknown
}

export const DEFAULT_THEME: ThemeSettings = {
  darkMode: true,
  colorScheme: 'solana-cyber',
  animations: true,
  glassEffect: true,
  neonGlow: true,
  themeStyle: 'cyberpunk',
  highContrast: false
};

const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: DEFAULT_THEME
};

/**
 * Apply theme to DOM immediately
 * This function is called from both useTheme and EnhancedSettings
 */
export function applyThemeToDOM(theme: ThemeSettings): void {
  const root = document.documentElement;
  
  // ─── DARK MODE ───
  if (theme.darkMode) {
    root.classList.add('dark');
    root.style.setProperty('--background', 'oklch(0.08 0.02 280)');
    root.style.setProperty('--foreground', 'oklch(0.85 0.12 195)');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--background', 'oklch(0.98 0.01 280)');
    root.style.setProperty('--foreground', 'oklch(0.15 0.02 280)');
  }
  
  // ─── THEME STYLE ───
  const allThemes = ['cyberpunk', 'matrix-green', 'blood-mode', 'arctic', 'matrix', 'synthwave', 'default'];
  allThemes.forEach(t => root.classList.remove(t));
  
  if (theme.themeStyle) {
    root.classList.add(theme.themeStyle);
    root.setAttribute('data-theme', theme.themeStyle);
    
    // Apply CSS variables per theme
    switch (theme.themeStyle) {
      case 'cyberpunk':
        root.style.setProperty('--primary', 'oklch(0.72 0.20 195)');
        root.style.setProperty('--secondary', 'oklch(0.68 0.18 330)');
        root.style.setProperty('--accent', 'oklch(0.72 0.20 195)');
        break;
      case 'matrix-green':
        root.style.setProperty('--primary', 'oklch(0.75 0.30 140)');
        root.style.setProperty('--secondary', 'oklch(0.60 0.25 140)');
        root.style.setProperty('--accent', 'oklch(0.80 0.35 140)');
        break;
      case 'blood-mode':
        root.style.setProperty('--primary', 'oklch(0.55 0.30 25)');
        root.style.setProperty('--secondary', 'oklch(0.45 0.25 25)');
        root.style.setProperty('--accent', 'oklch(0.60 0.35 25)');
        break;
      case 'arctic':
        root.style.setProperty('--primary', 'oklch(0.75 0.15 200)');
        root.style.setProperty('--secondary', 'oklch(0.65 0.12 200)');
        root.style.setProperty('--accent', 'oklch(0.80 0.18 200)');
        break;
      case 'matrix':
        root.style.setProperty('--primary', 'oklch(0.70 0.20 140)');
        root.style.setProperty('--secondary', 'oklch(0.60 0.18 140)');
        root.style.setProperty('--accent', 'oklch(0.75 0.22 150)');
        break;
      case 'synthwave':
        root.style.setProperty('--primary', 'oklch(0.75 0.25 310)');
        root.style.setProperty('--secondary', 'oklch(0.70 0.25 285)');
        root.style.setProperty('--accent', 'oklch(0.65 0.28 250)');
        break;
    }
  }
  
  // ─── ANIMATIONS ───
  if (theme.animations === false) {
    root.style.setProperty('--animate-duration', '0s');
    root.classList.add('no-animations');
  } else {
    root.style.removeProperty('--animate-duration');
    root.classList.remove('no-animations');
  }
  
  // ─── GLASS EFFECT ───
  if (theme.glassEffect) {
    root.classList.add('glass-enabled');
    root.style.setProperty('--glass-blur', '12px');
  } else {
    root.classList.remove('glass-enabled');
    root.style.setProperty('--glass-blur', '0px');
  }
  
  // ─── NEON GLOW ───
  if (theme.neonGlow) {
    root.classList.add('neon-enabled');
  } else {
    root.classList.remove('neon-enabled');
  }
  
  // ─── HIGH CONTRAST ───
  if (theme.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
}

/**
 * Hook for managing theme settings
 * Reads from 'app-settings' -> 'theme' to sync with EnhancedSettings
 */
export function useTheme() {
  const [appSettings, setAppSettings] = useKV<AppSettings>('app-settings', DEFAULT_APP_SETTINGS);
  
  const themeSettings = appSettings?.theme || DEFAULT_THEME;

  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDOM(themeSettings);
    console.log('[useTheme] Applied:', themeSettings.themeStyle, '| Dark:', themeSettings.darkMode);
  }, [themeSettings]);

  // Also apply on mount (for page refresh)
  useEffect(() => {
    // Apply immediately on mount
    const stored = localStorage.getItem('spark_kv_app-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.theme) {
          applyThemeToDOM(parsed.theme);
        }
      } catch {
        applyThemeToDOM(DEFAULT_THEME);
      }
    } else {
      applyThemeToDOM(DEFAULT_THEME);
    }
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setAppSettings((current) => {
      const base = current || DEFAULT_APP_SETTINGS;
      const newTheme = { ...(base.theme || DEFAULT_THEME), ...updates };
      applyThemeToDOM(newTheme); // Apply immediately
      return { ...base, theme: newTheme };
    });
  }, [setAppSettings]);

  const setThemeSettings = useCallback((newTheme: ThemeSettings | ((prev: ThemeSettings) => ThemeSettings)) => {
    setAppSettings((current) => {
      const base = current || DEFAULT_APP_SETTINGS;
      const resolved = typeof newTheme === 'function' ? newTheme(base.theme || DEFAULT_THEME) : newTheme;
      applyThemeToDOM(resolved);
      return { ...base, theme: resolved };
    });
  }, [setAppSettings]);

  return { 
    themeSettings, 
    setThemeSettings, 
    updateTheme,
    applyThemeToDOM 
  };
}
