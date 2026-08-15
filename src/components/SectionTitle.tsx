import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/src/theme';

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action ? <Text style={styles.action}>{action}</Text> : null}</View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' }, action: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' } });
