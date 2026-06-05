import { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/ui/Button';
import { useCreateReport } from '@/hooks/useReports';
import { colors, fontFamilies, spacing, radius } from '@/theme';

interface ReportModalProps {
  songId: string;
  songTitle: string;
  visible: boolean;
  onClose: () => void;
}

const REASONS = [
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam or Misleading' },
  { value: 'other', label: 'Other' },
] as const;

export function ReportModal({ songId, songTitle, visible, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<(typeof REASONS)[number]['value'] | null>(
    null,
  );
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();

  const handleSubmit = async () => {
    if (!selectedReason) {
      Toast.show({
        type: 'error',
        text1: 'Please select a reason',
        text2: "Choose why you're reporting this content",
      });
      return;
    }

    try {
      await createReport.mutateAsync({
        songId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Report submitted',
        text2: "We'll review your report shortly",
      });

      // Reset and close
      setSelectedReason(null);
      setDescription('');
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to submit report';
      Toast.show({
        type: 'error',
        text1: 'Report failed',
        text2: message,
      });
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.content}>
          <View style={styles.dragHandle} />
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Report Song</Text>
            <Text style={styles.subtitle}>{songTitle}</Text>
          </View>

          {/* Reason picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Why are you reporting this?</Text>
            {REASONS.map((reason) => (
              <Pressable
                key={reason.value}
                style={[
                  styles.reasonButton,
                  selectedReason === reason.value && styles.reasonButtonSelected,
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <View style={[styles.radioCircle, selectedReason === reason.value && styles.radioCircleActive]}>
                  {selectedReason === reason.value && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason.value && styles.reasonTextSelected,
                  ]}
                >
                  {reason.label}
                </Text>
                {selectedReason === reason.value && (
                  <Feather name="check" size={20} color={colors.accentPrimary} />
                )}
              </Pressable>
            ))}
          </View>

          {/* Optional details */}
          <View style={styles.section}>
            <Text style={styles.label}>Additional details (optional)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Submit Report"
              onPress={handleSubmit}
              loading={createReport.isPending}
              disabled={!selectedReason}
            />
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  content: {
    backgroundColor: '#15151B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#2C2C3A',
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  header: { marginBottom: 20 },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
  },
  section: { marginBottom: 20 },
  label: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2C2C3A',
    alignSelf: 'center',
    marginBottom: 20,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#191920',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#4A4A5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: colors.accentPrimary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentPrimary,
  },
  reasonButtonSelected: {
    backgroundColor: 'rgba(0,204,204,0.094)',
    borderColor: colors.accentPrimary,
  },
  reasonText: {
    flex: 1,
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  reasonTextSelected: { color: colors.accentPrimary },
  textarea: {
    backgroundColor: '#191920',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#313142',
    padding: 16,
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#F5F5F7',
    height: 100,
  },
  actions: { gap: 12 },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#9B9BA7',
  },
});
