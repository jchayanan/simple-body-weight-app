export type MovementName = 'Push-up' | 'Pull-up';

export type MovementHistoryEntry = {
  id: number;
  movement: MovementName;
  kind: 'maximum' | 'session';
  reps: number;
  recordedAt: string;
  routine?: string;
  programOnly?: boolean;
  maximumTest?: boolean;
};

export type MovementProgramStatus = {
  maximum: number;
  sessionsSinceMaximum: number;
  requiresMaximumTest: boolean;
};

const maxProgramProgressions = [
  [0.6, 0.5, 0.44, 0.4, 0.34],
  [0.66, 0.56, 0.5, 0.44, 0.4],
  [0.7, 0.6, 0.56, 0.5, 0.44],
  [0.72, 0.64, 0.6, 0.54, 0.48],
];

export function buildMaxProgramTargets(maximumReps: number, sessionNumber = 1) {
  const progression = maxProgramProgressions[Math.min(Math.max(sessionNumber, 1), maxProgramProgressions.length) - 1];
  return progression.map((multiplier) => Math.max(1, Math.round(maximumReps * multiplier)));
}

export function restSecondsForSession(sessionNumber?: number) {
  return 60 + Math.max((sessionNumber ?? 1) - 1, 0) * 30;
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
  const sessionsSinceMaximum = entries.filter((entry) => entry.movement === movement && entry.kind === 'session' && entry.programOnly && !entry.maximumTest && entry.recordedAt > latestMaximum.recordedAt).length;
  return { maximum: latestMaximum.reps, sessionsSinceMaximum, requiresMaximumTest: sessionsSinceMaximum >= 4 };
}
