import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Khám phá ưu đãi độc quyền',
    description:
      'Trải nghiệm các voucher giảm giá từ những thương hiệu hàng đầu — ẩm thực, cà phê, du lịch và giải trí.',
    icon: 'sparkles' as const,
    accent: '#FF765F',
  },
  {
    id: 2,
    title: 'Săn voucher dễ dàng',
    description:
      'Tiết kiệm đến 80% so với giá gốc. Voucher được gửi tức thì vào ví điện tử cá nhân của bạn.',
    icon: 'pricetags' as const,
    accent: '#FF9D43',
  },
  {
    id: 3,
    title: 'Ví điện tử thông minh',
    description:
      'Lưu trữ, kiểm tra và sử dụng voucher mọi lúc mọi nơi. Trải nghiệm quét mã và đổi ưu đãi nhanh chóng.',
    icon: 'wallet' as const,
    accent: '#2E9D68',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const slide = SLIDES[currentIndex];

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Top Skip Button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>

        {/* Slide Visual Presentation */}
        <View style={styles.centerContent}>
          <View style={styles.illustrationWrapper}>
            <LinearGradient
              colors={Colors.gradientPeach}
              style={styles.circleBackdrop}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.iconCard, { borderColor: slide.accent }]}>
                <Ionicons name={slide.icon} size={64} color={slide.accent} />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  currentIndex === i ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          <PrimaryButton
            title={currentIndex === SLIDES.length - 1 ? 'Bắt đầu ngay' : 'Tiếp tục'}
            onPress={handleNext}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 40,
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    ...Typography.body,
    color: Colors.secondaryText,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  circleBackdrop: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  iconCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Shadows.float,
  },
  title: {
    ...Typography.h1,
    fontSize: 24,
    textAlign: 'center',
    color: Colors.primaryText,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.secondaryText,
    lineHeight: 22,
    maxWidth: 320,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primaryCoral,
  },
  bottomBar: {
    paddingVertical: Spacing.base,
  },
  actionBtn: {
    width: '100%',
  },
});
