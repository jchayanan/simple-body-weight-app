import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RepEditorModal } from '@/src/components/RepEditorModal';
import { getMovementProgramStatus, saveMovementMaximum } from '@/src/lib/localDb';
import { buildMaxProgramTargets, MaxProgramMovement, useWorkoutStore } from '@/src/stores/useWorkoutStore';
import { colors, fonts, spacing } from '@/src/theme';

export default function ProgramScreen() {
  const { movement: movementParam } = useLocalSearchParams<{ movement?: string }>();
  const movement: MaxProgramMovement = movementParam === 'Pull-up' ? 'Pull-up' : 'Push-up';
  const programStatus = getMovementProgramStatus(movement);
  const [maximumReps, setMaximumReps] = useState(() => programStatus.maximum || (movement === 'Pull-up' ? 8 : 20));
  const [isMaximumEditorOpen, setIsMaximumEditorOpen] = useState(false);
  const startMaxProgram = useWorkoutStore((state) => state.startMaxProgram);
  const sessionNumber = Math.min(programStatus.sessionsSinceMaximum + 1, 4);
  const targets = useMemo(() => buildMaxProgramTargets(maximumReps, sessionNumber), [maximumReps, sessionNumber]);

  const startProgram = () => {
    startMaxProgram(movement, maximumReps);
    router.replace('/workout');
  };

  const saveMaximum = () => {
    saveMovementMaximum(movement, maximumReps);
    router.back();
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Close program setup" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={colors.ink} /></Pressable><Text style={styles.topLabel}>PROGRAM SETUP</Text></View>
      <View style={styles.intro}><Text style={styles.title}>{movement} only.</Text></View>
      {programStatus.requiresMaximumTest ? <View style={styles.maximumBlock}><Text style={styles.maximumLabel}>TEST YOUR MAXIMUM</Text><Pressable accessibilityRole="button" accessibilityLabel={`Edit maximum reps, currently ${maximumReps}`} accessibilityHint="Opens a number input" onPress={() => setIsMaximumEditorOpen(true)} style={({ pressed }) => [styles.maximumButton, pressed && styles.pressed]}><Text style={styles.maximumValue}>{maximumReps}</Text><Text style={styles.maximumUnit}>clean reps · tap to edit</Text></Pressable></View> : <View style={styles.plan}><View style={styles.planHeader}><Text style={styles.planTitle}>Your five sets</Text><Text style={styles.planFormula}>Session {sessionNumber} of 4</Text></View>{targets.map((reps, index) => <View key={`set-${index + 1}`} style={styles.setRow}><Text style={styles.setLabel}>SET {index + 1}</Text><Text style={styles.setPercentage}>{Math.round((reps / maximumReps) * 100)}%</Text><Text style={styles.setReps}>{reps} reps</Text></View>)}</View>}
    </ScrollView>
    <View style={styles.footer}><PrimaryButton label={programStatus.requiresMaximumTest ? 'Save maximum' : 'Start 5 sets'} onPress={programStatus.requiresMaximumTest ? saveMaximum : startProgram} /></View><RepEditorModal minimum={1} onClose={() => setIsMaximumEditorOpen(false)} onSave={setMaximumReps} title={`Test ${movement} maximum`} value={maximumReps} visible={isMaximumEditorOpen} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: spacing.lg, paddingBottom: 100 }, top: { alignItems: 'center', flexDirection: 'row', minHeight: 44, paddingTop: spacing.sm }, close: { alignItems: 'flex-start', height: 44, justifyContent: 'center', width: 44 }, topLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginLeft: spacing.xs }, intro: { marginTop: spacing.xl }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 42 }, maximumBlock: { borderBottomColor: colors.ink, borderBottomWidth: 1, borderTopColor: colors.ink, borderTopWidth: 1, marginTop: spacing.xxl, paddingVertical: spacing.lg }, maximumLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' }, maximumButton: { alignItems: 'center', marginTop: spacing.md, minHeight: 76, justifyContent: 'center' }, maximumValue: { color: colors.ink, fontFamily: fonts.display, fontSize: 58, lineHeight: 62, textAlign: 'center' }, maximumUnit: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' }, plan: { marginTop: spacing.xl }, planHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }, planTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 24 }, planFormula: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontWeight: '700' }, setRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 56 }, setLabel: { color: colors.ink, fontFamily: fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, width: 74 }, setPercentage: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 14 }, setReps: { color: colors.ink, fontFamily: fonts.display, fontSize: 23 }, footer: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md }, pressed: { opacity: 0.64 },
});
