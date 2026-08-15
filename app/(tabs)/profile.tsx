import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { colors, fonts, spacing } from '@/src/theme';

const rows = [{ icon: 'timer-outline', label: 'Rest timer', value: '60 sec' }, { icon: 'moon-outline', label: 'Appearance', value: 'Light' }, { icon: 'cloud-outline', label: 'Sync status', value: 'Local only' }];

export default function ProfileScreen() {
  return <Screen>
    <View style={styles.header}><Text style={styles.title}>Me</Text><Text style={styles.subtitle}>Your practice, kept in one place.</Text></View>
    <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>R</Text></View><View><Text style={styles.name}>Ready when you are.</Text><Text style={styles.member}>Member since today</Text></View></View>
    <Text style={styles.section}>Preferences</Text><View style={styles.list}>{rows.map((row) => <Pressable key={row.label} style={styles.row}><View style={styles.rowIcon}><Ionicons name={row.icon as keyof typeof Ionicons.glyphMap} size={19} color={colors.muted} /></View><Text style={styles.rowLabel}>{row.label}</Text><Text style={styles.rowValue}>{row.value}</Text><Ionicons name="chevron-forward" size={17} color={colors.border} /></Pressable>)}</View>
    <Text style={styles.section}>About Repbook</Text><View style={styles.about}><Text style={styles.aboutTitle}>Simple training, recorded honestly.</Text><Text style={styles.aboutBody}>Repbook keeps your sessions available offline. When sync is connected, your journal can travel with you.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ header: { paddingTop: spacing.md, marginBottom: spacing.xl }, title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34 }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, marginTop: spacing.xs }, profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.xl }, avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.ink, justifyContent: 'center', alignItems: 'center' }, avatarText: { color: colors.white, fontFamily: fonts.display, fontSize: 28 }, name: { color: colors.ink, fontFamily: fonts.display, fontSize: 21 }, member: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 }, section: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: spacing.md }, list: { borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.xl }, row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm }, rowIcon: { width: 30, alignItems: 'center' }, rowLabel: { flex: 1, color: colors.ink, fontFamily: fonts.body, fontSize: 15 }, rowValue: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 }, about: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.lg }, aboutTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 20 }, aboutBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: spacing.sm } });
