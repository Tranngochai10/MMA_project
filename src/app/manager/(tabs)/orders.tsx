import { VoucherStatusBadge } from '../../../components/voucher/VoucherStatusBadge';
import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { EmptyState } from '../../../components/common/EmptyState';
import { OrderPaymentModal } from '../../../components/manager/OrderPaymentModal';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { Order } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function ManagerOrdersScreen() {
  const { managerRecentOrders: orders, refreshAccountData } = useApp();
  useFocusEffect(useCallback(() => { void refreshAccountData(); }, [refreshAccountData]));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  const statuses = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PAID', label: 'Đã thanh toán' },
    { id: 'PENDING', label: 'Chờ xử lý' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus !== 'ALL' && o.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesTitle = o.voucherTitle.toLowerCase().includes(q);
        const matchesBrand = o.brandName.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesBrand) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Quản Lý Đơn Hàng"
        subtitle="Lịch sử giao dịch mua voucher từ khách hàng"
        showBack={false}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm mã đơn hàng hoặc tên voucher..."
        showFilterButton={false}
      />

      {/* Status Filter Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
          style={{ flexGrow: 0 }}
        >
          {statuses.map((st) => (
            <TouchableOpacity
              key={st.id}
              activeOpacity={0.7}
              onPress={() => setSelectedStatus(st.id)}
              style={[
                styles.chip,
                selectedStatus === st.id && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedStatus === st.id && styles.chipTextActive,
                ]}
              >
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <View style={styles.listContainer}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((ord) => (
            <TouchableOpacity
              key={ord.id}
              activeOpacity={0.88}
              onPress={() => setInspectedOrder(ord)}
              style={styles.orderCard}
            >
              <View style={styles.orderHeader}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text selectable numberOfLines={1} style={styles.orderId}>{ord.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(ord.createdAt)}</Text>
                </View>
                <VoucherStatusBadge status={ord.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.bodyRow}>
                <View style={styles.texts}>
                  <Text style={styles.brandName}>{ord.brandName}</Text>
                  <Text style={styles.voucherTitle}>{ord.voucherTitle}</Text>
                  <Text style={styles.paymentMethod}>Thanh toán: {ord.paymentMethod}</Text>
                </View>
                <Text style={styles.amount}>{formatCurrency(ord.amount)}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="Không tìm thấy đơn hàng"
            message="Không có đơn hàng nào khớp với điều kiện tìm kiếm."
          />
        )}
      </View>

      {/* Order Inspection Dialog */}
      {inspectedOrder && (
        <OrderPaymentModal order={inspectedOrder} onClose={() => setInspectedOrder(null)} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsWrapper: {
    height: 48,
    flexGrow: 0,
    marginBottom: Spacing.xs,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  orderId: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
    fontSize: 13,
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusPaid: {
    backgroundColor: Colors.successLight,
  },
  statusOther: {
    backgroundColor: Colors.disabled,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  texts: {
    flex: 1,
    marginRight: Spacing.sm,
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
    marginTop: 2,
    fontSize: 16,
    lineHeight: 23,
  },
  paymentMethod: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    marginTop: 4,
  },
  amount: {
    ...Typography.h4,
    color: Colors.primaryCoral,
    fontWeight: '800',
  },
});
