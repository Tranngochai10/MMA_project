import React, { useEffect, useState } from 'react';
import {
  View,
  Share,
  Alert,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { createURL } from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { BrandPresence } from '../../../components/brand/BrandPresence';
import { api } from '../../../services/api';
import { Voucher } from '../../../types';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { VoucherStatusBadge } from '../../../components/voucher/VoucherStatusBadge';
import { PriceDisplay } from '../../../components/voucher/PriceDisplay';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { SecondaryButton } from '../../../components/common/SecondaryButton';
import { CartButton } from '../../../components/common/CartButton';
import { useCart } from '../../../context/CartContext';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function VoucherDetailScreen() {
  const { id } = useLocalSearchParams();
  const voucherId = Array.isArray(id) ? id[0] : id;
  return <VoucherDetail key={voucherId} voucherId={voucherId || ''} />;
}

function VoucherDetail({ voucherId }: { voucherId: string }) {
  const insets = useSafeAreaInsets();
  const { getVoucherById, getBrandById, toggleFavoriteVoucher, isLoggedIn, notify } = useApp();
  const { ids: cartIds, addVoucher, ready: cartReady } = useCart();
  const [adding, setAdding] = useState(false);


  const [detail, setDetail] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    api.voucher(voucherId).then(value => {
      if (active) setDetail(value);
    }).catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [voucherId]);
  const cached = getVoucherById(voucherId || '');
  const voucher = detail?.id === voucherId ? { ...detail, isFavorite: cached?.isFavorite ?? detail.isFavorite } : cached;
  const brand = getBrandById(voucher?.brandId || '');
  const images = [voucher?.coverImage, brand?.coverImage, voucher?.brandLogo].filter((uri): uri is string => Boolean(uri?.trim()));
  const imageUri = images.find(uri => !failedImages.includes(uri));
  if (!voucher && loading) return <ScreenContainer><ActivityIndicator size="large" /></ScreenContainer>;

  if (!voucher) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy voucher"
          message="Chúng tôi không thể tìm thấy thông tin chi tiết của voucher này."
          actionLabel="Quay lại khám phá"
          onAction={() => router.replace('/(user)/(tabs)/discover')}
        />
      </ScreenContainer>
    );
  }

  const isBuyable = !loadError && voucher.status === 'ACTIVE' && voucher.availableQuantity > 0
    && new Date(voucher.startDate) <= new Date() && new Date(voucher.expirationDate) > new Date();

  const handleShare = async () => {
    try {
      await Share.share({ title: voucher.title, message: `${voucher.title}\n${voucher.brandName}\n${createURL(`vouchers/${voucher.id}`)}` });
    } catch {
      Alert.alert('Không chia sẻ được', 'Thiết bị hoặc trình duyệt chưa hỗ trợ chia sẻ.');
    }
  };

  const handleBuy = () => {
    if (!isBuyable) return;
    router.push({
      pathname: '/(user)/checkout',
      params: { voucherId: voucher.id },
    });
  };
  const inCart = cartIds.includes(voucher.id);
  const handleAdd = async () => {
    if (inCart) { router.push('/(user)/cart'); return; }
    if (adding || !isBuyable) return;
    setAdding(true);
    try { await addVoucher(voucher.id); notify('Đã thêm voucher vào giỏ hàng.'); }
    catch (e) { notify(e instanceof Error ? e.message : 'Không thể thêm vào giỏ hàng.', 'error'); }
    finally { setAdding(false); }
  };

  return (
    <View style={styles.outerContainer}>
      <ScreenContainer scrollable contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 + insets.bottom }]}>
        {/* Cover Image & Floating Actions */}
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <Image key={imageUri} source={{ uri: imageUri }} style={styles.image} onError={() => setFailedImages(previous => [...previous, imageUri])} />
          ) : <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="image-outline" size={48} color={Colors.secondaryText} /></View>}
          <View style={styles.floatingNav}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              activeOpacity={0.8}
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(user)/(tabs)/home')}
              style={styles.floatingIconBtn}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.primaryText} />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <View style={{ marginRight: Spacing.sm }}><CartButton /></View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Về trang chủ"
                activeOpacity={0.8}
                onPress={() => router.dismissTo('/(user)/(tabs)/home')}
                style={[styles.floatingIconBtn, { marginRight: Spacing.sm }]}
              >
                <Ionicons name="home-outline" size={20} color={Colors.primaryText} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={styles.floatingIconBtn}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={Colors.primaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => isLoggedIn
                  ? void toggleFavoriteVoucher(voucher.id)
                  : router.push({ pathname: '/login', params: { returnToFavoriteVoucherId: voucher.id } })}
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
            {voucher.originalValue > voucher.sellingPrice && (
            <View style={styles.savingsPill}>
              <Text style={styles.savingsText}>
                Tiết kiệm {formatCurrency(voucher.originalValue - voucher.sellingPrice)}
              </Text>
            </View>
            )}
          </View>
        </View>

        {loadError && <Text style={styles.description}>Không tải được chi tiết mới nhất. Vui lòng quay lại và thử lại.</Text>}
        <View style={{ marginHorizontal: Spacing.base }}>
          <BrandPresence name={voucher.brandName} salesChannel={voucher.brandSalesChannel || brand?.salesChannel} websiteUrl={voucher.brandWebsiteUrl || brand?.websiteUrl} />
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
            Voucher được cấp vào ví sau khi quản lý xác nhận đã nhận chuyển khoản.
          </Text>
        </View>
      </ScreenContainer>

      {/* Fixed Bottom Buy Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomPriceVal}>{formatCurrency(voucher.sellingPrice)}</Text>
        </View>

        <View style={styles.bottomBtnCol}>
          <SecondaryButton title={inCart ? 'Xem giỏ hàng' : 'Thêm vào giỏ'} onPress={handleAdd} disabled={adding || !cartReady || (!inCart && !isBuyable)} style={{ flex: 1 }} textStyle={{ fontSize: 14 }} />
          <PrimaryButton
            title={
              voucher.status !== 'ACTIVE'
                ? `Voucher ${voucher.status}`
                : voucher.availableQuantity <= 0
                ? 'Hết lượt'
                : 'Thanh toán'
            }
            onPress={handleBuy}
            disabled={!isBuyable}
            style={{ flex: 1 }}
            textStyle={{ fontSize: 14 }}
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
    height: 216,
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
    width: 44,
    height: 44,
    borderRadius: 12,
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
    padding: 20,
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
    flexWrap: 'wrap',
    gap: 8,
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
    fontSize: 24,
    color: Colors.primaryText,
    lineHeight: 32,
    fontWeight: '700',
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
    fontSize: 12,
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
    flexWrap: 'wrap',
    gap: 12,
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
    padding: 20,
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
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    ...Shadows.tabBar,
    gap: 12,
  },
  bottomPriceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  bottomPriceVal: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.primaryCoral,
    fontWeight: '800',
  },
  bottomBtnCol: {
    flexDirection: 'row',
    gap: 12,
  },
});
