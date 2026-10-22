import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';

export default function ManagerRedemptionsScreen() {
  const { managerRedemptions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRedemptions = useMemo(() => {
    if (!searchQuery.trim()) return managerRedemptions;
    const q = searchQuery.toLowerCase();
    return managerRedemptions.filter(
      (r) =>
        r.voucherTitle.toLowerCase().includes(q) ||
        r.voucherCode.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
    );
  }, [managerRedemptions, searchQuery]);

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Lịch Sử Sử Dụng Mã"
        subtitle="Nhật ký xác thực mã voucher tại điểm bán"
        showBack={false}
      />

      {/* Prominent Simulation Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Ionicons name="information-circle" size={20} color={Colors.primaryCoral} />
        <View style={styles.disclaimerTexts}>
          <Text style={styles.disclaimerTitle}>Hệ Thống Xác Thực Ưu Đãi</Text>
          <Text style={styles.disclaimerSub}>
            Nhật ký sử dụng được ghi nhận tức thì khi khách hàng kích hoạt voucher từ Ví điện tử. Hỗ trợ đối tác quản lý lượt sử dụng minh bạch.
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm mã voucher, tên khách hàng hoặc ưu đãi..."
        showFilterButton={false}
      />

      <View style={styles.listContainer}>
        {filteredRedemptions.length > 0 ? (
          filteredRedemptions.map((red) => (
            <View key={red.id} style={styles.redemptionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.codeWrap}>
                  <Text style={styles.codeLabel}>Mã Voucher</Text>
                  <Text style={styles.codeValue}>{red.voucherCode}</Text>
                </View>

                <View style={styles.badge}>
                  <Ionicons name="checkmark-done" size={14} color="#1E40AF" />
                  <Text style={styles.badgeText}>ĐÃ SỬ DỤNG</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.voucherTitle}>{red.voucherTitle}</Text>

              <View style={styles.metaRow}>
                <View style={styles.customerCol}>
                  <Ionicons name="person-outline" size={14} color={Colors.secondaryText} />
                  <Text style={styles.customerName}>{red.customerName}</Text>
                </View>
                <View style={styles.dateCol}>
                  <Ionicons name="time-outline" size={14} color={Colors.secondaryText} />
                  <Text style={styles.dateText}>{red.redeemedDate}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="Chưa Có Lượt Sử Dụng"
            message="Các lượt đổi mã voucher của khách hàng sẽ được hiển thị đầy đủ tại đây."
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightPeach,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FFDDC4',
  },
  disclaimerTexts: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  disclaimerTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  disclaimerSub: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
  },
  redemptionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeWrap: {},
  codeLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  codeValue: {
    ...Typography.h4,
    color: Colors.primaryCoral,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    marginLeft: 3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  voucherTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primaryText,
    marginLeft: 4,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: 4,
  },
});
