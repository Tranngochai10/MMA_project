import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { VoucherStatusBadge } from '../../../components/voucher/VoucherStatusBadge';
import { PriceDisplay } from '../../../components/voucher/PriceDisplay';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatDate } from '../../../utils/formatters';

export default function VoucherDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { getVoucherById, toggleFavoriteVoucher } = useApp();

  const [shareSuccess, setShareSuccess] = useState(false);

  const voucher = getVoucherById(id as string);

  if (!voucher) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy voucher"
          message="Chúng tôi không thể tìm thấy thông tin chi tiết của voucher này."
          actionLabel="Quay lại khám phá"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const isBuyable = voucher.status === 'ACTIVE' && voucher.availableQuantity > 0;

  const handleShare = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  const handleBuy = () => {
    if (!isBuyable) return;
    router.push({
      pathname: '/(user)/checkout',
      params: { voucherId: voucher.id },
    });
  };

  return (
    <View style={styles.outerContainer}>
      <ScreenContainer scrollable contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
        {/* Cover Image & Floating Actions */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: voucher.coverImage }} style={styles.image} />
          <View style={styles.floatingNav}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={styles.floatingIconBtn}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.primaryText} />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={styles.floatingIconBtn}
              >
                <Ionicons
                  name={shareSuccess ? 'checkmark-circle' : 'share-social-outline'}
                  size={20}
                  color={shareSuccess ? Colors.success : Colors.primaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleFavoriteVoucher(voucher.id)}
                style={[styles.floatingIconBtn, { marginLeft: Spacing.sm }]}
              >
                <Ionicons
                  name={voucher.isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={voucher.isFavorite ? Colors.primaryCoral : Colors.primaryText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Pill */}
          <View style={styles.discountFloatingPill}>
            <Text style={styles.discountFloatingText}>{voucher.discountDisplay}</Text>
          </View>
        </View>

        {/* Share notification banner if triggered */}
        {shareSuccess && (
          <View style={styles.shareBanner}>
            <Ionicons name="link-outline" size={16} color={Colors.success} />
            <Text style={styles.shareBannerText}>Đã sao chép liên kết voucher vào bộ nhớ tạm!</Text>
          </View>
        )}

        {/* Brand Bar Header */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/(user)/brands/${voucher.brandId}`)}
          style={styles.brandRow}
        >
          <BrandLogo url={voucher.brandLogo} name={voucher.brandName} size="md" />
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{voucher.brandName}</Text>
            <Text style={styles.brandCategory}>{voucher.category}</Text>
          </View>
          <View style={styles.viewBrandBadge}>
            <Text style={styles.viewBrandText}>Cửa hàng</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primaryCoral} />
          </View>
        </TouchableOpacity>

        {/* Voucher Title & Status */}
        <View style={styles.mainInfoCard}>
          <View style={styles.statusRow}>
            <VoucherStatusBadge status={voucher.status} size="md" />
            <View style={styles.inventoryBadge}>
              <Ionicons name="cube-outline" size={14} color={Colors.secondaryText} />
              <Text style={styles.inventoryText}>
                {voucher.availableQuantity > 0
                  ? `Còn ${voucher.availableQuantity} suất`
                  : 'Hết lượt'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{voucher.title}</Text>
          <Text style={styles.description}>{voucher.description}</Text>

          {/* Expiration & Start Dates */}
          <View style={styles.datesGrid}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primaryCoral} />
              <View style={styles.dateTexts}>
                <Text style={styles.dateLabel}>Hạn sử dụng</Text>
                <Text style={styles.dateVal}>{formatDate(voucher.expirationDate)}</Text>
              </View>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="time-outline" size={16} color={Colors.primaryOrange} />
              <View style={styles.dateTexts}>
                <Text style={styles.dateLabel}>Ngày bắt đầu</Text>
                <Text style={styles.dateVal}>{formatDate(voucher.startDate)}</Text>
              </View>
            </View>
          </View>

          {/* Pricing Highlight */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Giá ưu đãi độc quyền</Text>
              <PriceDisplay
                sellingPrice={voucher.sellingPrice}
                originalValue={voucher.originalValue}
                size="lg"
              />
            </View>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsText}>
                Tiết kiệm ${(voucher.originalValue - voucher.sellingPrice).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Usage Conditions */}
        <View style={styles.conditionsCard}>
          <Text style={styles.conditionsHeader}>Điều khoản & Điều kiện sử dụng</Text>
          {voucher.usageConditions.map((cond, index) => (
            <View key={index} style={styles.conditionRow}>
              <View style={styles.conditionBullet} />
              <Text style={styles.conditionText}>{cond}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer Note */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="shield-outline" size={18} color={Colors.secondaryText} />
          <Text style={styles.disclaimerText}>
            Hệ thống Dealora: Không trừ tiền thực tế. Voucher mua xong sẽ hiển thị ngay trong Ví của bạn.
          </Text>
        </View>
      </ScreenContainer>

      {/* Fixed Bottom Buy Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomPriceVal}>${voucher.sellingPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.bottomBtnCol}>
          <PrimaryButton
            title={
              voucher.status !== 'ACTIVE'
                ? `Voucher ${voucher.status}`
                : voucher.availableQuantity <= 0
                ? 'Hết lượt'
                : 'Mua Voucher ngay'
            }
            onPress={handleBuy}
            disabled={!isBuyable}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.warmCream,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageWrapper: {
    height: 240,
    backgroundColor: Colors.lightPeach,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingNav: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
  },
  floatingIconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  discountFloatingPill: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    backgroundColor: Colors.primaryCoral,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.card,
    ...Shadows.soft,
  },
  discountFloatingText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successLight,
    paddingVertical: 8,
    paddingHorizontal: Spacing.base,
  },
  shareBannerText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
    marginLeft: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  brandInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  brandName: {
    ...Typography.h4,
    color: Colors.primaryText,
  },
  brandCategory: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  viewBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  viewBrandText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginRight: 2,
  },
  mainInfoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.base,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  inventoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: 4,
    fontWeight: '600',
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.primaryText,
    lineHeight: 26,
  },
  description: {
    ...Typography.body,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  datesGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.warmCream,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTexts: {
    marginLeft: Spacing.xs,
  },
  dateLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  dateVal: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryText,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.base,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  savingsPill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  savingsText: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.success,
  },
  conditionsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.base,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  conditionsHeader: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  conditionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryCoral,
    marginTop: 7,
    marginRight: 8,
  },
  conditionText: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    flex: 1,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    ...Shadows.tabBar,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  bottomPriceVal: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.primaryCoral,
    fontWeight: '900',
  },
  bottomBtnCol: {
    flex: 1.5,
  },
});
