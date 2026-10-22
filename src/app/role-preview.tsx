import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function RolePreviewScreen() {
  const { setRole } = useApp();

  const handleSelectRole = (selectedRole: 'USER' | 'MANAGER') => {
    setRole(selectedRole);
    if (selectedRole === 'USER') {
      router.replace('/(user)/home');
    } else {
      router.replace('/(manager)/dashboard');
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            style={styles.logoBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={28} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Cổng chọn vai trò</Text>
          <Text style={styles.subtitle}>
            Chọn giao diện trải nghiệm người mua sắm hoặc bảng quản lý dành cho đối tác thương hiệu.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {/* USER Role Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleSelectRole('USER')}
            style={styles.roleCard}
          >
            <View style={[styles.roleIconCircle, { backgroundColor: Colors.lightPeach }]}>
              <Ionicons name="cart" size={32} color={Colors.primaryCoral} />
            </View>
            <View style={styles.roleInfo}>
              <View style={styles.roleTitleRow}>
                <Text style={styles.roleTitle}>Giao diện KHÁCH HÀNG</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Người dùng</Text>
                </View>
              </View>
              <Text style={styles.roleDescription}>
                Khám phá deal sốc giảm đến 80%, lưu thương hiệu yêu thích, mua voucher và sử dụng thẻ ví điện tử.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.primaryCoral} />
          </TouchableOpacity>

          {/* MANAGER Role Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleSelectRole('MANAGER')}
            style={[styles.roleCard, styles.managerCard]}
          >
            <View style={[styles.roleIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="briefcase" size={32} color="#0284C7" />
            </View>
            <View style={styles.roleInfo}>
              <View style={styles.roleTitleRow}>
                <Text style={styles.roleTitle}>Giao diện QUẢN LÝ</Text>
                <View style={[styles.roleBadge, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={[styles.roleBadgeText, { color: '#0284C7' }]}>Đối tác</Text>
                </View>
              </View>
              <Text style={styles.roleDescription}>
                Bảng điều khiển kinh doanh cho đối tác. Tạo mới voucher, chỉnh sửa chiến dịch, quản lý đơn hàng và đối soát đổi mã khách hàng.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#0284C7" />
          </TouchableOpacity>
        </View>

        {/* Disclaimer Note */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle" size={18} color={Colors.primaryCoral} />
          <Text style={styles.disclaimerText}>
            Lưu ý: Bạn có thể đổi qua lại giữa vai trò Khách hàng và Quản lý bất kỳ lúc nào từ màn hình Hồ sơ / Tài khoản.
          </Text>
        </View>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace('/login')}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Quay lại Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  title: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    maxWidth: 300,
  },
  cardContainer: {
    gap: Spacing.base,
    marginVertical: Spacing.lg,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#FFDDC4',
    ...Shadows.card,
  },
  managerCard: {
    borderColor: '#BAE6FD',
  },
  roleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roleInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleTitle: {
    ...Typography.h4,
    fontSize: 15,
    color: Colors.primaryText,
  },
  roleBadge: {
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  roleDescription: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 16,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  backBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
});
