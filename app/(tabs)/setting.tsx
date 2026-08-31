import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { pickBackupFile, shareBackupFile } from '@/src/lib/backupFile';
import { createBackup, parseBackup, type RepbookBackup } from '@/src/lib/backupModel';
import { getCurrentBackupData, mergeBackupData, previewBackupImport } from '@/src/lib/backupStorage';
import { cancelTrainingReminders, scheduleTrainingReminders } from '@/src/lib/trainingReminders';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [status, setStatus] = useState('Backups stay private until you save or share the file');

  const exportData = async () => {
    setBusy('export');
    setStatus('Preparing your backup…');
    try {
      const backup = createBackup(getCurrentBackupData());
      await shareBackupFile(JSON.stringify(backup, null, 2), `repbook-backup-${backup.exportedAt.slice(0, 10)}.json`);
      setStatus('Backup ready. Keep the JSON file somewhere you can reach from your next phone');
    } catch (error) {
      setStatus(errorMessage(error, 'Could not export your data. Try again and choose another save location'));
    } finally {
      setBusy(null);
    }
  };

  const commitImport = async (backup: RepbookBackup) => {
    setBusy('import');
    setStatus('Importing your backup…');
    try {
      const result = mergeBackupData(backup.data);
      let reminderNote = '';
      if (backup.data.reminder) {
        try {
          if (backup.data.reminder.days.length) {
            const scheduled = await scheduleTrainingReminders(backup.data.reminder);
            if (!scheduled.scheduled) reminderNote = ' Reminder time was restored, but notifications need attention in Settings.';
          } else {
            await cancelTrainingReminders();
          }
        } catch {
          reminderNote = ' Reminder time was restored, but notifications need attention in Settings.';
        }
      }
      const added = result.addedWorkouts + result.addedMovementEntries;
      const message = added
        ? `Added ${result.addedWorkouts} workout${result.addedWorkouts === 1 ? '' : 's'} and ${result.addedMovementEntries} progress record${result.addedMovementEntries === 1 ? '' : 's'}. Skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'}.${reminderNote}`
        : `Your training record was already up to date. Skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'}.${reminderNote}`;
      setStatus(message);
      if (Platform.OS !== 'web') Alert.alert(added ? 'Import complete' : 'Already up to date', message);
    } catch (error) {
      setStatus(errorMessage(error, 'Could not import this backup. Your existing data was not changed'));
    } finally {
      setBusy(null);
    }
  };

  const importData = async () => {
    setBusy('import');
    setStatus('Choose a Repbook JSON backup');
    try {
      const contents = await pickBackupFile();
      if (contents === null) {
        setStatus('Import cancelled. Your existing data was not changed');
        return;
      }
      const backup = parseBackup(contents);
      const preview = previewBackupImport(backup.data);
      const message = `${preview.workouts.length} workout${preview.workouts.length === 1 ? '' : 's'} and ${preview.movementHistory.length} progress record${preview.movementHistory.length === 1 ? '' : 's'} will be added. ${preview.skipped} duplicate${preview.skipped === 1 ? '' : 's'} will be skipped. Your existing training data will stay in place.${backup.data.reminder ? ' The reminder schedule from this backup will be restored.' : ''}`;
      setBusy(null);
      if (Platform.OS === 'web') {
        if (window.confirm(`Import this backup?\n\n${message}`)) await commitImport(backup);
        else setStatus('Import cancelled. Your existing data was not changed');
      } else {
        Alert.alert('Import this backup?', message, [
          { text: 'Cancel', style: 'cancel', onPress: () => setStatus('Import cancelled. Your existing data was not changed') },
          { text: 'Import', onPress: () => { void commitImport(backup); } },
        ]);
      }
    } catch (error) {
      setStatus(errorMessage(error, 'Could not read this backup. Your existing data was not changed'));
    } finally {
      setBusy(null);
    }
  };

  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Keep the next session easy to return to</Text></View>
    <Text style={styles.section}>Preferences</Text>
    <View style={styles.list}>
      <Pressable accessibilityRole="button" accessibilityLabel="Open training reminders" accessibilityHint="Choose the days and time for your workout reminder" onPress={() => router.push('/reminder')} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.icon}><Ionicons name="notifications-outline" size={20} color={colors.accent} /></View><View style={styles.copy}><Text style={styles.label}>Training reminders</Text><Text style={styles.note}>Choose days and time</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
      <View style={styles.row}><View style={styles.icon}><Ionicons name="moon-outline" size={20} color={colors.accent} /></View><View style={styles.copy}><Text style={styles.label}>Dark appearance</Text><Text style={styles.note}>{mode === 'dark' ? 'On' : 'Off'}</Text></View><Switch accessibilityLabel="Use dark appearance" onValueChange={(enabled) => setMode(enabled ? 'dark' : 'light')} trackColor={{ false: colors.border, true: colors.accent }} value={mode === 'dark'} /></View>
    </View>
    <Text style={styles.section}>Data</Text>
    <View style={styles.list}>
      <Pressable accessibilityRole="button" accessibilityLabel="Export training data" accessibilityHint="Create a JSON backup you can save or share" disabled={busy !== null} onPress={() => { void exportData(); }} style={({ pressed }) => [styles.row, (pressed || busy !== null) && styles.pressed]}><View style={styles.icon}><Ionicons name="share-outline" size={20} color={colors.accent} /></View><View style={styles.copy}><Text style={styles.label}>Export data</Text><Text style={styles.note}>{busy === 'export' ? 'Preparing backup…' : 'Save a backup for another phone'}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Import training data" accessibilityHint="Merge a Repbook JSON backup with data on this phone" disabled={busy !== null} onPress={() => { void importData(); }} style={({ pressed }) => [styles.row, (pressed || busy !== null) && styles.pressed]}><View style={styles.icon}><Ionicons name="document-attach-outline" size={20} color={colors.accent} /></View><View style={styles.copy}><Text style={styles.label}>Import data</Text><Text style={styles.note}>{busy === 'import' ? 'Reading backup…' : 'Merge a backup without duplicates'}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.dataStatus}>{status}</Text>
    <Text style={styles.section}>About</Text>
    <View style={styles.about}><Text style={styles.aboutTitle}>Simple Bodyweight</Text><Text style={styles.aboutBody}>Your training record stays on this device and works without a connection</Text></View>
  </Screen>;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  header: { marginBottom: spacing.xl, paddingTop: spacing.md },
  title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs },
  section: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, fontWeight: '800', letterSpacing: 1.1, marginBottom: spacing.md, textTransform: 'uppercase' },
  list: { borderTopColor: colors.ink, borderTopWidth: 2, marginBottom: spacing.xl },
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 72 },
  icon: { alignItems: 'center', width: 40 },
  copy: { flex: 1, minWidth: 0, paddingRight: spacing.md },
  label: { color: colors.ink, fontFamily: fonts.body, fontSize: 16, fontWeight: '800' },
  note: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 },
  dataStatus: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginBottom: spacing.xl, marginTop: -spacing.md },
  about: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 2, paddingVertical: spacing.lg },
  aboutTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 20, fontWeight: '800' },
  aboutBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  pressed: { opacity: 0.68 },
});
