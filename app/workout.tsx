import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RepEditorModal } from '@/src/components/RepEditorModal';
import { getStatisticsHistory } from '@/src/lib/localDb';
import type { MovementName } from '@/src/lib/progressMath';
import { restSecondsForSession } from '@/src/lib/progressMath';
import { createRestSkipGuard } from '@/src/lib/restSkipGuard';
import { formatCountdown } from '@/src/lib/time';
import { useWorkoutStore } from '@/src/stores/useWorkoutStore';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

const restSkipLockMilliseconds = 400;

function getPreviousReps(movement?: MovementName) {
  if (!movement) return null;
  try {
    const entries = getStatisticsHistory().workouts.flatMap((workout) => workout.entries.filter((entry) => entry.exercise === movement).map((entry) => ({ completedAt: workout.completedAt, entry })));
    entries.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime() || b.entry.setIndex - a.entry.setIndex);
    return entries[0]?.entry.reps ?? null;
  } catch {
    return null;
  }
}

export default function WorkoutScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const plan = useWorkoutStore((state) => state.plan);
  const current = useWorkoutStore((state) => state.currentExercise);
  const setReps = useWorkoutStore((state) => state.setReps);
  const reps = setReps[current];
  const savedExercises = useWorkoutStore((state) => state.savedExercises);
  const setCurrentReps = useWorkoutStore((state) => state.setCurrentReps);
  const updateSavedExercise = useWorkoutStore((state) => state.updateSavedExercise);
  const saveCurrentExercise = useWorkoutStore((state) => state.saveCurrentExercise);
  const finishWorkout = useWorkoutStore((state) => state.finishWorkout);
  const [seconds, setSeconds] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<{ name: string; reps: number } | null>(null);
  const [isRepEditorOpen, setIsRepEditorOpen] = useState(false);
  const [editingSavedIndex, setEditingSavedIndex] = useState<number | null>(null);
  const [isWorkoutActionLocked, setIsWorkoutActionLocked] = useState(false);
  const workoutActionGuard = useRef(createRestSkipGuard());
  const workoutActionReleaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exerciseNames = plan.labels;
  const currentLabel = exerciseNames[current];
  const isMaxProgram = plan.type === 'max-program';
  const restSeconds = isMaxProgram ? restSecondsForSession(plan.sessionNumber) : 60;
  const trackedMovement = isMaxProgram || currentLabel === plan.trackedMovement ? plan.trackedMovement : undefined;
  const previousReps = useMemo(() => getPreviousReps(trackedMovement), [trackedMovement]);
  const previousValue = previousReps === null ? 'No previous entry' : `${previousReps} reps`;
  const nextLabel = isMaxProgram ? `Set ${current + 1}` : currentLabel;

  useEffect(() => {
    if (!restEndsAt) {
      setSeconds(0);
      return undefined;
    }
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) setRestEndsAt(null);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [restEndsAt]);

  useEffect(() => () => {
    if (workoutActionReleaseTimer.current) clearTimeout(workoutActionReleaseTimer.current);
  }, []);

  const beginWorkoutAction = () => {
    if (!workoutActionGuard.current.beginAction()) return false;
    setIsWorkoutActionLocked(true);
    workoutActionReleaseTimer.current = setTimeout(() => {
      workoutActionGuard.current.release();
      setIsWorkoutActionLocked(false);
    }, restSkipLockMilliseconds);
    return true;
  };

  const saveAndContinue = () => {
    setLastSaved({ name: currentLabel, reps });
    saveCurrentExercise();
    setRestEndsAt(Date.now() + restSeconds * 1000);
  };

  const finish = () => {
    finishWorkout();
    router.replace('/complete');
  };

  const skipRest = () => {
    if (!beginWorkoutAction()) return;
    setRestEndsAt(null);
  };

  const continueWorkout = () => {
    if (!beginWorkoutAction()) return;
    if (current === exerciseNames.length - 1) finish();
    else saveAndContinue();
  };

  if (seconds > 0 && lastSaved) {
    return <SafeAreaView edges={['top', 'bottom']} style={styles.restScreen}>
      <View style={styles.restScreenContent}><Text style={styles.restScreenSaved}>{lastSaved.name} saved</Text><Text style={styles.restScreenNext}>Next: {nextLabel}</Text><Text style={styles.restScreenLabel}>REST REMAINING</Text><Text accessibilityLiveRegion="polite" style={styles.restScreenValue}>{formatCountdown(seconds)}</Text><Text style={styles.restScreenUnit}>Keep your form ready.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Skip rest" accessibilityState={{ disabled: isWorkoutActionLocked }} disabled={isWorkoutActionLocked} onPress={skipRest} style={({ pressed }) => [styles.skipRest, (pressed || isWorkoutActionLocked) && styles.pressed]}><Text style={styles.skipRestText}>Skip rest</Text></Pressable>
    </SafeAreaView>;
  }

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
    <View style={styles.top}><Pressable accessibilityLabel="Close workout" accessibilityRole="button" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={colors.white} /></Pressable><Text style={styles.topTitle}>{plan.name.toUpperCase()}</Text><Text style={styles.progressLabel}>{isMaxProgram ? 'Set' : 'Exercise'} {current + 1} of {exerciseNames.length}</Text></View>
    <View style={styles.progressTrack}>{exerciseNames.map((_, index) => <View key={index} style={[styles.segment, index <= current && styles.segmentLit]} />)}</View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.exerciseHeader}><Text style={styles.exerciseTitle}>{isMaxProgram ? plan.movement : currentLabel}</Text><Text style={styles.range}>Target {plan.targetReps[current]} reps</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${isMaxProgram ? `set ${current + 1}` : currentLabel} reps, currently ${reps}`} accessibilityHint="Opens a number input" onPress={() => { setEditingSavedIndex(null); setIsRepEditorOpen(true); }} style={({ pressed }) => [styles.repBlock, pressed && styles.pressed]}><Text style={styles.repLabel}>{isMaxProgram ? `SET ${current + 1}` : 'THIS EXERCISE'}</Text><Text accessibilityLiveRegion="polite" style={styles.repValue}>{reps}</Text><Text style={styles.repHint}>tap anywhere to edit</Text></Pressable>
      <View style={styles.previous}><Text style={styles.previousLabel}>LAST TIME</Text><Text style={styles.previousValue}>{previousValue}</Text><Text style={styles.previousNote}>{previousReps === null ? 'No saved history yet' : 'latest logged entry'}</Text></View>
      {savedExercises.some((entry) => entry !== null) ? <View style={styles.sessionLog}>{savedExercises.map((entry, index) => entry === null ? null : <Pressable key={exerciseNames[index]} accessibilityRole="button" accessibilityLabel={`Edit ${exerciseNames[index]}, ${entry} reps`} accessibilityHint="Opens a number input" onPress={() => { setEditingSavedIndex(index); setIsRepEditorOpen(true); }} style={({ pressed }) => [styles.savedRow, pressed && styles.pressed]}><Text style={styles.savedName}>{exerciseNames[index]}</Text><Text style={styles.savedValue}>{entry} reps</Text></Pressable>)}</View> : null}
    </ScrollView>
    <View style={styles.footer}><PrimaryButton disabled={isWorkoutActionLocked} label={current === exerciseNames.length - 1 ? 'Finish workout' : 'Save & rest'} onPress={continueWorkout} /><Text style={styles.footerNote}>{current === exerciseNames.length - 1 ? 'This saves your final exercise and completes the session.' : `This saves the ${isMaxProgram ? 'set' : 'exercise'} before the ${restSeconds}-second rest.`}</Text></View><RepEditorModal minimum={1} onClose={() => { setIsRepEditorOpen(false); setEditingSavedIndex(null); }} onSave={(nextReps) => { if (editingSavedIndex === null) setCurrentReps(nextReps); else updateSavedExercise(editingSavedIndex, nextReps); }} title={editingSavedIndex === null ? isMaxProgram ? 'Edit this set' : 'Edit this exercise' : `Edit ${exerciseNames[editingSavedIndex]}`} value={editingSavedIndex === null ? reps : setReps[editingSavedIndex] ?? 1} visible={isRepEditorOpen} />
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
  savedRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.segmentOff, paddingHorizontal: spacing.xs },
  savedName: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 13 },
  savedValue: { color: colors.success, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  exerciseHeader: { alignItems: 'center', marginBottom: spacing.lg },
  exerciseTitle: { color: colors.white, fontFamily: fonts.body, fontSize: 35, fontWeight: '800', textAlign: 'center' },
  range: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 14, fontWeight: '700', marginTop: spacing.sm },
  repBlock: { backgroundColor: colors.segmentOff, borderWidth: 1, borderColor: colors.segmentOff, alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.lg },
  repLabel: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  repValue: { color: colors.accent, fontFamily: fonts.display, fontSize: 86, lineHeight: 96, marginBottom: spacing.lg },
  repHint: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12 },
  previous: { borderBottomWidth: 1, borderTopWidth: 1, borderColor: colors.segmentOff, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.lg },
  previousLabel: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  previousValue: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  previousNote: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12 },
  restScreen: { backgroundColor: colors.instrument, flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  restScreenContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  restScreenSaved: { color: colors.success, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  restScreenNext: { color: colors.white, fontFamily: fonts.body, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
  restScreenLabel: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: spacing.xxl },
  restScreenValue: { color: colors.accent, fontFamily: fonts.display, fontSize: 136, lineHeight: 146, marginTop: spacing.md },
  restScreenUnit: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 15, marginTop: spacing.xs },
  skipRest: { alignItems: 'center', borderColor: colors.segmentOff, borderWidth: 1, justifyContent: 'center', minHeight: 52 },
  skipRestText: { color: colors.white, fontFamily: fonts.body, fontSize: 15, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: colors.segmentOff, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.instrument },
  footerNote: { color: colors.instrumentMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm },
  pressed: { opacity: 0.64 },
});
