import { create } from 'zustand';
import { getMovementProgramStatus, saveCompletedWorkout } from '@/src/lib/localDb';
import { buildMaxProgramTargets, type MovementName } from '@/src/lib/progressMath';
import { attemptWorkoutSave, type WorkoutSaveResult } from '@/src/lib/workoutSave';
import { toTrackedWorkoutEntries } from '@/src/lib/workoutEntries';

export { buildMaxProgramTargets } from '@/src/lib/progressMath';

export type MaxProgramMovement = MovementName;

type SessionPlan = {
  name: string;
  type: 'routine' | 'max-program';
  movement?: MaxProgramMovement;
  trackedMovement?: MovementName;
  sessionNumber?: number;
  labels: string[];
  targetReps: number[];
};

const defaultPlan: SessionPlan = {
  name: 'Push strength',
  type: 'routine',
  trackedMovement: 'Push-up',
  labels: ['Push-up', 'Diamond push-up', 'Pike push-up'],
  targetReps: [12, 8, 10],
};

type WorkoutState = {
  plan: SessionPlan;
  currentExercise: number;
  setReps: number[];
  savedExercises: Array<number | null>;
  hasDraft: boolean;
  lastWorkoutTotal: number;
  lastWorkoutName: string;
  lastWorkoutSetCount: number;
  lastWorkoutDurationMinutes: number | null;
  workoutStartedAt: number | null;
  setCurrentReps: (reps: number) => void;
  updateSavedExercise: (index: number, reps: number) => void;
  startRoutine: () => void;
  startMaxProgram: (movement: MaxProgramMovement, maximumReps: number) => void;
  saveCurrentExercise: () => void;
  finishWorkout: () => WorkoutSaveResult;
  resetWorkout: () => void;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plan: defaultPlan,
  currentExercise: 0,
  setReps: [...defaultPlan.targetReps],
  savedExercises: defaultPlan.labels.map(() => null),
  hasDraft: false,
  lastWorkoutTotal: 0,
  lastWorkoutName: '',
  lastWorkoutSetCount: 0,
  lastWorkoutDurationMinutes: null,
  workoutStartedAt: null,
  setCurrentReps: (reps) => set((state) => {
    const setReps = [...state.setReps];
    setReps[state.currentExercise] = Math.max(1, Math.round(reps));
    return { setReps, hasDraft: true };
  }),
  updateSavedExercise: (index, reps) => set((state) => {
    const value = Math.max(1, Math.round(reps));
    const setReps = [...state.setReps];
    const savedExercises = [...state.savedExercises];
    setReps[index] = value;
    savedExercises[index] = value;
    return { setReps, savedExercises, hasDraft: true };
  }),
  startRoutine: () => set({
    plan: defaultPlan,
    currentExercise: 0,
    setReps: [...defaultPlan.targetReps],
    savedExercises: defaultPlan.labels.map(() => null),
    hasDraft: false,
    workoutStartedAt: Date.now(),
  }),
  startMaxProgram: (movement, maximumReps) => {
    let sessionNumber = 1;
    try {
      sessionNumber = Math.min(getMovementProgramStatus(movement).sessionsSinceMaximum + 1, 4);
    } catch {
      // Start the first training session if local persistence is unavailable.
    }
    const targetReps = buildMaxProgramTargets(maximumReps, sessionNumber);
    const plan: SessionPlan = {
      name: `${movement} · Session ${sessionNumber} of 4`,
      type: 'max-program',
      movement,
      trackedMovement: movement,
      sessionNumber,
      labels: targetReps.map((_, index) => `Set ${index + 1}`),
      targetReps,
    };

    set({
      plan,
      currentExercise: 0,
      setReps: [...targetReps],
      savedExercises: targetReps.map(() => null),
      hasDraft: false,
      workoutStartedAt: Date.now(),
    });
  },
  saveCurrentExercise: () => set((state) => {
    const savedExercises = [...state.savedExercises];
    savedExercises[state.currentExercise] = state.setReps[state.currentExercise];
    return {
      savedExercises,
      hasDraft: true,
      currentExercise: Math.min(state.currentExercise + 1, state.plan.labels.length - 1),
    };
  }),
  finishWorkout: () => {
    const workout = get();
    const totalReps = workout.setReps.reduce((total, reps) => total + reps, 0);
    const savedExercises = [...workout.savedExercises];
    savedExercises[workout.currentExercise] = workout.setReps[workout.currentExercise];
    const result = attemptWorkoutSave(() => {
      const movementReps = workout.plan.type === 'max-program' ? totalReps : workout.plan.trackedMovement ? workout.setReps[0] : undefined;
      const entries = toTrackedWorkoutEntries(workout.plan.labels, workout.setReps, workout.plan.type === 'max-program' ? workout.plan.trackedMovement : undefined);
      saveCompletedWorkout({ routine: workout.plan.name, totalReps, entries, movement: workout.plan.trackedMovement, movementReps, maximumProgram: workout.plan.type === 'max-program' });
    });
    if (!result.saved) return result;
    set({
      lastWorkoutTotal: totalReps,
      lastWorkoutName: workout.plan.name,
      lastWorkoutSetCount: workout.plan.labels.length,
      lastWorkoutDurationMinutes: workout.workoutStartedAt ? Math.max(1, Math.round((Date.now() - workout.workoutStartedAt) / 60000)) : null,
      savedExercises,
      hasDraft: true,
    });
    return result;
  },
  resetWorkout: () => set({
    plan: defaultPlan,
    currentExercise: 0,
    setReps: [...defaultPlan.targetReps],
    savedExercises: defaultPlan.labels.map(() => null),
    hasDraft: false,
    workoutStartedAt: null,
  }),
}));
