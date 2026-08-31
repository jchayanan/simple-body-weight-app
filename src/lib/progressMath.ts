export type MovementName = 'Push-up' | 'Pull-up' | 'Squat';

export type MovementHistoryEntry = {
  id: number;
  movement: MovementName;
  kind: 'maximum' | 'session';
  reps: number;
  recordedAt: string;
  routine?: string;
  maximumProgram?: boolean;
  maximumTest?: boolean;
};

export type MovementProgramStatus = {
  maximum: number;
  sessionsSinceMaximum: number;
  requiresMaximumTest: boolean;
};

const maxProgramProgressions = [
  [58, 49, 43, 39, 33],
  [62, 53, 47, 43, 38],
  [66, 57, 51, 47, 42],
  [70, 61, 55, 51, 46],
];

export function buildMaxProgramTargets(maximumReps: number, sessionNumber = 1) {
  const progression = maxProgramProgressions[Math.min(Math.max(sessionNumber, 1), maxProgramProgressions.length) - 1];
  return progression.map((percentage) => Math.max(1, Math.round((maximumReps * percentage) / 100)));
}

export function restSecondsForSession(sessionNumber?: number, movement: MovementName = 'Push-up') {
  const schedule = movement === 'Squat' ? [80, 90, 100, 120] : [120, 140, 160, 180];
  return schedule[Math.min(Math.max(sessionNumber ?? 1, 1), schedule.length) - 1];
}

const localDayKey = (value: Date) => `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;

export function personalBest(entries: MovementHistoryEntry[], movement: MovementName) {
  return entries.filter((entry) => entry.movement === movement && entry.kind === 'maximum').reduce((best, entry) => Math.max(best, entry.reps), 0);
}

export function volumeTimeline(entries: MovementHistoryEntry[], days = 7, now = new Date()) {
  const totals = new Map<string, number>();
  entries.filter((entry) => entry.kind === 'session').forEach((entry) => {
    const key = localDayKey(new Date(entry.recordedAt));
    totals.set(key, (totals.get(key) ?? 0) + entry.reps);
  });

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));
    const key = localDayKey(date);
    return {
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      reps: totals.get(key) ?? 0,
    };
  });
}

export function maximumTimeline(entries: MovementHistoryEntry[]) {
  return entries.filter((entry) => entry.kind === 'maximum').sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 6);
}

export function movementProgramStatus(entries: MovementHistoryEntry[], movement: MovementName): MovementProgramStatus {
  const latestMaximum = entries.filter((entry) => entry.movement === movement && entry.kind === 'maximum').sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
  if (!latestMaximum) return { maximum: 0, sessionsSinceMaximum: 0, requiresMaximumTest: true };
  const sessionsSinceMaximum = entries.filter((entry) => entry.movement === movement && entry.kind === 'session' && entry.maximumProgram && !entry.maximumTest && entry.recordedAt > latestMaximum.recordedAt).length;
  return { maximum: latestMaximum.reps, sessionsSinceMaximum, requiresMaximumTest: sessionsSinceMaximum >= 4 };
}
