import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { useEffect } from 'react';

export type ThemeStyle = 'cyberpunk' | 'matrix-green' | 'blood-mode' | 'arctic' | 'matrix' | 'synthwave';

interface ThemeSettings {
  darkMode: boolean
  colorScheme: string
  animations: boolean
  glassEffect: boolean
  neonGlow: boolean
  themeStyle: ThemeStyle
  highContrast: boolean
}

const DEFAULT_THEME: ThemeSettings = {
  darkMode: true,
  colorScheme: 'solana-cyber',
  animations: true,
  glassEffect: true,
  neonGlow: true,
  themeStyle: 'cyberpunk',
  highContrast: false
};

export function useTheme() {
  const [themeSettings, setThemeSettings] = useKV<ThemeSettings>('app-theme-settings', DEFAULT_THEME);

  useEffect(() => {
    const root = document.documentElement;
    const settings = themeSettings || DEFAULT_THEME;
    
    // Remove all theme classes
    root.classList.remove('cyberpunk', 'matrix-green', 'blood-mode', 'arctic', 'matrix', 'synthwave', 'default', 'high-contrast');
    
    // Add active theme class
    if (settings.themeStyle) {
      root.classList.add(settings.themeStyle);
      root.setAttribute('data-theme', settings.themeStyle);
    }
    
    // Apply theme-specific CSS variables
    applyThemeVariables(settings.themeStyle);
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    }
    
    if (!settings.animations) {
      root.style.setProperty('--animate-duration', '0s');
    } else {
      root.style.removeProperty('--animate-duration');
    }
  }, [themeSettings]);

  const applyThemeVariables = (themeStyle: ThemeStyle) => {
    const root = document.documentElement;
    
    switch (themeStyle) {
      case 'cyberpunk':
        root.style.setProperty('--theme-primary', 'oklch(0.72 0.20 195)');
        root.style.setProperty('--theme-secondary', 'oklch(0.68 0.18 330)');
        root.style.setProperty('--theme-accent', 'oklch(0.72 0.20 195)');
        break;
      case 'matrix-green':
        root.style.setProperty('--theme-primary', '#00ff41');
        root.style.setProperty('--theme-secondary', '#00cc33');
        root.style.setProperty('--theme-accent', '#00ff41');
        break;
      case 'blood-mode':
        root.style.setProperty('--theme-primary', '#ff0000');
        root.style.setProperty('--theme-secondary', '#cc0000');
        root.style.setProperty('--theme-accent', '#ff4444');
        break;
      case 'arctic':
        root.style.setProperty('--theme-primary', '#00d4ff');
        root.style.setProperty('--theme-secondary', '#0099cc');
        root.style.setProperty('--theme-accent', '#66e5ff');
        break;
      case 'matrix':
        root.style.setProperty('--theme-primary', '#00ff00');
        root.style.setProperty('--theme-secondary', '#008800');
        root.style.setProperty('--theme-accent', '#00ff00');
        break;
      case 'synthwave':
        root.style.setProperty('--theme-primary', '#ff00ff');
        root.style.setProperty('--theme-secondary', '#ff0080');
        root.style.setProperty('--theme-accent', '#ff88ff');
        break;
    }
  };

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setThemeSettings((current) => {
      const base = current || DEFAULT_THEME;
      return { ...base, ...updates };
    });
  };

  return { themeSettings: themeSettings || DEFAULT_THEME, setThemeSettings, updateTheme };
}
