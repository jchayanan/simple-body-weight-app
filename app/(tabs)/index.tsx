import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { AppColors, fonts, spacing, useAppTheme } from '@/src/theme';

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return <Screen>
    <View style={styles.header}><Text style={styles.date}>WEDNESDAY, 14 AUGUST</Text><Text style={styles.title}>Train today.</Text><Text style={styles.weekStatus}>2 sessions this week</Text></View>
    <View style={styles.programHero}><Text style={styles.programHeroTitle}>Choose your focus.</Text>{[
      { movement: 'Push-up', note: 'Five sets from your tested maximum', icon: 'arrow-up-outline' },
      { movement: 'Pull-up', note: 'Five sets from your tested maximum', icon: 'arrow-down-outline' },
      { movement: 'Squat', note: 'Five sets from your tested maximum', icon: 'barbell-outline' },
    ].map((program) => <Pressable key={program.movement} accessibilityRole="button" accessibilityLabel={`Set up ${program.movement} program`} accessibilityHint="Starts your focused five-set program" onPress={() => router.push({ pathname: '/program', params: { movement: program.movement } })} style={({ pressed }) => [styles.programHeroRow, pressed && styles.pressed]}><View style={styles.programHeroIcon}><Ionicons name={program.icon as keyof typeof Ionicons.glyphMap} size={25} color={colors.white} /></View><View style={styles.programHeroCopy}><Text style={styles.programHeroName}>{program.movement}</Text><Text style={styles.programHeroNote}>{program.note}</Text></View><Ionicons name="arrow-forward" size={21} color={colors.accent} /></Pressable>)}</View>
  </Screen>;
}

const createStyles = (colors: AppColors) => StyleSheet.create({ header: { paddingTop: spacing.md, marginBottom: spacing.xl }, date: { color: colors.accent, fontFamily: fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.9 }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 36, fontWeight: '800', letterSpacing: -1.1, marginTop: spacing.xs }, weekStatus: { color: colors.success, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', marginTop: spacing.sm }, programHero: { borderTopColor: colors.ink, borderTopWidth: 2, paddingTop: spacing.lg }, programHeroTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 25, fontWeight: '800', letterSpacing: -0.4, marginBottom: spacing.sm }, programHeroRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', minHeight: 104 }, programHeroIcon: { alignItems: 'center', backgroundColor: colors.instrument, height: 48, justifyContent: 'center', width: 48 }, programHeroCopy: { flex: 1, marginLeft: spacing.md }, programHeroName: { color: colors.ink, fontFamily: fonts.body, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }, programHeroNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 5, maxWidth: 190 }, pressed: { opacity: 0.65 } });
