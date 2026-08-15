import { createContext, createElement, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { getStoredAppearance, storeAppearance } from '@/src/lib/appearance';

export type AppearanceMode = 'light' | 'dark';

export const lightColors = { background: '#F6F5F2', ink: '#202020', accent: '#B9584F', surface: '#F6F5F2', muted: '#706F6B', border: '#D9D7D2', success: '#687560', error: '#9E514A', white: '#F6F5F2', instrument: '#171717', instrumentMuted: '#AAA6A0', segmentOff: '#3B3936' };
export const darkColors = { background: '#171717', ink: '#F6F5F2', accent: '#D06D63', surface: '#202020', muted: '#B9B5AF', border: '#4B4844', success: '#9BAA91', error: '#E08880', white: '#F6F5F2', instrument: '#101010', instrumentMuted: '#C4C0BA', segmentOff: '#3B3936' };
export type AppColors = typeof lightColors;
export const colors = lightColors;

type ThemeValue = { colors: AppColors; mode: AppearanceMode; setMode: (mode: AppearanceMode) => void };
const ThemeContext = createContext<ThemeValue>({ colors: lightColors, mode: 'light', setMode: () => undefined });

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<AppearanceMode>(getStoredAppearance);
  const setMode = useCallback((nextMode: AppearanceMode) => { storeAppearance(nextMode); setModeState(nextMode); }, []);
  const value = useMemo(() => ({ colors: mode === 'dark' ? darkColors : lightColors, mode, setMode }), [mode]);
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useAppTheme() { return useContext(ThemeContext); }

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 };
export const radii = { sm: 10, md: 16, lg: 22 };
export const fonts = {
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};
