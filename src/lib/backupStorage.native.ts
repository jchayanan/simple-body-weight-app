import * as SQLite from 'expo-sqlite';
import { planBackupMerge, type BackupData, type BackupMovementEntry, type BackupWorkout } from './backupModel';
import { initialiseLocalDb } from './localDb';
import { getStoredReminder } from './reminderPreferences';

const database = SQLite.openDatabaseSync('repbook.db');

export type BackupImportResult = { addedWorkouts: number; addedMovementEntries: number; skipped: number };

export function getCurrentBackupData(): BackupData {
  initialiseLocalDb();
  const rows = database.getAllSync<{
    workout_id: number; routine: string; total_reps: number; completed_at: string;
    exercise: 'Push-up' | 'Pull-up' | 'Squat' | null; reps: number | null; set_index: number | null;
  }>('SELECT completed_workouts.id AS workout_id, completed_workouts.routine, completed_workouts.total_reps, completed_workouts.completed_at, workout_exercise_entries.exercise, workout_exercise_entries.reps, workout_exercise_entries.set_index FROM completed_workouts LEFT JOIN workout_exercise_entries ON workout_exercise_entries.workout_id = completed_workouts.id ORDER BY completed_workouts.completed_at ASC, workout_exercise_entries.set_index ASC');
  const workoutMap = new Map<number, BackupWorkout>();
  rows.forEach((row) => {
    const workout = workoutMap.get(row.workout_id) ?? { routine: row.routine, totalReps: row.total_reps, completedAt: row.completed_at, entries: [] };
    if (row.exercise !== null && row.reps !== null && row.set_index !== null) workout.entries.push({ exercise: row.exercise, reps: row.reps, setIndex: row.set_index });
    workoutMap.set(row.workout_id, workout);
  });
  const movementHistory = database.getAllSync<{
    movement: BackupMovementEntry['movement']; kind: BackupMovementEntry['kind']; reps: number; routine: string | null;
    maximum_program: number; maximum_test: number; recorded_at: string;
  }>('SELECT movement, kind, reps, routine, maximum_program, maximum_test, recorded_at FROM movement_history ORDER BY recorded_at ASC').map((entry) => ({
    movement: entry.movement,
    kind: entry.kind,
    reps: entry.reps,
    routine: entry.routine ?? undefined,
    maximumProgram: entry.maximum_program === 1,
    maximumTest: entry.maximum_test === 1,
    recordedAt: entry.recorded_at,
  }));
  return { workouts: [...workoutMap.values()], movementHistory, reminder: getStoredReminder() };
}

export function previewBackupImport(incoming: BackupData) {
  return planBackupMerge(getCurrentBackupData(), incoming);
}

export function mergeBackupData(incoming: BackupData): BackupImportResult {
  initialiseLocalDb();
  const plan = previewBackupImport(incoming);
  database.withTransactionSync(() => {
    plan.workouts.forEach((workout) => {
      const workoutId = database.runSync('INSERT INTO completed_workouts (routine, total_reps, completed_at) VALUES (?, ?, ?)', workout.routine, workout.totalReps, workout.completedAt).lastInsertRowId;
      workout.entries.forEach((entry) => database.runSync('INSERT INTO workout_exercise_entries (workout_id, exercise, reps, set_index) VALUES (?, ?, ?, ?)', workoutId, entry.exercise, entry.reps, entry.setIndex));
    });
    plan.movementHistory.forEach((entry) => database.runSync(
      'INSERT INTO movement_history (movement, kind, reps, routine, maximum_program, maximum_test, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      entry.movement, entry.kind, entry.reps, entry.routine ?? null, entry.maximumProgram ? 1 : 0, entry.maximumTest ? 1 : 0, entry.recordedAt,
    ));
    if (plan.reminder) database.runSync('INSERT OR REPLACE INTO app_preferences (key, value) VALUES (?, ?)', 'training-reminder', JSON.stringify(plan.reminder));
  });
  return { addedWorkouts: plan.workouts.length, addedMovementEntries: plan.movementHistory.length, skipped: plan.skipped };
}
