import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { FormInput } from '../../../components/common/FormInput';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { SecondaryButton } from '../../../components/common/SecondaryButton';
import { SuccessModal } from '../../../components/common/SuccessModal';
import { CATEGORIES } from '../../../constants/categories';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { DiscountType, VoucherCategory, VoucherStatus } from '../../../types';

export default function CreateVoucherScreen() {
  const { currentUser, createVoucher } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VoucherCategory>('Food & Dining');
  const [originalValue, setOriginalValue] = useState('20.00');
  const [sellingPrice, setSellingPrice] = useState('10.00');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('50');
  const [totalQuantity, setTotalQuantity] = useState('100');
  const [startDate, setStartDate] = useState('2026-10-22');
  const [expirationDate, setExpirationDate] = useState('2026-12-31');
  const [conditionsText, setConditionsText] = useState(
    'Valid at all branches nationwide\nCannot be combined with other coupons\nPresent voucher barcode before billing'
  );
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStatus, setCreatedStatus] = useState<VoucherStatus>('ACTIVE');

  const assignedBrandName = currentUser.assignedBrandName || 'Starbucks';
  const assignedBrandId = currentUser.assignedBrandId || 'brand_01';

  const handlePickCover = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        // Toggle preset high-res Unsplash demo images
        const presets = [
          'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
        ];
        const next = presets[(presets.indexOf(coverImage) + 1) % presets.length];
        setCoverImage(next);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0].uri) {
        setCoverImage(result.assets[0].uri);
      }
    } catch {
      // Fallback
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề chiến dịch voucher';
    if (!description.trim()) newErrors.description = 'Vui lòng nhập mô tả chi tiết';
    if (isNaN(Number(originalValue)) || Number(originalValue) <= 0) {
      newErrors.originalValue = 'Vui lòng nhập giá gốc hợp lệ';
    }
    if (isNaN(Number(sellingPrice)) || Number(sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Vui lòng nhập giá bán hợp lệ';
    }
    if (isNaN(Number(totalQuantity)) || Number(totalQuantity) <= 0) {
      newErrors.totalQuantity = 'Vui lòng nhập tổng số lượng voucher hợp lệ';
    }
    if (!expirationDate.trim()) newErrors.expirationDate = 'Vui lòng nhập ngày hết hạn';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (targetStatus: VoucherStatus) => {
    if (!validate()) return;

    setLoading(true);
    setCreatedStatus(targetStatus);

    setTimeout(() => {
      setLoading(false);
      const conditionsList = conditionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const discountDisplayStr =
        discountType === 'PERCENTAGE'
          ? `GIẢM ${discountValue}%`
          : `GIẢM $${discountValue}`;

      createVoucher({
        brandId: assignedBrandId,
        brandName: assignedBrandName,
        brandLogo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
        title,
        description,
        category,
        discountType,
        discountValue: Number(discountValue),
        discountDisplay: discountDisplayStr,
        sellingPrice: Number(sellingPrice),
        originalValue: Number(originalValue),
        startDate,
        expirationDate,
        usageConditions: conditionsList.length > 0 ? conditionsList : ['Áp dụng quy định đổi voucher tiêu chuẩn của thương hiệu.'],
        totalQuantity: Number(totalQuantity),
        coverImage,
        status: targetStatus,
      });

      setShowSuccessModal(true);
    }, 700);
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Tạo Chiến Dịch" subtitle="Phát hành hoặc lưu nháp ưu đãi thương hiệu" showBack />

      <View style={styles.container}>
        {/* Cover Image Selector */}
        <View style={styles.coverSection}>
          <Text style={styles.sectionLabel}>Ảnh Bìa Voucher</Text>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handlePickCover}
            style={styles.coverWrapper}
          >
            <Image source={{ uri: coverImage }} style={styles.coverPreview} />
            <View style={styles.coverOverlay}>
              <Ionicons name="camera" size={24} color={Colors.white} />
              <Text style={styles.coverOverlayText}>Thay Đổi Ảnh</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Brand Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thương Hiệu Áp Dụng</Text>
          <View style={styles.assignedBrandRow}>
            <Ionicons name="business" size={20} color={Colors.primaryCoral} />
            <Text style={styles.assignedBrandName}>{assignedBrandName}</Text>
          </View>
        </View>

        {/* General Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông Tin Ưu Đãi</Text>

          <FormInput
            label="Tiêu Đề Voucher *"
            placeholder="Ví dụ: Voucher Đồ Uống & Bánh $25"
            value={title}
            onChangeText={(txt: string) => {
              setTitle(txt);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />

          <FormInput
            label="Mô Tả Chiến Dịch *"
            placeholder="Mô tả quyền lợi và sản phẩm khách hàng nhận được..."
            value={description}
            onChangeText={(txt: string) => {
              setDescription(txt);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          {/* Category Selector */}
          <Text style={styles.inputLabel}>Danh Mục</Text>
          <View style={styles.categoryWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
              style={{ flexGrow: 0 }}
            >
              {CATEGORIES.filter((c) => c.id !== 'All').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    category === cat.id && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Pricing & Discount */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giá Bán & Số Lượng</Text>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <FormInput
                label="Giá Gốc ($) *"
                placeholder="25.00"
                value={originalValue}
                onChangeText={setOriginalValue}
                keyboardType="numeric"
                error={errors.originalValue}
              />
            </View>
            <View style={[styles.flexOne, { marginLeft: Spacing.sm }]}>
              <FormInput
                label="Giá Bán Ưu Đãi ($) *"
                placeholder="10.00"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                keyboardType="numeric"
                error={errors.sellingPrice}
              />
            </View>
          </View>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <FormInput
                label="Mức Giảm (% hoặc $)"
                placeholder="50"
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexOne, { marginLeft: Spacing.sm }]}>
              <FormInput
                label="Tổng Số Lượng Phát Hành *"
                placeholder="100"
                value={totalQuantity}
                onChangeText={setTotalQuantity}
                keyboardType="numeric"
                error={errors.totalQuantity}
              />
            </View>
          </View>
        </View>

        {/* Campaign Schedule & Terms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thời Gian & Điều Kiện</Text>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <FormInput
                label="Ngày Bắt Đầu"
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={[styles.flexOne, { marginLeft: Spacing.sm }]}>
              <FormInput
                label="Ngày Hết Hạn *"
                placeholder="YYYY-MM-DD"
                value={expirationDate}
                onChangeText={setExpirationDate}
                error={errors.expirationDate}
              />
            </View>
          </View>

          <FormInput
            label="Điều Kiện Áp Dụng (Mỗi dòng 1 điều kiện)"
            placeholder="Áp dụng khi dùng tại chỗ và mang đi..."
            value={conditionsText}
            onChangeText={setConditionsText}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="Phát Hành Chiến Dịch Ngay"
            onPress={() => handleSubmit('ACTIVE')}
            loading={loading && createdStatus === 'ACTIVE'}
            style={styles.publishBtn}
          />

          <SecondaryButton
            title="Lưu Dưới Dạng Bản Nháp"
            onPress={() => handleSubmit('DRAFT')}
            loading={loading && createdStatus === 'DRAFT'}
            style={styles.draftBtn}
          />
        </View>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={createdStatus === 'ACTIVE' ? 'Chiến Dịch Đã Phát Hành! 🚀' : 'Đã Lưu Bản Nháp 📝'}
        message={`"${title}" đã được thiết lập thành công với ${totalQuantity} lượt voucher.`}
        buttonLabel="Xem Danh Sách Voucher"
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(manager)/vouchers');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  coverSection: {
    marginBottom: Spacing.base,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: Spacing.xs,
  },
  coverWrapper: {
    height: 160,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    backgroundColor: Colors.lightPeach,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  coverPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverOverlayText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: Spacing.md,
  },
  assignedBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assignedBrandName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryText,
    marginLeft: Spacing.sm,
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
    marginBottom: Spacing.xs,
  },
  categoryWrap: {
    height: 44,
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  categoryScroll: {
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.warmCream,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryCoral,
    borderColor: Colors.primaryCoral,
  },
  categoryChipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
  },
  flexOne: {
    flex: 1,
  },
  actionsContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  publishBtn: {
    marginBottom: Spacing.sm,
  },
  draftBtn: {},
});
