import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { FormInput } from '../components/common/FormInput';
import { api } from '../services/api';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const [otp, setOtp] = useState((params.otp as string) || '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [requestError, setRequestError] = useState('');

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

  const handleReset = async () => {
    if (!validate()) return;
    if (!otp.trim()) { setRequestError('Vui lòng nhập mã OTP.'); return; }
    try {
      await api.resetPassword(email, otp.trim(), password);
      Alert.alert('Đổi mật khẩu thành công', 'Bạn có thể đăng nhập bằng mật khẩu mới.', [{ text: 'Đăng nhập', onPress: () => router.replace('/login') }]);
    } catch (e) { setRequestError(e instanceof Error ? e.message : 'Không thể đặt lại mật khẩu. Vui lòng thử lại.'); }
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
          {requestError ? <Text style={styles.requestError}>{requestError}</Text> : null}
          <FormInput label="Mã OTP" placeholder="Nhập mã OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
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
            title="Đặt lại mật khẩu"
            onPress={handleReset}
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

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontSize: 28,
    color: Colors.primaryText,
    textAlign: 'left',
    lineHeight: 36,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'left',
    marginTop: 8,
    lineHeight: 23,
    maxWidth: 300,
    marginBottom: Spacing.xl,
    fontSize: 15,
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
  requestError: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
