import React, { useState } from 'react';
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
import { VoucherGrid } from '../../../components/voucher/VoucherGrid';
import { BrandCard } from '../../../components/brand/BrandCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { Voucher } from '../../../types';

export default function FavoritesScreen() {
  const { vouchers, brands, toggleFavoriteVoucher, toggleFavoriteBrand } = useApp();
  const [activeTab, setActiveTab] = useState<'VOUCHERS' | 'BRANDS'>('VOUCHERS');

  const favoriteVouchers = vouchers.filter((v) => v.isFavorite);
  const favoriteBrands = brands.filter((b) => b.isFavorite);

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Mục Yêu Thích" subtitle="Truy cập nhanh voucher và thương hiệu bạn quan tâm" />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('VOUCHERS')}
          style={[styles.tab, activeTab === 'VOUCHERS' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'VOUCHERS' && styles.tabTextActive]}>
            Vouchers ({favoriteVouchers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('BRANDS')}
          style={[styles.tab, activeTab === 'BRANDS' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'BRANDS' && styles.tabTextActive]}>
            Thương hiệu ({favoriteBrands.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'VOUCHERS' ? (
        favoriteVouchers.length > 0 ? (
          <VoucherGrid
            vouchers={favoriteVouchers}
            onVoucherPress={(v: Voucher) => router.push(`/(user)/vouchers/${v.id}`)}
            onFavoritePress={toggleFavoriteVoucher}
          />
        ) : (
          <EmptyState
            icon="heart-outline"
            title="Chưa Có Voucher Yêu Thích"
            message="Chạm vào biểu tượng trái tim trên bất kỳ voucher nào để lưu lại mua nhanh."
            actionLabel="Khám Phá Ưu Đãi"
            onAction={() => router.push('/(user)/discover')}
          />
        )
      ) : favoriteBrands.length > 0 ? (
        <View style={styles.brandsContainer}>
          {favoriteBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              variant="card"
              onPress={() => router.push(`/(user)/brands/${brand.id}`)}
              onFavoritePress={() => toggleFavoriteBrand(brand.id)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="storefront-outline"
          title="Chưa Có Thương Hiệu Yêu Thích"
          message="Lưu các thương hiệu bạn yêu thích để dễ dàng theo dõi các chiến dịch ưu đãi mới."
          actionLabel="Khám Phá Thương Hiệu"
          onAction={() => router.push('/(user)/brands')}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabActive: {
    backgroundColor: Colors.lightPeach,
  },
  tabText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  tabTextActive: {
    color: Colors.primaryCoral,
    fontWeight: '700',
  },
  brandsContainer: {
    paddingHorizontal: Spacing.base,
  },
});
