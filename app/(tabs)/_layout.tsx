import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveWindowLayout } from '@/src/lib/layout';
import { tabIconName } from '@/src/lib/tabIconName';
import { fonts, useAppTheme } from '@/src/theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const expanded = resolveWindowLayout(window.width, window.height).expanded;
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarPosition: expanded ? 'left' : 'bottom', tabBarLabelPosition: 'below-icon', tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', marginBottom: 2 }, tabBarItemStyle: expanded ? { maxHeight: 80 } : undefined, tabBarStyle: expanded ? { width: 96, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.surface, borderRightColor: colors.border, borderRightWidth: 1, borderTopWidth: 0 } : { height: 56 + insets.bottom, paddingBottom: insets.bottom, paddingTop: 6, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarIcon: ({ color, focused, size }) => <Ionicons name={tabIconName(route.name, focused)} color={color} size={size} /> })}><Tabs.Screen name="index" options={{ title: 'Today' }} /><Tabs.Screen name="progress" options={{ title: 'Progress' }} /><Tabs.Screen name="profile" options={{ title: 'Settings' }} /></Tabs>;
}
