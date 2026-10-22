import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { WalletVoucherCard } from '../../../components/voucher/WalletVoucherCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { WalletVoucherStatus } from '../../../types';

type WalletTab = 'ALL' | WalletVoucherStatus;

export default function WalletScreen() {
  const { walletVouchers } = useApp();
  const [activeTab, setActiveTab] = useState<WalletTab>('ALL');

  const tabs: { id: WalletTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'Tất cả', count: walletVouchers.length },
    {
      id: 'AVAILABLE',
      label: 'Khả dụng',
      count: walletVouchers.filter((w) => w.status === 'AVAILABLE').length,
    },
    {
      id: 'REDEEMED',
      label: 'Đã dùng',
      count: walletVouchers.filter((w) => w.status === 'REDEEMED').length,
    },
    {
      id: 'EXPIRED',
      label: 'Hết hạn',
      count: walletVouchers.filter((w) => w.status === 'EXPIRED').length,
    },
  ];

  const filteredVouchers = useMemo(() => {
    if (activeTab === 'ALL') return walletVouchers;
    return walletVouchers.filter((w) => w.status === activeTab);
  }, [walletVouchers, activeTab]);

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <AppHeader
        title="Ví Voucher Của Tôi"
        subtitle="Quản lý và kích hoạt sử dụng voucher đã mua"
      />

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
          style={{ flexGrow: 0 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabChip,
                activeTab === tab.id && styles.tabChipActive,
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  activeTab === tab.id && styles.tabChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  activeTab === tab.id && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    activeTab === tab.id && styles.countTextActive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Voucher List or Empty State */}
      <View style={styles.listContainer}>
        {filteredVouchers.length > 0 ? (
          filteredVouchers.map((v) => (
            <WalletVoucherCard
              key={v.id}
              walletVoucher={v}
              onPress={() => router.push(`/(user)/wallet/${v.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="Chưa có voucher trong mục này"
            message="Hãy khám phá các chương trình khuyến mãi và chọn mua các voucher giảm giá hấp dẫn."
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
    marginBottom: Spacing.md,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    height: 38,
    justifyContent: 'center',
  },
  tabChipActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  tabChipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.secondaryText,
    marginRight: 6,
  },
  tabChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Colors.warmCream,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  countTextActive: {
    color: Colors.white,
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
  },
});
