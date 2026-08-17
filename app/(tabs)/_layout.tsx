import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabIconName } from '@/src/lib/tabIconName';
import { fonts, useAppTheme } from '@/src/theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', marginBottom: 2 }, tabBarStyle: { height: 56 + insets.bottom, paddingBottom: insets.bottom, paddingTop: 6, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarIcon: ({ color, focused, size }) => <Ionicons name={tabIconName(route.name, focused)} color={color} size={size} /> })}><Tabs.Screen name="index" options={{ title: 'Today' }} /><Tabs.Screen name="progress" options={{ title: 'Progress' }} /><Tabs.Screen name="profile" options={{ title: 'Settings' }} /></Tabs>;
}
