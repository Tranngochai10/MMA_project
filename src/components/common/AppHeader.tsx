import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showUserGreeting?: boolean;
  showNotifications?: boolean;
  showOrders?: boolean;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showUserGreeting = false,
  showNotifications = true,
  showOrders = true,
  rightAction,
  style,
}) => {
  const { currentUser, unreadNotificationCount, role } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.primaryText} />
          </TouchableOpacity>
        ) : showUserGreeting ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(role === 'MANAGER' ? '/(manager)/profile' : '/(user)/profile')}
            style={styles.avatarRow}
          >
            <Image
              source={{ uri: currentUser.avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greetingGreeting}>Xin chào 👋</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                {currentUser.name}
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
        {rightAction ? (
          rightAction
        ) : (
          <>
            {showNotifications && (
              <TouchableOpacity
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
                activeOpacity={0.7}
                onPress={() => router.push(role === 'MANAGER' ? '/(manager)/orders' : '/(user)/orders')}
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
    paddingVertical: Spacing.md,
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
    fontSize: 20,
    color: Colors.primaryText,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
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
    fontSize: 10,
    fontWeight: '700',
  },
});
