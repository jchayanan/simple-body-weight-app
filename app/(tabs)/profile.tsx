import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { scheduleTrainingReminders } from '@/src/lib/trainingReminders';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

const weekdays = [
  { value: 2, label: 'M' }, { value: 3, label: 'T' }, { value: 4, label: 'W' }, { value: 5, label: 'T' }, { value: 6, label: 'F' }, { value: 7, label: 'S' }, { value: 1, label: 'S' },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors);
  const [days, setDays] = useState([2, 4, 6]);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [status, setStatus] = useState('No reminder scheduled yet.');
  const [saving, setSaving] = useState(false);
  const toggleDay = (day: number) => setDays((current) => current.includes(day) ? current.filter((value) => value !== day) : [...current, day]);
  const saveReminders = async () => {
    if (!days.length) { setStatus('Choose at least one day.'); return; }
    setSaving(true);
    try {
      const result = await scheduleTrainingReminders({ days, hour, minute });
      setStatus(result.scheduled ? `Reminder set for ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}.` : result.reason);
    } catch {
      setStatus('Could not save reminders. Try again.');
    } finally { setSaving(false); }
  };
  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Set the conditions that keep your practice moving.</Text></View>
    <View style={styles.sectionHead}><Ionicons name="notifications-outline" size={19} color={colors.accent} /><Text style={styles.section}>Training reminders</Text></View>
    <View style={styles.reminder}><Text style={styles.fieldLabel}>Repeat on</Text><View style={styles.dayRow}>{weekdays.map((day) => <Pressable key={`${day.label}-${day.value}`} accessibilityRole="button" accessibilityState={{ selected: days.includes(day.value) }} onPress={() => toggleDay(day.value)} style={[styles.day, days.includes(day.value) && styles.dayActive]}><Text style={[styles.dayText, days.includes(day.value) && styles.dayTextActive]}>{day.label}</Text></Pressable>)}</View>
      <Text style={styles.fieldLabel}>Time</Text><View style={styles.timeRow}><TextInput accessibilityLabel="Reminder hour" keyboardType="number-pad" maxLength={2} onChangeText={(value) => setHour(Math.min(23, Math.max(0, Number(value) || 0)))} style={styles.timeInput} value={String(hour).padStart(2, '0')} /><Text style={styles.timeSeparator}>:</Text><TextInput accessibilityLabel="Reminder minute" keyboardType="number-pad" maxLength={2} onChangeText={(value) => setMinute(Math.min(59, Math.max(0, Number(value) || 0)))} style={styles.timeInput} value={String(minute).padStart(2, '0')} /></View>
      <Pressable accessibilityRole="button" disabled={saving} onPress={saveReminders} style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}><Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save reminders'}</Text></Pressable><Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text>
    </View>
    <View style={styles.sectionHead}><Ionicons name="contrast-outline" size={19} color={colors.accent} /><Text style={styles.section}>Appearance</Text></View>
    <View style={styles.appearance}><Text style={styles.appearanceNote}>Choose how Repbook looks while you train.</Text><View style={styles.modeRow}>{(['light', 'dark'] as const).map((value) => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: mode === value }} onPress={() => setMode(value)} style={[styles.mode, mode === value && styles.modeActive]}><Ionicons name={value === 'light' ? 'sunny-outline' : 'moon-outline'} size={19} color={mode === value ? colors.white : colors.ink} /><Text style={[styles.modeText, mode === value && styles.modeTextActive]}>{value === 'light' ? 'Light' : 'Dark'}</Text></Pressable>)}</View></View>
    <View style={styles.about}><Text style={styles.aboutTitle}>Repbook</Text><Text style={styles.aboutBody}>Your training record stays on this device and works without a connection.</Text></View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  header: { paddingTop: spacing.md, marginBottom: spacing.xl }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs }, sectionHead: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }, section: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' }, reminder: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 2, marginBottom: spacing.xl, paddingVertical: spacing.lg }, fieldLabel: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', marginBottom: spacing.sm }, dayRow: { flexDirection: 'row', gap: 7, marginBottom: spacing.lg }, day: { alignItems: 'center', borderColor: colors.border, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 }, dayActive: { backgroundColor: colors.accent, borderColor: colors.accent }, dayText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, fontWeight: '800' }, dayTextActive: { color: colors.white }, timeRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.lg }, timeInput: { borderBottomColor: colors.ink, borderBottomWidth: 2, color: colors.accent, fontFamily: fonts.body, fontSize: 34, fontWeight: '800', paddingBottom: spacing.xs, textAlign: 'center', width: 62 }, timeSeparator: { color: colors.ink, fontFamily: fonts.body, fontSize: 30, fontWeight: '800', paddingHorizontal: spacing.sm }, saveButton: { alignItems: 'center', backgroundColor: colors.accent, justifyContent: 'center', minHeight: 50 }, saveLabel: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }, status: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: spacing.sm }, appearance: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 2, marginBottom: spacing.xl, paddingVertical: spacing.lg }, appearanceNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 }, modeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }, mode: { alignItems: 'center', borderColor: colors.border, borderWidth: 1, flex: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', minHeight: 50 }, modeActive: { backgroundColor: colors.accent, borderColor: colors.accent }, modeText: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, modeTextActive: { color: colors.white }, about: { borderTopColor: colors.ink, borderTopWidth: 2, paddingVertical: spacing.lg }, aboutTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 20, fontWeight: '800' }, aboutBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }, pressed: { opacity: 0.72 },
});
