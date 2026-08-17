import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { getChartAxisPoints, type ChartPoint } from '@/src/lib/statisticsMath';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

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
const splitAxisLabel = (label: string) => {
  const [primary, ...rest] = label.split(' ');
  return { primary, secondary: rest.join(' ') };
};

export function ProgressChart({ regularSeries, maximumSeries, activeSeries, selected, onSeriesChange, onSelect }: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [width, setWidth] = useState(0);
  const activePoints = activeSeries === 'regular' ? regularSeries : maximumSeries;
  const axisPoints = getChartAxisPoints(activePoints);
  const maximum = Math.max(...activePoints.map((point) => pointValue(point, activeSeries)), 1);
  const midpoint = Math.ceil(maximum / 2);
  const currentPoint = [...activePoints].reverse().find((point) => pointValue(point, activeSeries) > 0) ?? activePoints.at(-1);
  const selectedPoint = selected?.series === activeSeries ? activePoints.find((point) => point.bucketId === selected.bucketId) : undefined;
  const selectedIndex = selectedPoint ? activePoints.indexOf(selectedPoint) : currentPoint ? activePoints.indexOf(currentPoint) : 0;
  const chartUnit = activeSeries === 'regular' ? 'Total training reps in each period' : 'Best tested set in each period';
  const chartHint = activeSeries === 'regular' ? 'Select a period to hear total reps and sessions' : 'Select a period to hear the best tested set';
  const points = activePoints.map((point, index) => ({
    point,
    x: width ? 8 + ((width - 16) * index) / Math.max(activePoints.length - 1, 1) : 0,
    y: chartHeight - 8 - (pointValue(point, activeSeries) / maximum) * (chartHeight - 16),
  }));

  const selectNearest = (locationX: number) => {
    if (!activePoints.length) return;
    const index = Math.round((Math.max(0, Math.min(locationX, width || 1)) / Math.max(width || 1, 1)) * (activePoints.length - 1));
    onSelect(activePoints[index], activeSeries);
  };

  const moveSelection = (delta: number) => {
    if (!activePoints.length) return;
    const nextIndex = Math.max(0, Math.min(activePoints.length - 1, selectedIndex + delta));
    onSelect(activePoints[nextIndex], activeSeries);
  };

  return <View style={styles.container}>
    <View style={styles.legend}>
      <Pressable accessibilityRole="button" accessibilityLabel="Show training volume" accessibilityState={{ selected: activeSeries === 'regular' }} onPress={() => onSeriesChange('regular')} style={[styles.legendButton, activeSeries === 'regular' && styles.legendButtonActive]}><View style={[styles.legendMark, styles.regularMark]} /><Text style={[styles.legendText, activeSeries === 'regular' && styles.legendTextActive]}>Training volume</Text></Pressable>
      {maximumSeries.some((point) => point.bestSet > 0) ? <Pressable accessibilityRole="button" accessibilityLabel="Show maximum test" accessibilityState={{ selected: activeSeries === 'maximum' }} onPress={() => onSeriesChange('maximum')} style={[styles.legendButton, activeSeries === 'maximum' && styles.legendButtonActive]}><View style={[styles.legendMark, styles.maximumMark]} /><Text style={[styles.legendText, activeSeries === 'maximum' && styles.legendTextActive]}>Maximum test</Text></Pressable> : null}
    </View>
    <Text style={styles.chartUnit}>{chartUnit}</Text>
    <View style={styles.plotRow}>
      <View accessible={false} style={styles.scale}><Text numberOfLines={1} style={styles.scaleLabel}>{maximum.toLocaleString()}</Text><Text numberOfLines={1} style={styles.scaleLabel}>{midpoint.toLocaleString()}</Text><Text numberOfLines={1} style={styles.scaleLabel}>0</Text></View>
      <View accessibilityHint={chartHint + ' Screen readers can use next or previous period actions'} accessibilityLabel={(activeSeries === 'regular' ? 'Training volume' : 'Maximum test') + ' chart'} accessibilityRole="adjustable" accessibilityValue={{ text: selectedPoint ? `${selectedPoint.label}, ${pointValue(selectedPoint, activeSeries)} reps` : currentPoint ? `${currentPoint.label}, ${pointValue(currentPoint, activeSeries)} reps, latest period` : 'No periods' }} accessibilityActions={[{ name: 'increment', label: 'Next period' }, { name: 'decrement', label: 'Previous period' }]} onAccessibilityAction={(event) => moveSelection(event.nativeEvent.actionName === 'increment' ? 1 : -1)} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)} onStartShouldSetResponder={() => true} onResponderRelease={(event) => selectNearest(event.nativeEvent.locationX)} style={styles.plot}>
        <View style={styles.baseline} />
        {points.slice(1).map((current, index) => {
          const previous = points[index];
          const length = Math.hypot(current.x - previous.x, current.y - previous.y);
          const angle = Math.atan2(current.y - previous.y, current.x - previous.x) * (180 / Math.PI);
          return <View key={activeSeries + '-' + current.point.bucketId + '-line'} style={[styles.line, activeSeries === 'regular' ? styles.regularLine : styles.maximumLine, { left: (previous.x + current.x - length) / 2, top: (previous.y + current.y) / 2, transform: [{ rotate: String(angle) + 'deg' }], width: length }]} />;
        })}
        {points.map(({ point, x, y }) => <View key={activeSeries + '-' + point.bucketId} style={[styles.point, activeSeries === 'regular' ? styles.regularPoint : styles.maximumPoint, point.bucketId === currentPoint?.bucketId && styles.pointCurrent, selected?.series === activeSeries && selected.bucketId === point.bucketId && styles.pointSelected, { left: x - 5, top: y - 5 }]} />)}
      </View>
    </View>
    <View style={styles.axisRow}>
      <View style={styles.axisSpacer} />
      <View style={styles.axis}>
        {axisPoints.map((point, index) => {
          const { primary, secondary } = splitAxisLabel(point.label);
          const alignment = axisPoints.length === 1 ? styles.axisLabelMiddle : index === 0 ? styles.axisLabelStart : index === axisPoints.length - 1 ? styles.axisLabelEnd : styles.axisLabelMiddle;
          return <View key={point.bucketId} style={[styles.axisLabel, alignment]}>
            <Text numberOfLines={1} style={styles.axisLabelText}>{primary}</Text>
            <Text numberOfLines={1} style={styles.axisLabelText}>{secondary || '\u00A0'}</Text>
          </View>;
        })}
      </View>
    </View>
  </View>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: spacing.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  legendButton: { alignItems: 'center', borderColor: colors.border, borderWidth: 1, flexDirection: 'row', flexShrink: 0, minHeight: 44, paddingHorizontal: spacing.sm },
  legendButtonActive: { borderColor: colors.accent },
  legendMark: { height: 8, marginRight: spacing.xs, width: 8 },
  regularMark: { backgroundColor: colors.accent },
  maximumMark: { backgroundColor: colors.success },
  legendText: { color: colors.ink, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  legendTextActive: { color: colors.accent },
  chartUnit: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginBottom: spacing.sm },
  plotRow: { flexDirection: 'row' },
  scale: { height: chartHeight, justifyContent: 'space-between', paddingRight: spacing.sm, width: 44 },
  scaleLabel: { color: colors.muted, flexShrink: 0, fontFamily: fonts.body, fontSize: 11, textAlign: 'right' },
  plot: { flex: 1, height: chartHeight, position: 'relative' },
  baseline: { backgroundColor: colors.border, bottom: 0, height: 1, left: 0, position: 'absolute', right: 0 },
  line: { height: 2, position: 'absolute' },
  regularLine: { backgroundColor: colors.accent },
  maximumLine: { backgroundColor: colors.success },
  point: { borderColor: colors.background, borderRadius: 5, borderWidth: 2, height: 10, position: 'absolute', width: 10 },
  regularPoint: { backgroundColor: colors.accent },
  maximumPoint: { backgroundColor: colors.success },
  pointCurrent: { borderColor: colors.ink, borderWidth: 3 },
  pointSelected: { borderColor: colors.accent, height: 14, marginLeft: -2, marginTop: -2, width: 14 },
  axisRow: { flexDirection: 'row' },
  axisSpacer: { width: 44 },
  axis: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  axisLabel: { flex: 1, height: 32, justifyContent: 'flex-start' },
  axisLabelStart: { alignItems: 'flex-start' },
  axisLabelMiddle: { alignItems: 'center' },
  axisLabelEnd: { alignItems: 'flex-end' },
  axisLabelText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
