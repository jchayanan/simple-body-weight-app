import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useWorkoutStore } from '@/src/stores/useWorkoutStore';
import { colors, fonts, spacing } from '@/src/theme';

export default function CompleteScreen() {
  const total = useWorkoutStore((state) => state.lastWorkoutTotal);
  const lastWorkoutName = useWorkoutStore((state) => state.lastWorkoutName);
  const lastWorkoutSetCount = useWorkoutStore((state) => state.lastWorkoutSetCount);
  const resetWorkout = useWorkoutStore((state) => state.resetWorkout);
  return <Screen>
    <View style={styles.header}><View style={styles.check}><Ionicons name="checkmark" size={28} color={colors.white} /></View><Text style={styles.kicker}>SESSION COMPLETE</Text><Text style={styles.title}>Good work.</Text>{lastWorkoutName ? <Text style={styles.sessionName}>{lastWorkoutName}</Text> : null}<Text style={styles.subtitle}>You kept the promise you made to yourself today.</Text></View>
    <View style={styles.summary}><View style={styles.stat}><Text style={styles.value}>{total || 30}</Text><Text style={styles.label}>total reps</Text></View><View style={styles.stat}><Text style={styles.value}>18</Text><Text style={styles.label}>minutes</Text></View><View style={styles.stat}><Text style={styles.value}>{lastWorkoutSetCount || 3}</Text><Text style={styles.label}>{lastWorkoutSetCount === 4 ? 'sets' : 'exercises'}</Text></View></View>
    <View style={styles.note}><Text style={styles.noteTitle}>Next time</Text><Text style={styles.noteBody}>Repeat this routine once more before moving to a harder variation.</Text></View>
    <View style={styles.bottom}><PrimaryButton label="Back to today" onPress={() => { resetWorkout(); router.replace('/'); }} /><Text style={styles.footer}>Saved locally · syncs when connected</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ header: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xxl }, check: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl }, kicker: { color: colors.success, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 42, marginTop: spacing.sm }, sessionName: { color: colors.accent, fontFamily: fonts.body, fontSize: 14, fontWeight: '700', marginTop: spacing.xs }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 280, marginTop: spacing.sm }, summary: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', marginBottom: spacing.xl }, stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, borderRightWidth: 1, borderRightColor: colors.border }, value: { color: colors.accent, fontFamily: fonts.display, fontSize: 30 }, label: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: spacing.xs }, note: { borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.lg }, noteTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, noteBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.xs }, bottom: { marginTop: 'auto', paddingTop: spacing.lg }, footer: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: spacing.sm } });
