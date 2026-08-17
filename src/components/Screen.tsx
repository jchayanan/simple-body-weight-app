import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, spacing, useAppTheme } from '@/src/theme';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>{scroll ? <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={styles.content}>{children}</View>}</SafeAreaView>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, content: { alignSelf: 'center', flexGrow: 1, maxWidth: 760, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, width: '100%' } });
