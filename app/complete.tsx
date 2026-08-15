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
  const lastWorkoutDurationMinutes = useWorkoutStore((state) => state.lastWorkoutDurationMinutes);
  const planType = useWorkoutStore((state) => state.plan.type);
  const resetWorkout = useWorkoutStore((state) => state.resetWorkout);
  const sessionUnit = planType === 'max-program' ? 'sets' : 'exercises';

  return <Screen>
    <View accessibilityLiveRegion="polite" style={styles.header}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.check}><Ionicons name="checkmark" size={25} color={colors.white} /></View><Text style={styles.title}>Good work.</Text>{lastWorkoutName ? <Text style={styles.sessionName}>{lastWorkoutName}</Text> : null}<Text style={styles.subtitle}>Your session is recorded. Take the win, then come back when you are ready.</Text></View>
    <View accessibilityLabel={`${total} total reps, ${lastWorkoutSetCount} ${sessionUnit}${lastWorkoutDurationMinutes ? `, ${lastWorkoutDurationMinutes} minutes` : ''}`} style={styles.summary}>
      <View style={styles.stat}><Text style={styles.value}>{total}</Text><Text style={styles.label}>total reps</Text></View>
      <View style={[styles.stat, !lastWorkoutDurationMinutes && styles.lastStat]}><Text style={styles.value}>{lastWorkoutSetCount}</Text><Text style={styles.label}>{sessionUnit}</Text></View>
      {lastWorkoutDurationMinutes ? <View style={[styles.stat, styles.lastStat]}><Text style={styles.value}>{lastWorkoutDurationMinutes}</Text><Text style={styles.label}>minutes</Text></View> : null}
    </View>
    <View style={styles.record}><View style={styles.recordMark} /><View style={styles.recordCopy}><Text style={styles.recordTitle}>Saved to this device</Text><Text style={styles.recordBody}>Your completed sets are now part of your training record.</Text></View></View>
    <View style={styles.bottom}><PrimaryButton label="Back to today" onPress={() => { resetWorkout(); router.replace('/'); }} /><Text style={styles.footer}>A steady practice adds up.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ header: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xxl }, check: { alignItems: 'center', backgroundColor: colors.success, height: 52, justifyContent: 'center', marginBottom: spacing.lg, width: 52 }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 42, fontWeight: '800', letterSpacing: -1.2 }, sessionName: { color: colors.accent, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, marginTop: spacing.sm, textAlign: 'center' }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, maxWidth: 288, textAlign: 'center' }, summary: { borderBottomWidth: 1, borderColor: colors.ink, borderTopWidth: 2, flexDirection: 'row' }, stat: { alignItems: 'center', borderRightColor: colors.border, borderRightWidth: 1, flex: 1, paddingVertical: spacing.lg }, lastStat: { borderRightWidth: 0 }, value: { color: colors.accent, fontFamily: fonts.body, fontSize: 32, fontWeight: '800', letterSpacing: -0.6 }, label: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: spacing.xs }, record: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: spacing.lg }, recordMark: { backgroundColor: colors.success, height: 8, marginRight: spacing.md, marginTop: 7, width: 8 }, recordCopy: { flex: 1 }, recordTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, recordBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.xs }, bottom: { marginTop: 'auto', paddingTop: spacing.xl }, footer: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.sm, textAlign: 'center' } });
