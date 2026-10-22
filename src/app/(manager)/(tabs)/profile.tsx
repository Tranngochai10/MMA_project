import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  action: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ManagerProfileScreen() {
  const { currentUser, logout, setRole } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    router.replace('/login');
  };

  const menuItems: MenuSection[] = [
    {
      title: 'Chuyển đổi giao diện',
      items: [
        {
          label: 'Chuyển sang Chế độ Khách hàng (User)',
          icon: 'cart-outline' as const,
          badge: 'DEMO',
          action: () => {
            setRole('USER');
            router.replace('/(user)/home');
          },
        },
      ],
    },
    {
      title: 'Quản trị Cổng Đối tác',
      items: [
        {
          label: 'Thông báo Chiến dịch & Số lượng',
          icon: 'notifications-outline' as const,
          action: () =>
            setShowInfoModal(
              'Cảnh báo chiến dịch: Nhận thông báo tức thì qua ứng dụng và email khi số lượng voucher còn lại dưới 10%.'
            ),
        },
        {
          label: 'Bảo mật & Phân quyền Nhân viên',
          icon: 'shield-checkmark-outline' as const,
          action: () =>
            setShowInfoModal(
              'Tài khoản quản lý được bảo vệ với xác thực 2 lớp (2FA). Đã kích hoạt quyền quản trị viên thương hiệu.'
            ),
        },
        {
          label: 'Hồ sơ Thương hiệu & Thư viện Hình ảnh',
          icon: 'business-outline' as const,
          action: () =>
            setShowInfoModal(
              'Tài nguyên thương hiệu: Logo vector, banner quảng bá độ phân giải cao và điều khoản áp dụng khuyến mãi đã đồng bộ.'
            ),
        },
        {
          label: 'Thỏa thuận Hợp tác Đối tác',
          icon: 'document-text-outline' as const,
          action: () =>
            setShowInfoModal(
              'Chính sách đối tác: Miễn 100% phí hoa hồng sàn trong giai đoạn ưu đãi phát triển cộng đồng.'
            ),
        },
      ],
    },
  ];

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Hồ Sơ Quản Lý"
        subtitle="Quản trị viên thương hiệu đối tác"
        showBack={false}
      />

      <View style={styles.container}>
        {/* Manager Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>QUẢN LÝ</Text>
              </View>
            </View>
            <Text style={styles.email}>{currentUser.email}</Text>
            <View style={styles.brandRow}>
              <Ionicons name="storefront" size={12} color={Colors.primaryCoral} />
              <Text style={styles.brandName}>
                {currentUser.assignedBrandName || 'Starbucks Coffee'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  activeOpacity={0.7}
                  onPress={item.action}
                  style={[
                    styles.menuRow,
                    iIdx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconCircle}>
                      <Ionicons name={item.icon} size={20} color={Colors.primaryCoral} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>

                  <View style={styles.menuRight}>
                    {item.badge ? (
                      <View style={styles.demoBadge}>
                        <Text style={styles.demoBadgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                    <Ionicons name="chevron-forward" size={18} color={Colors.tertiaryText} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowLogoutConfirm(true)}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản Quản lý</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Quản lý không?"
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy bỏ"
        isDestructive
        icon="log-out-outline"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        visible={showInfoModal !== null}
        title="Cổng Đối Tác"
        message={showInfoModal || ''}
        confirmLabel="Đã hiểu"
        cancelLabel="Đóng"
        icon="business-outline"
        onConfirm={() => setShowInfoModal(null)}
        onCancel={() => setShowInfoModal(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primaryCoral,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...Typography.h4,
    color: Colors.primaryText,
  },
  roleBadge: {
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  roleText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryCoral,
  },
  email: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  brandName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginLeft: 4,
  },
  sectionWrap: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.secondaryText,
    marginBottom: Spacing.xs,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  menuLabel: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.primaryText,
    flex: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: 6,
  },
  demoBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#1E40AF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
});
