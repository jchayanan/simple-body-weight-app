import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PushUpIcon } from '@/src/components/PushUpIcon';
import { PullUpIcon } from '@/src/components/PullUpIcon';
import { Screen } from '@/src/components/Screen';
import { getStatisticsHistory } from '@/src/lib/localDb';
import { buildWorkoutActivity } from '@/src/lib/workoutActivity';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [activity, setActivity] = useState(() => buildWorkoutActivity([]));
  const refreshActivity = useCallback(() => {
    try {
      setActivity(buildWorkoutActivity(getStatisticsHistory().workouts));
    } catch {
      setActivity(buildWorkoutActivity([]));
    }
  }, []);
  useFocusEffect(useCallback(() => { refreshActivity(); }, [refreshActivity]));
  const sessionLabel = activity.sessionCount === 1 ? 'session' : 'sessions';

  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Training</Text><Text style={styles.weekStatus}>{activity.sessionCount} {sessionLabel} in the last 7 days</Text></View>
    <View style={styles.activityStrip}><View style={styles.activityDays}>{activity.days.map((day) => <View key={day.key} accessible accessibilityLabel={day.accessibilityLabel} style={[styles.activityDay, day.isToday && styles.activityDayToday]}><Text style={[styles.activityWeekday, day.isToday && styles.activityWeekdayToday]}>{day.weekday}</Text><Text style={styles.activityDate}>{day.date}</Text><View style={[styles.activityMark, day.completed ? styles.activityMarkComplete : styles.activityMarkEmpty]} /></View>)}</View></View>
    <View style={styles.programHero}><Text style={styles.programHeroTitle}>Choose your focus</Text>{[
      { movement: 'Push-up', note: 'Five sets from your tested maximum', icon: 'arrow-up-outline' },
      { movement: 'Pull-up', note: 'Five sets from your tested maximum', icon: 'arrow-down-outline' },
      { movement: 'Squat', note: 'Five sets from your tested maximum', icon: 'barbell-outline' },
    ].map((program) => <Pressable key={program.movement} accessibilityRole="button" accessibilityLabel={`Set up ${program.movement} program`} accessibilityHint="Starts your focused five-set program" onPress={() => router.push({ pathname: '/program', params: { movement: program.movement } })} style={({ pressed }) => [styles.programHeroRow, pressed && styles.pressed]}><View style={styles.programHeroIcon}>{program.movement === 'Push-up' ? <PushUpIcon color={colors.white} size={29} /> : program.movement === 'Pull-up' ? <PullUpIcon color={colors.white} size={29} /> : <Ionicons name={program.icon as keyof typeof Ionicons.glyphMap} size={25} color={colors.white} />}</View><View style={styles.programHeroCopy}><Text style={styles.programHeroName}>{program.movement}</Text><Text style={styles.programHeroNote}>{program.note}</Text></View><Ionicons name="arrow-forward" size={21} color={colors.accent} /></Pressable>)}</View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ header: { paddingTop: spacing.md, marginBottom: spacing.md }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 }, weekStatus: { color: colors.success, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', marginTop: spacing.sm }, activityStrip: { paddingBottom: spacing.sm }, activityDays: { flexDirection: 'row', gap: spacing.xs }, activityDay: { alignItems: 'center', borderColor: colors.background, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 72, minWidth: 0, paddingVertical: spacing.xs }, activityDayToday: { borderColor: colors.accent }, activityWeekday: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }, activityWeekdayToday: { color: colors.accent }, activityDate: { color: colors.ink, fontFamily: fonts.body, fontSize: 20, fontWeight: '800', marginTop: 2 }, activityMark: { height: 6, marginTop: spacing.xs, width: 6 }, activityMarkComplete: { backgroundColor: colors.success }, activityMarkEmpty: { borderColor: colors.border, borderWidth: 1 }, programHero: { borderTopColor: colors.ink, borderTopWidth: 2, paddingTop: spacing.md }, programHeroTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 25, fontWeight: '800', letterSpacing: -0.4, marginBottom: spacing.sm }, programHeroRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', minHeight: 104 }, programHeroIcon: { alignItems: 'center', backgroundColor: colors.instrument, height: 48, justifyContent: 'center', width: 48 }, programHeroCopy: { flex: 1, marginLeft: spacing.md }, programHeroName: { color: colors.ink, fontFamily: fonts.body, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }, programHeroNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 5, maxWidth: 190 }, pressed: { opacity: 0.65 } });
