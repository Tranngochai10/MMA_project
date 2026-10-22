import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { NotificationItem, NotificationType } from '../../types';

export default function NotificationsScreen() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
  } = useApp();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'PURCHASE_SUCCESS':
        return { name: 'bag-check' as const, color: Colors.success, bg: Colors.successLight };
      case 'VOUCHER_ISSUED':
        return { name: 'pricetag' as const, color: Colors.primaryCoral, bg: Colors.lightPeach };
      case 'EXPIRATION_REMINDER':
        return { name: 'alarm' as const, color: Colors.warning, bg: Colors.warningLight };
      case 'REDEMPTION_CONFIRMED':
        return { name: 'checkmark-done' as const, color: '#2563EB', bg: '#EFF6FF' };
      default:
        return { name: 'notifications' as const, color: Colors.primaryCoral, bg: Colors.lightPeach };
    }
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.actionUrl) {
      router.push(notif.actionUrl as any);
    }
  };

  return (
    <ScreenContainer scrollable>
      {/* Header with Mark All as Read button */}
      <AppHeader
        title="Thông báo"
        subtitle={`${unreadNotificationCount} thông báo chưa đọc`}
        showBack
        rightAction={
          unreadNotificationCount > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={markAllNotificationsAsRead}
              style={styles.markAllBtn}
            >
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.listContainer}>
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const iconConfig = getNotificationIcon(notif.type);
            return (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.8}
                onPress={() => handleNotificationPress(notif)}
                style={[
                  styles.notifCard,
                  !notif.isRead && styles.notifCardUnread,
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                  <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                </View>

                <View style={styles.contentCol}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.title, !notif.isRead && styles.titleUnread]}>
                      {notif.title}
                    </Text>
                    <Text style={styles.timeText}>{notif.createdAt}</Text>
                  </View>
                  <Text style={styles.message}>{notif.message}</Text>
                </View>

                {!notif.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            icon="notifications-off-outline"
            title="Không có thông báo"
            message="Bạn đã xem hết thông báo! Các cập nhật mới nhất về voucher sẽ hiển thị tại đây."
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  markAllBtn: {
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FFDDC4',
  },
  markAllText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    ...Shadows.soft,
    position: 'relative',
  },
  notifCardUnread: {
    borderColor: '#FFDDC4',
    backgroundColor: '#FFFDFB',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contentCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleUnread: {
    fontWeight: '800',
    color: Colors.primaryCoral,
  },
  timeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.tertiaryText,
  },
  message: {
    ...Typography.caption,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryCoral,
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.sm,
  },
});
