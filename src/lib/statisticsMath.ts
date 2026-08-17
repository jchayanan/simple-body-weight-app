export type StatisticsExercise = 'Push-up' | 'Pull-up' | 'Squat';
export type TimeRange = '30d' | '6m' | '1y' | 'all';
export type StatisticsFilter = { type: 'all' } | { type: 'exercise'; value: StatisticsExercise } | { type: 'routine'; value: string };

export type WorkoutExerciseEntry = { id: number; exercise: StatisticsExercise; reps: number; setIndex: number };
export type TrackedWorkoutEntryInput = Omit<WorkoutExerciseEntry, 'id'>;
export type StoredWorkout = { id: number; routine: string; completedAt: string; entries: WorkoutExerciseEntry[] };
export type MaximumTestEntry = { id: number; movement: StatisticsExercise; reps: number; recordedAt: string };
export type StatisticsInput = { now: Date; range: TimeRange; filter: StatisticsFilter; workouts: StoredWorkout[]; maximumTests: MaximumTestEntry[] };

export type ChartPoint = {
  bucketId: string;
  label: string;
  start: string;
  end: string;
  reps: number;
  sessions: number;
  activeDays: number;
  bestSet: number;
};

export type StatisticsMetrics = { totalReps: number; sessionCount: number; activeDays: number; consistency: number; bestSet: number; latestMaximumTest: number };
export type StatisticsView = { regularSeries: ChartPoint[]; maximumSeries: ChartPoint[]; metrics: StatisticsMetrics };

type Bucket = { id: string; label: string; start: Date; end: Date };
type RegularRecord = { workoutId: number; routine: string; completedAt: Date; entry: WorkoutExerciseEntry };
type ParsedMaximumTestEntry = Omit<MaximumTestEntry, 'recordedAt'> & { recordedAt: Date };

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
const endOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
const toDayKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const toMonthKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
const toYearKey = (value: Date) => `${value.getFullYear()}`;
const isInBucket = (value: Date, bucket: Bucket) => value >= bucket.start && value <= bucket.end;
const isSameOrAfter = (value: Date, boundary: Date) => value.getTime() >= boundary.getTime();

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function startOfWeek(value: Date) {
  const date = startOfDay(value);
  const offset = (date.getDay() + 6) % 7;
  return addDays(date, -offset);
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(value: Date) {
  return new Date(value.getFullYear(), 0, 1);
}

function endOfYear(value: Date) {
  return new Date(value.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function createBuckets(input: StatisticsInput): Bucket[] {
  const now = startOfDay(input.now);
  if (input.range === '30d') return Array.from({ length: 30 }, (_, index) => {
    const start = addDays(now, index - 29);
    return { id: toDayKey(start), label: start.toLocaleDateString('en-US', { day: 'numeric' }), start, end: endOfDay(start) };
  });

  if (input.range === '6m') {
    const first = addDays(startOfWeek(now), -25 * 7);
    return Array.from({ length: 26 }, (_, index) => {
      const start = addDays(first, index * 7);
      return { id: toDayKey(start), label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start, end: endOfDay(addDays(start, 6)) };
    });
  }

  if (input.range === '1y') {
    const currentMonth = startOfMonth(now);
    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + index - 11, 1);
      return { id: toMonthKey(start), label: start.toLocaleDateString('en-US', { month: 'short' }), start, end: endOfMonth(start) };
    });
  }

  const dates = [
    ...regularRecords(input).map((record) => record.completedAt),
    ...maximumRecords(input).map((record) => record.recordedAt),
  ];
  const first = dates.length ? new Date(Math.min(...dates.map((date) => date.getTime()))) : now;
  const monthDistance = (now.getFullYear() - first.getFullYear()) * 12 + now.getMonth() - first.getMonth();
  if (monthDistance > 24) {
    return Array.from({ length: now.getFullYear() - first.getFullYear() + 1 }, (_, index) => {
      const start = new Date(first.getFullYear() + index, 0, 1);
      return { id: toYearKey(start), label: `${start.getFullYear()}`, start, end: endOfYear(start) };
    });
  }

  const firstMonth = startOfMonth(first);
  return Array.from({ length: monthDistance + 1 }, (_, index) => {
    const start = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    return { id: toMonthKey(start), label: start.toLocaleDateString('en-US', { month: 'short', year: monthDistance > 11 ? '2-digit' : undefined }), start, end: endOfMonth(start) };
  });
}

