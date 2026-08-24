import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveWindowLayout } from '@/src/lib/layout';
import { AppColors, spacing, useAppTheme } from '@/src/theme';

export function Screen({ children, scroll = true, width = 'readable' }: PropsWithChildren<{ scroll?: boolean; width?: 'readable' | 'expanded' }>) {
  const { colors } = useAppTheme();
  const window = useWindowDimensions();
  const layout = resolveWindowLayout(window.width, window.height);
  const styles = createStyles(colors);
  const contentStyle = [styles.content, layout.size !== 'compact' && styles.contentRoomy, width === 'expanded' && layout.expanded && styles.contentExpanded];
  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>{scroll ? <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={contentStyle}>{children}</View>}</SafeAreaView>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, content: { alignSelf: 'center', flexGrow: 1, maxWidth: 760, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, width: '100%' }, contentRoomy: { paddingHorizontal: spacing.xl }, contentExpanded: { maxWidth: 1120, paddingHorizontal: spacing.xxl } });
