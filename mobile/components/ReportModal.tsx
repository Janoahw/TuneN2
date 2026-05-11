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
  const [selectedReason, setSelectedReason] = useState<typeof REASONS[number]['value'] | null>(null);
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();

  const handleSubmit = async () => {
    if (!selectedReason) {
      Toast.show({
        type: 'error',
        text1: 'Please select a reason',
        text2: 'Choose why you're reporting this content',
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
        text2: 'We'll review your report shortly',
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    maxHeight: '90%',
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  reasonButtonSelected: {
    backgroundColor: `${colors.accentPrimary}20`,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  reasonText: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  reasonTextSelected: {
    fontFamily: fontFamilies.uiMedium,
    color: colors.accentPrimary,
  },
  textarea: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 15,
    color: colors.textPrimary,
    height: 96,
  },
  actions: {
    gap: spacing.sm,
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
