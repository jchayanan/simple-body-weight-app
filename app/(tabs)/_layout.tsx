import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { tabIconName } from '@/src/lib/tabIconName';
import { fonts, useAppTheme } from '@/src/theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', marginBottom: 3 }, tabBarStyle: { height: 84, paddingTop: 10, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarIcon: ({ color, focused, size }) => <Ionicons name={tabIconName(route.name, focused)} color={color} size={size} /> })}><Tabs.Screen name="index" options={{ title: 'Today' }} /><Tabs.Screen name="progress" options={{ title: 'Progress' }} /><Tabs.Screen name="profile" options={{ title: 'Settings' }} /></Tabs>;
}
