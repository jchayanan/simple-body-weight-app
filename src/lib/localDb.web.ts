import { movementProgramStatus, type MovementHistoryEntry, type MovementName } from '@/src/lib/progressMath';

type CompletedWorkout = {
  routine: string;
  totalReps: number;
  movement?: MovementName;
  movementReps?: number;
  programOnly?: boolean;
  maximumTest?: boolean;
};

const historyKey = 'repbook:movement-history';

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

export function saveCompletedWorkout({ movement, movementReps, routine: _routine, totalReps: _totalReps, programOnly, maximumTest }: CompletedWorkout) {
  if (movement && movementReps !== undefined) addEntry({ movement, kind: 'session', reps: movementReps, routine: _routine, programOnly, maximumTest });
}
