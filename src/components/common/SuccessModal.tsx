import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { PrimaryButton } from './PrimaryButton';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
  subMessage?: string;
}

export function SuccessModal({
  visible,
  title,
  message,
  buttonLabel = 'Tuyệt vời, tiếp tục',
  onClose,
  subMessage,
}: SuccessModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle" size={54} color={Colors.success} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {subMessage ? (
                <View style={styles.subContainer}>
                  <Text style={styles.subText}>{subMessage}</Text>
                </View>
              ) : null}

              <PrimaryButton
                title={buttonLabel}
                onPress={onClose}
                style={styles.button}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: Spacing.base,
    lineHeight: 22,
  },
  subContainer: {
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subText: {
    ...Typography.bodySmall,
    color: Colors.primaryCoral,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    width: '100%',
  },
});
