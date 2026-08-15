import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initialiseLocalDb } from '@/src/lib/localDb';
import { colors } from '@/src/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => { try { initialiseLocalDb(); } catch { /* Keep the flow usable in environments without SQLite. */ } }, []);
  return <QueryClientProvider client={queryClient}><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="(tabs)" /><Stack.Screen name="program" options={{ presentation: 'fullScreenModal', gestureEnabled: true }} /><Stack.Screen name="workout" options={{ presentation: 'fullScreenModal', gestureEnabled: true }} /><Stack.Screen name="complete" options={{ presentation: 'fullScreenModal', gestureEnabled: true }} /></Stack></QueryClientProvider>;
}
