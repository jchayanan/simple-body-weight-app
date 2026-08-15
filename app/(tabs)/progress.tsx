import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { SectionTitle } from '@/src/components/SectionTitle';
import { getMovementHistory } from '@/src/lib/localDb';
import { maximumTimeline, MovementHistoryEntry, personalBest, volumeTimeline } from '@/src/lib/progressMath';
import { colors, fonts, spacing } from '@/src/theme';

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function ProgressScreen() {
  const [history, setHistory] = useState<MovementHistoryEntry[]>([]);
  const [chartWidth, setChartWidth] = useState(0);
  useFocusEffect(useCallback(() => {
    setHistory(getMovementHistory());
  }, []));

  const volume = volumeTimeline(history, 30);
  const volumeMaximum = Math.max(...volume.map((entry) => entry.reps), 1);
  const sessions = history.filter((entry) => entry.kind === 'session');
  const sessionCount = sessions.length;
  const totalReps = sessions.reduce((total, entry) => total + entry.reps, 0);
  const pushUpReps = sessions.filter((entry) => entry.movement === 'Push-up').reduce((total, entry) => total + entry.reps, 0);
  const pullUpReps = sessions.filter((entry) => entry.movement === 'Pull-up').reduce((total, entry) => total + entry.reps, 0);
  const maximums = maximumTimeline(history);
  const pushUpBest = personalBest(history, 'Push-up');
  const pullUpBest = personalBest(history, 'Pull-up');
  const chartHeight = 112;
  const points = volume.map((entry, index) => ({
    ...entry,
    x: chartWidth ? 4 + ((chartWidth - 8) * index) / (volume.length - 1) : 0,
    y: chartHeight - (entry.reps / volumeMaximum) * chartHeight,
  }));

  const measureChart = (event: LayoutChangeEvent) => setChartWidth(event.nativeEvent.layout.width);

  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Progress</Text><Text style={styles.subtitle}>Your record, kept one honest session at a time.</Text></View>

    <SectionTitle title="All time" action={`${sessionCount} sessions`} />
    <View style={styles.allTime}><View style={styles.allTimeItem}><Text style={styles.allTimeValue}>{totalReps}</Text><Text style={styles.allTimeLabel}>total reps</Text></View><View style={styles.allTimeItem}><Text style={styles.allTimeValue}>{pushUpReps}</Text><Text style={styles.allTimeLabel}>Push-up reps</Text></View><View style={styles.allTimeItem}><Text style={styles.allTimeValue}>{pullUpReps}</Text><Text style={styles.allTimeLabel}>Pull-up reps</Text></View></View>

    <SectionTitle title="Volume · last 30 days" />
    <View style={styles.chart} onLayout={measureChart}><View style={styles.plot}>{points.slice(1).map((point, index) => { const previous = points[index]; const length = Math.hypot(point.x - previous.x, point.y - previous.y); const angle = Math.atan2(point.y - previous.y, point.x - previous.x) * (180 / Math.PI); return <View key={`line-${point.date}`} style={[styles.line, { left: (previous.x + point.x - length) / 2, top: (previous.y + point.y) / 2, transform: [{ rotate: `${angle}deg` }], width: length }]} />; })}{points.map((point) => <View key={point.date} style={[styles.point, point.reps > 0 && styles.pointActive, { left: point.x - 3, top: point.y - 3 }]} />)}</View><View style={styles.axis}>{volume.map((entry, index) => <Text key={entry.date} style={styles.axisLabel}>{index % 5 === 0 || index === volume.length - 1 ? entry.date.split('-')[2] : ''}</Text>)}</View></View>

    <SectionTitle title="Maximums" /><View style={styles.records}><View style={styles.record}><Text style={styles.recordValue}>{pushUpBest || '–'}</Text><Text style={styles.recordLabel}>Push-up{pushUpBest ? ' reps' : ' not recorded'}</Text></View><View style={styles.record}><Text style={styles.recordValue}>{pullUpBest || '–'}</Text><Text style={styles.recordLabel}>Pull-up{pullUpBest ? ' reps' : ' not recorded'}</Text></View></View>

    <SectionTitle title="Maximum timeline" /><View style={styles.timeline}>{maximums.length ? maximums.map((entry) => <View key={entry.id} style={styles.timelineRow}><View style={[styles.timelineDot, entry.movement === 'Push-up' ? styles.pushDot : styles.pullDot]} /><View style={styles.timelineCopy}><Text style={styles.timelineMovement}>{entry.movement}</Text><Text style={styles.timelineDate}>{formatDate(entry.recordedAt)}</Text></View><Text style={styles.timelineReps}>{entry.reps} reps</Text></View>) : <Text style={styles.empty}>Start a Push-up or Pull-up program to save your first maximum.</Text>}</View>

    <SectionTitle title="Recent movement sessions" /><View style={styles.timeline}>{history.filter((entry) => entry.kind === 'session').slice(0, 6).map((entry) => <View key={entry.id} style={styles.timelineRow}><View style={styles.sessionMark} /><View style={styles.timelineCopy}><Text style={styles.timelineMovement}>{entry.movement}</Text><Text style={styles.timelineDate}>{formatDate(entry.recordedAt)} · {entry.routine ?? 'Workout'}</Text></View><Text style={styles.timelineReps}>{entry.reps} reps</Text></View>)}{!history.some((entry) => entry.kind === 'session') ? <Text style={styles.empty}>Finish a session to see your Push-up or Pull-up volume here.</Text> : null}</View>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, marginBottom: spacing.xl }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34 }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: spacing.xs }, allTime: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', marginBottom: spacing.xl }, allTimeItem: { flex: 1, paddingVertical: spacing.lg }, allTimeValue: { color: colors.accent, fontFamily: fonts.display, fontSize: 30 }, allTimeLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 15, marginTop: spacing.xs }, chart: { borderBottomColor: colors.border, borderBottomWidth: 1, height: 166, marginBottom: spacing.xl, paddingTop: spacing.sm }, plot: { height: 112, position: 'relative' }, line: { backgroundColor: colors.accent, height: 2, position: 'absolute' }, point: { backgroundColor: colors.border, borderRadius: 3, height: 6, position: 'absolute', width: 6 }, pointActive: { backgroundColor: colors.accent }, axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }, axisLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, minWidth: 8, textAlign: 'center' }, records: { borderBottomColor: colors.border, borderTopColor: colors.border, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row', marginBottom: spacing.xl }, record: { alignItems: 'flex-start', flex: 1, paddingVertical: spacing.lg }, recordValue: { color: colors.accent, fontFamily: fonts.display, fontSize: 34 }, recordLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.xs }, timeline: { borderTopColor: colors.border, borderTopWidth: 1, marginBottom: spacing.xl }, timelineRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 64 }, timelineDot: { borderRadius: 5, height: 10, marginRight: spacing.md, width: 10 }, pushDot: { backgroundColor: colors.accent }, pullDot: { backgroundColor: colors.success }, sessionMark: { backgroundColor: colors.ink, height: 1, marginRight: spacing.md, width: 10 }, timelineCopy: { flex: 1 }, timelineMovement: { color: colors.ink, fontFamily: fonts.body, fontSize: 15, fontWeight: '700' }, timelineDate: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 }, timelineReps: { color: colors.ink, fontFamily: fonts.display, fontSize: 19 }, empty: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, paddingVertical: spacing.lg },
});
