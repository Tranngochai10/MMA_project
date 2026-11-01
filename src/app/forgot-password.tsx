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
import { PrimaryButton } from '../components/common/PrimaryButton';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSendLink = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Vui lòng nhập đúng định dạng email');
      return;
    }

    setError('Backend hiện chưa có API gửi liên kết đặt lại mật khẩu. Vui lòng liên hệ bộ phận hỗ trợ.');
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

        {/* Lock Illustration */}
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={44} color={Colors.primaryCoral} />
        </View>

        {/* Header */}
        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subtitle}>
          Nhập địa chỉ email đã đăng ký của bạn để nhận hướng dẫn đặt lại mật khẩu mới.
        </Text>

        {/* Simulation note */}
        <View style={styles.simulationBadge}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primaryCoral} />
          <Text style={styles.simulationText}>
            Tính năng đặt lại mật khẩu chưa được backend hỗ trợ.
          </Text>
        </View>

        {/* Email input */}
        <View style={styles.form}>
          <FormInput
            label="Địa chỉ Email"
            placeholder="Ví dụ: nguyenvana@example.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={error}
          />

          <PrimaryButton
            title="Kiểm tra hỗ trợ đặt lại"
            onPress={handleSendLink}
            style={styles.sendButton}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/login')}
            style={styles.backToLoginBtn}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.primaryText} />
            <Text style={styles.backToLoginText}>Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    backgroundColor: Colors.lightPeach,
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
  },
  simulationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmCream,
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  simulationText: {
    ...Typography.caption,
    color: Colors.primaryCoral,
    marginLeft: 6,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  sendButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  backToLoginText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryText,
    marginLeft: 6,
  },
});
