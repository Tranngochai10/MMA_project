import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { FormInput } from '../components/common/FormInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SuccessModal } from '../components/common/SuccessModal';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function RegisterScreen() {
  const { register } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');

  const validate = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setTermsError('');

    if (!fullName.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Định dạng email không hợp lệ');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải chứa ít nhất 6 ký tự');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Vui lòng xác nhận mật khẩu');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    if (!acceptTerms) {
      setTermsError('Bạn cần đồng ý với Điều khoản và Điều kiện');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      register(fullName, email, phone);
      setShowSuccessModal(true);
    }, 800);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/(user)/home');
  };

  return (
    <ScreenContainer scrollable edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Top Back Navigation */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primaryText} />
        </TouchableOpacity>

        {/* Heading */}
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Tham gia Dealora để nhận ngay các ưu đãi độc quyền từ các thương hiệu hàng đầu
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <FormInput
            label="Họ và tên"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={fullName}
            onChangeText={(txt) => {
              setFullName(txt);
              if (nameError) setNameError('');
            }}
            leftIcon="person-outline"
            error={nameError}
          />

          <FormInput
            label="Địa chỉ Email"
            placeholder="Ví dụ: nguyenvana@example.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={emailError}
          />

          <FormInput
            label="Số điện thoại (Không bắt buộc)"
            placeholder="0912 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <PasswordInput
            label="Mật khẩu"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
          />

          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              if (confirmError) setConfirmError('');
            }}
            error={confirmError}
          />

          {/* Terms Checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setAcceptTerms(!acceptTerms);
              if (termsError) setTermsError('');
            }}
            style={styles.termsRow}
          >
            <Ionicons
              name={acceptTerms ? 'checkbox' : 'square-outline'}
              size={22}
              color={acceptTerms ? Colors.primaryCoral : Colors.secondaryText}
            />
            <Text style={styles.termsText}>
              Tôi đồng ý với <Text style={styles.termsHighlight}>Điều khoản & Điều kiện</Text> và{' '}
              <Text style={styles.termsHighlight}>Chính sách bảo mật</Text>
            </Text>
          </TouchableOpacity>
          {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}

          {/* Submit */}
          <PrimaryButton
            title="Đăng ký tài khoản"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          {/* Return to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Tạo tài khoản thành công! 🎉"
        message="Chào mừng bạn đến với Dealora. Tài khoản của bạn đã sẵn sàng để bắt đầu mua sắm ưu đãi."
        buttonLabel="Đến sàn ưu đãi"
        onClose={handleModalClose}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.primaryText,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  termsText: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  termsHighlight: {
    color: Colors.primaryCoral,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  submitBtn: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  loginText: {
    ...Typography.body,
    color: Colors.secondaryText,
  },
  loginLink: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
});
