import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { FormInput } from '../../../components/common/FormInput';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { SecondaryButton } from '../../../components/common/SecondaryButton';
import { CATEGORIES } from '../../../constants/categories';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { VoucherCategory, VoucherStatus } from '../../../types';
import { router } from 'expo-router';
import { api } from '../../../services/api';
import { CategoryDto } from '../../../services/apiTypes';

const CATEGORY_SLUGS: Record<string, string> = {
  'Food & Dining': 'food-dining',
  'Coffee & Tea': 'coffee-tea',
  Entertainment: 'entertainment',
  'Travel & Hotel': 'travel-hotel',
  'Tech & Gadgets': 'tech-gadgets',
  'Beauty & Spa': 'beauty-spa',
  Groceries: 'groceries',
  Fitness: 'fitness',
};

export default function CreateVoucherScreen() {
  const { currentUser, brands, createVoucher, preferredVoucherBrandId, setPreferredVoucherBrandId } = useApp();
  const [brandChoice, setBrandChoice] = useState('');
  const selectedBrandId = preferredVoucherBrandId || brandChoice || currentUser.assignedBrandId || brands[0]?.id || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VoucherCategory>('Food & Dining');
  const [apiCategories, setApiCategories] = useState<CategoryDto[]>([]);
  const [originalValue, setOriginalValue] = useState('20.00');
  const [sellingPrice, setSellingPrice] = useState('10.00');
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
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSucceeded, setSubmitSucceeded] = useState(false);

  useEffect(() => {
    api.categories().then(setApiCategories).catch(() => setApiCategories([]));
  }, []);

  const assignedBrand = brands.find((brand) => brand.id === selectedBrandId);
  const assignedBrandName = assignedBrand?.name || 'Chọn thương hiệu';
  const categoryId = apiCategories.find((item) => item.slug === CATEGORY_SLUGS[category])?._id;

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

  const handleSubmit = async (targetStatus: VoucherStatus) => {
    if (submissionLock.current || submitSucceeded) return;
    setSubmitMessage('');
    setSubmitSucceeded(false);
    if (!validate()) {
      setSubmitMessage('Hãy kiểm tra các trường bắt buộc được đánh dấu: tiêu đề, mô tả, giá, số lượng và ngày hết hạn.');
      return;
    }
    if (!selectedBrandId) {
      setSubmitMessage('Hãy chọn thương hiệu áp dụng cho voucher.');
      return;
    }
    if (!categoryId) {
      setSubmitMessage('Không tìm thấy ID danh mục từ máy chủ. Hãy kiểm tra API danh mục rồi thử lại.');
      return;
    }
    try {
      submissionLock.current = true;
      setSubmitting(true);
      await createVoucher({ brandId: selectedBrandId, categoryId, brandName: assignedBrandName, brandLogo: assignedBrand?.logo || '', title: title.trim(), description: description.trim(), category, discountType: 'PERCENTAGE', discountValue: Number(discountValue), discountDisplay: `GIẢM ${discountValue}%`, sellingPrice: Number(sellingPrice), originalValue: Number(originalValue), startDate, expirationDate, usageConditions: conditionsText.split('\n').map((line) => line.trim()).filter(Boolean), totalQuantity: Number(totalQuantity), coverImage, status: targetStatus });
      setSubmitSucceeded(true);
      setSubmitMessage(targetStatus === 'DRAFT' ? 'Đã lưu voucher dưới dạng bản nháp.' : 'Chiến dịch voucher đã được phát hành.');
    } catch (error) {
      submissionLock.current = false;
      setSubmitMessage(error instanceof Error ? error.message : 'Không thể lưu voucher. Vui lòng thử lại.');
    } finally { setSubmitting(false); }
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {brands.map((brand) => <TouchableOpacity key={brand.id} onPress={() => { setBrandChoice(brand.id); setPreferredVoucherBrandId(''); }} style={[styles.categoryChip, selectedBrandId === brand.id && styles.categoryChipActive]}><Text style={[styles.categoryChipText, selectedBrandId === brand.id && styles.categoryChipTextActive]}>{brand.name}</Text></TouchableOpacity>)}
            <TouchableOpacity onPress={() => router.push('/(manager)/brands/create')} style={[styles.categoryChip, styles.newBrandChip]}><Text style={styles.newBrandText}>＋ Tạo thương hiệu</Text></TouchableOpacity>
          </ScrollView>
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
          {submitMessage ? <Text accessibilityRole="alert" style={[styles.submitMessage, submitSucceeded ? styles.submitSuccess : styles.submitError]}>{submitMessage}</Text> : null}
          <PrimaryButton
            title="Phát Hành Chiến Dịch Ngay"
            onPress={() => handleSubmit('ACTIVE')}
            loading={submitting}
            disabled={submitting || submitSucceeded}
            style={styles.publishBtn}
          />

          <SecondaryButton
            title="Lưu Dưới Dạng Bản Nháp"
            onPress={() => handleSubmit('DRAFT')}
            loading={submitting}
            disabled={submitting || submitSucceeded}
            style={styles.draftBtn}
          />
          {submitSucceeded ? <SecondaryButton title="Quay lại danh sách voucher" onPress={() => router.back()} style={styles.draftBtn} /> : null}
        </View>
      </View>

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
  newBrandChip: { borderStyle: 'dashed', borderColor: Colors.primaryCoral },
  newBrandText: { ...Typography.caption, fontWeight: '700', color: Colors.primaryCoral },
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
  submitMessage: {
    marginBottom: Spacing.md,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitError: { color: Colors.error },
  submitSuccess: { color: Colors.success },
  publishBtn: {
    marginBottom: Spacing.sm,
  },
  draftBtn: {},
});
