import type { MovementName } from './progressMath';
import type { StatisticsExercise } from './statisticsMath';

export type BackupWorkoutEntry = { exercise: StatisticsExercise; reps: number; setIndex: number };
export type BackupWorkout = { routine: string; totalReps: number; completedAt: string; entries: BackupWorkoutEntry[] };
export type BackupMovementEntry = {
  movement: MovementName;
  kind: 'maximum' | 'session';
  reps: number;
  recordedAt: string;
  routine?: string;
  maximumProgram?: boolean;
  maximumTest?: boolean;
};
export type BackupReminder = { days: number[]; hour: number; minute: number };
export type BackupData = {
  workouts: BackupWorkout[];
  movementHistory: BackupMovementEntry[];
  reminder?: BackupReminder;
};
export type RepbookBackup = { format: 'repbook-backup'; version: 1; exportedAt: string; data: BackupData };
export type BackupMergePlan = BackupData & { skipped: number };

const movements = new Set<MovementName>(['Push-up', 'Pull-up', 'Squat']);
const kinds = new Set(['maximum', 'session']);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isWorkout(value: unknown): value is BackupWorkout {
  if (!isObject(value) || typeof value.routine !== 'string' || !value.routine.trim() || !isNonNegativeInteger(value.totalReps) || !isDate(value.completedAt) || !Array.isArray(value.entries)) return false;
  return value.entries.every((entry) => isObject(entry)
    && movements.has(entry.exercise as MovementName)
    && isNonNegativeInteger(entry.reps)
    && isNonNegativeInteger(entry.setIndex));
}

function isMovementEntry(value: unknown): value is BackupMovementEntry {
  return isObject(value)
    && movements.has(value.movement as MovementName)
    && kinds.has(value.kind as string)
    && isPositiveInteger(value.reps)
    && isDate(value.recordedAt)
    && (value.routine === undefined || typeof value.routine === 'string')
    && (value.maximumProgram === undefined || typeof value.maximumProgram === 'boolean')
    && (value.maximumTest === undefined || typeof value.maximumTest === 'boolean');
}

function isReminder(value: unknown): value is BackupReminder {
  return isObject(value)
    && Array.isArray(value.days)
    && new Set(value.days).size === value.days.length
    && value.days.every((day) => Number.isInteger(day) && day >= 1 && day <= 7)
    && typeof value.hour === 'number' && Number.isInteger(value.hour) && value.hour >= 0 && value.hour <= 23
    && typeof value.minute === 'number' && Number.isInteger(value.minute) && value.minute >= 0 && value.minute <= 59;
}

export function resolveWorkoutTotalReps(workout: { totalReps?: number; entries: Array<{ reps: number }> }) {
  if (isNonNegativeInteger(workout.totalReps)) return workout.totalReps;
  return workout.entries.reduce((total, entry) => total + entry.reps, 0);
}

export function parseBackup(contents: string): RepbookBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error('Invalid backup file. Choose a Repbook JSON backup and try again.');
  }

  if (isObject(parsed) && parsed.format === 'repbook-backup' && typeof parsed.version === 'number' && parsed.version > 1) {
    throw new Error('This backup was created by a newer version of Repbook. Update the app before importing it.');
  }

  if (!isObject(parsed)
    || parsed.format !== 'repbook-backup'
    || parsed.version !== 1
    || !isDate(parsed.exportedAt)
    || !isObject(parsed.data)
    || !Array.isArray(parsed.data.workouts)
    || !parsed.data.workouts.every(isWorkout)
    || !Array.isArray(parsed.data.movementHistory)
    || !parsed.data.movementHistory.every(isMovementEntry)
    || (parsed.data.reminder !== undefined && !isReminder(parsed.data.reminder))) {
    throw new Error('Invalid backup file. No data was imported.');
  }

  return parsed as RepbookBackup;
}

function workoutFingerprint(workout: BackupWorkout) {
  const entries = [...workout.entries]
    .sort((a, b) => a.setIndex - b.setIndex || a.exercise.localeCompare(b.exercise) || a.reps - b.reps)
    .map(({ exercise, reps, setIndex }) => [exercise, reps, setIndex]);
  return JSON.stringify([workout.routine, workout.totalReps, workout.completedAt, entries]);
}

function movementFingerprint(entry: BackupMovementEntry) {
  return JSON.stringify([entry.movement, entry.kind, entry.reps, entry.recordedAt, entry.routine ?? '', entry.maximumProgram === true, entry.maximumTest === true]);
}

export function planBackupMerge(existing: Pick<BackupData, 'workouts' | 'movementHistory'>, incoming: BackupData): BackupMergePlan {
  const workoutKeys = new Set(existing.workouts.map(workoutFingerprint));
  const movementKeys = new Set(existing.movementHistory.map(movementFingerprint));
  let skipped = 0;

  const workouts = incoming.workouts.filter((workout) => {
    const key = workoutFingerprint(workout);
    if (workoutKeys.has(key)) { skipped += 1; return false; }
    workoutKeys.add(key);
    return true;
  });
  const movementHistory = incoming.movementHistory.filter((entry) => {
    const key = movementFingerprint(entry);
    if (movementKeys.has(key)) { skipped += 1; return false; }
    movementKeys.add(key);
    return true;
  });

  return { workouts, movementHistory, reminder: incoming.reminder, skipped };
}

export function createBackup(data: BackupData, exportedAt = new Date().toISOString()): RepbookBackup {
  return { format: 'repbook-backup', version: 1, exportedAt, data };
}