function regularRecords(input: StatisticsInput): RegularRecord[] {
  return input.workouts.flatMap((workout) => workout.entries.map((entry) => ({ workoutId: workout.id, routine: workout.routine, completedAt: new Date(workout.completedAt), entry }))).filter((record) => {
    if (input.filter.type === 'exercise') return record.entry.exercise === input.filter.value;
    if (input.filter.type === 'routine') return record.routine === input.filter.value;
    return true;
  });
}

function maximumRecords(input: StatisticsInput) {
  if (input.filter.type === 'routine') return [] as ParsedMaximumTestEntry[];
  return input.maximumTests.filter((entry) => input.filter.type !== 'exercise' || entry.movement === input.filter.value).map((entry) => ({ ...entry, recordedAt: new Date(entry.recordedAt) }));
}

function pointForRegular(bucket: Bucket, records: RegularRecord[]): ChartPoint {
  const matches = records.filter((record) => isInBucket(record.completedAt, bucket));
  return {
    bucketId: bucket.id,
    label: bucket.label,
    start: bucket.start.toISOString(),
    end: bucket.end.toISOString(),
    reps: matches.reduce((total, record) => total + record.entry.reps, 0),
    sessions: new Set(matches.map((record) => record.workoutId)).size,
    activeDays: new Set(matches.map((record) => toDayKey(record.completedAt))).size,
    bestSet: matches.reduce((best, record) => Math.max(best, record.entry.reps), 0),
  };
}

function pointForMaximum(bucket: Bucket, records: ParsedMaximumTestEntry[]): ChartPoint {
  const matches = records.filter((record) => isInBucket(record.recordedAt, bucket));
  return {
    bucketId: bucket.id,
    label: bucket.label,
    start: bucket.start.toISOString(),
    end: bucket.end.toISOString(),
    reps: 0,
    sessions: 0,
    activeDays: 0,
    bestSet: matches.reduce((best, record) => Math.max(best, record.reps), 0),
  };
}

function buildMetrics(buckets: Bucket[], regular: RegularRecord[], maximum: ParsedMaximumTestEntry[]): StatisticsMetrics {
  const start = buckets[0]?.start;
  const end = buckets.at(-1)?.end;
  const scopedRegular = start && end ? regular.filter((record) => isSameOrAfter(record.completedAt, start) && record.completedAt <= end) : [];
  const scopedMaximum = start && end ? maximum.filter((record) => isSameOrAfter(record.recordedAt, start) && record.recordedAt <= end) : [];
  const activeDays = new Set(scopedRegular.map((record) => toDayKey(record.completedAt))).size;
  const possibleDays = start && end ? Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000) + 1 : 0;
  const latestMaximum = scopedMaximum.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];
  return {
    totalReps: scopedRegular.reduce((total, record) => total + record.entry.reps, 0),
    sessionCount: new Set(scopedRegular.map((record) => record.workoutId)).size,
    activeDays,
    consistency: possibleDays ? Math.round((activeDays / possibleDays) * 100) : 0,
    bestSet: scopedRegular.reduce((best, record) => Math.max(best, record.entry.reps), 0),
    latestMaximumTest: latestMaximum?.reps ?? 0,
  };
}

export function buildStatisticsView(input: StatisticsInput): StatisticsView {
  const buckets = createBuckets(input);
  const regular = regularRecords(input);
  const maximum = maximumRecords(input);
  return {
    regularSeries: buckets.map((bucket) => pointForRegular(bucket, regular)),
    maximumSeries: buckets.map((bucket) => pointForMaximum(bucket, maximum)),
    metrics: buildMetrics(buckets, regular, maximum),
  };
}

export function hasStatisticsData(view: StatisticsView) {
  return view.metrics.sessionCount > 0 || view.maximumSeries.some((point) => point.bestSet > 0);
}

export function getChartAxisPoints(points: ChartPoint[]) {
  if (points.length <= 3) return points;
  return [points[0], points[Math.round((points.length - 1) / 2)], points.at(-1)!];
}

export function formatBucketLabel(point: ChartPoint) {
  const start = new Date(point.start);
  const end = new Date(point.end);
  const sameDay = toDayKey(start) === toDayKey(end);
  return sameDay ? start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
}
