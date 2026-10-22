import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SuccessModal } from '../components/common/SuccessModal';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email = (params.email as string) || 'your account';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validate = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmError('');

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu mới');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải chứa ít nhất 6 ký tự');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Vui lòng xác nhận mật khẩu mới');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    return isValid;
  };

  const handleReset = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccessModal(true);
    }, 700);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/login');
  };

  return (
    <ScreenContainer scrollable edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primaryText} />
        </TouchableOpacity>

        {/* Shield Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={44} color={Colors.success} />
        </View>

        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        <Text style={styles.subtitle}>
          Tạo mật khẩu mới an toàn cho tài khoản {email}
        </Text>

        <View style={styles.form}>
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              if (confirmError) setConfirmError('');
            }}
            error={confirmError}
          />

          <PrimaryButton
            title="Cập nhật mật khẩu"
            onPress={handleReset}
            loading={loading}
            style={styles.updateButton}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.replace('/login')}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>Hủy & Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Cập nhật mật khẩu thành công! 🔒"
        message="Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay với mật khẩu mới."
        buttonLabel="Đăng nhập ngay"
        onClose={handleModalClose}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  title: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: Spacing.xl,
  },
  form: {
    width: '100%',
  },
  updateButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
});
