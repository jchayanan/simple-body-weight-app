import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { colors, fonts, radii, spacing } from '@/src/theme';

export default function TodayScreen() {
  return <Screen>
    <View style={styles.header}><Text style={styles.date}>WEDNESDAY, 14 AUGUST</Text><Text style={styles.title}>Train today.</Text><Text style={styles.weekStatus}>2 sessions this week</Text></View>
    <View style={styles.programHero}><Text style={styles.programHeroTitle}>Choose your focus.</Text>{[
      { movement: 'Push-up', note: 'Five sets from your tested maximum', icon: 'arrow-up-outline' },
      { movement: 'Pull-up', note: 'Five sets from your tested maximum', icon: 'arrow-down-outline' },
      { movement: 'Squat', note: 'Five sets from your tested maximum', icon: 'barbell-outline' },
    ].map((program) => <Pressable key={program.movement} accessibilityRole="button" accessibilityLabel={`Set up ${program.movement} only program`} accessibilityHint="Starts your focused five-set program" onPress={() => router.push({ pathname: '/program', params: { movement: program.movement } })} style={({ pressed }) => [styles.programHeroRow, pressed && styles.pressed]}><View style={styles.programHeroIcon}><Ionicons name={program.icon as keyof typeof Ionicons.glyphMap} size={25} color={colors.accent} /></View><View style={styles.programHeroCopy}><Text style={styles.programHeroName}>{program.movement} only</Text><Text style={styles.programHeroNote}>{program.note}</Text></View><Ionicons name="arrow-forward" size={21} color={colors.accent} /></Pressable>)}</View>
  </Screen>;
}

const styles = StyleSheet.create({ header: { paddingTop: spacing.md, marginBottom: spacing.xl }, date: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34, marginTop: spacing.xs }, weekStatus: { color: colors.success, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', marginTop: spacing.sm }, programHero: { backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }, programHeroTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 31, marginBottom: spacing.md }, programHeroRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', minHeight: 112 }, programHeroIcon: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 }, programHeroCopy: { flex: 1, marginLeft: spacing.md }, programHeroName: { color: colors.ink, fontFamily: fonts.display, fontSize: 25 }, programHeroNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 5, maxWidth: 190 }, pressed: { opacity: 0.65 } });
