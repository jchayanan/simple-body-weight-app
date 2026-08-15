import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, spacing } from '@/src/theme';

type RepEditorModalProps = {
  visible: boolean;
  title: string;
  value: number;
  minimum?: number;
  onClose: () => void;
  onSave: (value: number) => void;
};

export function RepEditorModal({ visible, title, value, minimum = 0, onClose, onSave }: RepEditorModalProps) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(String(value));
      setError('');
    }
  }, [value, visible]);

  const save = () => {
    const nextValue = Number(draft);
    if (!Number.isInteger(nextValue) || nextValue < minimum) {
      setError(`Enter a whole number of at least ${minimum}.`);
      return;
    }
    onSave(nextValue);
    onClose();
  };

  return <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <View accessibilityViewIsModal style={styles.overlay}>
      <Pressable accessibilityLabel="Close rep editor" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        <TextInput accessibilityLabel="Reps" autoFocus keyboardType="number-pad" onChangeText={setDraft} onSubmitEditing={save} selectTextOnFocus style={styles.input} value={draft} />
        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}><Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" onPress={save} style={styles.save}><Text style={styles.saveText}>Save reps</Text></Pressable></View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: 'rgba(32, 32, 32, 0.52)', flex: 1, justifyContent: 'center', padding: spacing.lg }, sheet: { backgroundColor: colors.surface, borderTopColor: colors.ink, borderTopWidth: 3, padding: spacing.lg, width: '100%' }, title: { color: colors.ink, fontFamily: fonts.body, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }, input: { borderBottomColor: colors.accent, borderBottomWidth: 2, color: colors.accent, fontFamily: fonts.body, fontSize: 50, fontWeight: '800', letterSpacing: -1, lineHeight: 58, marginTop: spacing.lg, paddingVertical: spacing.xs, textAlign: 'center' }, error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: spacing.sm, textAlign: 'center' }, actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }, cancel: { alignItems: 'center', borderColor: colors.ink, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 }, cancelText: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }, save: { alignItems: 'center', backgroundColor: colors.accent, flex: 1, justifyContent: 'center', minHeight: 48 }, saveText: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
});
