import type { StatisticsExercise, TrackedWorkoutEntryInput } from './statisticsMath';

const trackedExercises = new Set<StatisticsExercise>(['Push-up', 'Pull-up', 'Squat']);

export function toTrackedWorkoutEntries(labels: string[], reps: number[], programMovement?: StatisticsExercise): TrackedWorkoutEntryInput[] {
  if (programMovement) return reps.map((value, index) => ({ exercise: programMovement, reps: Math.max(0, Math.round(value)), setIndex: index + 1 }));
  return labels.flatMap((label, index) => trackedExercises.has(label as StatisticsExercise) ? [{ exercise: label as StatisticsExercise, reps: Math.max(0, Math.round(reps[index] ?? 0)), setIndex: index + 1 }] : []);
}
