import { Pressable, StyleSheet, Text } from 'react-native';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.label}>{label}</Text></Pressable>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ button: { alignItems: 'center', backgroundColor: colors.accent, justifyContent: 'center', minHeight: 56, paddingHorizontal: spacing.lg }, pressed: { opacity: 0.82 }, label: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' } });
