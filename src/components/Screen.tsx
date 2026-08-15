import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/src/theme';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>{scroll ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={styles.content}>{children}</View>}</SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl } });
