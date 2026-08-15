import * as SQLite from 'expo-sqlite';
import { movementProgramStatus, type MovementHistoryEntry, type MovementName } from '@/src/lib/progressMath';
import type { MaximumTestEntry, StoredWorkout, TrackedWorkoutEntryInput } from '@/src/lib/statisticsMath';

type CompletedWorkout = {
  routine: string;
  totalReps: number;
  movement?: MovementName;
  movementReps?: number;
  maximumProgram?: boolean;
  maximumTest?: boolean;
  entries?: TrackedWorkoutEntryInput[];
};

const database = SQLite.openDatabaseSync('repbook.db');

export function initialiseLocalDb() {
  database.execSync(`
    CREATE TABLE IF NOT EXISTS completed_workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine TEXT NOT NULL,
      total_reps INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS movement_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movement TEXT NOT NULL,
      kind TEXT NOT NULL,
      reps INTEGER NOT NULL,
      routine TEXT,
      maximum_program INTEGER NOT NULL DEFAULT 0,
      maximum_test INTEGER NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_exercise_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise TEXT NOT NULL CHECK (exercise IN ('Push-up', 'Pull-up', 'Squat')),
      reps INTEGER NOT NULL,
      set_index INTEGER NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES completed_workouts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS workout_exercise_entries_workout_id ON workout_exercise_entries(workout_id);
    CREATE INDEX IF NOT EXISTS workout_exercise_entries_exercise ON workout_exercise_entries(exercise);
  `);
  try {
    database.execSync('ALTER TABLE movement_history ADD COLUMN maximum_program INTEGER NOT NULL DEFAULT 0;');
  } catch {
    // Existing databases already have this column.
  }
  try {
    database.execSync('UPDATE movement_history SET maximum_program = program_only WHERE program_only = 1;');
  } catch {
    // New databases do not have the retired column.
  }
  try {
    database.execSync('ALTER TABLE movement_history ADD COLUMN maximum_test INTEGER NOT NULL DEFAULT 0;');
  } catch {
    // Existing databases already have this column.
  }
}

export function saveMovementMaximum(movement: MovementName, reps: number) {
  initialiseLocalDb();
  const maximum = Math.max(1, Math.round(reps));
  database.runSync('INSERT INTO movement_history (movement, kind, reps, recorded_at) VALUES (?, ?, ?, ?)', movement, 'maximum', maximum, new Date().toISOString());
}

export function getMovementMaximum(movement: MovementName) {
  initialiseLocalDb();
  const record = database.getFirstSync<{ reps: number }>('SELECT reps FROM movement_history WHERE movement = ? AND kind = ? ORDER BY recorded_at DESC LIMIT 1', movement, 'maximum');
  return record?.reps ?? 0;
}

export function getMovementHistory(): MovementHistoryEntry[] {
  initialiseLocalDb();
  return database.getAllSync<{ id: number; movement: MovementName; kind: 'maximum' | 'session'; reps: number; routine: string | null; maximum_program: number; maximum_test: number; recorded_at: string }>('SELECT id, movement, kind, reps, routine, maximum_program, maximum_test, recorded_at FROM movement_history ORDER BY recorded_at DESC').map((entry) => ({
    id: entry.id,
    movement: entry.movement,
    kind: entry.kind,
    reps: entry.reps,
    routine: entry.routine ?? undefined,
    maximumProgram: entry.maximum_program === 1,
    maximumTest: entry.maximum_test === 1,
    recordedAt: entry.recorded_at,
  }));
}

export function getMovementProgramStatus(movement: MovementName) {
  return movementProgramStatus(getMovementHistory(), movement);
}

export function getStatisticsHistory(): { workouts: StoredWorkout[]; maximumTests: MaximumTestEntry[] } {
  initialiseLocalDb();
  const rows = database.getAllSync<{ workout_id: number; routine: string; completed_at: string; entry_id: number | null; exercise: 'Push-up' | 'Pull-up' | 'Squat' | null; reps: number | null; set_index: number | null }>(`SELECT completed_workouts.id AS workout_id, completed_workouts.routine, completed_workouts.completed_at, workout_exercise_entries.id AS entry_id, workout_exercise_entries.exercise, workout_exercise_entries.reps, workout_exercise_entries.set_index FROM completed_workouts LEFT JOIN workout_exercise_entries ON workout_exercise_entries.workout_id = completed_workouts.id ORDER BY completed_workouts.completed_at ASC, workout_exercise_entries.set_index ASC`);
  const workouts = new Map<number, StoredWorkout>();
  rows.forEach((row) => {
    const workout = workouts.get(row.workout_id) ?? { id: row.workout_id, routine: row.routine, completedAt: row.completed_at, entries: [] };
    if (row.entry_id !== null && row.exercise !== null && row.reps !== null && row.set_index !== null) workout.entries.push({ id: row.entry_id, exercise: row.exercise, reps: row.reps, setIndex: row.set_index });
    workouts.set(row.workout_id, workout);
  });
  const maximumTests = getMovementHistory().filter((entry) => entry.kind === 'maximum').map((entry) => ({ id: entry.id, movement: entry.movement, reps: entry.reps, recordedAt: entry.recordedAt }));
  return { workouts: [...workouts.values()], maximumTests };
}

export function saveCompletedWorkout({ routine, totalReps, movement, movementReps, maximumProgram = false, maximumTest = false, entries = [] }: CompletedWorkout) {
  initialiseLocalDb();
  const completedAt = new Date().toISOString();
  database.withTransactionSync(() => {
    const workoutId = database.runSync('INSERT INTO completed_workouts (routine, total_reps, completed_at) VALUES (?, ?, ?)', routine, totalReps, completedAt).lastInsertRowId;
    entries.forEach((entry) => database.runSync('INSERT INTO workout_exercise_entries (workout_id, exercise, reps, set_index) VALUES (?, ?, ?, ?)', workoutId, entry.exercise, Math.max(0, Math.round(entry.reps)), entry.setIndex));
    if (movement && movementReps !== undefined) database.runSync('INSERT INTO movement_history (movement, kind, reps, routine, maximum_program, maximum_test, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)', movement, 'session', movementReps, routine, maximumProgram ? 1 : 0, maximumTest ? 1 : 0, completedAt);
  });
}
