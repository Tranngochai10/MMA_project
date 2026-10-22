import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

export default function ProfileScreen() {
  const { currentUser, logout, setRole } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    router.replace('/login');
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Hoạt động Voucher',
      items: [
        {
          label: 'Lịch sử Đơn hàng',
          icon: 'receipt-outline',
          action: () => router.push('/(user)/orders'),
        },
        {
          label: 'Ví Voucher của tôi',
          icon: 'wallet-outline',
          action: () => router.push('/(user)/wallet'),
        },
        {
          label: 'Mục Yêu thích đã lưu',
          icon: 'heart-outline',
          action: () => router.push('/(user)/favorites'),
        },
        {
          label: 'Thông báo',
          icon: 'notifications-outline',
          action: () => router.push('/(user)/notifications'),
        },
      ],
    },
    {
      title: 'Chuyển đổi vai trò',
      items: [
        {
          label: 'Chuyển sang Cổng Quản lý Đối tác',
          icon: 'briefcase-outline',
          badge: 'DEMO',
          action: () => {
            setRole('MANAGER');
            router.replace('/(manager)/dashboard');
          },
        },
      ],
    },
    {
      title: 'Cài đặt & Pháp lý',
      items: [
        {
          label: 'Cài đặt ứng dụng',
          icon: 'settings-outline',
          action: () => setShowInfoModal('Tùy chọn thông báo, tiền tệ và mã bảo mật sinh trắc học đã được bật.'),
        },
        {
          label: 'Giới thiệu về Dealora',
          icon: 'information-circle-outline',
          action: () => setShowInfoModal('Dealora Mobile UI v1.0.0 — Nền tảng săn voucher ưu đãi thương hiệu và quản lý chiến dịch chuyên nghiệp.'),
        },
        {
          label: 'Điều khoản & Điều kiện',
          icon: 'document-text-outline',
          action: () => setShowInfoModal('Quy định Voucher: Tất cả ưu đãi áp dụng theo chính sách phát hành của từng thương hiệu đối tác.'),
        },
        {
          label: 'Chính sách Bảo mật',
          icon: 'shield-checkmark-outline',
          action: () => setShowInfoModal('Dữ liệu cá nhân của bạn được bảo mật tuyệt đối trên thiết bị của bạn.'),
        },
      ],
    },
  ];

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Tài Khoản" subtitle="Cài đặt tài khoản & thông tin cá nhân" />

      <View style={styles.container}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{currentUser.role === 'USER' ? 'KHÁCH HÀNG' : 'QUẢN LÝ'}</Text>
              </View>
            </View>
            <Text style={styles.email}>{currentUser.email}</Text>
            {currentUser.phone ? (
              <Text style={styles.phone}>{currentUser.phone}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(user)/edit-profile')}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primaryCoral} />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIndex) => (
          <View key={sIndex} style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIndex) => (
                <TouchableOpacity
                  key={iIndex}
                  activeOpacity={0.7}
                  onPress={item.action}
                  style={[
                    styles.menuItem,
                    iIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconWrapper}>
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

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowLogoutConfirm(true)}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy bỏ"
        isDestructive
        icon="log-out-outline"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Info Dialog */}
      <ConfirmDialog
        visible={showInfoModal !== null}
        title="Dealora"
        message={showInfoModal || ''}
        confirmLabel="Đã hiểu"
        cancelLabel="Đóng"
        icon="information-circle-outline"
        onConfirm={() => setShowInfoModal(null)}
        onCancel={() => setShowInfoModal(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primaryCoral,
  },
  userInfo: {
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
    marginLeft: Spacing.xs,
  },
  roleText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryCoral,
  },
  email: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  phone: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    marginTop: 1,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionContainer: {
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.lightPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  demoBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    paddingVertical: 14,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoutText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
});
