import { StyleSheet, Text, View } from 'react-native';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action ? <Text style={styles.action}>{action}</Text> : null}</View>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' }, action: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' } });
