import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { FormInput } from '../components/common/FormInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { login } = useApp();

  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('Voucher2026!');
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

  const handleLogin = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo authentication validation
      const isManagerEmail = email.toLowerCase().includes('manager');
      login(email, isManagerEmail ? 'MANAGER' : 'USER');

      if (isManagerEmail) {
        router.replace('/(manager)/dashboard');
      } else {
        router.replace('/(user)/home');
      }
    }, 800);
  };

  const handleDemoPreset = (type: 'USER' | 'MANAGER') => {
    if (type === 'USER') {
      setEmail('alex.morgan@example.com');
      setPassword('Voucher2026!');
    } else {
      setEmail('manager.sarah@brandhub.com');
      setPassword('Manager2026!');
    }
    setEmailError('');
    setPasswordError('');
    setAuthError('');
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

        {/* Quick Demo Credentials Autofill */}
        <View style={styles.presetContainer}>
          <Text style={styles.presetLabel}>Chọn nhanh tài khoản mẫu:</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity
              style={[
                styles.presetBtn,
                !email.includes('manager') && styles.presetBtnActive,
              ]}
              onPress={() => handleDemoPreset('USER')}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  !email.includes('manager') && styles.presetBtnTextActive,
                ]}
              >
                Khách hàng (User)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.presetBtn,
                email.includes('manager') && styles.presetBtnActive,
              ]}
              onPress={() => handleDemoPreset('MANAGER')}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  email.includes('manager') && styles.presetBtnTextActive,
                ]}
              >
                Quản lý (Manager)
              </Text>
            </TouchableOpacity>
          </View>
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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons (Demo presentation) */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              style={styles.socialBtn}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              style={styles.socialBtn}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

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
  presetContainer: {
    backgroundColor: Colors.lightPeach,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#FFDDC4',
  },
  presetLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  presetBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryText,
  },
  presetBtnTextActive: {
    color: Colors.white,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    fontWeight: '700',
    marginHorizontal: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  socialBtnText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryText,
    marginLeft: Spacing.sm,
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
