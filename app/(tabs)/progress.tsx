import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressChart, type ChartSeries } from '@/src/components/ProgressChart';
import { Screen } from '@/src/components/Screen';
import { getStatisticsHistory } from '@/src/lib/localDb';
import { buildStatisticsView, formatBucketLabel, type StatisticsFilter, type TimeRange } from '@/src/lib/statisticsMath';
import { colors, fonts, spacing } from '@/src/theme';

const ranges: Array<{ value: TimeRange; label: string }> = [
  { value: '30d', label: '30 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export default function ProgressScreen() {
  const [history, setHistory] = useState<ReturnType<typeof getStatisticsHistory>>({ workouts: [], maximumTests: [] });
  const [range, setRange] = useState<TimeRange>('30d');
  const [filter, setFilter] = useState<StatisticsFilter>({ type: 'exercise', value: 'Push-up' });
  const [activeSeries, setActiveSeries] = useState<ChartSeries>('regular');
  const [selected, setSelected] = useState<{ series: ChartSeries; bucketId: string } | null>(null);

  useFocusEffect(useCallback(() => {
    setHistory(getStatisticsHistory());
  }, []));

  const view = useMemo(() => buildStatisticsView({ now: new Date(), range, filter, ...history }), [filter, history, range]);
  const filterOptions = useMemo(() => [
    ...(['Push-up', 'Pull-up', 'Squat'] as const).map((exercise) => ({ key: 'exercise-' + exercise, label: exercise, value: { type: 'exercise', value: exercise } as StatisticsFilter })),
  ], []);

  const filterKey = filter.type === 'all' ? 'all' : filter.type + '-' + filter.value;
  const selectedSeries = selected?.series ?? activeSeries;
  const selectedPoint = (selected ? (selected.series === 'regular' ? view.regularSeries : view.maximumSeries).find((point) => point.bucketId === selected.bucketId) : undefined)
    ?? (selectedSeries === 'regular' ? [...view.regularSeries].reverse().find((point) => point.reps > 0) : [...view.maximumSeries].reverse().find((point) => point.bestSet > 0))
    ?? (selectedSeries === 'regular' ? view.regularSeries.at(-1) : view.maximumSeries.at(-1));
  const isEmpty = view.metrics.sessionCount === 0 && view.maximumSeries.every((point) => point.bestSet === 0);

  const updateRange = (nextRange: TimeRange) => { setRange(nextRange); setSelected(null); };
  const updateFilter = (nextFilter: StatisticsFilter) => { setFilter(nextFilter); setSelected(null); };

  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Progress</Text><Text style={styles.subtitle}>Your record, read one honest session at a time.</Text></View>

    <Text style={styles.controlLabel}>Time range</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlScroller} contentContainerStyle={styles.controlRow}>{ranges.map((option) => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: range === option.value }} onPress={() => updateRange(option.value)} style={[styles.control, range === option.value && styles.controlActive]}><Text style={[styles.controlText, range === option.value && styles.controlTextActive]}>{option.label}</Text></Pressable>)}</ScrollView>

    <Text style={styles.controlLabel}>Filter record</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlScroller} contentContainerStyle={styles.controlRow}>{filterOptions.map((option) => <Pressable key={option.key} accessibilityRole="button" accessibilityState={{ selected: filterKey === option.key }} onPress={() => updateFilter(option.value)} style={[styles.control, filterKey === option.key && styles.controlActive]}><Text style={[styles.controlText, filterKey === option.key && styles.controlTextActive]}>{option.label}</Text></Pressable>)}</ScrollView>

    {isEmpty ? <View style={styles.empty}><Text style={styles.emptyTitle}>Your record starts here.</Text><Text style={styles.emptyBody}>Finish a Push-up, Pull-up, or Squat set to see the first entry.</Text></View> : <>
      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Training record</Text><Text style={styles.sectionNote}>Tap the chart to inspect a period.</Text></View>
      <ProgressChart activeSeries={activeSeries} maximumSeries={view.maximumSeries} onSelect={(point, series) => setSelected({ series, bucketId: point.bucketId })} onSeriesChange={(series) => { setActiveSeries(series); setSelected(null); }} regularSeries={view.regularSeries} selected={selected} />
      {selectedPoint ? <View style={styles.inspection}><View style={[styles.inspectionMark, selectedSeries === 'regular' ? styles.trainingMark : styles.maximumMark]} /><View style={styles.inspectionCopy}><Text style={styles.inspectionTitle}>{(selectedSeries === 'regular' ? 'Training' : 'Maximum test') + ' · ' + formatBucketLabel(selectedPoint)}</Text><Text style={styles.inspectionBody}>{selectedSeries === 'regular' ? selectedPoint.reps + ' reps · ' + selectedPoint.sessions + ' session' + (selectedPoint.sessions === 1 ? '' : 's') + ' · best set ' + (selectedPoint.bestSet || '–') : selectedPoint.bestSet ? selectedPoint.bestSet + ' reps tested' : 'No maximum test recorded'}</Text></View></View> : null}

      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>This range</Text></View>
      <View style={styles.ledger}>
        <Metric label="Total reps" value={view.metrics.totalReps} />
        <Metric label="Workout sessions" value={view.metrics.sessionCount} />
        <Metric label="Active days" value={view.metrics.activeDays} />
        <Metric label="Consistency" value={view.metrics.consistency + '%'} />
        <Metric label="Best regular set" value={view.metrics.bestSet || '–'} />
        <Metric label="Latest maximum test" value={view.metrics.latestMaximumTest ? view.metrics.latestMaximumTest + ' reps' : '–'} last />
      </View>
    </>}
  </Screen>;
}

function Metric({ label, value, last = false }: { label: string; value: number | string; last?: boolean }) {
  return <View style={[styles.metric, last && styles.metricLast]}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl, paddingTop: spacing.md },
  title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs },
  controlLabel: { color: colors.ink, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.7, marginBottom: spacing.sm, textTransform: 'uppercase' },
  controlScroller: { flexGrow: 0, flexShrink: 0, marginBottom: spacing.lg },
  controlRow: { alignItems: 'center', gap: spacing.sm, paddingRight: spacing.lg },
  control: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.border, borderWidth: 1, height: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  controlActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  controlText: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  controlTextActive: { color: colors.white },
  sectionHead: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  sectionNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, textAlign: 'right' },
  inspection: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: spacing.lg },
  inspectionMark: { height: 8, marginRight: spacing.md, marginTop: 6, width: 8 },
  trainingMark: { backgroundColor: colors.accent },
  maximumMark: { backgroundColor: colors.success },
  inspectionCopy: { flex: 1 },
  inspectionTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
  inspectionBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.xs },
  ledger: { borderTopColor: colors.ink, borderTopWidth: 2, marginBottom: spacing.xl },
  metric: { alignItems: 'baseline', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 56 },
  metricLast: { borderBottomWidth: 0 },
  metricLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 14 },
  metricValue: { color: colors.accent, fontFamily: fonts.body, fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  empty: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: spacing.xl },
  emptyTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  emptyBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
});
