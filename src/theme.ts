import { Platform } from 'react-native';

export const colors = {
  background: '#F6F5F2',
  ink: '#202020',
  accent: '#B9584F',
  surface: '#F6F5F2',
  muted: '#706F6B',
  border: '#D9D7D2',
  success: '#687560',
  error: '#9E514A',
  white: '#F6F5F2',
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 };
export const radii = { sm: 10, md: 16, lg: 22 };
export const fonts = {
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};
