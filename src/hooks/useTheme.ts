import { useKV } from '@github/spark/hooks';
import { useEffect } from 'react';

export type ThemeStyle = 'default' | 'matrix' | 'synthwave';

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
  themeStyle: 'default',
  highContrast: false
};

export function useTheme() {
  const [themeSettings, setThemeSettings] = useKV<ThemeSettings>('app-theme-settings', DEFAULT_THEME);

  useEffect(() => {
    const root = document.documentElement;
    const settings = themeSettings || DEFAULT_THEME;
    
    root.classList.remove('default', 'matrix', 'synthwave', 'high-contrast');
    
    if (settings.themeStyle) {
      root.classList.add(settings.themeStyle);
    }
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    }
    
    if (!settings.animations) {
      root.style.setProperty('--animate-duration', '0s');
    } else {
      root.style.removeProperty('--animate-duration');
    }
  }, [themeSettings]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setThemeSettings((current) => {
      const base = current || DEFAULT_THEME;
      return { ...base, ...updates };
    });
  };

  return { themeSettings: themeSettings || DEFAULT_THEME, setThemeSettings, updateTheme };
}
