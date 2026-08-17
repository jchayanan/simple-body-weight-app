import { buildWorkoutActivity } from './workoutActivity';

const now = new Date('2026-08-17T12:00:00+07:00');
const activity = buildWorkoutActivity([
  { id: 1, routine: 'Push strength', completedAt: '2026-08-17T00:30:00.000Z', entries: [] },
  { id: 2, routine: 'Pull strength', completedAt: '2026-08-16T10:00:00.000Z', entries: [] },
  { id: 3, routine: 'Leg strength', completedAt: '2026-08-16T18:00:00.000Z', entries: [] },
], now);

if (activity.days.length !== 7) throw new Error('Activity should contain seven calendar days.');
if (activity.days.at(-1)?.key !== '2026-08-17') throw new Error('Activity should include today as the last day.');
if (!activity.days.at(-1)?.completed) throw new Error('A workout should be assigned to today in local time.');
if (!activity.days.at(-2)?.completed) throw new Error('Duplicate workouts should still mark the calendar day.');
if (activity.sessionCount !== 3) throw new Error('Session count should count workouts, not active days.');
if (activity.activeDays !== 2) throw new Error('Active days should deduplicate workouts by local date.');

const empty = buildWorkoutActivity([], now);
if (empty.days[0]?.key !== '2026-08-11') throw new Error('The range should start six days before today.');
if (empty.days.some((day) => day.completed)) throw new Error('Empty history should have no completed marks.');

console.info('Workout activity checks passed.');
