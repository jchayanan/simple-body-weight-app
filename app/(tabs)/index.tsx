import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PushUpIcon } from '@/src/components/PushUpIcon';
import { PullUpIcon } from '@/src/components/PullUpIcon';
import { Screen } from '@/src/components/Screen';
import { getStatisticsHistory } from '@/src/lib/localDb';
import { resolveWindowLayout } from '@/src/lib/layout';
import { attemptRead } from '@/src/lib/safeRead';
import { buildWorkoutActivity } from '@/src/lib/workoutActivity';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const window = useWindowDimensions();
  const expanded = resolveWindowLayout(window.width, window.height).expanded;
  const styles = createStyles(colors);
  const recentHistoryStart = useCallback(() => { const start = new Date(); start.setDate(start.getDate() - 7); return start.toISOString(); }, []);
  const [activityResult, setActivityResult] = useState(() => attemptRead(() => buildWorkoutActivity(getStatisticsHistory(recentHistoryStart()).workouts)));
  const refreshActivity = useCallback(() => {
    setActivityResult(attemptRead(() => buildWorkoutActivity(getStatisticsHistory(recentHistoryStart()).workouts)));
  }, [recentHistoryStart]);
  useFocusEffect(useCallback(() => { refreshActivity(); }, [refreshActivity]));
  const activity = activityResult.ok ? activityResult.value : buildWorkoutActivity([]);
  const sessionLabel = activity.sessionCount === 1 ? 'session' : 'sessions';

  return <Screen width="expanded">
    <View style={styles.header}><Text style={styles.title}>Training</Text><Text style={styles.weekStatus}>{activity.sessionCount} {sessionLabel} in the last 7 days</Text></View>
    <View style={[styles.dashboard, expanded && styles.dashboardExpanded]}><View style={[styles.activityPane, expanded && styles.activityPaneExpanded]}>{activityResult.ok ? <View style={styles.activityStrip}><View style={styles.activityDays}>{activity.days.map((day) => <View key={day.key} accessible accessibilityLabel={day.accessibilityLabel} style={[styles.activityDay, day.isToday && styles.activityDayToday]}><Text style={[styles.activityWeekday, day.isToday && styles.activityWeekdayToday]}>{day.weekday}</Text><Text style={styles.activityDate}>{day.date}</Text><View style={[styles.activityMark, day.completed ? styles.activityMarkComplete : styles.activityMarkEmpty]} /></View>)}</View></View> : <View accessibilityRole="alert" style={styles.state}><Text style={styles.stateTitle}>Recent activity is unavailable</Text><Text style={styles.stateBody}>Your saved workouts are still on this device. Reload the record to try reading them again</Text><Pressable accessibilityRole="button" onPress={refreshActivity} style={styles.stateAction}><Text style={styles.stateActionText}>Reload activity</Text></Pressable></View>}</View>
    <View style={[styles.programHero, expanded && styles.programHeroExpanded]}><Text style={styles.programHeroTitle}>Choose your focus</Text>{[
      { movement: 'Push-up', note: 'Five sets from your tested maximum', icon: 'arrow-up-outline' },
      { movement: 'Pull-up', note: 'Five sets from your tested maximum', icon: 'arrow-down-outline' },
      { movement: 'Squat', note: 'Five sets from your tested maximum', icon: 'barbell-outline' },
    ].map((program) => <Pressable key={program.movement} accessibilityRole="button" accessibilityLabel={`Set up ${program.movement} program`} accessibilityHint="Starts your focused five-set program" onPress={() => router.push({ pathname: '/program', params: { movement: program.movement } })} style={({ pressed }) => [styles.programHeroRow, pressed && styles.pressed]}><View style={styles.programHeroIcon}>{program.movement === 'Push-up' ? <PushUpIcon color={colors.white} size={29} /> : program.movement === 'Pull-up' ? <PullUpIcon color={colors.white} size={29} /> : <Ionicons name={program.icon as keyof typeof Ionicons.glyphMap} size={25} color={colors.white} />}</View><View style={styles.programHeroCopy}><Text style={styles.programHeroName}>{program.movement}</Text><Text style={styles.programHeroNote}>{program.note}</Text></View><Ionicons name="arrow-forward" size={21} color={colors.accent} /></Pressable>)}</View></View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ header: { paddingTop: spacing.md, marginBottom: spacing.md }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 }, weekStatus: { color: colors.success, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', marginTop: spacing.sm }, dashboard: { flex: 1 }, dashboardExpanded: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xxl }, activityPane: { minWidth: 0 }, activityPaneExpanded: { flex: 1 }, activityStrip: { paddingBottom: spacing.sm }, activityDays: { flexDirection: 'row', gap: spacing.xs }, activityDay: { alignItems: 'center', borderColor: colors.background, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 72, minWidth: 0, paddingVertical: spacing.xs }, activityDayToday: { borderColor: colors.accent }, activityWeekday: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }, activityWeekdayToday: { color: colors.accent }, activityDate: { color: colors.ink, fontFamily: fonts.body, fontSize: 20, fontWeight: '800', marginTop: 2 }, activityMark: { height: 6, marginTop: spacing.xs, width: 6 }, activityMarkComplete: { backgroundColor: colors.success }, activityMarkEmpty: { borderColor: colors.border, borderWidth: 1 }, state: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, marginBottom: spacing.lg, paddingVertical: spacing.lg }, stateTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 21, fontWeight: '800' }, stateBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.xs }, stateAction: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.accent, borderWidth: 1, justifyContent: 'center', marginTop: spacing.md, minHeight: 48, paddingHorizontal: spacing.md }, stateActionText: { color: colors.accent, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, programHero: { borderTopColor: colors.ink, borderTopWidth: 2, paddingTop: spacing.md }, programHeroExpanded: { flex: 1.25, minWidth: 0 }, programHeroTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 25, fontWeight: '800', letterSpacing: -0.4, marginBottom: spacing.sm }, programHeroRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', minHeight: 104 }, programHeroIcon: { alignItems: 'center', backgroundColor: colors.instrument, height: 48, justifyContent: 'center', width: 48 }, programHeroCopy: { flex: 1, marginLeft: spacing.md, minWidth: 0 }, programHeroName: { color: colors.ink, fontFamily: fonts.body, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }, programHeroNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 5 }, pressed: { opacity: 0.65 } });
