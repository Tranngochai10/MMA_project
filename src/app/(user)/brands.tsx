import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { BrandCard } from '../../components/brand/BrandCard';
import { EmptyState } from '../../components/common/EmptyState';
import { CATEGORIES } from '../../constants/categories';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { VoucherCategory } from '../../types';

export default function BrandsScreen() {
  const { brands, toggleFavoriteBrand } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>('All');

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      if (selectedCategory !== 'All' && brand.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = brand.name.toLowerCase().includes(query);
        const matchesCategory = brand.category.toLowerCase().includes(query);
        const matchesDesc = brand.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }
      return true;
    });
  }, [brands, selectedCategory, searchQuery]);

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <AppHeader
        title="Thương Hiệu Đối Tác"
        subtitle="Khám phá các thương hiệu đối tác và ưu đãi độc quyền"
        showBack
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm Starbucks, Phúc Long, Highland..."
        showFilterButton={false}
      />

      {/* Category Filter Horizontal Scroll */}
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
              onPress={() => setSelectedCategory(cat.id)}
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

      {/* Brands List */}
      <View style={styles.listContainer}>
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              variant="card"
              onPress={() => router.push(`/(user)/brands/${brand.id}`)}
              onFavoritePress={() => toggleFavoriteBrand(brand.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="storefront-outline"
            title="Không tìm thấy thương hiệu"
            message="Không có thương hiệu nào phù hợp với bộ lọc tìm kiếm."
            actionLabel="Đặt lại bộ lọc"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  categoryWrapper: {
    height: 48,
    flexGrow: 0,
    marginBottom: Spacing.xs,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
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
  listContainer: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
});
