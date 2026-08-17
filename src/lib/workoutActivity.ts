import type { StoredWorkout } from './statisticsMath';

export type WorkoutDay = {
  key: string;
  weekday: string;
  date: number;
  completed: boolean;
  isToday: boolean;
  accessibilityLabel: string;
};

export type WorkoutActivity = {
  days: WorkoutDay[];
  sessionCount: number;
  activeDays: number;
};

const shortWeekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const fullDateFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
}

function toDayKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function buildWorkoutActivity(workouts: StoredWorkout[], now: Date = new Date()): WorkoutActivity {
  const today = startOfDay(now);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  const rangeKeys = new Set(dates.map(toDayKey));
  const completedKeys = new Set<string>();
  let sessionCount = 0;

  workouts.forEach((workout) => {
    const completedAt = new Date(workout.completedAt);
    const key = toDayKey(completedAt);
    if (!Number.isNaN(completedAt.getTime()) && rangeKeys.has(key)) {
      completedKeys.add(key);
      sessionCount += 1;
    }
  });

  return {
    days: dates.map((date, index) => {
      const key = toDayKey(date);
      const completed = completedKeys.has(key);
      const isToday = index === dates.length - 1;
      return {
        key,
        weekday: shortWeekdayFormatter.format(date),
        date: date.getDate(),
        completed,
        isToday,
        accessibilityLabel: `${fullDateFormatter.format(date)}, ${completed ? 'workout completed' : 'no workout'}`,
      };
    }),
    sessionCount,
    activeDays: completedKeys.size,
  };
}
