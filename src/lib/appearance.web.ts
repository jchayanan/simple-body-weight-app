import type { AppearanceMode } from '@/src/theme';

const key = 'repbook:appearance';

export function getStoredAppearance(): AppearanceMode {
  return typeof localStorage !== 'undefined' && localStorage.getItem(key) === 'dark' ? 'dark' : 'light';
}

export function storeAppearance(mode: AppearanceMode) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, mode);
}
