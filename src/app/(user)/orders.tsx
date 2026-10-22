import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type TabOption = 'ALL' | OrderStatus;

export default function OrdersScreen() {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<TabOption>('ALL');

  const tabs: { id: TabOption; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PAID', label: 'Đã thanh toán' },
    { id: 'PENDING', label: 'Chờ xử lý' },
    { id: 'FAILED', label: 'Thất bại' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return { bg: Colors.successLight, color: Colors.success, label: 'Đã thanh toán' };
      case 'PENDING':
        return { bg: Colors.warningLight, color: Colors.warning, label: 'Chờ xử lý' };
      case 'CANCELLED':
        return { bg: Colors.disabled, color: Colors.secondaryText, label: 'Đã hủy' };
      case 'FAILED':
        return { bg: Colors.errorLight, color: Colors.error, label: 'Thất bại' };
    }
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Lịch Sử Đơn Hàng" subtitle="Theo dõi và quản lý các giao dịch voucher" showBack />

      {/* Status Filter Tabs - Fixed Horizontal Layout */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
          style={styles.tabsScrollView}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabChip,
                  isSelected && styles.tabChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isSelected && styles.tabChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <View style={styles.listContainer}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() => router.push(`/(user)/orders/${order.id}`)}
                style={styles.orderCard}
              >
                <View style={styles.cardTop}>
                  <View style={styles.orderIdCol}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.itemRow}>
                  <BrandLogo url={order.brandLogo} name={order.brandName} size="sm" />
                  <View style={styles.itemInfo}>
                    <Text style={styles.brandName}>{order.brandName}</Text>
                    <Text style={styles.voucherTitle} numberOfLines={1}>
                      {order.voucherTitle}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.paymentMethodText}>
                    Qua {order.paymentMethod.split('(')[0]}
                  </Text>
                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>Chi tiết đơn</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primaryCoral} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="Không có đơn hàng nào"
            message="Bạn chưa có đơn hàng nào trong trạng thái này."
            actionLabel="Khám Phá Ưu Đãi"
            onAction={() => router.push('/(user)/discover')}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    height: 48,
    marginBottom: Spacing.sm,
  },
  tabsScrollView: {
    flexGrow: 0,
    height: 48,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  tabChipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  tabChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdCol: {},
  orderId: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  brandName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  voucherTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  orderAmount: {
    ...Typography.h4,
    color: Colors.primaryCoral,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
  },
  paymentMethodText: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    ...Typography.caption,
    color: Colors.primaryCoral,
    fontWeight: '700',
    marginRight: 2,
  },
});
