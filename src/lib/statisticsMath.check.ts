import { strict as assert } from 'node:assert';
import { buildStatisticsView, getChartAxisPoints, hasStatisticsData, statisticsRangeStart, type StatisticsInput } from './statisticsMath';

const rangeNow = new Date(2026, 7, 15, 12);
assert.equal(statisticsRangeStart('30d', rangeNow)?.getTime(), new Date(2026, 6, 17).getTime());
assert.equal(statisticsRangeStart('1y', rangeNow)?.getTime(), new Date(2025, 8, 1).getTime());
assert.equal(statisticsRangeStart('all', rangeNow), null);

const input: StatisticsInput = {
  now: new Date('2026-08-15T12:00:00.000Z'),
  range: '30d',
  filter: { type: 'exercise', value: 'Push-up' },
  workouts: [
    { id: 1, routine: 'Push practice', completedAt: '2026-08-14T08:00:00.000Z', entries: [{ id: 1, exercise: 'Push-up', reps: 12, setIndex: 1 }] },
    { id: 2, routine: 'Mixed practice', completedAt: '2026-08-14T09:00:00.000Z', entries: [{ id: 2, exercise: 'Pull-up', reps: 8, setIndex: 1 }] },
    { id: 3, routine: 'Push practice', completedAt: '2026-08-15T08:00:00.000Z', entries: [{ id: 3, exercise: 'Push-up', reps: 15, setIndex: 1 }] },
  ],
  maximumTests: [
    { id: 10, movement: 'Push-up', reps: 20, recordedAt: '2026-08-14T10:00:00.000Z' },
    { id: 11, movement: 'Pull-up', reps: 9, recordedAt: '2026-08-15T10:00:00.000Z' },
  ],
};

const pushUpView = buildStatisticsView(input);
const axisPoints = getChartAxisPoints(pushUpView.regularSeries);
if (axisPoints.length !== 3 || axisPoints[0] !== pushUpView.regularSeries[0] || axisPoints[1] !== pushUpView.regularSeries[15] || axisPoints[2] !== pushUpView.regularSeries[29]) {
  throw new Error('Chart axis should render only the first, middle, and last points.');
}
const lastRegular = pushUpView.regularSeries.at(-1);
const secondLastRegular = pushUpView.regularSeries.at(-2);
const secondLastMaximum = pushUpView.maximumSeries.at(-2);

if (lastRegular?.reps !== 15 || secondLastRegular?.reps !== 12) throw new Error('Regular series should include only matching workout entries.');
if (secondLastMaximum?.bestSet !== 20 || pushUpView.maximumSeries.at(-1)?.bestSet !== 0) throw new Error('Maximum tests should remain separate and respect the exercise filter.');
if (pushUpView.metrics.totalReps !== 27 || pushUpView.metrics.sessionCount !== 2) throw new Error('Metrics should use filtered regular-training entries.');
if (pushUpView.metrics.activeDays !== 2 || pushUpView.metrics.bestSet !== 15) throw new Error('Active days and best set should be derived from the selected regular entries.');

const routineView = buildStatisticsView({ ...input, filter: { type: 'routine', value: 'Push practice' } });
if (routineView.metrics.totalReps !== 27 || routineView.maximumSeries.some((point) => point.bestSet !== 0)) throw new Error('Routine filters must exclude maximum tests.');

const sixMonthView = buildStatisticsView({ ...input, range: '6m', filter: { type: 'all' } });
if (sixMonthView.regularSeries.length !== 26) throw new Error('Six-month view should aggregate into 26 weekly buckets.');

const emptyView = buildStatisticsView({ ...input, workouts: [], maximumTests: [] });
if (emptyView.metrics.totalReps !== 0 || emptyView.metrics.consistency !== 0) throw new Error('Empty history should produce zero metrics.');
if (hasStatisticsData(pushUpView) !== true) throw new Error('Filtered history should be treated as available data.');
if (hasStatisticsData(buildStatisticsView({ ...input, filter: { type: 'exercise', value: 'Squat' } })) !== false) throw new Error('A filter with no matching records should be treated as empty.');
if (hasStatisticsData(emptyView) !== false) throw new Error('A completely empty history should be treated as empty.');

console.info('Statistics calculations check passed.');
