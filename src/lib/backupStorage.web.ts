import { planBackupMerge, resolveWorkoutTotalReps, type BackupData } from './backupModel';
import { getMovementHistory, getStatisticsHistory } from './localDb';
import { getStoredReminder, storeReminder } from './reminderPreferences';
import type { MovementHistoryEntry } from './progressMath';
import type { StoredWorkout } from './statisticsMath';

const historyKey = 'repbook:movement-history';
const workoutsKey = 'repbook:completed-workouts';
export type BackupImportResult = { addedWorkouts: number; addedMovementEntries: number; skipped: number };

export function getCurrentBackupData(): BackupData {
  const { workouts } = getStatisticsHistory();
  return {
    workouts: workouts.map((workout) => ({
      routine: workout.routine,
      totalReps: resolveWorkoutTotalReps(workout),
      completedAt: workout.completedAt,
      entries: workout.entries.map(({ exercise, reps, setIndex }) => ({ exercise, reps, setIndex })),
    })),
    movementHistory: getMovementHistory().map(({ movement, kind, reps, recordedAt, routine, maximumProgram, maximumTest }) => ({ movement, kind, reps, recordedAt, routine, maximumProgram, maximumTest })),
    reminder: getStoredReminder(),
  };
}

export function previewBackupImport(incoming: BackupData) {
  return planBackupMerge(getCurrentBackupData(), incoming);
}

export function mergeBackupData(incoming: BackupData): BackupImportResult {
  const plan = previewBackupImport(incoming);
  if (typeof localStorage !== 'undefined') {
    const currentWorkouts = getStatisticsHistory().workouts;
    let nextWorkoutId = Math.max(Date.now(), ...currentWorkouts.map((workout) => workout.id)) + 1;
    const addedWorkouts: StoredWorkout[] = plan.workouts.map((workout) => {
      const id = nextWorkoutId++;
      return { id, routine: workout.routine, totalReps: workout.totalReps, completedAt: workout.completedAt, entries: workout.entries.map((entry, index) => ({ ...entry, id: id * 100 + index })) };
    });
    const currentMovement = getMovementHistory();
    let nextMovementId = Math.max(Date.now(), ...currentMovement.map((entry) => entry.id)) + 1;
    const addedMovement: MovementHistoryEntry[] = plan.movementHistory.map((entry) => ({ ...entry, id: nextMovementId++ }));
    const reminderKey = 'repbook:training-reminder';
    const snapshots = new Map([
      [workoutsKey, localStorage.getItem(workoutsKey)],
      [historyKey, localStorage.getItem(historyKey)],
      [reminderKey, localStorage.getItem(reminderKey)],
    ]);
    try {
      localStorage.setItem(workoutsKey, JSON.stringify([...currentWorkouts, ...addedWorkouts].sort((a, b) => a.completedAt.localeCompare(b.completedAt))));
      localStorage.setItem(historyKey, JSON.stringify([...currentMovement, ...addedMovement].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))));
      if (plan.reminder) storeReminder(plan.reminder);
    } catch (error) {
      snapshots.forEach((value, key) => { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); });
      throw error;
    }
  }
  return { addedWorkouts: plan.workouts.length, addedMovementEntries: plan.movementHistory.length, skipped: plan.skipped };
}
