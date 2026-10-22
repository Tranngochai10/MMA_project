import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { PrimaryButton } from './PrimaryButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
  disclaimer?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  isDestructive = false,
  icon = 'help-circle-outline',
  onConfirm,
  onCancel,
  disclaimer,
}: ConfirmDialogProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              <View
                style={[
                  styles.iconCircle,
                  isDestructive ? styles.destructiveCircle : styles.primaryCircle,
                ]}
              >
                <Ionicons
                  name={icon}
                  size={32}
                  color={isDestructive ? Colors.error : Colors.primaryCoral}
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {disclaimer ? (
                <View style={styles.disclaimerContainer}>
                  <Text style={styles.disclaimerText}>{disclaimer}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onCancel}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>

                <View style={styles.confirmWrapper}>
                  <PrimaryButton
                    title={confirmLabel}
                    onPress={onConfirm}
                    style={isDestructive ? styles.destructiveButton : undefined}
                  />
                </View>
              </View>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  primaryCircle: {
    backgroundColor: Colors.lightPeach,
  },
  destructiveCircle: {
    backgroundColor: Colors.errorLight,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  disclaimerContainer: {
    backgroundColor: Colors.warmCream,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.primaryCoral,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  confirmWrapper: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  destructiveButton: {
    backgroundColor: Colors.error,
  },
});
