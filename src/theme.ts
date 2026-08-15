import { Platform } from 'react-native';

export const colors = {
  background: '#EFECE5',
  ink: '#1D1D1B',
  accent: '#C46A3A',
  surface: '#F7F4EE',
  muted: '#77736C',
  border: '#D8D3C9',
  success: '#6F7D61',
  error: '#A85449',
  white: '#FFFDF8',
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 };
export const radii = { sm: 10, md: 16, lg: 22 };
export const fonts = {
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};
