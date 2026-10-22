import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { VoucherGrid } from '../../../components/voucher/VoucherGrid';
import { FilterBottomSheet } from '../../../components/voucher/FilterBottomSheet';
import { EmptyState } from '../../../components/common/EmptyState';
import { CATEGORIES } from '../../../constants/categories';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { FilterState, SortOption, Voucher, VoucherCategory } from '../../../types';

export default function DiscoverScreen() {
  const { vouchers, brands, toggleFavoriteVoucher } = useApp();
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>(
    (params.category as VoucherCategory) || 'All'
  );
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: (params.category as VoucherCategory) || 'All',
    brandId: (params.brandId as string) || undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minDiscount: params.minDiscount ? Number(params.minDiscount) : undefined,
  });

  useEffect(() => {
    if (params.q) setSearchQuery(params.q as string);
    if (params.category) setSelectedCategory(params.category as VoucherCategory);
  }, [params]);

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'popular', label: 'Phổ biến nhất' },
    { id: 'discount_high', label: 'Giảm nhiều nhất' },
    { id: 'price_low', label: 'Giá: Thấp đến Cao' },
    { id: 'price_high', label: 'Giá: Cao đến Thấp' },
  ];

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (v.status !== 'ACTIVE') return false;

      if (selectedCategory !== 'All' && v.category !== selectedCategory) {
        return false;
      }

      if (filters.brandId && v.brandId !== filters.brandId) {
        return false;
      }

      if (filters.maxPrice && v.sellingPrice > filters.maxPrice) {
        return false;
      }

      if (filters.minDiscount && v.discountValue < filters.minDiscount) {
        return false;
      }

      if (filters.onlyAvailable && v.availableQuantity <= 0) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(query);
        const matchesBrand = v.brandName.toLowerCase().includes(query);
        const matchesCategory = v.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBrand && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'discount_high') return b.discountValue - a.discountValue;
      if (sortBy === 'price_low') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price_high') return b.sellingPrice - a.sellingPrice;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [vouchers, selectedCategory, filters, searchQuery, sortBy]);

  const hasActiveFilters = Boolean(
    filters.brandId || filters.maxPrice || filters.minDiscount || filters.onlyAvailable
  );

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Khám Phá Ưu Đãi" subtitle="Hàng ngàn mã giảm giá từ thương hiệu hàng đầu" />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm kiếm ẩm thực, cà phê, công nghệ..."
        onFilterPress={() => setFilterModalVisible(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Category Chips Horizontal Scroll */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedCategory(cat.id);
                setFilters((prev) => ({ ...prev, category: cat.id }));
              }}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>
          {filteredVouchers.length} voucher khả dụng
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.7}
              onPress={() => setSortBy(opt.id)}
              style={[
                styles.sortChip,
                sortBy === opt.id && styles.sortChipActive,
              ]}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === opt.id && styles.sortChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 2-Column Grid or Empty State */}
      {filteredVouchers.length > 0 ? (
        <VoucherGrid
          vouchers={filteredVouchers}
          onVoucherPress={(v: Voucher) => router.push(`/(user)/vouchers/${v.id}`)}
          onFavoritePress={toggleFavoriteVoucher}
        />
      ) : (
        <EmptyState
          icon="search-outline"
          title="Không tìm thấy voucher phù hợp"
          message="Hãy thử thay đổi danh mục, điều chỉnh mức giá hoặc xóa từ khóa tìm kiếm."
          actionLabel="Xóa bộ lọc"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setFilters({ category: 'All' });
          }}
        />
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        brands={brands}
        filters={filters}
        onApplyFilters={(newFilters: FilterState) => {
          setFilters(newFilters);
          setSelectedCategory(newFilters.category);
        }}
        onClearFilters={() => {
          setFilters({ category: 'All' });
          setSelectedCategory('All');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  categoryWrapper: {
    marginBottom: Spacing.xs,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  categoryChipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginVertical: Spacing.md,
  },
  resultCount: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontWeight: '700',
    marginRight: Spacing.md,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortChipActive: {
    backgroundColor: Colors.lightPeach,
    borderColor: Colors.primaryCoral,
  },
  sortChipText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  sortChipTextActive: {
    color: Colors.primaryCoral,
    fontWeight: '700',
  },
});
