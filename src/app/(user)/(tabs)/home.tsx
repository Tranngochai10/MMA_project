import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { SearchBar } from '../../../components/common/SearchBar';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { BrandCard } from '../../../components/brand/BrandCard';
import { VoucherGrid } from '../../../components/voucher/VoucherGrid';
import { VoucherCard } from '../../../components/voucher/VoucherCard';
import { FilterBottomSheet } from '../../../components/voucher/FilterBottomSheet';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { FilterState, Voucher } from '../../../types';

export default function HomeScreen() {
  const { brands, vouchers, toggleFavoriteVoucher } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ category: 'All' });

  const featuredBrands = brands.slice(0, 7);

  const specialForYou = vouchers.filter((v) => v.status === 'ACTIVE').slice(0, 4);
  const trendingDeals = vouchers.filter((v) => v.trending && v.status === 'ACTIVE').slice(0, 4);
  const newArrivals = vouchers.filter((v) => v.newArrival && v.status === 'ACTIVE');

  const handleSearchSubmit = () => {
    router.push({
      pathname: '/(user)/discover',
      params: { q: searchQuery },
    });
  };

  const handleVoucherPress = (voucher: Voucher) => {
    router.push(`/(user)/vouchers/${voucher.id}`);
  };

  return (
    <ScreenContainer scrollable>
      {/* 1. Header with Avatar Greeting & Badges */}
      <AppHeader showUserGreeting showNotifications showOrders />

      {/* 2. Search & Filter Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchSubmit}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      {/* 3. Promotional Banner Matching Reference Image */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={Colors.gradientPeach}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.bannerTag}>
              <Ionicons name="flash" size={12} color={Colors.white} />
              <Text style={styles.bannerTagText}>ƯU ĐÃI ĐẶC QUYỀN</Text>
            </View>

            <Text style={styles.bannerHeadline}>GIẢM ĐẾN 80%</Text>
            <Text style={styles.bannerSubtext}>
              Hàng ngàn voucher độc quyền từ các thương hiệu yêu thích
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/(user)/discover')}
              style={styles.bannerCta}
            >
              <Text style={styles.bannerCtaText}>Khám phá ngay</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerRight}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
              }}
              style={styles.bannerIllustration}
            />
          </View>
        </LinearGradient>
      </View>

      {/* 4. Featured Brands (Horizontal Circular Logos) */}
      <SectionHeader
        title="Thương Hiệu Nổi Bật"
        subtitle="Đối tác ưu đãi chính hãng"
        onAction={() => router.push('/(user)/brands')}
      />
      <View style={styles.brandsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandsScroll}
          style={{ flexGrow: 0 }}
        >
          {featuredBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              variant="circle"
              onPress={() => router.push(`/(user)/brands/${brand.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 5. Special For You (2-Column Voucher Grid) */}
      <SectionHeader
        title="Dành Riêng Cho Bạn"
        subtitle="Mã giảm giá phù hợp với bạn"
        onAction={() => router.push('/(user)/discover')}
      />
      <VoucherGrid
        vouchers={specialForYou}
        onVoucherPress={handleVoucherPress}
        onFavoritePress={toggleFavoriteVoucher}
      />

      {/* 6. Trending Deals Section */}
      <SectionHeader
        title="Ưu Đãi Hot 🔥"
        subtitle="Được săn đón nhiều nhất tuần qua"
        onAction={() => router.push('/(user)/discover')}
      />
      <View style={styles.horizontalVouchersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalVouchersScroll}
          style={{ flexGrow: 0 }}
        >
          {trendingDeals.map((v) => (
            <View key={v.id} style={styles.horizontalCardWrap}>
              <VoucherCard
                voucher={v}
                onPress={() => handleVoucherPress(v)}
                onFavoritePress={() => toggleFavoriteVoucher(v.id)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 7. New Arrivals */}
      {newArrivals.length > 0 && (
        <>
          <SectionHeader
            title="Mới Ra Mắt ✨"
            subtitle="Các chương trình khuyến mãi vừa cập nhật"
            onAction={() => router.push('/(user)/discover')}
          />
          <VoucherGrid
            vouchers={newArrivals}
            onVoucherPress={handleVoucherPress}
            onFavoritePress={toggleFavoriteVoucher}
          />
        </>
      )}

      {/* Filter Bottom Sheet Modal */}
      <FilterBottomSheet
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        brands={brands}
        filters={filters}
        onApplyFilters={(f: FilterState) => {
          setFilters(f);
          router.push({
            pathname: '/(user)/discover',
            params: {
              category: f.category,
              brandId: f.brandId || '',
              maxPrice: f.maxPrice ? String(f.maxPrice) : '',
              minDiscount: f.minDiscount ? String(f.minDiscount) : '',
            },
          });
        }}
        onClearFilters={() => setFilters({ category: 'All' })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  bannerGradient: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFDDC4',
    ...Shadows.card,
    overflow: 'hidden',
  },
  bannerLeft: {
    flex: 1.3,
    paddingRight: Spacing.sm,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryCoral,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 3,
  },
  bannerHeadline: {
    ...Typography.h2,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryText,
    letterSpacing: -0.5,
  },
  bannerSubtext: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryCoral,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.card,
    alignSelf: 'flex-start',
    ...Shadows.soft,
  },
  bannerCtaText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  bannerRight: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.soft,
  },
  brandsWrapper: {
    marginBottom: Spacing.xs,
  },
  brandsScroll: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    alignItems: 'center',
  },
  horizontalVouchersWrapper: {
    marginBottom: Spacing.sm,
  },
  horizontalVouchersScroll: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
  },
  horizontalCardWrap: {
    width: 180,
    marginRight: Spacing.md,
  },
});
