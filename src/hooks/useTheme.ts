import { useKV } from '@/hooks/useKVFallback';
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

export function useTheme() {
  const [themeSettings, setThemeSettings] = useKV<ThemeSettings>('app-theme-settings', {
    darkMode: true,
    colorScheme: 'solana-cyber',
    animations: true,
    glassEffect: true,
    neonGlow: true,
    themeStyle: 'default',
    highContrast: false
  });

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('default', 'matrix', 'synthwave', 'high-contrast');
    
    if (themeSettings.themeStyle) {
      root.classList.add(themeSettings.themeStyle);
    }
    
    if (themeSettings.highContrast) {
      root.classList.add('high-contrast');
    }
    
    if (!themeSettings.animations) {
      root.style.setProperty('--animate-duration', '0s');
    } else {
      root.style.removeProperty('--animate-duration');
    }
  }, [themeSettings]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setThemeSettings(current => ({ ...current, ...updates }));
  };

  return { themeSettings, setThemeSettings, updateTheme };
}
