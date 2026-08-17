import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressChart, type ChartSeries } from '@/src/components/ProgressChart';
import { Screen } from '@/src/components/Screen';
import { getStatisticsHistory } from '@/src/lib/localDb';
import { buildStatisticsView, formatBucketLabel, hasStatisticsData, type StatisticsFilter, type TimeRange } from '@/src/lib/statisticsMath';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

const ranges: Array<{ value: TimeRange; label: string }> = [
  { value: '30d', label: '30 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export default function ProgressScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [history, setHistory] = useState<ReturnType<typeof getStatisticsHistory>>({ workouts: [], maximumTests: [] });
  const [range, setRange] = useState<TimeRange>('30d');
  const [filter, setFilter] = useState<StatisticsFilter>({ type: 'exercise', value: 'Push-up' });
  const [activeSeries, setActiveSeries] = useState<ChartSeries>('regular');
  const [selected, setSelected] = useState<{ series: ChartSeries; bucketId: string } | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [error, setError] = useState(false);

  const refreshHistory = useCallback(() => {
    try {
      setError(false);
      setHistory(getStatisticsHistory());
    } catch {
      setError(true);
    }
  }, []);

  useFocusEffect(useCallback(() => { refreshHistory(); }, [refreshHistory]));

  const view = useMemo(() => buildStatisticsView({ now: new Date(), range, filter, ...history }), [filter, history, range]);
  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All exercises', value: { type: 'all' } as StatisticsFilter },
    ...(['Push-up', 'Pull-up', 'Squat'] as const).map((exercise) => ({ key: 'exercise-' + exercise, label: exercise, value: { type: 'exercise', value: exercise } as StatisticsFilter })),
  ], []);

  const filterKey = filter.type === 'all' ? 'all' : filter.type + '-' + filter.value;
  const filterLabel = filter.type === 'all' ? 'all exercises' : filter.value;
  const emptyRecordLabel = filter.type === 'all' ? 'training' : filter.value;
  const rangeLabel = ranges.find((option) => option.value === range)?.label ?? range;
  const rangeDescription = range === 'all' ? 'all recorded history' : 'the last ' + rangeLabel.toLowerCase();
  const hasData = hasStatisticsData(view);
  const hasRegularData = view.metrics.sessionCount > 0;
  const hasMaximumData = view.maximumSeries.some((point) => point.bestSet > 0);
  const selectedSeries = selected?.series ?? activeSeries;
  const selectedPoint = (selected ? (selected.series === 'regular' ? view.regularSeries : view.maximumSeries).find((point) => point.bucketId === selected.bucketId) : undefined)
    ?? (selectedSeries === 'regular' ? [...view.regularSeries].reverse().find((point) => point.reps > 0) : [...view.maximumSeries].reverse().find((point) => point.bestSet > 0))
    ?? (selectedSeries === 'regular' ? view.regularSeries.at(-1) : view.maximumSeries.at(-1));
  const isHistoryEmpty = history.workouts.length === 0 && history.maximumTests.length === 0;
  const emptyTitle = isHistoryEmpty ? 'Your record starts here.' : `No ${emptyRecordLabel} sessions found.`;
  const emptyBody = isHistoryEmpty ? 'Complete a Push-up, Pull-up, or Squat set to start your record.' : `No ${emptyRecordLabel} sessions were recorded during ${rangeDescription}. Try another range or view all exercises.`;

  useEffect(() => {
    if (activeSeries === 'maximum' && !hasMaximumData) setActiveSeries('regular');
    if (activeSeries === 'regular' && !hasRegularData && hasMaximumData) setActiveSeries('maximum');
  }, [activeSeries, hasMaximumData, hasRegularData]);

  const updateRange = (nextRange: TimeRange) => { setRange(nextRange); setSelected(null); setDetailsVisible(false); };
  const updateFilter = (nextFilter: StatisticsFilter) => { setFilter(nextFilter); setSelected(null); setDetailsVisible(false); };

  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Progress</Text><Text style={styles.subtitle}>Your record, read one honest session at a time.</Text></View>

    <View style={styles.controls}>
      <View style={styles.controlGroup}><Text style={styles.controlLabel}>Time range</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlScroller} contentContainerStyle={styles.controlRow}>{ranges.map((option) => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: range === option.value }} onPress={() => updateRange(option.value)} style={[styles.control, range === option.value && styles.controlActive]}><Text style={[styles.controlText, range === option.value && styles.controlTextActive]}>{option.label}</Text></Pressable>)}</ScrollView></View>
      <View style={[styles.controlGroup, styles.controlGroupLast]}><Text style={styles.controlLabel}>Exercise</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlScroller} contentContainerStyle={styles.controlRow}>{filterOptions.map((option) => <Pressable key={option.key} accessibilityRole="button" accessibilityState={{ selected: filterKey === option.key }} onPress={() => updateFilter(option.value)} style={[styles.control, filterKey === option.key && styles.controlActive]}><Text style={[styles.controlText, filterKey === option.key && styles.controlTextActive]}>{option.label}</Text></Pressable>)}</ScrollView></View>
    </View>

    {error ? <View accessibilityRole="alert" style={styles.state}><Text style={styles.stateTitle}>Progress is unavailable.</Text><Text style={styles.stateBody}>We couldn’t read your saved training record. Reload it to try again.</Text><Pressable accessibilityRole="button" onPress={refreshHistory} style={styles.stateAction}><Text style={styles.stateActionText}>Reload record</Text></Pressable></View> : !hasData ? <View style={styles.empty}><Text style={styles.emptyTitle}>{emptyTitle}</Text><Text style={styles.emptyBody}>{emptyBody}</Text>{!isHistoryEmpty && filter.type !== 'all' ? <Pressable accessibilityRole="button" onPress={() => updateFilter({ type: 'all' })} style={styles.stateAction}><Text style={styles.stateActionText}>View all exercises</Text></Pressable> : null}</View> : <>
      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Training record</Text><Text style={styles.sectionNote}>Select a period for reps and sessions.</Text></View>
      <ProgressChart activeSeries={activeSeries} maximumSeries={view.maximumSeries} onSelect={(point, series) => setSelected({ series, bucketId: point.bucketId })} onSeriesChange={(series) => { setActiveSeries(series); setSelected(null); }} regularSeries={view.regularSeries} selected={selected} />
      {selectedPoint ? <View accessibilityLabel={`${selectedSeries === 'regular' ? 'Training volume' : 'Maximum test'} for ${formatBucketLabel(selectedPoint)}`} accessible style={styles.inspection}><View style={[styles.inspectionMark, selectedSeries === 'regular' ? styles.trainingMark : styles.maximumMark]} /><View style={styles.inspectionCopy}><Text style={styles.inspectionTitle}>{(selectedSeries === 'regular' ? 'Training volume' : 'Maximum test') + ' · ' + formatBucketLabel(selectedPoint) + (!selected ? ' · Latest' : '')}</Text><Text style={styles.inspectionBody}>{selectedSeries === 'regular' ? selectedPoint.reps + ' total reps · ' + selectedPoint.sessions + ' session' + (selectedPoint.sessions === 1 ? '' : 's') + ' · best set ' + (selectedPoint.bestSet || 'None yet') : selectedPoint.bestSet ? 'Best tested set: ' + selectedPoint.bestSet + ' reps' : 'No maximum test in this period'}</Text></View></View> : null}

      <View style={[styles.sectionHead, styles.rangeSectionHead]}><Text style={styles.sectionTitle}>Range totals</Text><Text style={styles.sectionNote}>For {filterLabel} · {rangeLabel}</Text></View>
      <View style={styles.ledger}>
        {hasRegularData ? <><Metric label="Total reps" value={view.metrics.totalReps} /><Metric label="Workout sessions" value={view.metrics.sessionCount} /><Metric label="Best training set" value={view.metrics.bestSet + ' reps'} /></> : null}
        {hasMaximumData ? <Metric label="Latest maximum test" value={view.metrics.latestMaximumTest + ' reps'} last={!hasRegularData} /> : null}
      </View>
      {hasRegularData ? <><Pressable accessibilityRole="button" accessibilityState={{ expanded: detailsVisible }} onPress={() => setDetailsVisible((visible) => !visible)} style={styles.detailToggle}><Text style={styles.detailToggleText}>{detailsVisible ? 'Hide extra stats' : 'Show more stats'}</Text></Pressable>{detailsVisible ? <View style={styles.detailLedger}><Metric label="Active days" value={view.metrics.activeDays} /><Metric description="days trained in this range" label="Training consistency" value={view.metrics.consistency + '%'} last /></View> : null}</> : null}
    </>}
  </Screen>;
}

