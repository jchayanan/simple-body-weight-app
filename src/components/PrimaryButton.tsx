import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, spacing } from '@/src/theme';

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.label}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { minHeight: 56, justifyContent: 'center', alignItems: 'center', borderRadius: radii.sm, backgroundColor: colors.accent, paddingHorizontal: spacing.lg }, pressed: { opacity: 0.82 }, label: { color: colors.white, fontFamily: fonts.body, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 } });
