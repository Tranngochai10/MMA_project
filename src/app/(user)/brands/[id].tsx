import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { VoucherGrid } from '../../../components/voucher/VoucherGrid';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { Voucher } from '../../../types';

export default function BrandDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getBrandById, vouchers, toggleFavoriteBrand, toggleFavoriteVoucher } = useApp();

  const brand = getBrandById(id as string);

  if (!brand) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="alert-circle-outline"
          title="Brand Not Found"
          message="We could not find the specified brand."
          actionLabel="Back to Brands"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const brandVouchers = vouchers.filter((v) => v.brandId === brand.id && v.status === 'ACTIVE');

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      {/* Cover Image & Header Controls */}
      <View style={styles.coverWrapper}>
        <Image source={{ uri: brand.coverImage }} style={styles.coverImage} />
        <View style={styles.coverOverlay} />

        {/* Back and Favorite Floating Buttons */}
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.floatingBtn}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.primaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleFavoriteBrand(brand.id)}
            style={styles.floatingBtn}
          >
            <Ionicons
              name={brand.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={brand.isFavorite ? Colors.primaryCoral : Colors.secondaryText}
            />
          </TouchableOpacity>
        </View>

        {/* Brand Circular Logo Badge */}
        <View style={styles.brandLogoPosition}>
          <BrandLogo url={brand.logo} name={brand.name} size="xl" />
        </View>
      </View>

      {/* Brand Info Section */}
      <View style={styles.infoCard}>
        <View style={styles.nameRow}>
          <Text style={styles.brandName}>{brand.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{brand.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.categoryTag}>{brand.category}</Text>
        <Text style={styles.description}>{brand.description}</Text>

        {/* Key Features / Badges */}
        <View style={styles.badgesRow}>
          <View style={styles.featurePill}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
            <Text style={styles.featurePillText}>Đối tác chính thức</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="pricetag" size={14} color={Colors.primaryCoral} />
            <Text style={styles.featurePillText}>{brandVouchers.length} Ưu đãi khả dụng</Text>
          </View>
        </View>

        {/* Brand Policy / Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Điều Kiện Áp Dụng Chung:</Text>
          <Text style={styles.termsBody}>
            • Áp dụng trên toàn quốc tại hệ thống cửa hàng chính hãng và website đối tác.{'\n'}
            • Không áp dụng đồng thời với các chương trình khuyến mãi khác.{'\n'}
            • Voucher có giá trị sử dụng một lần trước ngày hết hạn quy định.
          </Text>
        </View>
      </View>

      {/* Available Vouchers */}
      <SectionHeader
        title="Voucher Đang Phát Hành"
        subtitle={`Các mã giảm giá hấp dẫn từ ${brand.name}`}
      />

      {brandVouchers.length > 0 ? (
        <VoucherGrid
          vouchers={brandVouchers}
          onVoucherPress={(v: Voucher) => router.push(`/(user)/vouchers/${v.id}`)}
          onFavoritePress={toggleFavoriteVoucher}
        />
      ) : (
        <EmptyState
          icon="ticket-outline"
          title="Chưa Có Voucher Hoạt Động"
          message={`${brand.name} hiện chưa phát hành chiến dịch voucher mới. Bạn hãy quay lại sau nhé!`}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  coverWrapper: {
    height: 200,
    position: 'relative',
    backgroundColor: Colors.lightPeach,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  floatingHeader: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  brandLogoPosition: {
    position: 'absolute',
    bottom: -44,
    left: Spacing.base,
  },
  infoCard: {
    backgroundColor: Colors.white,
    marginTop: 50,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandName: {
    ...Typography.h2,
    color: Colors.primaryText,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 3,
  },
  categoryTag: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primaryCoral,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  description: {
    ...Typography.body,
    color: Colors.secondaryText,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmCream,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featurePillText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primaryText,
    marginLeft: 4,
  },
  termsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  termsTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  termsBody: {
    ...Typography.caption,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
});
