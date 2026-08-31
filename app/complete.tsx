import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useWorkoutStore } from '@/src/stores/useWorkoutStore';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function CompleteScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { height, width } = useWindowDimensions();
  const isCompactLandscape = width > height && height < 500;
  const completionMark = useRef(new Animated.Value(0.94)).current;
  const summaryReveal = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const total = useWorkoutStore((state) => state.lastWorkoutTotal);
  const lastWorkoutName = useWorkoutStore((state) => state.lastWorkoutName);
  const lastWorkoutSetCount = useWorkoutStore((state) => state.lastWorkoutSetCount);
  const lastWorkoutDurationMinutes = useWorkoutStore((state) => state.lastWorkoutDurationMinutes);
  const planType = useWorkoutStore((state) => state.plan.type);
  const resetWorkout = useWorkoutStore((state) => state.resetWorkout);
  const sessionUnit = planType === 'max-program' ? 'sets' : 'exercises';
  const sessionTitle = lastWorkoutName ? `${lastWorkoutName} complete` : 'Session complete';
  const sessionUnitLabel = sessionUnit === 'sets' ? 'sets completed' : 'exercises completed';
  const summaryAccessibilityLabel = `${total} reps logged, ${lastWorkoutSetCount} ${sessionUnitLabel}${lastWorkoutDurationMinutes ? `, ${lastWorkoutDurationMinutes} minutes` : ''}`;

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AccessibilityInfo.announceForAccessibility(`${sessionTitle} ${summaryAccessibilityLabel}`);
  }, [sessionTitle, summaryAccessibilityLabel]);

  useEffect(() => {
    if (reduceMotion !== false) return;
    const useNativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(completionMark, { duration: 520, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(summaryReveal, { duration: 360, easing: Easing.out(Easing.cubic), toValue: 0, useNativeDriver }),
      ]),
    ]).start();
    return () => {
      completionMark.stopAnimation();
      summaryReveal.stopAnimation();
    };
  }, [completionMark, reduceMotion, summaryReveal]);

  const checkMotionStyle = reduceMotion === false ? { opacity: completionMark.interpolate({ inputRange: [0.94, 1], outputRange: [0.9, 1] }), transform: [{ scale: completionMark }] } : undefined;
  const summaryMotionStyle = reduceMotion === false ? { opacity: summaryReveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }), transform: [{ translateY: summaryReveal.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) }] } : undefined;

  return <Screen>
    <View accessibilityLiveRegion="polite" style={[styles.header, isCompactLandscape && styles.headerCompact]}><Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.check, checkMotionStyle]}><Ionicons name="checkmark" size={31} color={colors.white} /></Animated.View><Text style={styles.title}>{sessionTitle}</Text><Text style={styles.subtitle}>A clear record of this session</Text></View>
    <Animated.View accessible accessibilityLabel={summaryAccessibilityLabel} style={[styles.summary, isCompactLandscape && styles.summaryCompact, summaryMotionStyle]}>
      <View style={styles.stat}><Text style={styles.value}>{total}</Text><Text style={styles.label}>reps logged</Text></View>
      <View style={[styles.stat, !lastWorkoutDurationMinutes && styles.lastStat]}><Text style={styles.value}>{lastWorkoutSetCount}</Text><Text style={styles.label}>{sessionUnitLabel}</Text></View>
      {lastWorkoutDurationMinutes ? <View style={[styles.stat, styles.lastStat]}><Text style={styles.value}>{lastWorkoutDurationMinutes}</Text><Text style={styles.label}>minutes</Text></View> : null}
    </Animated.View>
    <View style={[styles.record, isCompactLandscape && styles.recordCompact]}><View style={styles.recordMark} /><View style={styles.recordCopy}><Text style={styles.recordTitle}>Saved on this device</Text><Text style={styles.recordBody}>Filed in your training log. No connection needed</Text></View></View>
    <View style={[styles.bottom, isCompactLandscape && styles.bottomCompact]}><PrimaryButton label="Back to today" onPress={() => { resetWorkout(); router.replace('/'); }} /><Pressable accessibilityRole="button" accessibilityLabel="View progress" onPress={() => { resetWorkout(); router.replace('/progress'); }} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}><Text style={styles.secondaryLabel}>View progress</Text></Pressable><Text style={styles.footer}>Your next session starts when you are ready</Text></View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ header: { alignItems: 'center', backgroundColor: colors.background, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl + spacing.sm, paddingTop: spacing.xxl + spacing.sm }, headerCompact: { paddingBottom: spacing.lg, paddingTop: spacing.lg }, check: { alignItems: 'center', backgroundColor: colors.success, height: 56, justifyContent: 'center', marginBottom: spacing.lg, width: 56 }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 44, fontWeight: '700', letterSpacing: -0.8, maxWidth: '100%', textAlign: 'center' }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, maxWidth: 312, textAlign: 'center' }, summary: { borderBottomWidth: 1, borderColor: colors.ink, borderTopWidth: 1, flexDirection: 'row', marginTop: spacing.xl }, summaryCompact: { marginTop: spacing.md }, stat: { alignItems: 'center', borderRightColor: colors.border, borderRightWidth: 1, flex: 1, paddingVertical: spacing.lg }, lastStat: { borderRightWidth: 0 }, value: { color: colors.accent, fontFamily: fonts.body, fontSize: 32, fontWeight: '800', letterSpacing: -0.6 }, label: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: spacing.xs, textAlign: 'center' }, record: { alignItems: 'flex-start', flexDirection: 'row', paddingVertical: spacing.lg }, recordCompact: { paddingVertical: spacing.md }, recordMark: { backgroundColor: colors.success, height: 18, marginRight: spacing.md, marginTop: 4, width: 4 }, recordCopy: { flex: 1, minWidth: 0 }, recordTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, recordBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.xs }, bottom: { marginTop: 'auto', paddingTop: spacing.xl }, bottomCompact: { paddingTop: spacing.md }, secondaryAction: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing.xs }, secondaryLabel: { color: colors.accent, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, footer: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.sm, textAlign: 'center' }, pressed: { opacity: 0.68 } });
