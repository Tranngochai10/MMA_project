import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { RemoteImage } from './RemoteImage';
import { CartButton } from './CartButton';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  showUserGreeting?: boolean;
  showNotifications?: boolean;
  showOrders?: boolean;
  showCart?: boolean;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showHome = showBack,
  onBack,
  showUserGreeting = false,
  showNotifications = !showBack,
  showOrders = !showBack,
  showCart = true,
  rightAction,
  style,
}) => {
  const { currentUser, unreadNotificationCount, role } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(role === 'MANAGER' ? '/manager/dashboard' : '/(user)/(tabs)/home');
    }
  };

  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.primaryText} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            {!!title && <Text style={styles.headerTitle}>{title}</Text>}
            {!!subtitle && <Text style={styles.headerSubtitle} numberOfLines={2}>{subtitle}</Text>}
          </View>
          </>
        ) : showUserGreeting ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(role === 'MANAGER' ? '/manager/profile' : '/(user)/profile')}
            style={styles.avatarRow}
          >
            <RemoteImage
              uri={currentUser.avatarUrl}
              fallbackIcon="person-outline"
              style={styles.avatar}
            />
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greetingGreeting}>Xin chào</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                {currentUser.name || 'Chào mừng bạn'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View>
            {title && <Text style={styles.headerTitle}>{title}</Text>}
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      <View style={styles.rightContainer}>
        {showHome && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={role === 'MANAGER' ? 'Về bảng điều khiển' : 'Về trang chủ'}
            activeOpacity={0.7}
            onPress={() => router.dismissTo(role === 'MANAGER' ? '/manager/dashboard' : '/(user)/(tabs)/home')}
            style={[styles.iconButton, { marginRight: Spacing.sm }]}
          >
            <Ionicons name="home-outline" size={20} color={Colors.primaryText} />
          </TouchableOpacity>
        )}
        {rightAction ? (
          rightAction
        ) : (
          <>
            {showCart && role !== 'MANAGER' && <View style={{ marginRight: Spacing.sm }}><CartButton /></View>}
            {showNotifications && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Thông báo"
                activeOpacity={0.7}
                onPress={() => router.push('/(user)/notifications')}
                style={styles.iconButton}
              >
                <Ionicons name="notifications-outline" size={20} color={Colors.primaryText} />
                {unreadNotificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {showOrders && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Đơn hàng"
                activeOpacity={0.7}
                onPress={() => router.push(role === 'MANAGER' ? '/manager/orders' : '/(user)/orders')}
                style={[styles.iconButton, { marginLeft: Spacing.sm }]}
              >
                <Ionicons name="receipt-outline" size={20} color={Colors.primaryText} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.warmCream,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primaryCoral,
  },
  greetingTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: Spacing.md,
  },
  greetingGreeting: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  greetingName: {
    ...Typography.h4,
    color: Colors.primaryText,
    maxWidth: 160,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    color: Colors.primaryText,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    ...Shadows.soft,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primaryCoral,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
