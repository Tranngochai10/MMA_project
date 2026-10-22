import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { ManagerStatCard } from '../../../components/manager/ManagerStatCard';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function ManagerDashboardScreen() {
  const { currentUser, managerStats, orders, managerRedemptions, setRole } = useApp();

  const assignedBrandName = currentUser.assignedBrandName || 'Starbucks Coffee';
  const recentOrders = orders.slice(0, 3);
  const recentRedemptions = managerRedemptions.slice(0, 2);

  return (
    <ScreenContainer scrollable>
      {/* Top Professional Header */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(manager)/profile')}
            style={styles.avatarRow}
          >
            <BrandLogo
              url="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80"
              name={assignedBrandName}
              size="md"
            />
            <View style={styles.headerTexts}>
              <View style={styles.brandBadgeRow}>
                <Text style={styles.brandBadgeText}>CỔNG ĐỐI TÁC</Text>
                <View style={styles.liveIndicator} />
              </View>
              <Text style={styles.brandTitle}>{assignedBrandName}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(manager)/profile')}
            style={styles.iconBtn}
          >
            <Ionicons name="person-circle-outline" size={24} color={Colors.primaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setRole('USER');
              router.replace('/(user)/home');
            }}
            style={styles.switchRoleBtn}
          >
            <Ionicons name="swap-horizontal" size={14} color={Colors.primaryCoral} />
            <Text style={styles.switchRoleText}>Khách hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Banner */}
      <View style={styles.welcomeBanner}>
        <LinearGradient
          colors={Colors.gradientPeach}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>Xin chào, {currentUser.name} 👋</Text>
            <Text style={styles.welcomeHeadline}>Bảng Điều Khiển Thương Hiệu</Text>
            <Text style={styles.welcomeSub}>
              Quản lý voucher đang chạy, theo dõi lượt đổi mã tại cửa hàng và phát hành các chương trình khuyến mãi mới.
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Thao tác Quản lý Nhanh</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(manager)/vouchers/create')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.primaryCoral }]}>
              <Ionicons name="add" size={24} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Tạo Voucher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(manager)/vouchers')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FF9D43' }]}>
              <Ionicons name="pricetags" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Vouchers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(manager)/orders')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#2E9D68' }]}>
              <Ionicons name="receipt" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(manager)/redemptions')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#2563EB' }]}>
              <Ionicons name="checkmark-done" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Đổi mã</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <SectionHeader title="Hiệu Quả Chiến Dịch" subtitle="Chỉ số hoạt động thời gian thực" />
        <View style={styles.statsRow}>
          <ManagerStatCard
            label="Chiến dịch Hoạt động"
            value={managerStats.activeVouchers}
            icon="flash"
            color={Colors.primaryCoral}
            subValue="+2 mới"
          />
          <ManagerStatCard
            label="Tổng Đơn hàng"
            value={managerStats.totalOrders}
            icon="cart"
            color="#FF9D43"
            subValue="+18.4%"
          />
        </View>

        <View style={[styles.statsRow, { marginTop: Spacing.md }]}>
          <ManagerStatCard
            label="Voucher Đã Phát hành"
            value={managerStats.issuedVouchers}
            icon="pricetag"
            color="#2563EB"
          />
          <ManagerStatCard
            label="Lượt Sử dụng"
            value={managerStats.simulatedRedemptions}
            icon="checkmark-circle"
            color={Colors.success}
            subValue="Trực tiếp"
          />
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueTop}>
            <View>
              <Text style={styles.revenueLabel}>Tổng Doanh Thu Chiến Dịch</Text>
              <Text style={styles.revenueVal}>{formatCurrency(managerStats.totalRevenue)}</Text>
            </View>
            <View style={styles.revenuePill}>
              <Ionicons name="trending-up" size={14} color={Colors.success} />
              <Text style={styles.revenuePillText}>+24% so với tháng trước</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Orders */}
      <SectionHeader
        title="Đơn Hàng Gần Đây"
        subtitle="Khách hàng vừa mua voucher"
        onAction={() => router.push('/(manager)/orders')}
      />
      <View style={styles.recentOrdersContainer}>
        {recentOrders.map((ord) => (
          <View key={ord.id} style={styles.orderItem}>
            <View style={styles.orderLeft}>
              <Text style={styles.orderId}>{ord.id}</Text>
              <Text style={styles.orderTitle} numberOfLines={1}>
                {ord.voucherTitle}
              </Text>
              <Text style={styles.orderDate}>{formatDate(ord.createdAt)}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderAmount}>{formatCurrency(ord.amount)}</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>
                  {ord.status === 'PAID' ? 'ĐÃ THANH TOÁN' : ord.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Simulated Redemptions */}
      <SectionHeader
        title="Lượt Đổi Mã Tại Cửa Hàng"
        subtitle="Mã ưu đãi vừa được quét xác thực"
        onAction={() => router.push('/(manager)/redemptions')}
      />
      <View style={styles.recentOrdersContainer}>
        {recentRedemptions.map((red) => (
          <View key={red.id} style={styles.orderItem}>
            <View style={styles.orderLeft}>
              <Text style={styles.redCode}>{red.voucherCode}</Text>
              <Text style={styles.redCustomer}>Khách hàng: {red.customerName}</Text>
              <Text style={styles.orderDate}>Đã dùng: {red.redeemedDate}</Text>
            </View>
            <View style={styles.confirmedBadge}>
              <Ionicons name="checkmark-done" size={12} color="#1E40AF" />
              <Text style={styles.confirmedBadgeText}>ĐÃ XÁC THỰC</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    marginLeft: Spacing.sm,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryCoral,
    letterSpacing: 0.5,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginLeft: 4,
  },
  brandTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    fontSize: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
    marginRight: Spacing.xs,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FFDDC4',
  },
  switchRoleText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginLeft: 3,
  },
  welcomeBanner: {
    margin: Spacing.base,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    ...Shadows.card,
  },
  welcomeGradient: {
    padding: Spacing.base,
  },
  welcomeContent: {},
  welcomeGreeting: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  welcomeHeadline: {
    ...Typography.h3,
    color: Colors.primaryText,
    marginTop: 2,
  },
  welcomeSub: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginTop: 4,
    lineHeight: 18,
  },
  quickActionsContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  quickActionsTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.secondaryText,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    width: '23%',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryText,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
  },
  revenueCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  revenueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontWeight: '600',
  },
  revenueVal: {
    ...Typography.h2,
    color: Colors.primaryCoral,
    marginTop: 2,
  },
  revenuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.card,
  },
  revenuePillText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.success,
    marginLeft: 3,
  },
  recentOrdersContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    ...Shadows.card,
  },
  orderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  orderId: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  orderTitle: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  orderDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.tertiaryText,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primaryCoral,
  },
  paidBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  paidBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: Colors.success,
  },
  redCode: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primaryCoral,
    letterSpacing: 1,
  },
  redCustomer: {
    ...Typography.caption,
    color: Colors.primaryText,
    marginTop: 1,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  confirmedBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#1E40AF',
    marginLeft: 3,
  },
});