function Metric({ description, label, value, last = false }: { description?: string; label: string; value: number | string; last?: boolean }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return <View accessible accessibilityRole="text" accessibilityLabel={`${label}: ${value}${description ? ', ' + description : ''}`} style={[styles.metric, last && styles.metricLast]}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  header: { marginBottom: spacing.xl, paddingTop: spacing.md },
  title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs },
  controls: { marginBottom: spacing.xl },
  controlGroup: { marginBottom: spacing.md },
  controlGroupLast: { marginBottom: 0 },
  controlLabel: { color: colors.ink, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.7, marginBottom: spacing.sm, textTransform: 'uppercase' },
  controlScroller: { flexGrow: 0, flexShrink: 0 },
  controlRow: { alignItems: 'center', gap: spacing.sm, paddingRight: spacing.lg },
  control: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.border, borderWidth: 1, height: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  controlActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  controlText: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  controlTextActive: { color: colors.white },
  sectionHead: { alignItems: 'baseline', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  rangeSectionHead: { marginTop: spacing.xl },
  sectionTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  sectionNote: { color: colors.muted, flex: 1, flexShrink: 1, fontFamily: fonts.body, fontSize: 11, marginLeft: spacing.sm, textAlign: 'right' },
  inspection: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: spacing.lg },
  inspectionMark: { height: 8, marginRight: spacing.md, marginTop: 6, width: 8 },
  trainingMark: { backgroundColor: colors.accent },
  maximumMark: { backgroundColor: colors.success },
  inspectionCopy: { flex: 1 },
  inspectionTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
  inspectionBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.xs },
  ledger: { borderTopColor: colors.ink, borderTopWidth: 2 },
  metric: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 56 },
  metricLast: { borderBottomWidth: 0 },
  metricLabel: { color: colors.muted, flexShrink: 1, fontFamily: fonts.body, fontSize: 14 },
  metricValue: { color: colors.accent, fontFamily: fonts.body, fontSize: 25, fontWeight: '800', letterSpacing: -0.5, marginLeft: spacing.md },
  detailToggle: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingVertical: spacing.sm },
  detailToggleText: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, fontWeight: '800' },
  detailLedger: { borderTopColor: colors.border, borderTopWidth: 1 },
  empty: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: spacing.xl },
  emptyTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  emptyBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  state: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: spacing.xl },
  stateTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  stateBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  stateAction: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.accent, borderWidth: 1, justifyContent: 'center', marginTop: spacing.lg, minHeight: 44, paddingHorizontal: spacing.md },
  stateActionText: { color: colors.accent, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
});
