import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors);
  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Keep the next session easy to return to</Text></View>
    <Text style={styles.section}>Preferences</Text>
    <View style={styles.list}>
      <Pressable accessibilityRole="button" accessibilityLabel="Open training reminders" accessibilityHint="Choose the days and time for your workout reminder" onPress={() => router.push('/reminder')} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.icon}><Ionicons name="notifications-outline" size={20} color={colors.accent} /></View><View style={styles.copy}><Text style={styles.label}>Training reminders</Text><Text style={styles.note}>Choose days and time</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
      <View style={styles.row}><View style={styles.icon}><Ionicons name="moon-outline" size={20} color={colors.accent} /></View><View style={styles.copy}><Text style={styles.label}>Dark appearance</Text><Text style={styles.note}>{mode === 'dark' ? 'On' : 'Off'}</Text></View><Switch accessibilityLabel="Use dark appearance" onValueChange={(enabled) => setMode(enabled ? 'dark' : 'light')} trackColor={{ false: colors.border, true: colors.accent }} value={mode === 'dark'} /></View>
    </View>
    <Text style={styles.section}>About</Text>
    <View style={styles.about}><Text style={styles.aboutTitle}>Repbook</Text><Text style={styles.aboutBody}>Your training record stays on this device and works without a connection</Text></View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  header: { marginBottom: spacing.xl, paddingTop: spacing.md }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs }, section: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, fontWeight: '800', letterSpacing: 1.1, marginBottom: spacing.md, textTransform: 'uppercase' }, list: { borderTopColor: colors.ink, borderTopWidth: 2, marginBottom: spacing.xl }, row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 72 }, icon: { alignItems: 'center', width: 40 }, copy: { flex: 1, minWidth: 0, paddingRight: spacing.md }, label: { color: colors.ink, fontFamily: fonts.body, fontSize: 16, fontWeight: '800' }, note: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 }, about: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 2, paddingVertical: spacing.lg }, aboutTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 20, fontWeight: '800' }, aboutBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }, pressed: { opacity: 0.68 },
});
