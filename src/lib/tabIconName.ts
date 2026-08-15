export type TabIconName = 'today' | 'today-outline' | 'trending-up' | 'trending-up-outline' | 'settings' | 'settings-outline';

export function tabIconName(routeName: string, focused: boolean): TabIconName {
  if (routeName === 'index') return focused ? 'today' : 'today-outline';
  if (routeName === 'progress') return focused ? 'trending-up' : 'trending-up-outline';
  return focused ? 'settings' : 'settings-outline';
}
