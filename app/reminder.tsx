import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { getStoredReminder, storeReminder } from '@/src/lib/reminderPreferences';
import { scheduleTrainingReminders } from '@/src/lib/trainingReminders';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

const weekdays = [
  { value: 2, label: 'M' }, { value: 3, label: 'T' }, { value: 4, label: 'W' }, { value: 5, label: 'T' }, { value: 6, label: 'F' }, { value: 7, label: 'S' }, { value: 1, label: 'S' },
];

export default function ReminderScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [days, setDays] = useState(() => getStoredReminder().days);
  const [hour, setHour] = useState(() => getStoredReminder().hour);
  const [minute, setMinute] = useState(() => getStoredReminder().minute);
  const [status, setStatus] = useState('Choose when Repbook should nudge you to train');
  const [saving, setSaving] = useState(false);
  const toggleDay = (day: number) => setDays((current) => current.includes(day) ? current.filter((value) => value !== day) : [...current, day]);
  const save = async () => {
    if (!days.length) { setStatus('Choose at least one day'); return; }
    setSaving(true);
    try {
      const result = await scheduleTrainingReminders({ days, hour, minute });
      if (result.scheduled) { storeReminder({ days, hour, minute }); router.back(); return; }
      setStatus(result.reason);
    } catch { setStatus('Could not save reminders. Try again'); } finally { setSaving(false); }
  };
  return <Screen>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Back to settings" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable></View>
    <View style={styles.header}><Text style={styles.title}>Training reminders</Text><Text style={styles.subtitle}>A quiet nudge for the days you intend to train</Text></View>
    <View style={styles.block}><Text style={styles.label}>Repeat on</Text><View style={styles.dayRow}>{weekdays.map((day) => <Pressable key={`${day.label}-${day.value}`} accessibilityRole="button" accessibilityState={{ selected: days.includes(day.value) }} onPress={() => toggleDay(day.value)} style={[styles.day, days.includes(day.value) && styles.dayActive]}><Text style={[styles.dayText, days.includes(day.value) && styles.dayTextActive]}>{day.label}</Text></Pressable>)}</View>
      <Text style={styles.label}>Time</Text><View style={styles.timeRow}><TextInput accessibilityLabel="Reminder hour" keyboardType="number-pad" maxLength={2} onChangeText={(value) => setHour(Math.min(23, Math.max(0, Number(value) || 0)))} style={styles.timeInput} value={String(hour).padStart(2, '0')} /><Text style={styles.timeSeparator}>:</Text><TextInput accessibilityLabel="Reminder minute" keyboardType="number-pad" maxLength={2} onChangeText={(value) => setMinute(Math.min(59, Math.max(0, Number(value) || 0)))} style={styles.timeInput} value={String(minute).padStart(2, '0')} /></View>
      <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={({ pressed }) => [styles.save, (pressed || saving) && styles.pressed]}><Text style={styles.saveText}>{saving ? 'Saving…' : 'Save reminders'}</Text></Pressable><Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text>
    </View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  top: { minHeight: 44, paddingTop: spacing.sm }, back: { alignItems: 'flex-start', height: 44, justifyContent: 'center', width: 44 }, header: { marginBottom: spacing.xl }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 34, fontWeight: '800', letterSpacing: -0.9 }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs }, block: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 2, paddingVertical: spacing.lg }, label: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', marginBottom: spacing.sm }, dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }, day: { alignItems: 'center', borderColor: colors.border, borderWidth: 1, height: 48, justifyContent: 'center', width: 44 }, dayActive: { backgroundColor: colors.accent, borderColor: colors.accent }, dayText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, fontWeight: '800' }, dayTextActive: { color: colors.white }, timeRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.xl }, timeInput: { borderBottomColor: colors.ink, borderBottomWidth: 2, color: colors.accent, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', minHeight: 48, paddingBottom: spacing.xs, textAlign: 'center', width: 64 }, timeSeparator: { color: colors.ink, fontFamily: fonts.body, fontSize: 32, fontWeight: '800', paddingHorizontal: spacing.sm }, save: { alignItems: 'center', backgroundColor: colors.accent, justifyContent: 'center', minHeight: 52 }, saveText: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }, status: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: spacing.sm }, pressed: { opacity: 0.72 },
});
