import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initialiseLocalDb } from '@/src/lib/localDb';
import { ThemeProvider, useAppTheme } from '@/src/theme';

export default function RootLayout() {
  return <ThemeProvider><AppNavigator /></ThemeProvider>;
}

function AppNavigator() {
  const { colors, mode } = useAppTheme();
  useEffect(() => { try { initialiseLocalDb(); } catch { /* Keep the flow usable in environments without SQLite. */ } }, []);
  return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="(tabs)" /><Stack.Screen name="reminder" options={{ presentation: 'card' }} /><Stack.Screen name="program" options={{ presentation: 'fullScreenModal', gestureEnabled: true }} /><Stack.Screen name="workout" options={{ presentation: 'fullScreenModal', gestureEnabled: true }} /><Stack.Screen name="complete" options={{ presentation: 'fullScreenModal', gestureEnabled: true }} /></Stack></>;
}
