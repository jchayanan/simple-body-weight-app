import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RepEditorModal } from '@/src/components/RepEditorModal';
import { restSecondsForSession } from '@/src/lib/progressMath';
import { formatCountdown } from '@/src/lib/time';
import { useWorkoutStore } from '@/src/stores/useWorkoutStore';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function WorkoutScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const plan = useWorkoutStore((state) => state.plan);
  const current = useWorkoutStore((state) => state.currentExercise);
  const reps = useWorkoutStore((state) => state.setReps[current]);
  const savedExercises = useWorkoutStore((state) => state.savedExercises);
  const setCurrentReps = useWorkoutStore((state) => state.setCurrentReps);
  const saveCurrentExercise = useWorkoutStore((state) => state.saveCurrentExercise);
  const finishWorkout = useWorkoutStore((state) => state.finishWorkout);
  const [seconds, setSeconds] = useState(0);
  const [lastSaved, setLastSaved] = useState<{ name: string; reps: number } | null>(null);
  const [isRepEditorOpen, setIsRepEditorOpen] = useState(false);
  const exerciseNames = plan.labels;
  const currentLabel = exerciseNames[current];
  const isMaxProgram = plan.type === 'max-program';
  const restSeconds = isMaxProgram ? restSecondsForSession(plan.sessionNumber) : 60;

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const saveAndContinue = () => {
    setLastSaved({ name: currentLabel, reps });
    saveCurrentExercise();
    setSeconds(restSeconds);
  };

  const finish = () => {
    finishWorkout();
    router.replace('/complete');
  };

  if (seconds > 0 && lastSaved) {
    return <SafeAreaView edges={['top', 'bottom']} style={styles.restScreen}>
      <View style={styles.restScreenContent}><Text style={styles.restScreenSaved}>{lastSaved.name} saved</Text><Text accessibilityLiveRegion="polite" style={styles.restScreenValue}>{formatCountdown(seconds)}</Text><Text style={styles.restScreenUnit}>remaining</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Skip rest" onPress={() => setSeconds(0)} style={({ pressed }) => [styles.skipRest, pressed && styles.pressed]}><Text style={styles.skipRestText}>Skip rest</Text></Pressable>
    </SafeAreaView>;
  }

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
    <View style={styles.top}><Pressable accessibilityLabel="Close and keep workout draft" accessibilityRole="button" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={colors.white} /></Pressable><Text style={styles.topTitle}>{plan.name.toUpperCase()}</Text><Text style={styles.progressLabel}>{isMaxProgram ? 'Set' : 'Exercise'} {current + 1} of {exerciseNames.length}</Text></View>
    <View style={styles.progressTrack}>{exerciseNames.map((_, index) => <View key={index} style={[styles.segment, index <= current && styles.segmentLit]} />)}</View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {savedExercises.some((entry) => entry !== null) ? <View style={styles.sessionLog}>{savedExercises.map((entry, index) => entry === null ? null : <View key={exerciseNames[index]} style={styles.savedRow}><Text style={styles.savedName}>{exerciseNames[index]}</Text><Text style={styles.savedValue}>{entry} reps</Text></View>)}</View> : null}
      <View style={styles.exerciseHeader}><Text style={styles.exerciseTitle}>{isMaxProgram ? plan.movement : currentLabel}</Text><Text style={styles.range}>{isMaxProgram ? `Target ${plan.targetReps[current]} reps` : 'Aim for 8–14 reps'}</Text></View>
      <View style={styles.repBlock}><Text style={styles.repLabel}>THIS SET</Text><Pressable accessibilityRole="button" accessibilityLabel={`Edit reps, currently ${reps}`} accessibilityHint="Opens a number input" onPress={() => setIsRepEditorOpen(true)} style={({ pressed }) => [styles.repButton, pressed && styles.pressed]}><Text accessibilityLiveRegion="polite" style={styles.repValue}>{reps}</Text><Text style={styles.repHint}>tap to edit</Text></Pressable></View>
      <View style={styles.previous}><Text style={styles.previousLabel}>LAST TIME</Text><Text style={styles.previousValue}>{current === 0 ? '10 reps' : current === 1 ? '8 reps' : '9 reps'}</Text><Text style={styles.previousNote}>steady is the goal</Text></View>
    </ScrollView>
    <View style={styles.footer}><PrimaryButton label={current === exerciseNames.length - 1 ? 'Finish workout' : 'Save & rest'} onPress={current === exerciseNames.length - 1 ? finish : saveAndContinue} /><Text style={styles.footerNote}>{current === exerciseNames.length - 1 ? 'This saves your final exercise and completes the session.' : 'Your exercise is saved before the timer begins.'}</Text></View><RepEditorModal minimum={0} onClose={() => setIsRepEditorOpen(false)} onSave={setCurrentReps} title="Edit this set" value={reps} visible={isRepEditorOpen} />
  </SafeAreaView>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.instrument },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.md },
  close: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  topTitle: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  progressLabel: { color: colors.white, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  progressTrack: { flexDirection: 'row', gap: 5, paddingHorizontal: spacing.lg, marginBottom: spacing.xl }, segment: { backgroundColor: colors.segmentOff, flex: 1, height: 6 }, segmentLit: { backgroundColor: colors.accent },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  sessionLog: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.segmentOff, marginBottom: spacing.xl },
  savedRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.segmentOff },
  savedName: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 13 },
  savedValue: { color: colors.success, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  exerciseHeader: { alignItems: 'center', marginBottom: spacing.lg },
  exerciseTitle: { color: colors.white, fontFamily: fonts.body, fontSize: 35, fontWeight: '800', textAlign: 'center' },
  range: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 14, fontWeight: '700', marginTop: spacing.sm },
  repBlock: { backgroundColor: '#202020', borderWidth: 1, borderColor: colors.segmentOff, alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.lg },
  repLabel: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  repButton: { alignItems: 'center', marginTop: spacing.sm, minHeight: 112, justifyContent: 'center' },
  repValue: { color: colors.accent, fontFamily: fonts.display, fontSize: 86, lineHeight: 96 },
  repHint: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12 },
  previous: { borderBottomWidth: 1, borderTopWidth: 1, borderColor: colors.segmentOff, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.lg },
  previousLabel: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  previousValue: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  previousNote: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12 },
  restScreen: { backgroundColor: colors.instrument, flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  restScreenContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  restScreenSaved: { color: colors.success, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  restScreenValue: { color: colors.accent, fontFamily: fonts.display, fontSize: 136, lineHeight: 146, marginTop: spacing.md },
  restScreenUnit: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 15 },
  skipRest: { alignItems: 'center', borderColor: colors.segmentOff, borderWidth: 1, justifyContent: 'center', minHeight: 52 },
  skipRestText: { color: colors.white, fontFamily: fonts.body, fontSize: 15, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: colors.segmentOff, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.instrument },
  footerNote: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm },
  pressed: { opacity: 0.64 },
});
