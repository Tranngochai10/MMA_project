import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-transition preview, or user can tap buttons
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Badge */}
        <LinearGradient
          colors={Colors.gradientPrimary}
          style={styles.logoBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="ticket" size={48} color={Colors.white} />
        </LinearGradient>

        <Text style={styles.appName}>Dealora<Text style={styles.appNameAccent}> Voucher</Text></Text>
        <Text style={styles.tagline}>
          Voucher thương hiệu & Sàn ưu đãi độc quyền
        </Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={Colors.primaryCoral} />
          <Text style={styles.loadingText}>Đang chuẩn bị sàn ưu đãi...</Text>
        </View>
      </View>

      {/* Quick Launch Actions */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Khám phá ngay"
          onPress={() => router.replace('/onboarding')}
          style={styles.button}
        />
        <SecondaryButton
          title="Cổng chọn vai trò (Demo)"
          onPress={() => router.replace('/role-preview')}
          style={[styles.button, { marginTop: Spacing.sm }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmCream,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.float,
  },
  appName: {
    ...Typography.h1,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  appNameAccent: {
    color: Colors.primaryCoral,
  },
  tagline: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 260,
    lineHeight: 22,
  },
  loaderContainer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    marginTop: Spacing.sm,
  },
  footer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
