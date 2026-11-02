import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { FormInput } from '../components/common/FormInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { login, toggleFavoriteVoucher } = useApp();
  const { returnToVoucherId, returnToFavoriteVoucherId } = useLocalSearchParams<{ returnToVoucherId?: string; returnToFavoriteVoucherId?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Vui lòng nhập đúng định dạng email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải chứa ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const role = await login(email.trim(), password, rememberMe);
      if (role === 'USER' && returnToFavoriteVoucherId) {
        const voucherId = String(returnToFavoriteVoucherId);
        await toggleFavoriteVoucher(voucherId);
        router.replace(`/(user)/vouchers/${voucherId}`);
      } else if (role === 'USER' && returnToVoucherId) {
        router.replace({ pathname: '/(user)/checkout', params: { voucherId: returnToVoucherId } });
      } else {
        router.replace(role === 'MANAGER' ? '/(manager)/dashboard' : '/(user)/home');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header Branding */}
        <View style={styles.header}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            style={styles.logoBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="ticket" size={32} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Chào mừng trở lại!</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để khám phá các voucher ưu đãi hấp dẫn
          </Text>
        </View>

        {/* Error Feedback */}
        {authError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={styles.form}>
          <FormInput
            label="Địa chỉ Email"
            placeholder="ten@example.com"
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

          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
          />

          {/* Remember me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberMeRow}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={20}
                color={rememberMe ? Colors.primaryCoral : Colors.secondaryText}
              />
              <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <PrimaryButton
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signUpLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>

          {/* Role Preview Shortcut */}
          <TouchableOpacity
            style={styles.rolePreviewLink}
            onPress={() => router.push('/role-preview')}
          >
            <Ionicons name="swap-horizontal-outline" size={14} color={Colors.primaryCoral} />
            <Text style={styles.rolePreviewText}>Cổng chuyển đổi vai trò Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
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
    marginTop: 4,
    maxWidth: 280,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.base,
  },
  errorBannerText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginLeft: 6,
  },
  forgotText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  loginButton: {
    marginBottom: Spacing.base,
  },
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  signUpText: {
    ...Typography.body,
    color: Colors.secondaryText,
  },
  signUpLink: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  rolePreviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.base,
    paddingVertical: 8,
  },
  rolePreviewText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginLeft: 4,
  },
});
