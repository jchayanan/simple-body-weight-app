import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors, fonts } from '@/src/theme';

export default function TabsLayout() {
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', marginBottom: 3 }, tabBarStyle: { height: 84, paddingTop: 10, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarIcon: ({ color, size }) => { const icon = route.name === 'index' ? 'today-outline' : route.name === 'progress' ? 'trending-up-outline' : 'person-outline'; return <Ionicons name={icon as keyof typeof Ionicons.glyphMap} color={color} size={size} />; } })}><Tabs.Screen name="index" options={{ title: 'Today' }} /><Tabs.Screen name="progress" options={{ title: 'Progress' }} /><Tabs.Screen name="profile" options={{ title: 'Me' }} /></Tabs>;
}
