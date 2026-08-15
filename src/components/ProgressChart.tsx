import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import type { ChartPoint } from '@/src/lib/statisticsMath';
import { colors, fonts, spacing } from '@/src/theme';

export type ChartSeries = 'regular' | 'maximum';

type Props = {
  regularSeries: ChartPoint[];
  maximumSeries: ChartPoint[];
  activeSeries: ChartSeries;
  selected: { series: ChartSeries; bucketId: string } | null;
  onSeriesChange: (series: ChartSeries) => void;
  onSelect: (point: ChartPoint, series: ChartSeries) => void;
};

const chartHeight = 148;
const pointValue = (point: ChartPoint, series: ChartSeries) => series === 'regular' ? point.reps : point.bestSet;

export function ProgressChart({ regularSeries, maximumSeries, activeSeries, selected, onSeriesChange, onSelect }: Props) {
  const [width, setWidth] = useState(0);
  const allValues = [...regularSeries.map((point) => point.reps), ...maximumSeries.map((point) => point.bestSet)];
  const maximum = Math.max(...allValues, 1);
  const activePoints = activeSeries === 'regular' ? regularSeries : maximumSeries;
  const pointsFor = (series: ChartPoint[], kind: ChartSeries) => series.map((point, index) => ({ point, x: width ? 8 + ((width - 16) * index) / Math.max(series.length - 1, 1) : 0, y: chartHeight - (pointValue(point, kind) / maximum) * chartHeight }));
  const regularPoints = pointsFor(regularSeries, 'regular');
  const maximumPoints = pointsFor(maximumSeries, 'maximum');
  const selectNearest = (locationX: number) => {
    if (!activePoints.length) return;
    const index = Math.round((Math.max(0, Math.min(locationX, width || 1)) / Math.max(width || 1, 1)) * (activePoints.length - 1));
    onSelect(activePoints[index], activeSeries);
  };
  const renderSeries = (points: Array<{ point: ChartPoint; x: number; y: number }>, kind: ChartSeries) => <>{points.slice(1).map((current, index) => {
    const previous = points[index];
    const length = Math.hypot(current.x - previous.x, current.y - previous.y);
    const angle = Math.atan2(current.y - previous.y, current.x - previous.x) * (180 / Math.PI);
    return <View key={kind + '-' + current.point.bucketId + '-line'} style={[styles.line, kind === 'regular' ? styles.regularLine : styles.maximumLine, { left: (previous.x + current.x - length) / 2, top: (previous.y + current.y) / 2, transform: [{ rotate: String(angle) + 'deg' }], width: length }]} />;
  })}{points.map(({ point, x, y }) => <View key={kind + '-' + point.bucketId} style={[styles.point, kind === 'regular' ? styles.regularPoint : styles.maximumPoint, selected?.series === kind && selected.bucketId === point.bucketId && styles.pointSelected, { left: x - 5, top: y - 5 }]} />)}</>;

  return <View style={styles.container}>
    <View style={styles.legend}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: activeSeries === 'regular' }} onPress={() => onSeriesChange('regular')} style={[styles.legendButton, activeSeries === 'regular' && styles.legendButtonActive]}><View style={[styles.legendMark, styles.regularMark]} /><Text style={styles.legendText}>Training</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: activeSeries === 'maximum' }} onPress={() => onSeriesChange('maximum')} style={[styles.legendButton, activeSeries === 'maximum' && styles.legendButtonActive]}><View style={[styles.legendMark, styles.maximumMark]} /><Text style={styles.legendText}>Maximum test</Text></Pressable>
    </View>
    <View accessibilityHint={'Tap the chart to inspect a ' + (activeSeries === 'regular' ? 'training' : 'maximum test') + ' period'} accessibilityLabel={(activeSeries === 'regular' ? 'Training volume' : 'Maximum test') + ' chart'} accessibilityRole="button" onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)} onStartShouldSetResponder={() => true} onResponderRelease={(event) => selectNearest(event.nativeEvent.locationX)} style={styles.plot}>
      <View style={styles.baseline} />
      {renderSeries(regularPoints, 'regular')}
      {renderSeries(maximumPoints, 'maximum')}
    </View>
    <View style={styles.axis}>{activePoints.map((point, index) => <Text key={point.bucketId} style={styles.axisLabel}>{index === 0 || index === activePoints.length - 1 || index === Math.round((activePoints.length - 1) / 2) ? point.label : ''}</Text>)}</View>
  </View>;
}

const styles = StyleSheet.create({
  container: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: spacing.md },
  legend: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  legendButton: { alignItems: 'center', borderColor: colors.border, borderWidth: 1, flexDirection: 'row', minHeight: 44, paddingHorizontal: spacing.sm },
  legendButtonActive: { borderColor: colors.ink },
  legendMark: { height: 8, marginRight: spacing.xs, width: 8 },
  regularMark: { backgroundColor: colors.ink },
  maximumMark: { backgroundColor: colors.success },
  legendText: { color: colors.ink, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  plot: { height: chartHeight, position: 'relative' },
  baseline: { backgroundColor: colors.border, bottom: 0, height: 1, left: 0, position: 'absolute', right: 0 },
  line: { height: 2, position: 'absolute' },
  regularLine: { backgroundColor: colors.ink },
  maximumLine: { backgroundColor: colors.success },
  point: { borderColor: colors.background, borderRadius: 5, borderWidth: 2, height: 10, position: 'absolute', width: 10 },
  regularPoint: { backgroundColor: colors.ink },
  maximumPoint: { backgroundColor: colors.success },
  pointSelected: { borderColor: colors.ink, height: 14, marginLeft: -2, marginTop: -2, width: 14 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  axisLabel: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 11, textAlign: 'center' },
});
