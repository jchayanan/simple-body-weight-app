import * as SQLite from 'expo-sqlite';
import { movementProgramStatus, type MovementHistoryEntry, type MovementName } from '@/src/lib/progressMath';

type CompletedWorkout = {
  routine: string;
  totalReps: number;
  movement?: MovementName;
  movementReps?: number;
  programOnly?: boolean;
  maximumTest?: boolean;
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
      program_only INTEGER NOT NULL DEFAULT 0,
      maximum_test INTEGER NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL
    );
  `);
  try {
    database.execSync('ALTER TABLE movement_history ADD COLUMN program_only INTEGER NOT NULL DEFAULT 0;');
  } catch {
    // Existing databases already have this column.
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
  return database.getAllSync<{ id: number; movement: MovementName; kind: 'maximum' | 'session'; reps: number; routine: string | null; program_only: number; maximum_test: number; recorded_at: string }>('SELECT id, movement, kind, reps, routine, program_only, maximum_test, recorded_at FROM movement_history ORDER BY recorded_at DESC').map((entry) => ({
    id: entry.id,
    movement: entry.movement,
    kind: entry.kind,
    reps: entry.reps,
    routine: entry.routine ?? undefined,
    programOnly: entry.program_only === 1,
    maximumTest: entry.maximum_test === 1,
    recordedAt: entry.recorded_at,
  }));
}

export function getMovementProgramStatus(movement: MovementName) {
  return movementProgramStatus(getMovementHistory(), movement);
}

export function saveCompletedWorkout({ routine, totalReps, movement, movementReps, programOnly = false, maximumTest = false }: CompletedWorkout) {
  initialiseLocalDb();
  const completedAt = new Date().toISOString();
  database.runSync('INSERT INTO completed_workouts (routine, total_reps, completed_at) VALUES (?, ?, ?)', routine, totalReps, completedAt);
  if (movement && movementReps !== undefined) {
    database.runSync('INSERT INTO movement_history (movement, kind, reps, routine, program_only, maximum_test, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)', movement, 'session', movementReps, routine, programOnly ? 1 : 0, maximumTest ? 1 : 0, completedAt);
  }
}
