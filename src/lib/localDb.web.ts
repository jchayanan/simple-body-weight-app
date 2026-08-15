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

const historyKey = 'repbook:movement-history';
const workoutsKey = 'repbook:completed-workouts';

function readHistory(): MovementHistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(historyKey) ?? '[]') as MovementHistoryEntry[];
  } catch {
    return [];
  }
}

function writeHistory(history: MovementHistoryEntry[]) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(historyKey, JSON.stringify(history));
}

function readWorkouts(): StoredWorkout[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(workoutsKey) ?? '[]') as StoredWorkout[];
  } catch {
    return [];
  }
}

function writeWorkouts(workouts: StoredWorkout[]) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(workoutsKey, JSON.stringify(workouts));
}

function addEntry(entry: Omit<MovementHistoryEntry, 'id' | 'recordedAt'>) {
  const history = readHistory();
  history.unshift({ ...entry, id: Date.now(), recordedAt: new Date().toISOString() });
  writeHistory(history);
}

export function initialiseLocalDb() {
  // localStorage is used for the web preview; SQLite is used on native devices.
}

export function saveMovementMaximum(movement: MovementName, reps: number) {
  const maximum = Math.max(1, Math.round(reps));
  addEntry({ movement, kind: 'maximum', reps: maximum });
}

export function getMovementMaximum(movement: MovementName) {
  return movementProgramStatus(readHistory(), movement).maximum;
}

export function getMovementHistory() {
  return readHistory();
}

export function getMovementProgramStatus(movement: MovementName) {
  return movementProgramStatus(readHistory(), movement);
}

export function getStatisticsHistory(): { workouts: StoredWorkout[]; maximumTests: MaximumTestEntry[] } {
  return {
    workouts: readWorkouts(),
    maximumTests: readHistory().filter((entry) => entry.kind === 'maximum').map((entry) => ({ id: entry.id, movement: entry.movement, reps: entry.reps, recordedAt: entry.recordedAt })),
  };
}

export function saveCompletedWorkout({ movement, movementReps, routine, totalReps, maximumProgram, maximumTest, entries = [] }: CompletedWorkout) {
  const completedAt = new Date().toISOString();
  const workoutId = Date.now();
  const workouts = readWorkouts();
  workouts.push({ id: workoutId, routine, completedAt, entries: entries.map((entry, index) => ({ ...entry, id: workoutId * 100 + index })) });
  writeWorkouts(workouts);
  if (movement && movementReps !== undefined) addEntry({ movement, kind: 'session', reps: movementReps, routine, maximumProgram, maximumTest });
}
