import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RepEditorModal } from '@/src/components/RepEditorModal';
import { getMovementProgramStatus, saveMovementMaximum } from '@/src/lib/localDb';
import { resolveWindowLayout } from '@/src/lib/layout';
import { resolveProgramMovement } from '@/src/lib/movementProgram';
import { attemptRead } from '@/src/lib/safeRead';
import { buildMaxProgramTargets, MaxProgramMovement, useWorkoutStore } from '@/src/stores/useWorkoutStore';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function ProgramScreen() {
  const { colors } = useAppTheme();
  const window = useWindowDimensions();
  const compactLandscape = resolveWindowLayout(window.width, window.height).compactLandscape;
  const styles = createStyles(colors);
  const { movement: movementParam } = useLocalSearchParams<{ movement?: string }>();
  const movement: MaxProgramMovement = resolveProgramMovement(movementParam);
  const [programResult, setProgramResult] = useState(() => attemptRead(() => getMovementProgramStatus(movement)));
  const programStatus = programResult.ok ? programResult.value : { maximum: 0, sessionsSinceMaximum: 0, requiresMaximumTest: true };
  const hasPreviousMaximum = programStatus.maximum > 0;
  const [maximumReps, setMaximumReps] = useState<number | null>(() => programStatus.maximum || null);
  const [maximumSaved, setMaximumSaved] = useState(false);
  const [isMaximumEditorOpen, setIsMaximumEditorOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const startMaxProgram = useWorkoutStore((state) => state.startMaxProgram);
  const defaultMaximum = movement === 'Pull-up' ? 8 : 20;
  const activeMaximum = maximumReps ?? defaultMaximum;
  const showPlan = !programStatus.requiresMaximumTest;
  const sessionNumber = Math.min(programStatus.sessionsSinceMaximum + 1, 4);
  const targets = useMemo(() => buildMaxProgramTargets(activeMaximum, sessionNumber), [activeMaximum, sessionNumber]);

  const reloadProgram = () => {
    const result = attemptRead(() => getMovementProgramStatus(movement));
    setProgramResult(result);
    if (result.ok) setMaximumReps(result.value.maximum || null);
  };

  const startProgram = () => {
    if (maximumReps === null) return;
    startMaxProgram(movement, maximumReps);
    router.replace('/workout');
  };

  const saveMaximum = () => {
    if (maximumReps === null) return;
    try {
      saveMovementMaximum(movement, maximumReps);
      setSaveError('');
      setMaximumSaved(true);
    } catch {
      setSaveError("Couldn't save locally. Try again");
    }
  };

  if (!programResult.ok) return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}><View style={styles.errorContent}><View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Close program setup" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={colors.ink} /></Pressable></View><View accessibilityRole="alert" style={styles.errorState}><Text style={styles.errorTitle}>Program setup is unavailable</Text><Text style={styles.errorBody}>We couldn’t read your saved maximum. Nothing was changed; reload it to try again</Text><Pressable accessibilityRole="button" onPress={reloadProgram} style={styles.errorAction}><Text style={styles.errorActionText}>Reload program</Text></Pressable></View></View></SafeAreaView>;

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
    <ScrollView contentContainerStyle={[styles.content, compactLandscape && styles.contentCompact]} showsVerticalScrollIndicator={false}>
      <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Close program setup" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={colors.ink} /></Pressable><Text style={styles.topLabel}>PROGRAM SETUP</Text></View>
      <View style={styles.intro}><Text style={styles.title}>{movement}</Text></View>
      {maximumSaved ? <View style={styles.savedBlock}><Text style={styles.savedLabel}>MAXIMUM SAVED</Text><Text style={styles.savedTitle}>That’s enough for today</Text><Text style={styles.savedCopy}>Your next five-set plan is ready when you’re recovered</Text></View> : !showPlan ? <View style={styles.maximumBlock}><Text style={styles.maximumLabel}>{hasPreviousMaximum ? 'RETEST YOUR MAXIMUM' : 'TEST YOUR MAXIMUM'}</Text><Text style={styles.maximumGuidance}>{hasPreviousMaximum ? `Four sessions complete, previous best: ${programStatus.maximum} reps` : 'Do one clean all-out set, stop when form breaks'}</Text><Pressable accessibilityRole="button" accessibilityLabel={maximumReps === null ? 'Enter maximum reps' : `Edit maximum reps, currently ${maximumReps}`} accessibilityHint="Opens a number input" onPress={() => setIsMaximumEditorOpen(true)} style={({ pressed }) => [styles.maximumButton, pressed && styles.pressed]}><Text style={styles.maximumValue}>{maximumReps ?? '—'}</Text><Text style={styles.maximumUnit}>{maximumReps === null ? 'tap to enter your clean reps' : 'clean reps · tap number to edit'}</Text></Pressable></View> : <View style={styles.plan}><View style={styles.planHeader}><View style={styles.planCopy}><Text style={styles.planTitle}>Your five sets</Text><Text style={styles.planNote}>Each set steps down to keep quality high</Text></View><Text style={styles.planFormula}>Session {sessionNumber} of 4</Text></View>{targets.map((reps, index) => <View key={`set-${index + 1}`} style={styles.setRow}><Text style={styles.setLabel}>SET {index + 1}</Text><Text style={styles.setPercentage}>{Math.round((reps / activeMaximum) * 100)}%</Text><Text style={styles.setReps}>{reps} reps</Text></View>)}</View>}
    </ScrollView>
    <View style={[styles.footer, compactLandscape && styles.footerCompact]}>{saveError ? <Text accessibilityLiveRegion="polite" style={styles.saveError}>{saveError}</Text> : null}<PrimaryButton disabled={!maximumSaved && !showPlan && maximumReps === null} label={maximumSaved ? 'Back to today' : !showPlan ? hasPreviousMaximum ? 'Save new maximum' : 'Save test result' : 'Start 5 sets'} onPress={maximumSaved ? () => router.back() : !showPlan ? saveMaximum : startProgram} /></View><RepEditorModal minimum={1} onClose={() => setIsMaximumEditorOpen(false)} onSave={setMaximumReps} title={`${hasPreviousMaximum ? 'Retest' : 'Test'} ${movement} maximum`} value={maximumReps} visible={isMaximumEditorOpen} />
  </SafeAreaView>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { alignSelf: 'center', maxWidth: 760, paddingHorizontal: spacing.lg, paddingBottom: 100, width: '100%' }, contentCompact: { paddingBottom: spacing.lg }, errorContent: { alignSelf: 'center', flex: 1, paddingHorizontal: spacing.lg, width: '100%', maxWidth: 760 }, top: { alignItems: 'center', flexDirection: 'row', minHeight: 48, paddingTop: spacing.sm }, close: { alignItems: 'flex-start', height: 48, justifyContent: 'center', width: 48 }, topLabel: { color: colors.accent, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginLeft: spacing.xs }, errorState: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 2, marginTop: spacing.xl, paddingVertical: spacing.xl }, errorTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 28, fontWeight: '800' }, errorBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm }, errorAction: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.accent, borderWidth: 1, justifyContent: 'center', marginTop: spacing.lg, minHeight: 48, paddingHorizontal: spacing.md }, errorActionText: { color: colors.accent, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, intro: { marginTop: spacing.xl }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 42, fontWeight: '800', letterSpacing: -1 }, maximumBlock: { borderBottomColor: colors.ink, borderBottomWidth: 2, borderTopColor: colors.ink, borderTopWidth: 2, marginTop: spacing.xxl, paddingVertical: spacing.lg }, maximumLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' }, maximumGuidance: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: spacing.sm, textAlign: 'center' }, maximumButton: { alignItems: 'center', marginTop: spacing.md, minHeight: 76, justifyContent: 'center' }, maximumValue: { color: colors.accent, fontFamily: fonts.body, fontSize: 64, fontWeight: '800', lineHeight: 68, textAlign: 'center' }, maximumUnit: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' }, savedBlock: { borderBottomColor: colors.ink, borderBottomWidth: 2, borderTopColor: colors.ink, borderTopWidth: 2, marginTop: spacing.xxl, paddingVertical: spacing.xl }, savedLabel: { color: colors.success, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' }, savedTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 30, fontWeight: '800', letterSpacing: -0.6, marginTop: spacing.sm, textAlign: 'center' }, savedCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' }, plan: { marginTop: spacing.xl }, planHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }, planCopy: { flex: 1, paddingRight: spacing.sm }, planTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 24, fontWeight: '800' }, planNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 3 }, planFormula: { color: colors.accent, flexShrink: 1, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', marginTop: 4, textAlign: 'right' }, setRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 56 }, setLabel: { color: colors.accent, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, width: 74 }, setPercentage: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 14, minWidth: 0 }, setReps: { color: colors.ink, fontFamily: fonts.body, fontSize: 23, fontWeight: '800' }, footer: { alignSelf: 'center', backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, maxWidth: 760, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md, width: '100%' }, footerCompact: { paddingTop: spacing.sm }, saveError: { color: colors.error, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginBottom: spacing.sm, textAlign: 'center' }, pressed: { opacity: 0.64 },
});
